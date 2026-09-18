# StatGather — Network Access Request for School IT

**What we're asking for (one line):** please allow two standard HTTPS (port 443)
domains through the content filter — `0.peerjs.com` and `standard.relay.metered.ca` —
so that a classroom statistics web app can connect student devices to the
teacher's device. Details, privacy notes, and the reasoning are below.

---

## 1. Summary for IT

StatGather is a **single static web page** (no backend, no database, no server we
operate) used in statistics class. The teacher starts a live survey; students open
the page on their own device, type in a value (e.g. their height), and the class
instantly sees the distribution as histograms, box plots, and summary statistics.

Student devices talk **directly** to the teacher's device using **WebRTC** — the
same peer-to-peer technology behind Google Meet / browser video calls. No student
data passes through or is stored on any server. The only outside help WebRTC needs
is a tiny "introduction" step, and that step is what the school filter is currently
blocking.

**The app already loads fine on the school network.** The one thing that doesn't
work is the browser-to-browser connection, because the filter blocks the
introduction (signaling) traffic.

---

## 2. What the project is and what it's used for

- **Purpose:** collect a class's own data live and teach statistics with it —
  distributions, center, spread, and outliers — using numbers the students
  generate themselves.
- **Who uses it:** a teacher (host) and their students (on phones/laptops), all in
  the same room, for the duration of a class period.
- **Data handling:** no accounts, no logins, no personal information requested, and
  **nothing is stored anywhere** — data lives only in the teacher's browser tab for
  that session and disappears when it's closed.

---

## 3. Exactly what the project uses (dependencies and services)

**Hosting**
- The app is one HTML file served by **GitHub Pages** at
  `https://statgather-app.github.io` (static hosting; no server-side code).

**JavaScript libraries (loaded once, over HTTPS, from public CDNs):**
| Library | Version | Loaded from | Used for |
|---|---|---|---|
| PeerJS | 1.5.2 | `unpkg.com` | WebRTC peer connections + signaling client |
| Plotly.js | 2.29.0 | `cdn.plot.ly` | drawing the charts |
| Tailwind CSS | (CDN) | `cdn.tailwindcss.com` | page styling |
| Google Fonts | — | `fonts.googleapis.com`, `fonts.gstatic.com` | typefaces |

**Connection services (this is the part that needs to be unblocked):**
| Service | Domain | Port/Protocol | Used for |
|---|---|---|---|
| **PeerJS signaling server** | `0.peerjs.com` | 443 / WSS (secure WebSocket) | **introduces** the two browsers so they can start a direct connection |
| **TURN relay** (metered.ca) | `standard.relay.metered.ca` | 443 (TCP/TLS) and 80 | relays the **already-encrypted** WebRTC media when a network blocks direct peer links |
| STUN (Google) | `stun.l.google.com` | 19302 / UDP | lets a browser learn its own address (optional; not required — TURN covers this) |

---

## 4. How it works (system design)

```
   TEACHER'S BROWSER                                     STUDENT'S BROWSER
   (hosts the session)                                   (joins with a 4-char code)
          |                                                       |
          |   1. "introduce us"  ── 0.peerjs.com (signaling) ──   |
          |<----------------------------------------------------->|
          |        (exchanges a small "how to reach me" note)     |
          |                                                       |
          |   2. DIRECT peer-to-peer WebRTC data channel          |
          |<=====================================================>|
          |        survey config out  /  student values in        |
          |        (end-to-end encrypted; nothing stored)         |
          |                                                       |
          |   3. If the network blocks the direct link, the       |
          |      encrypted packets relay via TURN over TCP 443     |
          |      (standard.relay.metered.ca) — looks like HTTPS    |
```

1. **Hosting a session.** The teacher's browser claims a session identified by a
   4-character code (e.g. `STAT-7HRD`). Students enter that code (or open a link).
2. **Signaling (the blocked step).** Before two browsers can talk directly, they
   must swap a small connection handshake ("here's how to reach me"). The **only**
   job of the signaling server `0.peerjs.com` is to pass that handshake between the
   two browsers. **It never sees or stores the survey data.**
3. **Direct peer-to-peer.** Once introduced, the student's browser and the
   teacher's browser open a **direct, end-to-end-encrypted** WebRTC data channel.
   Survey questions go out; student answers come back; the teacher's screen updates
   live. No server is in the middle, and nothing is written to disk anywhere.
4. **TURN (restrictive networks).** If the network won't allow a direct browser
   link, the *encrypted* packets are bounced through a TURN relay over **TCP port
   443** (indistinguishable from normal HTTPS). The relay forwards ciphertext in
   real time and stores nothing. *(This part already works on the school network.)*

**Why it currently fails at school:** we tested on the school Wi-Fi. The TURN relay
(step 4) works, but every signaling path we tried (step 2's introduction) is
blocked by the content filter. Without the introduction, the two browsers never
find each other, so no connection forms.

---

## 5. What we need unblocked

**Required (connection-critical), both standard HTTPS / port 443:**
1. **`0.peerjs.com`** — WebSocket Secure (WSS) over 443. *The signaling server.*
   This is the single most important one; without it, browsers can't connect.
2. **`standard.relay.metered.ca`** (and its subdomains under `*.relay.metered.ca`)
   — TCP/TLS 443 (and UDP if possible). *The TURN media relay.*

**Should already be allowed** (the app loads today, so these are likely fine — listed
for completeness):
- `statgather-app.github.io` (the app itself)
- `unpkg.com`, `cdn.plot.ly`, `cdn.tailwindcss.com` (JavaScript libraries)
- `fonts.googleapis.com`, `fonts.gstatic.com` (fonts)

**Privacy / security notes for IT review:**
- No student accounts, no logins, **no personal data collected**, nothing stored on
  any server. Session data exists only in the teacher's browser tab and is gone when
  it closes.
- All peer-to-peer traffic is **end-to-end encrypted** (WebRTC/DTLS). The signaling
  server only relays connection metadata; the TURN relay only forwards encrypted
  packets. Neither can read survey content.
- The entire app is **one open, human-readable HTML file** — the full source can be
  inspected at the GitHub Pages URL above.

**Flexible alternative if you'd prefer not to allow the public PeerJS cloud:** the
signaling server is standard open-source software (PeerServer) that we can host on a
domain the school approves, so the only external allowlist entry becomes a host you
choose and can vet. Happy to work with you on that.

---

## 6. Why this is worth it — benefits for statistics teachers

- **Real data, instantly.** Collect the class's own measurements (height, reaction
  time, shoe size, survey answers) in seconds and immediately show the distribution —
  **histogram, box plot, dot plot, stem-and-leaf**, plus **mean, median, standard
  deviation, quartiles, and IQR** with outliers flagged.
- **Students are invested** because it's *their* data — far more engaging than a
  textbook table for teaching center, spread, shape, and outliers.
- **Zero friction.** No installs, no accounts, no cost. The teacher opens a page and
  shares a 4-character code or link; students join from any phone or laptop browser.
- **Privacy-first by design.** Nothing is stored and no personal data is collected,
  which keeps it comfortably within FERPA/COPPA expectations.
- **Works even without live collection.** Built-in sample datasets and a data
  **simulation tool** let teachers demonstrate concepts (sampling, distributions)
  when a live survey isn't practical.
- **One tool, many lessons:** intro to distributions, comparing groups, sampling
  variability, the effect of outliers, and reading each chart type — all from data
  the class made together in the moment.

---

*Prepared for the StatGather classroom tool. Contact the requesting teacher for a
live demonstration.*
