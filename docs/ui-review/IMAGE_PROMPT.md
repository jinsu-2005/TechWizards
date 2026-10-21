# Generated UI reference

Created with the built-in image-generation tool. The PNG is a design reference only; the
implemented interface renders actual source data using React, SVG, and CSS.

## Final generation prompt

Use case: ui-mockup. Create a polished high fidelity redesign reference for AttackTrace, a working industrial cybersecurity monitoring dashboard. This is a conceptual layout reference, not a production screenshot. Wide desktop 1536x1024 composition, flat screen capture with no device frame. Preserve the practical dark obsidian visual identity: near-black navy background, slightly lighter panels, readable white and slate text, blue selected controls, amber for suspect, red reserved for attack origins, green normal. Header: AttackTrace; SIM HAI LIVE source tabs with HAI selected; Alerts Assets Metrics Sources Investigate; theme and AI Copilot. Three columns: compact 240px HAI Replay panel left, dominant Process Graph center, compact 280px incident panel right. Left panel first shows HAI 20.07, test1 recording, 51 tags, a progress bar and visible Pause and 10x replay controls near its top; secondary recording details below in disclosure section. Center graph toolbar has compact search and process filter; canvas tall and readable with 3 large sensor/actuator cards for P3 water treatment connected by understated dashed learned-association links, not a tangled mesh. Label example tags P3_LCP01D, P3_LCV01D, P3_LT01 with example readings. Explicit graph zoom controls + minus 100% Overview and an expand button, generous room for graph canvas. Right panel title Incident review, neutral No active incident, monitored tag status counts and HAI-specific readings, no empty SIM tanks or pumps. Bottom spans a calm telemetry timeline with readable labels and thin blue sparklines. Typography highly legible 13-16px, consistent eight-pixel spacing rhythm, quiet borders, clear grouping and alignment. No giant glowing gradients, decorative charts, invented risk scores, or tiny unreadable node clouds. Add a small label at bottom 'Design reference · illustrative values'.

## Comparison decisions

Adopted: dominant graph canvas, readable scale, controls near the top of the replay panel,
collapsible secondary details, quieter links, HAI-specific status and readings, explicit zoom.

Rejected: the generated image incorrectly merges HAI/LIVE and invents recording timestamps,
engineering units, physical relationships, and durations. Those are not implemented. Only
the dataset's actual learned links, values, and supplied metadata appear in the running app.
