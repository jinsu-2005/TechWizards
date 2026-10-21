# AttackTrace visual review — 15 October 2026

Follow-up: calibration persistence, model references, baseline comparison, and the Metrics bundle improvement are complete. See [implementation delivery](../IMPLEMENTATION_DELIVERY.md) for final measurements and remaining native zoom and screen-reader checks. Findings below retain the original review context.

Open [the screenshot comparison](index.html) for the original interface, generated concept, actual implementation, phone captures, and nine theme captures.

## Findings and implemented changes

| Finding | Change |
| --- | --- |
| Dense HAI graph shrank labels to an unreadable scale | Legible initial scale, explicit zoom percentage, 100% and Overview controls; process filtering and responsive process layout |
| Filters and details consumed the graph workspace | Collapsible filters, motion settings, recording details, and tag scores |
| Graph viewport could retain an unsuitable fit after resizing | Resize observation and refitting; selected HAI process stacks vertically on phones |
| Floating zoom controls could cover a process heading | Dedicated zoom toolbar above the canvas |
| Learned associations visually competed with the assets | Softer learned links, distinct inferred-path styling and motion pause/speed controls |
| HAI incident overview used simulator-specific reading labels | Real HAI tags and model status counts; unavailable physical evidence stays explicit |
| Navigation varied across supporting screens | Shared active-page navigation and theme selection; compact dashboard Workspace menu on phones |
| Long case identifiers and Copilot messages could crowd narrow layouts | Truncation/wrapping, mobile drawer sizing, fixed visible composer, background scroll lock |
| Loading cases briefly looked like an empty journal | Explicit initial loading states |
| Long asset lists were hard to scan | Search, role filter, result count, sticky table heading and keyboard-focusable scrolling region |

## Generated reference versus actual UI

The built-in image-generation model produced `design-reference.png`. Its exact prompt and design decisions are in [IMAGE_PROMPT.md](IMAGE_PROMPT.md). The concept informed spacing, graph emphasis, clearer controls and collapsible detail. Product UI remains native React, CSS and SVG.

Illustrative dates, engineering units, physical relationships and a combined HAI/LIVE indicator in the generated image were rejected. HAI is recorded replay; graph associations and inferred origins do not establish a verified intrusion route.

## Verification

- Frontend: 137 tests passed; lint, TypeScript and production build passed before the final zoom-toolbar positioning refinement. Lint/build were repeated for that refinement.
- Captured dashboard layouts across 320×568, 390×844, 768×1024, 1366×768, 1440×1000 and 1920×1080 during this review.
- All six supporting routes checked at 390×844: Alerts (11 records), Assets (51), Sources, Investigations, Metrics and Local lab. No horizontal page overflow; wide tables intentionally scroll inside their regions. Raw measurements: [mobile-pages-audit.json](mobile-pages-audit.json).
- Asset search `P3_` returned three assets; selecting Sensor reduced the list to `P3_LT01`.
- Graph zoom in/out, 100%, Overview, motion pause/resume, process filtering, workspace expansion, asset inspection and Escape exit exercised.
- Simulator Launch remained 40px tall at the tested laptop size. A controlled test incident was reset, and HAI replay restored.
- Nine themes captured and visually reviewed. Theme token contrast tests passed. These checks do not constitute a complete accessibility certification.
- Copilot composer stayed visible at 390×844. Opening locked background scroll; Escape closed the drawer and restored scrolling. A completed data-mode answer correctly distinguished SIM, HAI, LIVE and Modbus. Closing an in-progress request correctly cancelled it; the subsequent request completed through the evidence-summary response.

## Remaining scope

All-process HAI overview intentionally reduces labels; use process filtering, pan or 100% for reading. Phones use vertical page scrolling. Testing used the available in-app browser, not every browser engine or physical touchscreen. Browser page zoom and screen-reader workflows need a separate accessibility pass.

The timeline's fixed relative-time labels should be derived from the actual retained sample timestamps in a future functional pass. The Metrics bundle still triggers a size advisory (~555 kB before gzip); lazy chart-module loading is a separate performance improvement. Neither prevents this build from succeeding.

Real firmware and communication-channel attribution still requires corroborating evidence. This visual review does not change the project's local simulator / Modbus emulator scope.
