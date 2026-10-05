# StatGather — Draft / Learning Version

A simpler, from-scratch re-code of StatGather, built as a **coding activity** to
practise HTML, CSS, and JavaScript.

## The two files

| File | What it is |
| --- | --- |
| **`activity.html`** | The scaffold. The app is split into numbered sections (1, 2, 3, … with sub-steps like 2.1, 2.2). Each section has a comment block explaining what it's for and roughly what code to write. You fill in the code. |
| **`solution.html`** | The finished, working version. Same section numbers, no explanations. Use it as an answer key when you're stuck — and try adding your *own* comments to it at the end to show you understand each part. |

The section numbers line up between the two files, so you can jump straight from
a comment block in `activity.html` to the matching code in `solution.html`.

## How to run it

PeerJS needs `http://localhost` or `https` (opening the file with a `file://`
path won't connect), so serve the folder with a tiny local web server:

```
python -m http.server 8000
```

Then open <http://localhost:8000/solution.html> (or `activity.html` once you've
filled it in).

To test the live part you need **two** browser windows (or two devices on the
same network):

1. Window 1 → **Host a new session**. Note the room code (e.g. `STAT-AB12`).
2. Window 2 → **Join as student** → type the code → **Connect** → submit a number.
3. Watch the host's table, summary, and chart update.

You can also just use **Add a value manually** or **Bulk** on the host screen to
try the statistics and charts without a second device.

## What's in it

- **Statistics**: N, mean, median, sample standard deviation (s), quartiles, IQR,
  min / max / range, and 1.5·IQR outliers.
- **Charts** (Plotly): box plot, histogram, dot plot, and a hand-built
  stem-and-leaf plot.
- **Student response system** over **PeerJS** (teacher ↔ students, no backend),
  with a simple message protocol (`CONFIG`, `DATA_SUBMIT`, `ACK`, `REJECT`) and
  de-duplication of resent submissions.
- **Responses**: live table, manual add, bulk paste, and CSV export.

## How this differs from the production app

This draft deliberately drops features to stay small and teachable:

- Uses **PeerJS** for a direct teacher↔student connection instead of the
  Cloudflare backend.
- No simulation, and no dataset merge / split.
- Plain, hand-written CSS (no Tailwind, no gradients / glow / animation).
- Numeric data only (continuous / discrete), matching the four distribution charts.

It can be hosted as a static page (e.g. GitHub Pages) later with no changes.
