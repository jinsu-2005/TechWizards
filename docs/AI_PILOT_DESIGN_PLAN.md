# AI Pilot · Signal Room design plan

## Master idea

AI Pilot is an investigation instrument inside AttackTrace, not a generic chatbot. The visual motif is a **signal lens**: concentric traces frame the assistant, while a small central waveform reflects the real Live Voice state. The primary interaction is a short answer grounded in evidence. Longer records remain available through progressive disclosure.

The redesign uses the active AttackTrace theme tokens. Blue, emerald, amber, crimson, violet, and titanium all retain the same information hierarchy. Motion communicates a real state change; it never implies that an investigation or model request succeeded when it did not.

## Implementation flow

1. **Audit and information hierarchy — done.** Inspect conversation, Live Voice, model labels, empty/loading/error states, mobile layout, and theme tokens. The old Live Voice card was capped at 48dvh and left unused space below it. Opening the drawer scrolled the welcome state out of view.
2. **Conversation surface — done.** Give AI Pilot a stronger header and source context, segmented Conversation/Live Voice navigation, a signal-lens welcome state, numbered investigation prompts, visible local-vs-Gemini model labels, and a clearer composer. Preserve existing questions, evidence actions, and security behavior.
3. **Live Voice surface — done.** Fill the available drawer height. Give connecting, listening, thinking, speaking, muted, and disconnected states different copy and visuals. Group adjacent transcript fragments by speaker, retain transcript history on reconnect, and keep mute/end/voice-device controls discoverable.
4. **Responsive and accessible behavior — done.** Use fluid widths, compact phone spacing, 44px controls, visible focus, reduced-motion alternatives, and scrollable transcript/content regions. Verify at 320, 390, 768, and 1440 CSS-pixel widths, plus a light theme.
5. **Follow-up refinements.** Test with real keyboard-only and screen-reader sessions, user interviews with incident investigators, and low-bandwidth/provider-error scenarios. Measure whether the first useful action and the incident evidence are found faster than before.

## Reusable implementation prompt

Work in the existing AttackTrace React frontend. Redesign **AI Pilot only** as a distinctive, modern investigation instrument called **Signal Room**. Preserve all existing backend requests, evidence provenance, source semantics, authentication and role checks, read-only restrictions for HAI/LIVE, voice permissions, transcript behavior, and simulation action confirmation flow.

Start by capturing and inspecting the current conversation and Live Voice screens at 320×640, 390×844, 768×900, and 1440×900; also inspect a light theme. Identify clipping, empty space, weak hierarchy, unclear states, and inaccessible controls before changing code. Use the existing theme variables (`--bg`, `--surface`, `--text`, `--muted`, `--accent`, semantic status colors) rather than hardcoded brand colors. Keep Lucide icons, avoid emoji and generic AI-purple decoration, and make the result feel credible for a cyber-physical incident analyst.

Build a full-height, responsive AI Pilot drawer. Give it a precise header with source/incident context, a two-option segmented tab bar, and a generous but efficient conversation area. Replace the generic welcome screen with a custom CSS/SVG signal-lens motif, a concise headline, and three numbered investigation paths. Make answers visually distinguish user text, Gemini output, local evidence summaries, uncertainty, and expandable evidence. Keep the composer fixed at the bottom with large touch targets and visible keyboard focus. Never let focusing the composer scroll the welcome artwork offscreen.

Redesign Live Voice around one central, stateful visual. The orbit and waveform should communicate **connecting, listening, thinking, speaking, muted, reconnecting, and disconnected** without relying on color alone. Animate only when the underlying state calls for it; use low-cost transform/opacity animation and respect `prefers-reduced-motion`. Keep the AI's spoken greeting, transcript, voice switch, mute, end, device selection, provider disclosure, and clear failure/retry states. Let the transcript use remaining vertical space; do not cap the whole Live Voice view to a short card. Group streaming transcript fragments into readable speaker turns without losing the underlying history.

Maintain readable contrast in every AttackTrace theme. Use fluid sizing and safe-area padding, prevent drawer horizontal overflow, keep controls at least 44px high, and make the layout usable at real browser zoom. Validate with frontend lint, typecheck/build, tests, and real browser screenshots at all target widths in both conversation and Live Voice. Compare before and after captures, repair visible problems, and report any remaining limitations honestly.

## Design references

- Google PAIR, [Explainability + Trust](https://pair.withgoogle.com/guidebook-v2/chapter/explainability-trust/): show only the explanation needed for a decision, while making uncertainty and supporting detail available.
- Google PAIR, [AI design patterns](https://pair.withgoogle.com/guidebook-v2/patterns): explain for understanding, not completeness, and give users control when automation fails.
- Atlassian Design, [Motion](https://atlassian.design/foundations/motion): use purposeful motion with a reduced-motion alternative.
- MDN, [`prefers-reduced-motion`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-reduced-motion): respect the operating-system motion preference.
