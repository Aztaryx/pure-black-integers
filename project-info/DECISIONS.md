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

