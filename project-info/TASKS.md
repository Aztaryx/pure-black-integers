# Tasks

Track active and completed work here so multiple agents can coordinate.

## Template

```text
### [Status] Short task title
- Owner:
- Files:
- Acceptance criteria:
- Validation:
- Follow-up:
```

### [Completed] Build the complete interactive lesson deck
- Owner: Copilot
- Files: index.html, style.css, script.js
- Acceptance criteria: Preserve the intro/title/chip-mat flow and add beat-by-beat content for Portions 2–10 with Next/Back controls.
- Validation: Static server returns 200 for HTML, CSS, and JavaScript; JavaScript deck data and controls are present.
- Follow-up: Use a browser to verify full-screen layout and timing.

### [Ready for review] Consistent left-aligned deck layout
- Owner: Claude
- Files: index.html, style.css, script.js, project-info/DECISIONS.md
- Acceptance criteria: All deck slides share one header-plus-body structure and are left-aligned instead of centered; the Portion/Beat bar is removed; the chip mat slide matches the header position.
- Validation: 2026-11-18: `node --check script.js` passes and no deck slide overflows its content area at 1366×768. Not yet reviewed visually in a browser.
- Follow-up: Verify visually in a browser at presentation size, especially the 9.2 quiz slide and long question titles.

### [Planned] Add graphics to deck slides
- Owner: Unassigned
- Files: script.js (helpers and beat data), style.css (`.deck-visual` and graphic styles)
- Acceptance criteria: Each portion's slides carry the graphics listed in "Graphics plan" in DECISIONS.md; no dependencies; reduced-motion keeps a static end state.
- Validation: To be defined when work starts.
- Follow-up: Build the shared helpers first (`numberLine`, `scoreboard`, `pips`, `zeroPair`, `iconSvg`).
