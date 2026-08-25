# Amir Choudhary — Portfolio

Modular static site. No build step, no framework.

## Run

The site loads its sections with `fetch()`, so it needs a local server —
opening `index.html` from disk will show a note instead of the page.

- Double-click `start.bat` → http://localhost:5173
  (falls back to `serve.ps1`, a dependency-free PowerShell static server — no Node, no Python, no admin rights)
- or in VS Code: right-click `index.html` → **Open with Live Server**

## Layout

```
index.html          shell only: ambient layers, empty nav + deck
css/
  base.css          reset, design tokens, buttons, section headings
  effects.css       aurora orbs, grain, spotlight, custom cursor, canvas
  nav.css           top icon nav pill + active state + slide counter
  deck.css          the sticky slide deck and the swap-upward transition
  hero.css          first slide only
  scene.css         the hero animation: typing, electric blast, welcome line
  components.css    stats, marquee, timeline, cards, chips, awards, certs, contact
js/
  config.js         SECTIONS list + icon paths + typed lines  <- edit this to add a slide
  loader.js         fetches sections/*.html, mounts them as slides
  nav.js            builds the top icon nav from config
  deck.js           slide progress (--p), active slide, keyboard paging
  smoothscroll.js   eased wheel scrolling that settles onto the nearest slide
  typing.js         hero typewriter
  reveal.js         .rv reveals + stat counters
  cursor.js         custom cursor + shared pointer position
  wireframe.js      background wireframe water plane (perspective grid + waves)
  interactions.js   card tilt + magnetic buttons
  form.js           contact form validation, composes a mailto: link
  particles.js      flow-field constellation canvas
  main.js           entry point
sections/           one HTML partial per slide (content only)
                    hero.html also holds the coding -> surge -> welcome scene
```

## Add a slide

1. Drop `sections/my-thing.html` (just the inner markup).
2. Add an entry to `SECTIONS` in `js/config.js` — `id`, `file`, `label`, `icon`.
3. If you want a new icon, add its SVG paths to `ICONS` in the same file.

Nav icon, slide, counter and keyboard paging all follow automatically.

## The scroll animation

Every slide is `position: sticky; top: 0; height: 100svh`, so the next slide
physically rises over the current one. `js/deck.js` measures how far the next
slide has covered the current one and writes it to `--p` (0 → 1); `deck.css`
uses that to scale, fade and blur the outgoing slide.

`js/smoothscroll.js` handles the motion: one wheel nudge = one slide. The
gesture needs no travel distance — the smallest flick pages immediately and an
eased tween carries the scroll there, so it always lands on a slide. Slides with
tall content scroll internally first and only page once that content runs out.
Scrollbar drags, arrow keys, PageUp/PageDown, Home/End and touch momentum all
still work; `prefers-reduced-motion` turns the whole thing back into a plain
long page.

One trap worth knowing: the slides are `position: sticky`, so a pinned slide
reports the current scroll position from `offsetTop` rather than its place in
the flow. Target positions are therefore measured as `deckTop + index *
slideHeight` — using `offsetTop` silently breaks paging backwards.
