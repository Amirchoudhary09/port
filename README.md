# Amir Choudhary — Portfolio (arcade edition)

Static site, no framework, no build step. Live at https://port-omega-rust.vercel.app/ (deploys from `main`).

The whole page is one file, `index.html`, styled like an arcade cabinet: a HUD with an XP bar
that fills as you scroll, then one "screen" per section — title screen, player stats, quest log
(experience), level select (projects), skill inventory, trophies, badges, the Amir.AI console and
the co-op (contact) screen. Everything is vanilla JS + canvas; it opens straight from disk.

## Run locally

- Double-click `index.html`, or
- `start.bat` → http://localhost:5173 (falls back to `serve.ps1`, a dependency-free PowerShell static server)

## Layout

```
index.html          meta / link-preview tags, all styles, all markup (one <section class="screen"> per screen), all scripts
img/                WebP images, PNG icons, og.jpg (the share card)
tools/
  og-card.html      source of img/og.jpg
  make-assets.ps1   regenerates og.jpg + the PNG icons (from favicon.svg) with headless Chrome/Edge
Amir-Choudhary-Resume.pdf   also reachable as /resume (rewrite in vercel.json)
```

Inside `index.html`, top to bottom:

- `<style>` — design tokens in `:root` (arcade palette, pixel / UI / mono fonts), then one block per screen.
- `<main>` — the screens, each marked `<!-- ===== 0N · NAME ===== -->`. The HUD nav at the top links to them by `id`.
- `<script>` — background grid, XP bar + active nav, typing line, reveals + counters, card tilt,
  the LV 03 water canvas, the Amir.AI shell (`C` holds the commands), contact (phone reveal +
  encrypted drop-box form), Konami code.

## Editing content

- Text, links and images: edit the matching screen in `index.html`.
- Shell answers: the `C` object inside the `shell()` block. Keep it in sync when projects or experience change.
- Add a screen: copy a `<section class="screen" id="…">` block, give it an `id`, and add one `<a href="#id">` to the `#nav` list in the HUD. The XP bar and active state follow automatically.

## Contact form

Messages are encrypted in the browser (AES-256-GCM, key wrapped with RSA-OAEP) and dropped on an
ntfy.sh topic that only ever holds ciphertext; a GitHub Actions job in the private contact-inbox repo
decrypts them and files each as an issue. If the drop fails the visitor's mail app opens with the message.
The public key and topic live at the top of the `contact()` block in `index.html` — regenerate both together.

## Images, icons, share card

- Photos go in `img/` as WebP (about 50 KB each at 1200 px wide).
- After changing `tools/og-card.html` or `favicon.svg`, run
  `powershell -ExecutionPolicy Bypass -File tools/make-assets.ps1` to rebuild `img/og.jpg` and the PNG icons.

## Moving to a custom domain

Search-and-replace `port-omega-rust.vercel.app` in `index.html` (canonical + Open Graph tags),
`robots.txt` and `sitemap.xml`.
