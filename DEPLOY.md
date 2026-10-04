# StatGather — Backend Deploy & Run Guide

StatGather no longer uses WebRTC / peer‑to‑peer. It is now an ordinary
**client‑server web app over HTTPS**: student browsers POST their values to one
web service and the teacher's browser reads live updates from that same service.
All traffic goes to **a single domain** that school IT can categorise and
monitor — no STUN/TURN, no signaling relay, nothing device‑to‑device.

## Architecture at a glance

```
            ┌─────────────────────────── one HTTPS origin ───────────────────────────┐
            │                                                                          │
  TEACHER ──┤  GET /            → index.html (the whole app, one file)                 │
  browser   │  POST /api/host   → claim a 4-char room code (STAT-XXXX)                 │
            │  POST /api/config → push the survey question/type/allowMultiple          │
            │  GET  /api/teacher/poll?since=N → new submissions + live student count   │
            │                                                                          │
  STUDENT ──┤  GET  /api/student/poll?cid=…  → fetch config, register presence         │
  browser   │  POST /api/submit → send one value (server enforces one-per-cid)         │
            │                                                                          │
            │        Cloudflare Worker (front door) + Durable Object (the room)        │
            └──────────────────────────────────────────────────────────────────────┘
```

- **Cloudflare Worker** (`worker/worker.js`) serves BOTH the static app and the
  `/api`, so the frontend and backend share one origin — no CORS, one allowlist
  entry for IT.
- **Durable Object** (`worker/room.js`) — one instance per 4‑char code *is* the
  ephemeral session. It holds the live config, buffers submissions, enforces
  one‑response‑per‑`cid`, tracks presence, and auto‑expires via a TTL alarm
  (~4h after last activity).
- **No database, no accounts, no PII.** Only survey values, the config, and a
  per‑`cid` submission count (for dedupe) are kept, and only until the room
  expires.

## Why Cloudflare Workers?

| Requirement | How Workers meets it |
|---|---|
| Single filterable HTTPS domain | Worker serves app **and** API from one origin |
| Free at classroom scale | Free plan: 100k requests/day — far above tens of students × a few rooms |
| Near‑zero maintenance | Fully serverless/managed; nothing to patch or babysit |
| Real‑time, restrictive‑network‑friendly | Plain HTTPS GET/POST polling on 443 — the most filter‑tolerant option |
| Ephemeral per‑room state | One Durable Object per code, with a TTL alarm |

Durable Objects on the **free** plan require the SQLite‑backed class migration
that is already configured in `wrangler.toml` (`new_sqlite_classes = ["Room"]`).

---

## Run locally (verify end‑to‑end)

Prerequisites: Node.js 18+.

```bash
npm install            # installs wrangler (dev dependency)
npm run dev            # = wrangler dev  → http://localhost:8787
```

Then, to confirm the whole flow:

1. Open <http://localhost:8787> and click **Host a session** — note the
   `STAT‑XXXX` code and the "Room live" pill.
2. In a second tab open the join link shown in the header
   (`http://localhost:8787/?room=XXXX`), or use **Join as student** with the code.
3. Submit a value as the student → the student sees "Submission received".
4. Within ~2s the teacher's table, summary stats, and charts update live.

API smoke test (no browser needed):

```bash
B=http://localhost:8787 C=TST1
curl -s -X POST "$B/api/host?code=$C"   -H 'content-type: application/json' -d '{"code":"'$C'","question":"Height","dataType":"continuous"}'
curl -s      "$B/api/student/poll?code=$C&cid=stu-1"
curl -s -X POST "$B/api/submit?code=$C" -H 'content-type: application/json' -d '{"value":"68","cid":"stu-1"}'
curl -s      "$B/api/teacher/poll?code=$C&since=0"   # → entries:[{seq:1,value:68,…}], count:1
```

---

## Deploy (one‑time, the teacher/owner does this)

You need a **free** Cloudflare account. The CLI cannot create it for you.

```bash
npm install
npx wrangler login      # opens a browser to authorise this machine
npm run deploy          # = wrangler deploy
```

Wrangler prints the live URL, e.g. `https://statgather.<your-subdomain>.workers.dev`.
That single URL is the whole app **and** its API.

Optional: put it behind a custom domain in the Cloudflare dashboard
(Workers & Pages → your Worker → Settings → Domains & Routes) so IT sees a
stable, friendly hostname (e.g. `statgather.yourschool.org`).

Logs (optional): `npm run tail`.

### Note on GitHub Pages

The old live site at `statgather-app.github.io` (GitHub Pages) can only serve
static files — it cannot run the `/api`. Once the Worker is deployed, **use the
Worker URL as the app URL**. (If you must keep the page on GitHub Pages, set
`window.STATGATHER_API_BASE = "https://<your-worker-url>"` before the app
script; the Worker already returns permissive CORS headers. Co‑hosting on the
Worker is strongly preferred — it keeps everything on one filterable domain.)

---

## Updating the pending School IT request

The earlier request (`SCHOOL-IT-REQUEST.md`) asked IT to allow WebRTC
signaling/TURN domains (`0.peerjs.com`, `*.relay.metered.ca`). **That request is
now obsolete** and should be withdrawn/replaced, because the app no longer uses
any of it. `SCHOOL-IT-REQUEST.md` has been rewritten to describe the new
architecture. Tell IT:

- WebRTC / peer‑to‑peer / STUN / TURN / external signaling are **removed entirely**.
- All traffic is now **ordinary HTTPS (443) to one domain** (your Worker URL or
  custom domain) — fully categorisable and monitorable by the content filter.
- There is still **no student PII and nothing sensitive persisted**; sessions are
  ephemeral and auto‑expire.
- The only allowlist entry they need is that **one domain** (plus the existing
  CDN/font hosts the page already loads, which are already allowed).
