# HAI replay installation and controls

HAI 20.07 is installed from the [official HAI repository](https://github.com/icsdataset/hai).
The application reads the four compressed files directly; decompression on disk is unnecessary.
Dataset files, their manifest, and trained weights stay local and are excluded from Git.

Installed recording sizes: train1 309,600 rows, train2 241,200 rows,
test1 291,600 rows, test2 153,000 rows. Constant training columns are excluded, leaving 51 tags.
The SHA-256 checksums, Git blob identities, upstream commit, and download URLs are recorded in
`data/hai/manifest.json`. Repeat the verification/download from the project root:

```powershell
backend/.venv/Scripts/python.exe scripts/download-hai.py
```

The existing backend startup trains missing HAI models and loads the replay. On this installation,
GDN and MLP were already trained for the pipeline's standard 12 epochs; GDN was selected using
test2 tuning. Clean training validation uses the last 10% of the combined training recordings.
Held-out evaluation uses test1. The resulting HAI section is saved in `reports/metrics.json`
and displayed on the Metrics screen.

Select **HAI** to see the Process Graph and recording panel. The panel shows the recording name,
usable tag count, model, sample rate, absolute recording offset, loop start, and actual replay
position. Pause/resume and 1×–20× speed affect the shared replay source; the graph's separate
motion controls only change the illustration. Restart returns to five minutes before the first
annotated attack. Offsets are not original recording timestamps. Progress covers the whole file,
so the initial position is above zero. The source continues emitting heartbeats while paused.

Process filters isolate P1–P4. Process frames describe groups, not a verified physical piping
diagram. Dashed links are learned associations; red paths are inferred effects. Amber paths have
uncertain direction and show no arrow or moving pulse. Animation illustrates relative order and
does not represent packet traces or measured travel times. Motion pauses for stale data and
respects the operating system's reduced-motion setting.

## Actual held-out results from this installation

| Measure | Result |
| --- | --- |
| Attack windows detected | 26 / 28 |
| Precision | 0.237 |
| Recall | 0.617 |
| F1, without point adjustment | 0.342 |
| False alarms per normal hour | 2.94 |
| Mean delay among detected windows | 35.9 recording seconds |

High window coverage coexists with substantial false positives. These are offline evaluation
results, not a guarantee for every replay incident. Evaluation localization tunes weights on
test2; the running replay uses the configured localization weights. Process labels do not
verify the exact attacked component, firmware, channel, or physical actuator. Attack labels are
reserved for evaluation and choosing the initial demonstration offset; they are not returned
by the replay metadata endpoint or fed into detection scores.

Backend `GET /api/hai/replay` reports current metadata. Authenticated `POST /api/hai/replay`
accepts `paused` and/or a finite `speed` from 1 to 20, and requires HAI to be the active source.
It neither creates attacks nor changes connected equipment.
