# Decisions

This file records implementation decisions that affect multiple areas or future agents.

## Repository setup

- 2026-11-18: The project is a dependency-free static presentation.
- 2026-11-18: `project-info/` is the shared project and multi-agent handoff area.
- 2026-11-18: `intro.mp4` is large enough to require Git LFS before a GitHub push.

## Deck slide layout

- 2026-11-18: Every deck slide is built by `card()` in `script.js` and has one structure: a left-aligned header (`.deck-head`: red kicker plus title, with a rule underneath) and an optional body (`.deck-body`). Nothing is centered; the header always sits in the same top-left position.
- 2026-11-18: A card with no body gets `.solo`: a larger title and no rule. Question cards pass `q = true` for the smaller question title size.
- 2026-11-18: The Portion/Beat bar (`.deck-top`, `#portion`, `#beat`) was removed from the deck. The `portion` and `beat` fields stay in `BEATS` as data (`beat` ids are still used for notes and for locating the chip mat) but are not displayed.
- 2026-11-18: The unscramble slides (3.2–3.7) now keep the letter tiles in the body. Scramble slides use the title "Unscramble the word"; reveal slides use the question as the title with the word tiles below it.
- 2026-11-18: The chip-mat slide (`#s2`) uses the same padding, a matching kicker ("The Chip Mat"), and top alignment so the header position matches the deck slides.
- 2026-11-18: Shared "card" look: 3px #111 border and a 4px hard shadow on tiles, grid cards and quiz cards. Blue is `--b` and positive, red is `--r` and negative, as before.

## Graphics plan (planned, not yet built)

Goal: each slide gets a graphic next to or under the text instead of text alone. Constraints: no dependencies, inline SVG or CSS only, built by small helper functions in `script.js` next to `chips()` and `chipRow()`, keep blue/red/black-and-white styling, and respect `prefers-reduced-motion` (any animation must have a static end state).

Layout for graphics: keep the header as is. Add a `.deck-visual` slot in the body so wide slides can use two columns (text left, graphic right), and stack on narrow viewports.

Shared helpers to build first:

- `numberLine(from, to, {mark, hops, shade})`: SVG number line with ticks, labels, optional highlighted range (blue for positive, red for negative) and hop arrows.
- `scoreboard(rows)`: bordered panel with labeled rows and a running total.
- `pips(done, total)`: progress dots for "Drill 2 of 5" style kickers.
- `zeroPair()`: one blue and one red chip joined by a cancel mark.
- `iconSvg(name)`: a small set of flat line icons (hands, group, thermometer, elevator, coin, ball, check-in faces) drawn at one stroke weight.

Per portion:

- Portion 2, Preliminaries (2.1–2.8): 2.1 sun and desk icon beside the greeting; 2.2 simple folded-hands icon; 2.3–2.7 a large M/A/T/H letter tile with the four-letter strip MATH below, the current letter highlighted in blue; 2.8 a row of five mood faces for the check-in.
- Portion 2, Numeracy drills (2.9–2.19): question slides show the multiplication as a dot array (for example 5 rows of 6); answer slides keep the array and add the product; a `pips()` strip shows the drill number.
- Portion 3, Recall (3.1–3.8): tile rows stay; reveal slides add a number line (positive side shaded blue for 3.5, negative side shaded red for 3.7, whole line for 3.3); 3.8 shows a blue chip and a red chip side by side labeled +1 and −1.
- Portion 4, Score Board (4.1–4.7): a `scoreboard()` for Team A with Round 1 (+5) and Round 2 (−3) and a running total; 4.3 chips grouped under each round label; guide questions 4.4–4.7 show the chips with a question mark, and 4.7 shows the chips arranged in a mat row.
- Portion 5, Vocabulary (5.1–5.3): 5.1 a full number line (…, −3 to 3, …) with zero marked; 5.2 a labeled blue chip (+1) and red chip (−1); 5.3 a zero pair with the two chips overlapping and fading, plus the equation.
- Portion 6, Chip Mat extras (6.5–6.6): 6.5 two chip groups merging into one and a hop line on a number line that continues in one direction; 6.6 chips paired with connector lines and the leftover chips highlighted. The interactive mat itself (6.1–6.4) is unchanged.
- Portion 7, Familiarize (7.1–7.6): 7.1 and 7.2 three-step icon strip (think, pair, share); 7.3 and 7.4 a vertical thermometer from −6°C up to −2°C beside the chip row; 7.5 and 7.6 an elevator shaft with floors −2 to 3 and an arrow showing the 5-floor move.
- Portion 8, Decide (8.1–8.11): 8.2 four colored group badges; 8.3 the rubric as five segmented 5-point bars; 8.4–8.9 a number line or chip row per problem; 8.8–8.11 a running-total step chart for Mia and Carlo (bars up and down per round).
- Portion 9, Assessment (9.1–9.7): 9.1 a legend with a blue chip (+1) and a red chip (−1); 9.2–9.6 chip rows with zero pairs crossed out on the answer slides; 9.7 a route line showing 7 km out, 2 km more, 6 km back, ending 3 km from the start.
- Portion 10, Reflection (10.1–10.4): 10.1 four icons (attendance check, thermometer, coin, ball) inside the existing cards; 10.2 a blue and a red chip beside the question; 10.3 a video-play icon on the resource card; 10.4 a decorative row of blue and red chips.

Order of work: shared helpers, then Portions 4 to 7 (most chip content), then Portions 2, 3, 8, 9, 10.

## Graphics constraints (added 2026-11-18)

- 2026-11-18: No faces, people, or body parts in any graphic or icon (no mood faces, people groups, pairs of people, folded hands). Objects, chips, number lines and abstract shapes only. This overrides the earlier Graphics plan wherever it listed such items.
- 2026-11-18: Substitutions for the affected plan items: 2.2 (prayer) has no graphic; 2.8 (check-in) uses the `check` icon or no graphic; 7.1 and 7.2 use `iconRow([['think','Think'],['link','Pair'],['share','Share']])` (thought bubble, two overlapping circles, speech bubble); 8.2 uses numbered or colored badges instead of group icons; 10.1 uses `check`, `thermo`, `coin` and `ball` icons.
- 2026-11-18: Icon helpers in `script.js`: `iconSvg(name, cls)` (names: sun, desk, thermo, elevator, coin, ball, check, play, think, link, share; cls `blue` or `red`), `iconRow(items)` for captioned icon cards, and `duo(text, visual)` for the two-column body (text left, `.deck-visual` right, stacks under 820px). Icons are decorative (`aria-hidden`); meaning stays in the text.
- 2026-11-18 (update): Exception to the rule above, requested by the owner: the "pair" icon is two faceless default-avatar silhouettes (solid head and shoulders, no features) side by side. `iconSvg('pair')` replaces the earlier `link` icon, so 7.1 and 7.2 use `iconRow([['think','Think'],['pair','Pair'],['share','Share']])`. Everything else in the rule still holds: no faces, no other people shapes, no body parts, no mood faces, no group icons.

## Click-order reveals and merged slides (planned, 2026-11-18)

- 2026-11-18: Teacher request: when a slide repeats the previous slide's asset, merge them into one slide and reveal the changes by tap, in order. See the task "Format change" in TASKS.md for the merge list and batches.
- 2026-11-18: When a slide has little text, enlarge its asset to fill the free area (`.big`, viewport-unit sizing) rather than leaving empty space.
- 2026-11-18: Step markup is `data-step="n"` on elements inside a slide's body. Next reveals the next step, then advances. Back hides the last step, then goes to the previous slide fully revealed. Merged slides use a beat id range such as `2.10–2.11`.
- 2026-11-18: Chips carry no "+" or "−" glyph anywhere (chip mat, `chips()`, zero pair, crossed rows); color alone shows the sign (blue positive, red negative), as the teacher asked. The "+" between chip groups in a `chipRow` is the equation operator and stays.
- 2026-11-18: The Prayer slide is the one deliberate exception to "nothing is centered": title "Prayer" only, centered both ways (`.deck-card.center`).
- 2026-11-18: Quiz items 9.2 to 9.7 fold into one question-then-answer slide per item; the 9.2 grid is dropped.
- 2026-11-18: Reveal engine details. Hidden steps use `visibility: hidden`, so they keep their space and cannot be clicked. Animations inside a hidden step are switched off and start fresh when it is shown. Under reduced motion the steps still reveal one per tap, without animation. `.stack` puts two variants in one grid cell and `h1.swap` does the same for a title that changes between steps.
- 2026-11-18: Merged-slide patterns. Title that changes between taps: `card(..., { swap: true })` with spans carrying `data-step` / `data-hide`. Two versions of one asset in one spot: wrap them in `.stack`. `scoreboard()` no longer takes a round count; it is one board whose Round 2 row and second total are steps. `dots()` sets `--r` (rows) so `--ds` can fit the array to the free width and height (56vw by 46vh side by side, 88vw by 34vh stacked). The `still` flag on `dots()` is now unused.
- 2026-11-19: `data-on="n"` switches the class `.on` on at step n without hiding the element. Crossed zero-pair rows (`crossRow`) use it so the crossing marks and rings start when the presenter taps, not on load. Step counts are the highest of `data-step`, `data-on` and `data-hide` on the slide. `.big` also enlarges answers, chips, the thermometer and the elevator.
- 2026-11-19: The opening glitch transition is removed at the teacher's request. `begin()` goes straight to black and the intro video; the canvas fallback is unchanged.
- 2026-11-19: Deck opens with Prayer, then Good Morning. Same Signs (6.5) shows only its one-line rule; the method (keep the sign) and worked number lines are left for the students to find.

## Storyboard change (2026-11-19, teacher request)

- 2026-11-19: No opening video. The deck opens at Prayer. `intro.mp4`, its canvas fallback and the glitch code are gone from the code; the file itself is still in the repo (and `.gitattributes`/`.gitignore` still mention it) until the owner decides to delete it.
- 2026-11-19: The title slide is a deck beat (`{ title: true }`) after Guide Question 4 (4.7), before 5.1. The slides before it are preliminary questions that lead to the topic; the title then names it. The moving windows on that slide represent negative numbers, so they are part of the lesson. Entering it plays the wipe, then the title and windows reveal; Next goes to 5.1, Back to 4.7. Replay at the end of the deck returns to Prayer.
- 2026-11-19: No slide text says "inversion window". The chip-mat overlays are described as "overlay" in the captions. The windows themselves remain as visuals.
- 2026-11-19: Timer is manual (Start button), per the owner. The rubric data lives in `RUBRIC` in `script.js` so extra point columns are a one-line change plus a header cell in `rubric()`.
- 2026-11-19: `intro.mp4` and `.gitattributes` (its only content was the LFS rule) are deleted, so Git LFS is no longer needed for this repo. The earlier notes about LFS and the file staying in the repo are superseded.

## Window language and retyped titles (2026-11-19, owner request: consistency and polish)

- 2026-11-19: One visual rule for the whole deck: a negative is a window, and whatever sits under a window flips (white to black, blue to red). The title slide windows, the chip mat overlays, the `#wipe` transition and everything below follow it. No slide text says "inversion window".
- 2026-11-19: Negative numbers in slide text sit in a black window pill (`.neg`, white text). `negify()` runs in `renderDeck()` and wraps every `−digits` (with an optional `°C`/`°F`) in text nodes, except inside SVG, links and buttons. New slides follow the rule with no extra markup. The pill is a solid black fill, not a real `backdrop-filter`, because an ancestor with `opacity` or `filter` (the entrance animations use opacity) would make a backdrop filter see nothing.
- 2026-11-19: Every `.chip-mini.red` is a red disc inside a black window cell (rounded square), matching the chip mat where a window turns a blue chip red. Blue chips are unchanged. Flipping a chip by click switches between the two looks.
- 2026-11-19: `numberLine()` draws the negative side (`a < 0`) as a black window that stops halfway between −1 and 0, with white axis, ticks and labels; zero sits outside it. The window sweeps in from zero. Number lines with no negatives have no window.
- 2026-11-19: Deck ribbon: `#deck-ribbon` is a 6vw strip in the right padding of every deck slide, holding slowly drifting windows (same `win-up` motion as the title slide). It stays inside the padding so it is never behind text. Reduced motion shows three still windows. The spawner runs only while the deck is on screen and restarts in `renderDeck()`.
- 2026-11-19: Titles that change on a tap (`h1.swap`) are retyped by `retype()`: erase the old text (about 0.4 s), then type the new text (about 1.3 s at most) with a blinking caret. Both versions stay in the same grid cell, so nothing jumps. It runs for Next and Back through `applySteps(true)`; `renderDeck()` calls `applySteps()` without it, so a slide that opens does not retype. A new tap finishes the running retype first. Reduced motion switches instantly.
- 2026-11-19: Card-like blocks share one hover lift (4 px) and one press (2 px), now also on the scoreboard, icon cards, MATH letters and group badges.

## Transitions (2026-11-19, owner request)

- 2026-11-19: Every wipe (the window sweep, `#wipe`) dissolves all elements of the slide on screen, but not its background, for 600 ms (opacity to 0 with a blur) before the new slide is built. `dissolve(ms, then)` in `script.js` finds the slide by `st.sl` (`#s1` title: `.ttl`, `#hero`, `.par`; `#s2` chip mat: every child; `#deck`: `#deck-content`). The Back/Next buttons and the right-margin window ribbon stay.
- 2026-11-19: A plain next or previous slide (no wipe) used to cut. It now dissolves the old slide in 170 ms (`swapDeck()`), then the new slide fades in over 220 ms (`fadeIn()`). A tap during the dissolve finishes it at once (`flushSwap()`), so fast tapping is never blocked. Taps that only reveal a step are unchanged.
- 2026-11-19: Reduced motion: no dissolve and no fade; slides switch instantly as before.
- 2026-11-19: The rule under the slide title draws once per entry into the deck (page load, a wipe in, or Replay), then stays as is on later slides. `#deck.rule-seen` switches its animation off; `ruleSeen` in `script.js` is reset by `show()` (leaving the deck) and `openDeck()`. The kicker and title still slide in on every slide.
