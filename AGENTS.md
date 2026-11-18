# Agent Instructions

## Scope

This repository is a dependency-free static web presentation. It is not a React, Node, or build-tool project.

## Working rules

- Make the smallest complete change that satisfies the task.
- Preserve the existing two-slide presentation flow and integer-chip behavior.
- Keep `index.html`, `style.css`, and `script.js` consistent.
- Do not introduce dependencies without a documented need.
- Do not rename or move `intro.mp4` unless the reference and fallback behavior are updated together.
- Respect reduced-motion behavior and keep the presentation usable with keyboard and pointer controls.
- Avoid broad formatting changes to existing files.
- For multi-agent work, use `project-info/` as the shared handoff record.

## Validation

After JavaScript or HTML changes:

```bash
python3 -m http.server 4173
curl -I http://127.0.0.1:4173/
curl -I http://127.0.0.1:4173/script.js
curl -I http://127.0.0.1:4173/style.css
```

Also load the page in a browser and verify both slides, Back/Next controls, and the intro fallback.
