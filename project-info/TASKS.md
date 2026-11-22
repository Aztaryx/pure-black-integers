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
  - Merged slides keep the first beat id as a range (for example `2.10–2.11`, like `6.1–6.4`), so notes still work (`MAT_IDX` is gone since the mat was removed on 2026-11-20).
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
  - 2026-11-18: Batch 2 built. Drills 2.10 to 2.19 are 5 slides (`2.10–2.11` and so on): array left and sized to fit the free area, answer stamps on tap 1, pips under it. Unscramble 3.2 to 3.7 is 3 slides (`3.2–3.3`, `3.4–3.5`, `3.6–3.7`): tap 1 slides the tiles into order and swaps the title to the question, tap 2 sweeps in the number line. Score board 4.1 to 4.3 is one slide (`4.1–4.3`): tap 1 adds Round 2 and counts the total from 5 to 2, tap 2 swaps in the chip groups; board and text sit side by side. Guide and reflection question slides (4.4 to 4.7, 10.2) get a larger title. Deck is now 58 slides. Data sanity check run in Node (no `undefined`, step counts as intended); not looked at in a browser.
  - Next: batch 3 (Portion 7 and 8 pairs, and the 9.2 to 9.7 quiz fold).
  - 2026-11-19: Batch 3 built. Portion 7 problems are `7.3–7.4` and `7.5–7.6`: the problem first, tap 1 swaps the title to the answer and adds the chips and equation, tap 2 adds the thermometer or elevator (enlarged). Portion 8 pairs are `8.4–8.5`, `8.6–8.7`, `8.8–8.9`, `8.10–8.11`: tap 1 swaps the title to the expression and stamps the answer (8.4–8.5 fills the answers into the two expressions). Quiz is five slides, `9.2–9.3`, `9.4`, `9.5`, `9.6`, `9.7`, one per item: items 1 and 2 show the answer on tap 1; items 3 and 4 cross out the zero pairs on tap 1 and show the answer on tap 2; item 5 draws the route on tap 1 and shows the answer on tap 2. Deck is now 51 slides. Node data check only; not looked at in a browser.

### [In progress] Batch 5: wire icons and remaining graphics into the merged deck (2026-11-19)
- Owner: Claude
- Files: script.js (`BEATS` for 2.2–2.8, 3.8, 5.2, 7.1, 7.2, 8.2, 10.1, 10.3, 10.4; new `mathStrip()` and `badges()` helpers), style.css
- Acceptance criteria: those slides carry the graphics from the Graphics plan, adapted to the no-faces rule (see DECISIONS.md); no change to 6.5 and 6.6, which stay text only so the method is not given away; no dependencies; reduced motion shows static end states.
- Validation: `node --check script.js` only, by request.
- Plan: 2.2 sun and desk icons beside the greeting; 2.3–2.7 a MATH letter strip with the current letter in blue (2.3 shows all four); 2.8 `check` icon; 3.8 one blue and one red chip with labels; 5.2 keeps its chips, adds labels under each; 7.1 and 7.2 `iconRow` think, pair, share; 8.2 four numbered group badges; 10.1 `check`, `thermo`, `coin`, `ball` icons inside the four cards; 10.3 `play` icon; 10.4 a row of blue and red chips.
- 2026-11-19: Built. 2.2 sun and desk icons; 2.3–2.7 `mathStrip()` (2.3 all dim, 2.4–2.7 the current letter lit blue); 2.8 `check` icon; 3.8 and 5.2 `labelled()` chips; 7.1 and 7.2 `iconRow` think, pair, share; 8.2 `badges(4)`; 10.1 icons inside the four cards; 10.3 `play` icon; 10.4 three blue and three red chips. 6.5 and 6.6 left text only on purpose. Only `node --check` run.
- 2026-11-19: MATH rules 2.3–2.7 merged into one slide, `2.3–2.7` (owner request): title "MATH Rules", four rows (blue letter tile, word, description) revealed one per tap by `rules()`. The old `mathStrip()` and its CSS are removed. Deck is one slide shorter.
- 2026-11-19: Transitions (owner request): wipes dissolve every slide element except the background; plain slide changes dissolve fast and fade the new slide in (see DECISIONS.md). Only `node --check` run.
- After this batch: a browser pass is the main open item (nothing since the first layout commit has been looked at visually), then fixing whatever it shows.

### [In progress] Consistency pass: window language and retyped titles (2026-11-19)
- Owner: Claude
- Source: project owner, 2026-11-19: use the inversion windows consistently, not only on the title slide and one example; swap titles by retyping instead of switching; consistency and polish first.
- Files: script.js (`numberLine`, `chips`/`chipRow`, `applySteps`, new `retype()`, `negify()`, deck window ribbon), style.css, project-info/DECISIONS.md
- Acceptance criteria:
  - One rule everywhere: a negative is a window, and whatever sits under a window flips (white to black, blue to red). No slide text says "inversion window".
  - Negative numbers in titles, equations and answers sit in a black window pill with white text (`negify()` wraps every `−digits` in slide text, so new slides follow the rule without extra markup).
  - Red chips are a red disc inside a black window cell, as on the chip mat. This applies to every `.chip-mini.red`.
  - Number lines draw the negative side as a black window with white axis, ticks and labels, and the window sweeps in from zero.
  - Every deck slide has a narrow ribbon of slow-drifting windows in the right margin, like the title slide. The ribbon stays inside the right padding, so it never sits behind text, and it is switched off under reduced motion.
  - Titles that change on a tap (`h1.swap`) are retyped: the old title is deleted and the new one typed, with a blinking caret, in the same spot (no layout jump). Back retypes in reverse. A tap during typing finishes it at once. Reduced motion switches instantly.
  - The slide-to-slide wipe is already a window sweep (`#wipe`); no change.
  - Shared card look (3px #111 border, 4px hard shadow, d-up entrance, same hover/press) checked across tiles, cards, board, badges, icons and timer; fix any outliers.
- Validation: `node --check script.js` only, by request. Not looked at in a browser.
- 2026-11-19: Built, all criteria above except the outlier sweep, which was limited to hover and press on the board, icon cards, MATH letters and badges (everything else already shared the 3px border, 4px shadow and d-up entrance). Details in DECISIONS.md. Only `node --check` run.
- Known risk: this pass changes how many slides look. A browser pass over the whole deck is the main open item.

### [In progress] Teacher requests from the chat screenshots (2026-11-19)
- Source: screenshots from Joshua Philip (original teacher), relayed by the project owner, in Tagalog/English. The lesson-plan photos in them are too blurry to read, so anything that depends on their content is listed as open.
- Files: script.js (`BEATS`), style.css, index.html, project-info/
- Done 2026-11-19:
  - Start: the opening glitch, the intro video and its canvas fallback are removed; the deck opens at Prayer.
  - Order: Prayer first (2.1), then Good Morning (2.2).
  - Same Signs (6.5): "Keep the sign!" and the two worked number lines are removed, because they gave the method away.
  - Storyboard (answered 2026-11-19): the title slide ("Adding INTEGERS using integer chips", with the moving inversion windows) is now a deck beat after Guide Question 4 (4.7) and before the vocabulary (5.1). Everything before it is preliminary questions; the title reveals the topic. The windows stand for negatives, so the slide is part of the lesson, not a theme.
  - Text: "Inversion Window" removed from the 5.2 legend; the chip mat captions now say "overlay".
- Done 2026-11-19 (from the lesson plan PDF and the owner's answers):
  - Worked examples, two per case, answers on tap: `6.5a` Case 1 (`3 + 2 = 5`, `5 + 2 = 7`), `6.5b` Case 2 (`(−4) + (−2) = −6`, `(−3) + (−1) = −4`), `6.6a` Case 3 (`4 + (−2) = 2`, `(−4) + 3 = −1`; each crosses out its zero pairs on one tap and shows the answer on the next). Case 3 examples were added for consistency with the plan; delete `6.6a` if not wanted.
  - 8.3 rubric: the five cards are replaced by the full table from the lesson plan (5, 4, 3 and 2 points, 25 total). Columns checked against the owner's photo of the plan.
  - 8.3a: new 5-minute timer slide after the rubric, started by hand (Start, Pause, Reset); it stops when the slide changes and shows "Time’s up!" at zero. Clicking the timer never advances the slide.
- Superseded questions (kept for history):
  - Examples after Same Signs ("the one with two each"): which two examples, and as chips or number lines? Default if not told: 3 + 2 and (−4) + (−2) as chip rows, answers on tap.
  - Complete rubric: replace the five 5-point cards on 8.3 with the full rubric table from the photo. Needs the readable table text or the `.docx`.
  - 5-minute timer after the rubric: default is a new slide after 8.3 with a large mm:ss countdown and Start/Pause and Reset buttons (buttons do not advance the slide).
  - Title slide ("Adding INTEGERS using integer chips") after Guide Question 4 (4.7): confirm what the opening becomes (intro video, then straight to Prayer?).
  - 5.2 Integer Chips: the circled "Red / Inversion Window" text with the note "May nakalagay n text" ("there is already text"): what should change?
- 2026-11-19: Rubric complete (2-point column added from the photo). `intro.mp4` and the Git LFS rule in `.gitattributes` deleted, and the `intro.mp4` line removed from `.gitignore`, at the owner's request.

### [Ready for review] Polish: red number line, moving grid, glitch, poker chips, fonts (2026-11-19)
- Owner: Claude
- Files: index.html (`#grid-bg`, `fonts.css` link), style.css, script.js (`numberLine`), fonts.css (new), project-info/DECISIONS.md
- Acceptance criteria:
  - Number lines mark negatives red instead of drawing a black window.
  - The grid moves in the background of the chip mat and every deck slide.
  - When the chip-mat overlay glitches, the red chips are not part of the glitch (inside the overlay or the leftover ones).
  - Chips look like poker chips, with no + or − signs added.
  - The supplied fonts are inlined, with no font files to load.
- Validation: `node --check script.js` passes. Not loaded in a browser: the owner asked to skip testing.
- Follow-up: a browser pass is still open. Look at the red chips in the black cells (86% size, corners), the glitch on the 5 + (−3) example, the grid at the seam between slides, and body weights now that 600 maps to Bold and 800 to Black.

### [Ready for review] Timer scene on 8.3a (2026-11-19)
- Owner: Claude
- Files: timer-scene.js and timer-scene.css (new, loaded after `script.js`; they wrap `renderDeck`, `deckNext` and `deckBack`), index.html (two tags)
- Behavior: the slide before 8.3a zooms out about 40x into a field of drifting windows (big ones hold inverted past slides); the timer is huge, centered and always inverted (difference blend); no slide title. Times are elapsed seconds since Start: black squares arrive from 0:00 so the screen is fully black at 2:21; Back/Next/Start/Pause/Reset and keyboard navigation lock at 2:00; `test.mp4` plays at 2:22 and stays on screen until it ends (its last frame is black), then the slide is released.
- Needs: `test.mp4` next to `index.html` (not in the repo yet).
- Validation: none run (owner asked to skip browser testing).
- 2026-11-19 (revision, owner request): no zoom-out and no window at the center. The scene has a drifting grid; 12 windows, all showing inverted earlier slides (the slide before 8.3a first), sit weighted to the left and right sides and drift and sway. The black flood is a 32x18 grid of cells that turn black instantly, one at a time, from the bottom row up with a ragged front; the screen is fully black at 2:21. Only `node --check` run.
- 2026-11-19 (revision): windows made smaller (5 to 13 vw wide, 10 to 26 vh tall) and kept in the outer 18 vw on each side; sway reduced.
- 2026-11-19 (revision): the timer now sits above test.mp4 (z-index 9), so it stays visible, inverted, while the video plays.
- 2026-11-19 (revision): the last slide (10.4) shows the thumbnail of the 10.3 video, linked to it. It loads from img.youtube.com, so it needs internet; clicking it does not advance the slide.
- 2026-11-19 (revision, teacher request from the chat): red chips on the deck slides lost their black window cell and are plain red discs again (`.chip-mini.red` in style.css). The chip mat (`.win2`) is unchanged. This replaces the "red disc inside a black window cell" rule from the consistency pass.
- 2026-11-19 (revision): after the video, Next/Back dissolves the black scene to white over 1 s before changing slide. If test.mp4 is missing or fails, the slide is released instead of staying locked.
- 2026-11-19 (revision, owner request): each Portion 6 worked example (6.5a, 6.5b, 6.6a) has a number line under its row that appears with the answer: a hop from 0 to the first number, then a hop for the second (backward hops red). Built by `exLine(a, b)`. Quiz items, 8.4 and the Portion 7/8 problems were not changed. Only `node --check` run; check that two rows still fit at 1366x768.
- 2026-11-19 (revision, owner request): the zoom-out is back, but it pulls back about 10x with its origin at the bottom-right corner (the previous slide collapses into that corner) and a short tilt on the way. Windows show larger crops (0.55 to 0.85 scale) of five slides, not all. Added three sine waves flowing up the middle and 14 small empty moving windows. The black flood is now a 192x108 canvas of 10 px cells (about 20k) that blooms outward from the bottom center, full black at 2:21. Only `node --check` run.
- 2026-11-19 (revision, owner request): the three sine waves are now a transparent triple helix (barber-pole spiral) with depth shading, one turn per screen height, moving up; the zoom tilt is 2 degrees (was 9). Only `node --check` run.
- 2026-11-19 (revision, owner request): helix frequency lowered a lot: one turn per four screen heights (was one), drifting up over 180 s per turn (was 16 s), starting at a random point each time. Only `node --check` run.

- 2026-11-20: Timer scene: Earth accuracy, ADOFAI fire-and-ice dance, helix back, rolling clock, panel dissolves while zooming. Chip mat removed; 6.1–6.4 is a plain worked-example slide. See DECISIONS.md. Not checked in a browser.
- 2026-11-22: Removed the 6.1–6.4 "Chip Mat · Examples" slide (owner request). Not loaded in a browser; `node --check script.js` passes.
