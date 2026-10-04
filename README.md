# StatGather

**Collect a whole class's data live, compute the statistics, and see the distribution — right from the front of the room.**

StatGather is a web app for teaching statistics. The teacher opens a session on the projector; students join from their laptops with a 4‑character room code and submit data points to **one web service over ordinary HTTPS**. The teacher's browser reads the live updates from that same service; StatGather computes the summary statistics and draws the distribution as the numbers arrive.

No accounts. No spreadsheet. No peer‑to‑peer. All traffic goes to a single, filterable HTTPS domain — see [DEPLOY.md](DEPLOY.md) for the backend and how to deploy it.

**Live app:** <https://statgather.statroom.workers.dev>

---

## What it does

### Teacher (host)
- Create a session and share a join link or 4‑character code (`STAT‑XXXX`).
- See a live count of connected students.
- Configure the survey **question** and **data type**: numerical continuous, numerical discrete, or categorical.
- Watch responses arrive in a live table — add values by hand or delete erroneous ones.
- Read a full summary panel: **n, mean, median, standard deviation (s), min, max, range, IQR, Q1, Q3**, and a count of 1.5×IQR outliers.
- Switch between visualizations:
  - **Box plot** (median, quartiles, and explicit outliers)
  - **Histogram** with a live bin‑width slider
  - **Dot plot**
  - **Stem‑and‑leaf** plot
  - **Bar / pie / frequency** views for categorical data
- **Export to CSV** at any time.
- **Bulk paste** or manual entry as a fallback for data collected another way.
- Toggle whether students may submit **more than one** response.
- **Work with several datasets at once** — hold multiple named datasets as tabs and view any one while students keep submitting into the live survey. **Combine** (pool) and **Split** (by threshold or by category) build new datasets **non‑destructively**.
- **Simulate an experiment** — draw from a probability model (coin, die, spinner, uniform int/real, normal, binomial, poisson, exponential), repeat the trial many times with a **seedable RNG**, and record a statistic (sum, mean, count/proportion by condition, min/max/range/median/sd, category count, distinct, …). The resulting distribution becomes a new dataset that flows into the same summary stats and charts.

### Student (client)
- Open the teacher's link (or enter the code) — it connects automatically.
- See the survey question, enter a validated response, and submit.
- Get a clear "Submission received" confirmation.

---

## How to use it

### Quick start (about 30 seconds)

1. The **teacher** opens the [live app](https://statgather.statroom.workers.dev) and clicks **Host a session**.
2. The teacher types the question (e.g. *"Height in inches"*) and picks a data type.
3. The teacher clicks **Copy link** and shares it (post it in your LMS, chat, or write the code on the board).
4. **Students** open the link on their laptops — they connect automatically, type their answer, and hit **Submit**.
5. The stats and charts on the teacher's screen update live as answers arrive.

### For the teacher (hosting a session)

**1. Start the session.**
Open the app and click **Host a session**. A room is created instantly and you'll see:
- a room code at the top, shown as `STAT‑XXXX` (the last 4 characters are what students need),
- a **join link** with a **Copy link** button,
- a **"Room live"** indicator and a live **connected students** count.

**2. Set up your survey.** In the **Survey** panel on the left:
- **Question / prompt** — what you're asking students to report (e.g. *"How many hours did you sleep?"*). This text appears on every student's screen.
- **Data type** — choose one:
  - **Numerical — continuous** — measurements that can take any value (height, time, temperature).
  - **Numerical — discrete** — whole‑number counts (siblings, dice rolls, pets). Decimals are rounded.
  - **Categorical** — text categories (favorite subject, eye color, yes/no).
- **Allow multiple submissions** — leave **off** for one response per student (e.g. a survey), or turn it **on** for repeated‑trial data collection (e.g. *"roll a die 10 times"*).

  You can change any of these **during** the session — updates are pushed to every connected student immediately.

**3. Share the room.** Click **Copy link** and paste it wherever students can reach it, **or** just read out the 4‑character code and have students type it in. A student who opens the link joins automatically; a student who has the code enters it on the join screen.

**4. Watch the data arrive.** As students submit, entries appear at the top of the **Responses** table (newest first) with a timestamp. The **Summary** panel and the chart update in real time.

**5. Clean the data if needed.**
- Hover any row and click the **trash icon** to delete a mistaken or joke entry.
- Use the **"Add a value manually…"** box to type in a value yourself (handy for a student whose laptop won't connect — just collect their number verbally and add it).

**6. Read the statistics.** The **Summary** panel shows **n, mean (x̄), median, standard deviation (s), min, Q1, Q3, max, range, and IQR**, plus a note counting any values beyond the 1.5×IQR outlier fences. For categorical data it shows the count, number of categories, the mode, and the mode's share.

**7. Explore the distribution.** Use the tabs above the chart:
- **Box plot** — the five‑number summary with outliers marked as separate points.
- **Histogram** — drag the **Bin width** slider to show the shape at different resolutions (a great "what happens if we change the bins?" teaching moment).
- **Dot plot** — every observation as a stacked dot.
- **Stem & leaf** — a text stem‑and‑leaf table with a key.
- **Bar / Pie / Frequency** — appear automatically when the data type is categorical.

**8. Export.** Click **CSV** to download every response (entry number, value, timestamp) for grading or later analysis.

**9. Fallback if the network blocks connections.** If students can't connect (see *Troubleshooting*), click **Bulk** and paste a batch of values separated by commas, spaces, or new lines — collect them however you can (hands up, a shared doc, verbally) and paste them in.

> **Keep the host tab open.** Your running view of the session lives in the teacher's tab, and there's no "resume" — if you close or refresh it you can't rejoin that room (you'd start a new one), so **export to CSV** if you want to keep the data. The server holds only the raw values for the session and auto‑expires the room after a few hours of inactivity; no student names or accounts are stored.

### For the student (joining a session)

1. **Open the link** your teacher shared (or go to the app and click **Join as student**, then type the 4‑character code).
2. Watch the badge in the top‑right go from **Connecting…** to a green **Connected**.
3. Read the **question**, type your answer in the box, and click **Submit response**.
   - Numbers are validated as you go (whole numbers for discrete questions); categorical questions accept text.
4. You'll see a green **"Submission received"** confirmation. If the teacher allows multiple responses, a **Submit another response** button appears; otherwise you're done.

If your badge turns red / says **Disconnected**, click **Try again**, or ask your teacher to re‑share the link — the session may not have started yet.

### A worked example

> **Goal: explore the distribution of the class's heights.**
>
> 1. Teacher clicks **Host a session**, sets the question to *"Height in inches"* and the data type to **Numerical — continuous**, leaves multiple submissions **off**.
> 2. Teacher clicks **Copy link** and drops it in the class chat.
> 3. Each student opens it, types their height, and submits.
> 4. As the numbers land, the teacher switches to the **Histogram** and slides the **bin width** to show how the shape changes, then to the **Box plot** to point out the median, quartiles, and any outliers — the numbers on the chart match the **Summary** panel exactly.
> 5. Teacher clicks **CSV** to save the data for tomorrow's lesson.

### Tips for the classroom

- **Project the teacher view** and keep the room code visible so latecomers can join.
- Use the **manual add** box to include students whose device can't connect — no one gets left out of the dataset.
- Turn **Allow multiple submissions** on for experiments with repeated trials (coin flips, dice, reaction‑time tests).
- Deleting an outlier live is a great way to *show* how a single point moves the mean, standard deviation, and the box plot.

---

## How it works

- **Client‑server, single origin.** A small [Cloudflare Worker](worker/) serves both the app (one HTML file) **and** its API from one domain. Student browsers `POST` their values to that service over ordinary HTTPS; the teacher's browser polls the same service for new submissions and the live student count. No WebRTC, no peer‑to‑peer, no STUN/TURN, no signaling — just standard, filterable web traffic to one host. See [DEPLOY.md](DEPLOY.md) for the full architecture and endpoints.
- **Ephemeral, privacy by design.** Each 4‑char room is one [Durable Object](worker/room.js) that holds the live config, buffers submissions, enforces one response per student, and **auto‑expires** a few hours after the last activity. No accounts, no logins, no student PII — only survey values and the config, kept only until the room expires.
- **Trustworthy math.** Standard deviation is the sample statistic (divides by *n − 1*). Quartiles use the Moore & McCabe "median of halves" method taught in intro/AP statistics, and the box plot is drawn from those same numbers so the chart and the summary panel always agree.
- **Resilient.** Manual and bulk data entry work regardless of the network, so a lesson can always proceed.

## Tech

Frontend: plain HTML/CSS/JavaScript, no build step, loaded from CDNs:

- [Tailwind CSS](https://tailwindcss.com/) — styling
- [Plotly.js](https://plotly.com/javascript/) `2.29.0` — charts

Backend: a [Cloudflare Worker + SQLite‑backed Durable Object](worker/) (`wrangler`), co‑hosting the static app and the `/api` on one origin. Free tier, serverless, near‑zero maintenance.

## Run it locally

```bash
npm install
npm run dev      # wrangler dev → http://localhost:8787
```

This serves the app **and** the API together. Full local verification steps and an API smoke test are in [DEPLOY.md](DEPLOY.md).

## Hosting

Deploy the Worker (it serves both the frontend and the backend) with `npm run deploy` — a free Cloudflare account is all that's needed. Step‑by‑step instructions, and notes on the old GitHub Pages URL, are in [DEPLOY.md](DEPLOY.md).

## Troubleshooting

| Symptom | Likely cause | What to do |
|---|---|---|
| Student badge stuck on **Connecting…** then **Disconnected** | The session hasn't started yet, or the code is wrong | Make sure the teacher has clicked **Host a session**; re‑check the 4‑character code; click **Try again**. |
| Student sees **"No session found for code …"** | Wrong code, or the room expired / the teacher closed the host tab | Re‑share the current link/code from the teacher's screen; the teacher may need to host again. |
| Students can't reach the app at all | The network is blocking the app's domain, or they're offline | Confirm the app domain is allowed by the school filter (see [SCHOOL-IT-REQUEST.md](SCHOOL-IT-REQUEST.md)); otherwise use the teacher's **Bulk** paste / **manual add**. |
| A student submitted twice | **Allow multiple submissions** was on, or they used a different browser/device | Turn the toggle off for one‑per‑student; delete extra rows with the trash icon. The one‑per‑student limit is best‑effort (it can't stop someone using a brand‑new device). |
| Teacher's data disappeared | The host tab was closed/refreshed, or the room expired (TTL) | Rooms are ephemeral by design. Export to **CSV** periodically if you want a backup. |

**About connectivity:** all traffic is ordinary HTTPS (port 443) to a single
domain — the Worker that serves both the app and the API. That is exactly the
kind of traffic a school content filter can categorise and allow, which is the
whole reason the app moved off WebRTC/peer‑to‑peer. The only allowlist entry a
school needs is that one domain (plus the CDN/font hosts the page already loads).
See [SCHOOL-IT-REQUEST.md](SCHOOL-IT-REQUEST.md) for the request to hand to IT.

## Changelog

### 2026-10-01

Re‑architected the real‑time transport from **WebRTC peer‑to‑peer to a standard
client‑server web app over HTTPS**, after the school district's IT department
categorically rejected WebRTC/P2P on their network (uninspectable, device‑to‑device,
third‑party infrastructure — so self‑hosting a relay would have failed too).

**Changed**
- Removed PeerJS, `window.RTC_CONFIG`, and all metered.ca/TURN/STUN/signaling code.
- Student and teacher now talk to a single web service over ordinary HTTPS. The
  `CONFIG` / `DATA_SUBMIT` / `ACK` message shapes and the per‑`cid` one‑response
  dedupe are preserved, so all stats/charts/datasets/simulation/CSV UI is unchanged.

**Added**
- A [Cloudflare Worker + Durable Object backend](worker/) that co‑hosts the static
  app and the `/api` on one origin (one filterable domain, no CORS). One Durable
  Object per room code is the ephemeral session; rooms auto‑expire via a TTL alarm.
  No accounts, no PII.
- [DEPLOY.md](DEPLOY.md) — deploy/run guide and IT‑request update notes.

**Fixed**
- Teacher live poll re‑ingested every submission each tick (it never sent the
  `since` cursor), so one student showed up as many rows. Now sends `?since=<seq>`.

### 2026-09-16

Merged two independent lines of work: a connectivity overhaul that keeps sessions alive on locked‑down school networks, and a data‑analysis expansion that turns the single live survey into a multi‑dataset workspace with a built‑in simulation tool.

**Added**
- **Multi‑network discovery** — teacher and students join a room over **MQTT brokers, Nostr relays, and BitTorrent trackers simultaneously**; the connection forms over whichever transport the firewall doesn't block. Strategies load via `Promise.allSettled`, so one failing network can't take down the others.
- **On‑screen "Connection diagnostics" panel** (both roles) reporting which networks loaded/connected, plus an independent **TURN/STUN self‑test** and a **Copy report** button — so a failed classroom test is understandable without DevTools.
- **Multi‑dataset workspace** — hold several named datasets as tabs; **Combine** (pool) and **Split** (by threshold or category) build new datasets non‑destructively while the live survey keeps running.
- **Simulation tool** — define one trial (draw *n* from a model, record a statistic), repeat *R* times, and the resulting distribution becomes a new dataset that flows into the existing stats and charts. Models: coin, die, spinner, uniform int/real, normal, binomial, poisson, exponential. Seedable RNG for repeatable demos.

**Changed**
- Discovery switched from the deprecated `trystero@0.25.4/mqtt` subpath to the split `@trystero-p2p/*` packages.
- Teacher session state (`config`, `dataset`, `seq`, `activeViz`, `binWidth`) is now derived via getters over the active/live dataset, so the multi‑dataset workspace layers on top of the existing transport code without touching it.

**Fixed**
- **Sessions no longer hang on "Connecting…" on the deployed build.** The deployed build imported `trystero@0.25.4/mqtt`, but in 0.25.x that subpath is deprecated and *throws* on import — so `window.Trystero` was never set and the `trystero:ready` event never fired. Fixed by moving to the split `@trystero-p2p/*` packages.
- **Cross‑network peer tracking.** Trystero uses one `selfId` per page across all strategies, so the same peerId appears in every room. The teacher now tracks each peer's *set* of rooms (a leave on one network no longer evicts a student still connected on another) and replies over the room a message actually arrived on.

## License

[MIT](LICENSE)
