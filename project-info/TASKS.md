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

### [Planned] Polish pass: animations and demos
- Owner: Claude
- Files: script.js (animation helpers, click handlers, per-beat demos), style.css (keyframes and states)
- Acceptance criteria: Every item below works with pointer and keyboard; each animation has a static end state under `prefers-reduced-motion`; no dependencies; Next/Back still advance the deck, and a click on an interactive demo does not also advance the slide.
- Validation: To be defined per item; each finished item gets a dated note here.
- Follow-up: Work in the order listed. Push after each finished item.

Animation picks (decided 2026-11-18):

1. Slide entrance (all deck slides): header slides in from the left, rule draws left to right, body items fade up in sequence (about 60 ms apart). Back plays the same entrance, no reverse.
2. Idle (all deck slides): the kicker has a slow pulse on its leading marker; chips in `.chip-row` bob gently with staggered delays; tiles settle with a small tilt. Idle motion pauses while an active animation plays.
3. Active, answer reveals (drills 2.11–2.19, 8.5–8.11, 9.3–9.7): the answer value stamps in (scale from 1.3 to 1 with a hard-shadow pop) and the underline draws on.
4. Active, unscramble (3.2–3.7): tiles start shuffled in position, then slide into the correct order on the reveal slide.
5. On click, chips: clicking a chip in a `.chip-row` flips it (blue to red, +1 to −1) with a short 3D turn; clicking a zero pair makes the two chips merge and fade out.
6. On click, tiles and cards: tiles lift and tilt on press; grid cards and quiz cards lift 4 px on hover and press.
7. Demo, zero pair (5.3): auto-plays once on entry (blue and red chips slide together, flash, vanish, equation lights up to 0), with a "Replay" click on the visual.
8. Demo, number line (3.3, 3.5, 3.7, 5.1, 6.5): the shaded range sweeps in from zero; a hop arrow animates for addition examples.
9. Demo, scoreboard (4.1–4.3): points count up or down into the running total; chips drop onto the board one at a time.
10. Demo, drills (2.10, 2.12, 2.14, 2.16, 2.18): the dot array builds row by row; the pips strip fills.
11. Demo, thermometer and elevator (7.4, 7.6): the mercury level rises and the elevator car moves along the shaft to the answer.
12. Demo, assessment (9.3–9.7): zero pairs get a crossing line drawn through them, then the remainder highlights; 9.7 draws the route line.
13. Next/Back affordance: the Next button gets a subtle nudge animation after 8 seconds of inactivity on a slide.

Not planned: sound, particle effects, any animation that moves text the presenter is reading.

Progress (dated notes; not browser-tested, only `node --check` run):

- 2026-11-18: Items 1, 2 (chip bob, kicker pulse, tile settle), 3, 4, 6 built (entrance, idle, answer stamp, unscramble slide, hover and press).
- 2026-11-18: Items 5, 7, 8 built. Chip click flips blue/red; `zeroPair()` demo on 5.3 auto-plays once and toggles on click or Enter/Space; `numberLine()` added to 3.3, 3.5, 3.7, 5.1 (shaded range sweeps in) and 6.5 (hop arrows for 3 + 2 and (−4) + (−2)). Clicking a chip or zero pair no longer advances the slide; the click handler lives on `#deck-content`.
- Known limits: item 2's "pause idle during active animation" is approximated by delaying idle motion until the entrance finishes. Reduced motion shows the end state of every animation and skips the 5.3 auto-play.
- 2026-11-18: Items 9 (4.1–4.2 only), 10 and 13 built. Scoreboard with a counting total on 4.1 and 4.2 (CSS `@property` integer counter); drill slides 2.10–2.19 now generated from one list, with a dot array that builds row by row and a pips strip; the Next button nudges after 8 s idle (deck and chip mat). 4.3 keeps its chip rows without a scoreboard.
- 2026-11-18: Items 11 and 12 built. `thermo()` on the temperature slides (mercury rises −6 to −2) and `elevator()` on the floor slides (car rides −2 to 3), each beside the chip row; `crossRow()` crosses out zero pairs one by one on the answer slides and rings the leftover chips; 9.7 draws a three-hop route line (7 out, 2 more, 6 back) on a 0–10 number line. `numberLine()` now takes `hops: [[from, to], ...]`; backward hops are red. Beat ids for these slides were matched by their existing content, so check that each one landed on the intended slide.
- Next: icons from the graphics plan (portions 2, 7, 8, 10), the portion 6 merge and pairing graphics, and a browser pass over everything (nothing so far has been looked at visually; only `node --check` has run).

### [In progress] Graphics batches (supersedes "Add graphics to deck slides" order of work)
- Owner: Claude
- Files: script.js, style.css, project-info/
- Constraint: no faces, people, or body parts in any asset (see DECISIONS.md).
- Validation: `node --check script.js` only, by request; no browser testing.
- Batch 1 (2026-11-18): `iconSvg`, `iconRow`, `duo` helpers and their CSS. `numberLine`, `scoreboard`, `pips` and `zeroPair` already existed. Not wired into slides yet.
- Next: on hold until the format change below lands (it changes which slides exist). Then resume Portions 4 to 7, then 2, 3, 8, 9, 10, adapted to the merged slides.

### [Planned] Format change: merge repeat slides into click-order reveals, enlarge sparse assets
- Owner: Claude
- Source: request from the original teacher, relayed by the project owner, 2026-11-18. Do this before more graphics work.
- Files: script.js (`BEATS`, `card()`, `renderDeck`, `deckNext`, `deckBack`), style.css (step reveal, `.big` sizing), index.html (none expected), project-info/
- Acceptance criteria:
  - A slide that repeats the previous slide's asset (same drill array, same tiles, same scoreboard, same chip row or diagram) becomes one slide. Each tap (click, Next, Space, Enter, Right Arrow) reveals the next step in order; the tap after the last step goes to the next slide.
  - Back hides the last revealed step first; at step 0 it goes to the previous slide with all of its steps shown.
  - Steps are marked in slide HTML with `data-step="1"`, `"2"`, and so on. Unrevealed steps are hidden and keep their space, so the layout does not jump.
  - Interactive demos (chip flip, zero pair) still do not advance the slide when clicked.
  - Reduced motion: steps still reveal one per tap, with no animation. The Next nudge still waits 8 s.
  - Sparse slides (a title plus one asset, with little or no text) get a `.big` modifier that scales the asset to fill the free area: larger dot arrays, chips, number lines, thermometer and elevator, with sizes from viewport units, not fixed pixels.
  - Merged slides keep the first beat id as a range (for example `2.10–2.11`, like `6.1–6.4`), so notes and `MAT_IDX` still work.
  - No faces, people or body parts, except the `pair` silhouette (see DECISIONS.md).
- Validation: `node --check script.js` only, by request. No browser testing.
- Merge list (slides before, then after):
  - Drills 2.10 to 2.19 (question + answer, 10 slides): 5 slides. Tap 1 shows the array and question, tap 2 stamps the answer. Arrays use `.big`.
  - Unscramble 3.2 to 3.7 (6 slides): 3 slides. Tap 1 scrambled tiles, tap 2 tiles slide into order and the title becomes the question, tap 3 the number line shading sweeps in.
  - Score board 4.1 to 4.3 (3 slides): 1 slide. Tap 1 Round 1 (+5), tap 2 Round 2 (−3) with the total counting, tap 3 the chip groups. Guide questions 4.4 to 4.7 stay separate and become large solo question slides.
  - Problems 7.3/7.4 and 7.5/7.6: 2 slides. Tap 1 the problem, tap 2 chips and equation, tap 3 the thermometer or elevator.
  - Group answers 8.4/8.5, 8.6/8.7, 8.8/8.9, 8.10/8.11: 4 slides. Tap 1 the problem, tap 2 the answer.
  - Quiz 9.2 to 9.7 (6 slides): 5 slides, one per item; the 9.2 grid is dropped. Tap 1 shows the question and chips, tap 2 crosses out the zero pairs, tap 3 shows the answer (9.7 also draws the route).
  - Unchanged: Portions 2.1 to 2.8, 5, 6, 7.1 to 7.2, 8.1 to 8.3, 10.
- Resolved with the project owner (2026-11-18):
  - Quiz: consolidate, as listed above.
  - Chips: blue chips show no "+" and red chips no "−" (color alone shows the sign). Done in `chips()`, `zeroPair()`, `crossRow()`, `flipChip()` and the chip mat.
  - Prayer: title is just "Prayer", centered on the slide. Done (`card(..., { center: true })`).
- Batches (push after each):
  1. Step-reveal engine: `data-step` markup, `deckNext` and `deckBack` step logic, CSS, README note.
  2. Merge drills, unscramble and score board.
  3. Merge the Portion 7 and Portion 8 pairs and the Portion 9 items.
  4. `.big` enlargement across sparse slides.
  5. Resume the graphics plan on the merged deck.

- Progress (dated):
  - 2026-11-18: Small items done: chip glyphs removed, Prayer slide centered, `card()` takes an options object `{ center, big, swap }` and skips an empty kicker. Batch 1 (reveal engine) next.
  - 2026-11-18: Batch 1 built (reveal engine): `step()`, `hideAt()`, `applySteps()`, step-aware `deckNext`/`deckBack`, `renderDeck(full)` and `openDeck(index, full)` (Back arrives with every step shown), CSS for hidden steps, `.stack` and `h1.swap`. No slide uses it yet. Only `node --check` run.

