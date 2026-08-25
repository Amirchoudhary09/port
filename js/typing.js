import { TYPED_LINES } from './config.js';

/** Typewriter strap-line in the hero. */
export function initTyping() {
  const el = document.getElementById('type');
  if (!el) return;
  let li = 0, ci = 0, del = false;

  (function tick() {
    const s = TYPED_LINES[li];
    ci += del ? -1 : 1;
    el.textContent = s.slice(0, ci);
    let d = del ? 34 : 62;
    if (!del && ci === s.length) { d = 1700; del = true; }
    else if (del && ci === 0) { del = false; li = (li + 1) % TYPED_LINES.length; d = 320; }
    setTimeout(tick, d);
  })();
}
