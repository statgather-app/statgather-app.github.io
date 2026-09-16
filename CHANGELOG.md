# Changelog

All notable changes to StatGather are documented here. Dates are in
`YYYY-MM-DD` format.

## 2026-09-16

This release merges two independent lines of work: a connectivity overhaul that
makes sessions survive locked-down school networks, and a data-analysis
expansion that turns the single live survey into a multi-dataset workspace with
a built-in simulation tool.

### Added

**Multi-network connectivity & diagnostics**
- Teacher and students now join a room over **MQTT brokers, Nostr relays, and
  BitTorrent trackers simultaneously**, instead of a single discovery network.
  The connection forms over whichever transport the firewall doesn't block, and
  the student then collapses onto that one. Strategies load via
  `Promise.allSettled`, so one failing network can't take down the others.
- A collapsible **on-screen "Connection diagnostics" panel** (both roles)
  reports which networks loaded and connected and runs an independent
  **TURN/STUN self-test** — so a failed classroom test is understandable
  without opening DevTools. A **"Copy report"** button produces a shareable
  summary.

**Multi-dataset workspace**
- Hold several named datasets in one session as **tabs**. View any one (the
  active dataset) while students keep submitting into the live survey.
- **Combine** (pool datasets) and **Split** (by threshold or by category)
  produce new datasets **non-destructively** — the original data is never
  modified.

**Simulation tool**
- Define one trial (draw *n* values from a model and record a statistic),
  repeat it *R* times, and the resulting distribution of that statistic becomes
  a new dataset that flows into the existing summary stats and charts.
- **Models:** coin, die, spinner, uniform int/real, normal, binomial, poisson,
  exponential.
- **Statistics:** sum, mean, count/proportion by condition, min/max/range/
  median/sd, category count/proportion, distinct, or each raw draw.
- **Seedable RNG** for repeatable classroom demos.

### Changed

- Discovery switched from the deprecated `trystero@0.25.4/mqtt` subpath to the
  split `@trystero-p2p/*` packages (see the fix below).
- The teacher's core session state (`config`, `dataset`, `seq`, `activeViz`,
  `binWidth`) is now derived via getters over the active/live dataset, so the
  new multi-dataset workspace layers on top of the existing transport code
  without touching it.

### Fixed

- **Sessions no longer hang on "Connecting…" on the deployed build.** Root
  cause: the deployed build imported `trystero@0.25.4/mqtt`, but in 0.25.x that
  subpath is deprecated and *throws* on import. The module errored out,
  `window.Trystero` was never set, the `trystero:ready` event never fired, and
  every teacher/student hung. Fixed by switching to the split
  `@trystero-p2p/*` packages.
- **Cross-network peer tracking.** Trystero uses one `selfId` per page across
  all strategies, so the same peerId appears in every room. The teacher now
  tracks each peer's *set* of rooms — a leave on one network no longer evicts a
  student still connected on another — and always replies (acks/config) over
  the room a message actually arrived on, rather than a stored context that may
  point to a room the student has already left.
