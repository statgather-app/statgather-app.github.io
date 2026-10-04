# StatGather — Network Access Request for School IT (revised)

> **This revises our earlier request.** We previously asked you to allow two
> WebRTC domains (`0.peerjs.com` and `standard.relay.metered.ca`). **Please
> disregard that** — we have re‑architected the app so it no longer uses WebRTC,
> peer‑to‑peer, STUN, TURN, or any external signaling. There is now nothing of
> that kind to allow.

**What we're asking for (one line):** please categorise/allow **one ordinary
HTTPS domain** — the single web address the app is served from (see §5) — so a
classroom statistics web app can collect data from student devices over standard
web traffic on port 443.

---

## 1. Summary for IT

StatGather is a web app used in statistics class. The teacher starts a live
survey; students open the page on their own device, type in a value (e.g. their
height), and the class sees the distribution as histograms, box plots, and
summary statistics.

It is now a **standard client‑server web app**. Student devices send their
entries to **one ordinary web service over HTTPS (port 443)**; the teacher's
browser reads the live updates from that **same** service. This is normal,
inspectable, filterable web traffic to a single domain you can categorise and
monitor — exactly the kind of traffic your filter is designed to handle.

**What changed and why.** The previous version connected browsers directly using
WebRTC (peer‑to‑peer). On your network that failed, and when we asked to allow
the WebRTC signaling/relay domains you declined — reasonably — because
peer‑to‑peer traffic is encrypted end‑to‑end and not inspectable, could enable
device‑to‑device traffic beyond this app, and relies on third‑party
infrastructure. **We agreed with those concerns and removed the entire
peer‑to‑peer design.** Nothing in the app is device‑to‑device any more.

---

## 2. What the project is and what it's used for

- **Purpose:** collect a class's own data live and teach statistics with it —
  distributions, center, spread, and outliers — using numbers the students
  generate themselves.
- **Who uses it:** a teacher (host) and their students (phones/laptops), all in
  the same room, for the duration of a class period.
- **Data handling:** no accounts, no logins, no personal information requested.
  Session data is **ephemeral** — it lives only for the class session and
  auto‑expires; nothing sensitive is persisted and no student PII is stored.

---

## 3. Exactly what the project uses (dependencies and services)

**Hosting / backend (one origin):**
- A single **Cloudflare Worker** serves both the app (one HTML file) **and** its
  small API from the same domain. All student↔teacher data flows through this one
  service over HTTPS. There is **no** separate signaling server, STUN, or TURN.

**JavaScript libraries (loaded once, over HTTPS, from public CDNs):**
| Library | Loaded from | Used for |
|---|---|---|
| Plotly.js | `cdn.plot.ly` | drawing the charts |
| Tailwind CSS | `cdn.tailwindcss.com` | page styling |
| Google Fonts | `fonts.googleapis.com`, `fonts.gstatic.com` | typefaces |

*(PeerJS and the metered.ca TURN relay from the previous version have been
removed.)*

---

## 4. How it works (system design)

```
   TEACHER'S BROWSER                 ONE WEB SERVICE                STUDENT'S BROWSER
   (hosts the session)              (single HTTPS origin)          (joins with a 4-char code)
          |                                 |                                 |
          |  POST /api/host  ────────────▶  | claim code STAT-XXXX            |
          |  POST /api/config ───────────▶  | store the survey question       |
          |                                 |  ◀──── GET /api/student/poll ────|  fetch config
          |                                 |  ◀──── POST /api/submit ─────────|  send one value
          |  GET /api/teacher/poll ──────▶  | read new submissions + count    |
          |                                 |                                 |
          |     all traffic = ordinary HTTPS (443) to ONE domain             |
          |     inspectable/filterable · no P2P · no STUN/TURN · no signaling|
```

1. **Hosting a session.** The teacher's browser claims a session identified by a
   4‑character code (e.g. `STAT‑7HRD`). Students enter that code (or open a link).
2. **Students submit.** Each student's browser sends its value to the web service
   over HTTPS. The service keeps one response per student for the session.
3. **Teacher reads live.** The teacher's browser polls the same service over
   HTTPS and the screen updates as answers arrive.
4. **Ephemeral.** The session's data is held only for the class and auto‑expires
   (a few hours after last activity); nothing sensitive is retained.

---

## 5. What we need allowed

**One domain, standard HTTPS / port 443:**
1. **the app's own domain** — the Cloudflare Worker URL (e.g.
   `https://statgather.<subdomain>.workers.dev`, or a custom school‑friendly
   domain if we set one up). This single host is both the app and its API.

**Should already be allowed** (the page loads these today — listed for completeness):
- `cdn.plot.ly`, `cdn.tailwindcss.com` (JavaScript libraries)
- `fonts.googleapis.com`, `fonts.gstatic.com` (fonts)

**Privacy / security notes for IT review:**
- No student accounts, no logins, **no personal data collected**. Sessions are
  ephemeral and auto‑expire; nothing sensitive is persisted.
- All traffic is **standard HTTPS to a single, categorisable domain** — your
  filter can inspect and monitor it like any other website. There is no
  peer‑to‑peer traffic and no third‑party signaling/relay.
- The entire frontend is **one open, human‑readable HTML file**, and the backend
  is a small, auditable service; we're happy to share the source.

---

## 6. Why this is worth it — benefits for statistics teachers

- **Real data, instantly.** Collect the class's own measurements (height,
  reaction time, shoe size, survey answers) in seconds and immediately show the
  distribution — **histogram, box plot, dot plot, stem‑and‑leaf**, plus **mean,
  median, standard deviation, quartiles, and IQR** with outliers flagged.
- **Students are invested** because it's *their* data — far more engaging than a
  textbook table for teaching center, spread, shape, and outliers.
- **Zero friction.** No installs, no accounts, no cost. The teacher opens a page
  and shares a 4‑character code or link; students join from any browser.
- **Privacy‑first by design.** No personal data is collected and nothing
  sensitive is stored, keeping it comfortably within FERPA/COPPA expectations.
- **Works even without live collection.** Built‑in sample datasets and a data
  **simulation tool** let teachers demonstrate concepts when a live survey isn't
  practical.

---

*Prepared for the StatGather classroom tool. Contact the requesting teacher for a
live demonstration.*
