# Responsive UI validation — 16 October 2026

Implemented the navigation, monitoring, Copilot, collection and responsive layout work in
[the implementation plan](UI_UX_IMPLEMENTATION_PLAN.md). Deployment remains deferred.

## Changes delivered

- Shared page width, gutters, typography and selected-page navigation across all seven routes.
- Phone workspace selector; Process, Test scenario and Incident panel choices on monitoring.
- Mobile alert, asset and origin-hypothesis cards; desktop tables retain local scrolling.
- Source coverage appears before technical references. Lab hashes/configuration are collapsible.
- Copilot task prompts, readable messages, context, multiline input and focus restoration.
  Background content is inert while open; the backdrop remains clickable to dismiss.
- Process graph starts with the topology fitted; explicit 100% provides inspection scale.
  Short desktop windows now allow vertical scrolling to preserve a useful canvas height.
- Twin fits the available width and selected phone asset details grow without clipping.
- Internal navigation preserves browser history without full-document reloads.
- Scenario reset reports success only after the server accepts it; failed resets preserve state.

## Actual browser checks

All seven routes were captured and measured at these CSS viewport widths:

| Width | Result |
| --- | --- |
| 320 | Final pass: no page-level horizontal overflow |
| 375 | Final pass: no page-level horizontal overflow |
| 768 | No page-level horizontal overflow |
| 844 × 390 landscape | No page-level horizontal overflow; vertical scrolling retained |
| 1024 × 768 | No page-level horizontal overflow |
| 1366 × 768 | Final pass after canvas-height adjustment: no page-level horizontal overflow |
| 1920 × 1080 | No page-level horizontal overflow |

Measurements and screenshots: `ui-review/2026-10-16/responsive-audit.json` and adjacent JPEGs.
Initial failed checks are retained; use final-stage records for the corrected 320/375/1366 layouts.
The 1440px scaled preview was not used as the acceptance viewport.

Observed interactions: phone scenario/incident panels; launch and reset feedback; alert-to-case
navigation; browser Back/Forward; graph Overview/100%; theme ArrowDown/Escape; Copilot message
response, Escape focus return and backdrop dismissal. The phone asset inspector measured 514px
of client content against 514px scroll height, with no clipped internal content. Temporary viewport
overrides were reset and the local workspace left open. The local SIM test scenario was reset;
saved incident records remain available.

Monitoring screenshots have now been visually reviewed in all nine themes. Theme token tests cover
the nine palettes; this is not a claim that every theme/page/state combination has manual approval.

## Verification

- Frontend lint: passed with no warnings.
- TypeScript and production build: passed.
- Frontend tests: 148 passed across 24 files.
- A stale development-module error after server restart cleared with a fresh page reload.

## Remaining acceptance work

Native browser zoom at 200%/400%, a real screen reader, physical touch devices, and visual review of
every theme/page/state combination remain unverified. Viewport resizing is not native browser zoom.
Hosted OAuth, multi-user authorization and deployment acceptance remain separate production gates.
Wide scientific tables and diagrams intentionally retain contained scrolling/zooming controls.

## Screenshots

- Original: `ui-review/2026-10-16/before-dashboard.jpg`
- Wide monitoring: `ui-review/2026-10-16/wide-1920-monitoring.jpg`
- Laptop graph after height correction: `ui-review/2026-10-16/final-graph-laptop.jpg`
- Copilot real answer: `ui-review/2026-10-16/final-copilot-laptop.jpg`
- Phone Copilot: `ui-review/2026-10-16/final-phone-copilot.jpg`
- Phone asset detail: `ui-review/2026-10-16/final-phone-asset.jpg`

## Accessibility and journey follow-up

Implemented and checked on the same date:

- Shared modal focus handling for Copilot and expanded process view: background siblings become
  inert, body scrolling locks, disabled/hidden controls are excluded, Tab/Shift+Tab wrap, Escape
  restores the opener, and closing restores prior inert/scroll state. The expanded process view
  previously lacked background isolation; its focus now starts on its exit button.
- Expanded phone asset view previously clipped its growing evidence list behind a fixed-height
  container. The dialog now scrolls; keyboard navigation reached the bottom close button and wrapped
  back to the asset selector. Observed at 320px: 774px dialog client height with about 3105px scrollable
  content, using overflow auto.
- Theme menu opens with ArrowUp/ArrowDown, supports directional selection and closes on focus exit.
  Tab now leaves the menu for the next toolbar utility, rather than visiting all nine theme choices.
- All seven pages passed a repeated 320px reflow check. Skip links focused `main-workspace` on all
  seven. A basic visible-control name heuristic found no unnamed controls; this is not an axe audit
  or a full assistive-technology validation. Results: `ui-review/2026-10-16/accessibility-audit.json`.
- Enabled the browser's reduced-motion media preference temporarily: matchMedia reported true and
  sampled twin flow animations computed to `none`. The preference override was cleared afterward.
- Followed Alerts to saved test incident `inc_a107b98fc57744cea796411c2234e907`, asked Copilot for
  origin/path/evidence/alternatives/uncertainty, reviewed the selected incident answer and its evidence
  references. Saved one clearly labelled local usability-test note; confirmed it remained in the
  operator-decision chronology after page reload. No analyst severity or case-state change was made.
- Added a live save-confirmation status beside the note form. Temporarily blocked the workflow
  endpoint to test failed saves: draft text remained, the error became a useful connection message,
  and journal refresh no longer cleared the save error. Network blocking was removed and the failed
  test draft cleared. No failed-test note was submitted to the server.
- Repeated lint, TypeScript/build and frontend tests after the final changes: all pass, 148 tests.

Native zoom keyboard input did not produce a verified browser zoom change in the in-app browser;
200%/400% acceptance stays open. No real screen reader was available in this browser session.

Additional actual screenshots: `accessibility-case-copilot.jpg`, `accessibility-note-persisted.jpg`,
`accessibility-note-save-error-fixed.jpg`, `accessibility-expanded-phone-bottom.jpg`,
`accessibility-copilot-320.jpg`, and `accessibility-theme-*.jpg` in the review directory.
