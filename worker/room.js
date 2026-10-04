/* ============================================================================
   StatGather — Room Durable Object
   ----------------------------------------------------------------------------
   One instance per 4-char room code (addressed via env.ROOM.idFromName(code)),
   so a DO *is* the ephemeral session. It replaces what used to be the teacher's
   in-browser PeerJS host: it holds the live survey config, buffers the students'
   submissions, enforces one-response-per-cid, and tracks who is currently
   present — all over ordinary HTTPS. Nothing here is peer-to-peer.

   Message protocol preserved from the old WebRTC transport:
     • CONFIG       { question, dataType, allowMultiple }   → student poll result
     • DATA_SUBMIT  { value, cid }                          → POST /api/submit
     • ACK          { ok, reason?, allowMultiple }          → /api/submit response

   Privacy: no accounts, no PII. We store only survey values, the config, and a
   per-cid submission count for dedupe. Everything auto-expires (TTL alarm).
   ============================================================================ */

const TTL_MS = 4 * 60 * 60 * 1000;   // a room lives at most ~4h after last activity
const PRESENCE_MS = 15 * 1000;        // a student counts as "present" for 15s per poll
const MAX_ENTRIES = 5000;             // abuse guard; a class is tens of values

/* Strict value parsing — ported verbatim from the teacher's old parseValue().
   The server trusts the wire, so "12abc" / "1e309" / "" must be REJECTED
   (return null), never silently coerced. Returns the typed value, or null. */
function parseValue(v, dataType) {
  if (dataType === 'categorical') {
    const s = String(v ?? '').trim();
    if (!s) return null;
    return s.length > 120 ? s.slice(0, 120) : s; // cap length (mild abuse guard)
  }
  let num;
  if (typeof v === 'number') { if (!Number.isFinite(v)) return null; num = v; }
  else {
    const str = String(v).trim();
    if (!/^-?\d*\.?\d+$/.test(str)) return null; // clean decimal only — no e-notation, no trailing junk
    num = parseFloat(str);
    if (!Number.isFinite(num)) return null;
  }
  return dataType === 'discrete' ? Math.round(num) : num;
}

function sanitizeConfig(body, prev) {
  const types = ['continuous', 'discrete', 'categorical'];
  const dataType = types.includes(body?.dataType) ? body.dataType : (prev?.dataType || 'continuous');
  let question = typeof body?.question === 'string' ? body.question : (prev?.question || '');
  question = question.slice(0, 300);
  const allowMultiple = typeof body?.allowMultiple === 'boolean' ? body.allowMultiple : (prev?.allowMultiple ?? false);
  return { question, dataType, allowMultiple };
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'access-control-allow-origin': '*',
    },
  });
}

export class Room {
  constructor(ctx, env) {
    this.ctx = ctx;
    this.env = env;
    this.presence = new Map();   // cid -> lastSeen ms (in-memory only; cheap to rebuild)
    this.meta = null;            // { hosted, createdAt, lastActive, seq, config }
    this.entries = [];           // [{ seq, value, ts }]  — polling buffer
    this.cids = {};              // cid -> submission count (dedupe)
    this._lastPersist = 0;

    ctx.blockConcurrencyWhile(async () => {
      this.meta = (await ctx.storage.get('meta')) || null;
      this.entries = (await ctx.storage.get('entries')) || [];
      this.cids = (await ctx.storage.get('cids')) || {};
    });
  }

  active() {
    return !!(this.meta && this.meta.hosted && (Date.now() - this.meta.lastActive) < TTL_MS);
  }

  // Note activity so an in-use room never expires mid-class; persist is throttled
  // so a 2s teacher poll doesn't mean a storage write every 2s.
  async touch() {
    if (!this.meta) return;
    const now = Date.now();
    this.meta.lastActive = now;
    if (now - this._lastPersist > 60000) {
      this._lastPersist = now;
      await this.ctx.storage.put('meta', this.meta);
    }
  }

  presenceCount() {
    const cutoff = Date.now() - PRESENCE_MS;
    for (const [cid, seen] of this.presence) if (seen < cutoff) this.presence.delete(cid);
    return this.presence.size;
  }

  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;
    const q = url.searchParams;
    let body = {};
    if (request.method === 'POST') { try { body = await request.json(); } catch (e) {} }

    switch (path) {
      case '/api/host':         return this.host(body);
      case '/api/config':       return this.setConfig(body);
      case '/api/submit':       return this.submit(body);
      case '/api/student/poll': return this.studentPoll(q);
      case '/api/teacher/poll': return this.teacherPoll(q);
      default:                  return json({ ok: false, error: 'not_found' }, 404);
    }
  }

  /* Teacher claims the code. Collision (an already-live room on this code) → 409,
     mirroring the old PeerJS 'unavailable-id'; the client picks a fresh code and
     retries. Claiming a fresh room wipes any stale state for this code. */
  async host(body) {
    if (this.active()) return json({ ok: false, error: 'collision' }, 409);
    const now = Date.now();
    this.meta = { hosted: true, createdAt: now, lastActive: now, seq: 0, config: sanitizeConfig(body) };
    this.entries = [];
    this.cids = {};
    this.presence.clear();
    this._lastPersist = now;
    await this.ctx.storage.put('meta', this.meta);
    await this.ctx.storage.put('entries', this.entries);
    await this.ctx.storage.put('cids', this.cids);
    await this.ctx.storage.setAlarm(now + TTL_MS);
    return json({ ok: true, code: body?.code });
  }

  /* Teacher edits the survey (or switches which dataset is live). `reset:true`
     clears the per-cid dedupe so every student may answer the new survey once
     more — this is the old setLive()/deleteDataset() `submittedCids.clear()`. */
  async setConfig(body) {
    if (!this.active()) return json({ ok: false, error: 'no_room' }, 404);
    this.meta.config = sanitizeConfig(body, this.meta.config);
    this.meta.lastActive = Date.now();
    if (body?.reset) { this.cids = {}; await this.ctx.storage.put('cids', this.cids); }
    this._lastPersist = Date.now();
    await this.ctx.storage.put('meta', this.meta);
    return json({ ok: true });
  }

  /* Student submits a value. Returns the ACK. Dedupe + allowMultiple enforcement
     ported from the teacher's old onStudentData(). */
  async submit(body) {
    if (!this.active()) return json({ ok: false, reason: 'no_room' }, 404);
    const cfg = this.meta.config;
    const cid = typeof body.cid === 'string' && body.cid ? body.cid : null;
    const prior = cid ? (this.cids[cid] || 0) : 0;
    if (cid) this.presence.set(cid, Date.now());

    if (!cfg.allowMultiple && prior >= 1) {
      return json({ ok: false, reason: 'locked', allowMultiple: cfg.allowMultiple });
    }
    const parsed = parseValue(body.value, cfg.dataType);
    if (parsed === null) {
      return json({ ok: false, reason: 'invalid', allowMultiple: cfg.allowMultiple });
    }

    const entry = { seq: ++this.meta.seq, value: parsed, ts: Date.now() };
    this.entries.push(entry);
    if (this.entries.length > MAX_ENTRIES) this.entries = this.entries.slice(-MAX_ENTRIES);
    if (cid) this.cids[cid] = prior + 1;
    this.meta.lastActive = Date.now();
    this._lastPersist = Date.now();
    await this.ctx.storage.put('entries', this.entries);
    await this.ctx.storage.put('cids', this.cids);
    await this.ctx.storage.put('meta', this.meta);
    return json({ ok: true, allowMultiple: cfg.allowMultiple });
  }

  /* Student poll: register presence + fetch the current CONFIG. */
  async studentPoll(q) {
    if (!this.active()) return json({ ok: false, error: 'no_room' }, 404);
    const cid = q.get('cid');
    if (cid) this.presence.set(cid, Date.now());
    const c = this.meta.config;
    return json({ ok: true, config: { question: c.question, dataType: c.dataType, allowMultiple: c.allowMultiple } });
  }

  /* Teacher poll: new submissions since the cursor + the live student count. */
  async teacherPoll(q) {
    if (!this.active()) return json({ ok: false, error: 'no_room' }, 404);
    const since = parseInt(q.get('since') || '0', 10) || 0;
    const fresh = this.entries.filter(e => e.seq > since);
    const count = this.presenceCount();
    await this.touch();
    const c = this.meta.config;
    return json({ ok: true, entries: fresh, count, config: { question: c.question, dataType: c.dataType, allowMultiple: c.allowMultiple } });
  }

  /* TTL: wipe the session once it has been idle for TTL_MS; otherwise reschedule
     to the next deadline. Nothing sensitive survives. */
  async alarm() {
    if (this.active()) {
      await this.ctx.storage.setAlarm(this.meta.lastActive + TTL_MS);
      return;
    }
    await this.ctx.storage.deleteAll();
    this.meta = null;
    this.entries = [];
    this.cids = {};
    this.presence.clear();
  }
}
