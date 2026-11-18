# Project Overview

## Purpose

A two-part instructional presentation:

1. Introduce adding integers using integer chips.
2. Let the presenter step through worked examples with positive and negative chips.

## Technology

- HTML5
- CSS3
- Vanilla JavaScript
- Canvas 2D

No package manager or build step is currently configured.

## Runtime state

The main presentation state is stored in `script.js` in the `st` object:

- `sl`: active slide
- `ex`: active worked example
- `i`: presentation step

Examples are declared in the `EX` array. Each example contains an equation and positive/negative chip lists.

## Key flows

- Title slide with moving inversion windows (a deck beat after Guide Question 4)
- Slide reveal and wipe transitions
- Example navigation
- Chip pairing and cancellation
- Canvas animation and decorative effects
- Beat-by-beat preliminaries, recall, score board, vocabulary, familiarization, group activity, assessment, and reflection deck

## Constraints

- The deck opens at the Prayer slide; there is no opening video.
- Preserve `prefers-reduced-motion` behavior.
- Keep controls and content readable at desktop presentation sizes.
