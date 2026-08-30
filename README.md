# StatGather

**Collect a whole class's data live, compute the statistics, and see the distribution — right from the front of the room.**

StatGather is a single-file, serverless web app for teaching statistics. The teacher opens a session on the projector; students join from their laptops with a 4‑character room code and submit data points that travel **directly** to the teacher's browser over a peer‑to‑peer WebRTC connection. StatGather computes the summary statistics and draws the distribution as the numbers arrive.

No accounts. No spreadsheet. No server. No student data is ever stored anywhere but the teacher's screen.

👉 **Live app:** https://hamzaalisayeed-eng.github.io/StatGather/

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
- **Bulk paste** or manual entry as a fallback if the school network blocks peer‑to‑peer traffic.
- Toggle whether students may submit **more than one** response.

### Student (client)
- Open the teacher's link (or enter the code) — it connects automatically.
- See the survey question, enter a validated response, and submit.
- Get a clear "Submission received" confirmation.

---

## How it works

- **Peer‑to‑peer, serverless.** Student browsers connect directly to the teacher's browser using [PeerJS](https://peerjs.com/) (WebRTC). There is no backend and no database — the entire app is one static HTML file.
- **Privacy by design.** Data lives only in the teacher's browser tab for the duration of the session. Closing the tab discards it. Nothing is uploaded or persisted.
- **Trustworthy math.** Standard deviation is the sample statistic (divides by *n − 1*). Quartiles use the Moore & McCabe "median of halves" method taught in intro/AP statistics, and the box plot is drawn from those same numbers so the chart and the summary panel always agree.
- **Resilient.** If a school network blocks WebRTC, the teacher can still run the lesson with manual and bulk data entry.

## Tech

Plain HTML/CSS/JavaScript — no build step. Loaded from CDNs:

- [Tailwind CSS](https://tailwindcss.com/) — styling
- [PeerJS](https://peerjs.com/) `1.5.2` — WebRTC data channels
- [Plotly.js](https://plotly.com/javascript/) `2.29.0` — charts

## Run it locally

Because it uses WebRTC, open it over `http://` rather than `file://`:

```bash
# from the project folder
python -m http.server 8000
# then visit http://localhost:8000
```

## Hosting

StatGather is designed to be hosted for free on **GitHub Pages** — it's a single static file. This repository is published at the live link above.

## A note on connectivity

StatGather uses PeerJS's free public brokering service to help peers find each other. This is ideal for a classroom, but very restrictive networks may block WebRTC entirely — in that case use the built‑in **Bulk manual input** as a fallback.

## License

[MIT](LICENSE)
