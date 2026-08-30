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

## How to use it

### Quick start (about 30 seconds)

1. The **teacher** opens the [live app](https://hamzaalisayeed-eng.github.io/StatGather/) and clicks **Host a session**.
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

> **Keep the tab open.** The whole session lives in your browser tab. If you close or refresh it, the room and its data are gone. There's nothing on a server to recover.

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

## Troubleshooting

| Symptom | Likely cause | What to do |
|---|---|---|
| Student badge stuck on **Connecting…** then **Disconnected** | The session hasn't started yet, or the code is wrong | Make sure the teacher has clicked **Host a session**; re‑check the 4‑character code; click **Try again**. |
| Student sees **"No session found for code …"** | Wrong code, or the teacher's tab was closed/refreshed (which ends the room and creates a new code) | Re‑share the current link/code from the teacher's screen. |
| Several students can't connect at all | The network is blocking WebRTC (common on locked‑down school Wi‑Fi) | Use the teacher's **Bulk** paste or **manual add** to enter values collected another way. |
| A student submitted twice | **Allow multiple submissions** was on, or they used a different browser/device | Turn the toggle off for one‑per‑student; delete extra rows with the trash icon. The one‑per‑student limit is best‑effort (it can't stop someone using a brand‑new device). |
| Teacher's data disappeared | The teacher tab was closed or refreshed | Nothing is stored on a server by design. Export to **CSV** periodically if you want a backup. |

**About connectivity:** StatGather uses PeerJS's free public brokering service so peers can find each other. This is ideal for a classroom, but very restrictive networks may block WebRTC entirely — in that case use the built‑in **Bulk manual input** as a fallback. (For a fully self‑contained deployment you can run your own [PeerServer](https://github.com/peers/peerjs-server); the app currently uses the default public broker.)

## License

[MIT](LICENSE)
