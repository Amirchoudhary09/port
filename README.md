# Amir Choudhary — Portfolio

Static site, no framework, no build step. Live at https://port-omega-rust.vercel.app/ (deploys from `main`).

## Run locally

The site uses ES modules, so it needs a local server — opening `index.html` from
disk shows a flat, script-free version of the page with a note.

- Double-click `start.bat` → http://localhost:5173
  (falls back to `serve.ps1`, a dependency-free PowerShell static server — no Node, no Python, no admin rights)
- or in VS Code: right-click `index.html` → **Open with Live Server**

## Layout

```
index.html          everything visible: meta / link-preview tags, and one <section class="slide"> per slide
css/
  base.css          reset, design tokens, buttons, section headings, skip link, no-JS fallback
  effects.css       aurora orbs, grain, spotlight, custom cursor, canvas
  nav.css           top icon nav pill + active state + slide counter
  deck.css          the sticky slide deck and the swap-upward transition
  hero.css          first slide only
  scene.css         the hero animation: typing, electric blast, welcome line
  components.css    stats, marquee, timeline, cards, chips, awards, certs, GitHub cards, terminal, contact
js/
  config.js         SECTIONS list + icon paths + typed lines  <- the nav is built from this
  loader.js         collects the slides from index.html in config order
  nav.js            builds the top icon nav from config
  deck.js           slide progress (--p), active slide, keyboard paging
  smoothscroll.js   eased wheel scrolling that settles onto the nearest slide
  typing.js         hero typewriter
  reveal.js         .rv reveals + stat counters
  cursor.js         custom cursor + shared pointer position
  wireframe.js      three.js floating wireframe shapes (desktop only, loaded on demand)
  interactions.js   card tilt + magnetic buttons
  form.js           contact form (FormSubmit.co) + click-to-reveal phone
  particles.js      flow-field constellation canvas
  terminal.js       the "Amir.AI" shell: commands, history, tab completion, matrix rain
  water.js          WebGL water sketch on the graphics project card
  main.js           entry point
img/                WebP images, PNG icons, og.jpg (the share card)
tools/
  og-card.html      source of img/og.jpg
  make-assets.ps1   regenerates og.jpg + the PNG icons (from favicon.svg) with headless Chrome/Edge
Amir-Choudhary-Resume.pdf   also reachable as /resume (rewrite in vercel.json)
```

## Editing content

Everything a visitor reads is in `index.html`, one commented block per slide
(`<!-- ==== 02 · Projects ==== -->`). Keep the section `id`s in step with
`js/config.js` — `loader.js` matches them by id and warns in the console if one
is missing.

The terminal's answers live in `js/terminal.js` (`COMMANDS`); keep them in sync
when the experience or project list changes.

## Add a slide

1. Add a `<section class="slide" id="my-thing" aria-label="My Thing">` block to `index.html`
   (copy an existing one — `slide__inner` → `wrap` → content).
2. Add an entry to `SECTIONS` in `js/config.js` — `id`, `label`, `icon`.
3. If you want a new icon, add its SVG paths to `ICONS` in the same file.

Nav icon, slide, counter and keyboard paging all follow automatically.

## Images, icons, share card

- Photos go in `img/` as WebP (about 50 KB each at 1200 px wide). Any browser can
  convert: open the image, draw it on a `<canvas>`, `toDataURL('image/webp', .8)` —
  or use Squoosh.
- After changing `tools/og-card.html` or `favicon.svg`, run
  `powershell -ExecutionPolicy Bypass -File tools/make-assets.ps1` to rebuild
  `img/og.jpg` and the PNG icons.

## Moving to a custom domain

Search-and-replace `port-omega-rust.vercel.app` in `index.html` (canonical +
Open Graph tags + the form's `_next`), `robots.txt`, `sitemap.xml` and
`tools/og-card.html`, then rerun `make-assets.ps1`.

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
still work; `prefers-reduced-motion` (and no-JS) turn the whole thing back into
a plain long page.

One trap worth knowing: the slides are `position: sticky`, so a pinned slide
reports the current scroll position from `offsetTop` rather than its place in
the flow. Target positions are therefore measured as `deckTop + index *
slideHeight` — using `offsetTop` silently breaks paging backwards.

## Contact form

Submissions go to FormSubmit.co (`js/form.js`, and the plain `<form action>` as
the no-JS fallback). The first submission from a new domain sends an activation
email to the inbox — click it once, after that everything is delivered. A
honeypot field drops bots; if sending fails the visitor gets a ready-made
`mailto:` link instead.
