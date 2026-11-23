# Adding Integers Using Integer Chips

An interactive, static HTML presentation for teaching integer addition with positive and negative integer chips.

## Run locally

Open `index.html` directly, or serve the folder:

```bash
python3 -m http.server 4173
```

Then visit `http://localhost:4173`.

## Project layout

- `index.html` - page structure, slides, and canvas elements
- `style.css` - visual system, layout, animation, and responsive styles
- `fonts.css` - Sofia Pro, subset and inlined as base64 (no font files to load)
- `script.js` - presentation state, deck slides, and title-slide effects
- `project-info/` - implementation and multi-agent handoff documentation

## Agent guidance

See [AGENTS.md](AGENTS.md) and [project-info/AGENT-GUIDE.md](project-info/AGENT-GUIDE.md) before editing. Keep changes scoped and update the relevant project-info documents after implementation.

## Click-order reveals

A deck slide can reveal parts of itself one tap at a time. In a slide's HTML, wrap content with `step(n, html)` (appears on tap n) or `hideAt(n, html)` (disappears on tap n), or put `data-step="n"` / `data-hide="n"` on an element. Next, a click, Space, Enter and Right Arrow reveal the next step before moving on; Back hides the last step first.


For several items in the same spot, one per tap, use `pager([html, html, ...])`. Text never goes below `--min` (60px at 1920 wide; see `:root` in `style.css`).
