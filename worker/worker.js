/* ============================================================================
   StatGather — Cloudflare Worker (single-origin front door)
   ----------------------------------------------------------------------------
   Serves BOTH the static app and the API from one domain, so there is exactly
   one host for school IT to categorise and allow — ordinary HTTPS, nothing
   peer-to-peer, no WebRTC/STUN/TURN/signaling.

     • /api/*  → routed to the room's Durable Object (keyed by ?code=XXXX)
     • /*      → the single-page app (index.html, imported as a text module)

   The 4-char code travels in the query string on every /api call (even POSTs)
   so this front door can route without consuming the request body — the Durable
   Object reads the JSON body itself.
   ============================================================================ */

import INDEX_HTML from "../index.html";

export { Room } from "./room.js";

const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, OPTIONS',
  'access-control-allow-headers': 'content-type',
  'access-control-max-age': '86400',
};

function normCode(raw) {
  const code = String(raw || '').toUpperCase();
  return /^[A-Z0-9]{4}$/.test(code) ? code : null;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path.startsWith('/api/')) {
      if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
      const code = normCode(url.searchParams.get('code'));
      if (!code) {
        return new Response(JSON.stringify({ ok: false, error: 'bad_code' }), {
          status: 400,
          headers: { 'content-type': 'application/json; charset=utf-8', ...CORS },
        });
      }
      const stub = env.ROOM.get(env.ROOM.idFromName(code));
      return stub.fetch(request);
    }

    // Everything else is the app. One file, no build step.
    return new Response(INDEX_HTML, {
      headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-cache' },
    });
  },
};
