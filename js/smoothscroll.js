/**
 * Slide scroller.
 * The deck is a set of discrete slides, so scrolling is index-based: the
 * smallest wheel nudge immediately animates one slide forward or back, instead
 * of waiting for a whole gesture to accumulate. The page still scrolls for
 * real (scrollbar, anchors, touch momentum all work) — we just animate the
 * scroll position ourselves with an ease-in-out curve.
 */
export function createScroller(slides, onIndex) {
  const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  let index = 0, animating = false, lock = false, raf = 0, lockTimer = 0, settleTimer = 0;

  const last = () => slides.length - 1;
  const clampIndex = i => Math.max(0, Math.min(last(), i));

  /**
   * Slides are position:sticky, so once one is pinned its offsetTop reports the
   * pinned position, not its place in the flow — every already-passed slide would
   * claim to live exactly where we already are, which is why jumping *back* did
   * nothing. Derive the flow position from the deck instead.
   */
  let deckTop = 0, slideH = 0;
  function measure() {
    const deck = slides[0].parentElement;
    deckTop = deck.getBoundingClientRect().top + scrollY;
    slideH = slides[0].offsetHeight;
  }
  const yOf = i => Math.round(deckTop + i * slideH);

  function nearest(y) {
    let best = 0, bestD = Infinity;
    for (let i = 0; i < slides.length; i++) {
      const d = Math.abs(yOf(i) - y);
      if (d < bestD) { bestD = d; best = i; }
    }
    return best;
  }

  /** animate the page to slide `i` — works identically in both directions */
  function goTo(i, instant) {
    i = clampIndex(i);
    const from = scrollY, to = yOf(i), dist = to - from;

    if (i !== index) { index = i; onIndex(index); }

    cancelAnimationFrame(raf);
    clearTimeout(settleTimer);

    if (instant || reduce || Math.abs(dist) < 1) {
      scrollTo(0, to);
      animating = false;
      release();
      return;
    }

    // longer trips get a little more time, but never a slow crawl
    const dur = Math.min(1000, 380 + Math.abs(dist) / innerHeight * 420);
    const t0 = performance.now();
    animating = true;

    (function step(t) {
      const p = Math.min((t - t0) / dur, 1);
      scrollTo(0, from + dist * ease(p));
      if (p < 1) raf = requestAnimationFrame(step);
      else { animating = false; release(); }
    })(t0);
  }

  /** hold the wheel off briefly so trackpad inertia can't skip three slides */
  function release() {
    clearTimeout(lockTimer);
    lockTimer = setTimeout(() => { lock = false; }, 90);
  }

  /** does something under the pointer still have room to scroll itself? */
  function innerScrollable(el, dir) {
    for (let n = el; n && n !== document.body; n = n.parentElement) {
      if (n.scrollHeight - n.clientHeight < 2) continue;
      const oy = getComputedStyle(n).overflowY;
      if (oy !== 'auto' && oy !== 'scroll') continue;
      if (dir > 0 && n.scrollTop + n.clientHeight < n.scrollHeight - 1) return true;
      if (dir < 0 && n.scrollTop > 1) return true;
    }
    return false;
  }

  if (!reduce) {
    addEventListener('wheel', e => {
      if (e.ctrlKey) return;                                  // pinch-zoom
      const dir = Math.sign(e.deltaY);
      if (!dir) return;
      if (innerScrollable(e.target, dir)) return;             // let the slide body scroll first
      e.preventDefault();
      if (animating || lock) return;
      if (Math.abs(e.deltaY) < 3) return;                     // a nudge is enough, noise is not
      if ((dir > 0 && index === last()) || (dir < 0 && index === 0)) return;
      lock = true;
      goTo(index + dir);
    }, { passive: false });
  }

  // scrollbar drags, touch momentum, browser restores — resync, then settle onto a slide
  addEventListener('scroll', () => {
    if (animating) return;
    const i = nearest(scrollY);
    if (i !== index) { index = i; onIndex(index); }
    clearTimeout(settleTimer);
    settleTimer = setTimeout(() => {
      if (!animating && Math.abs(scrollY - yOf(index)) > 2) goTo(index);
    }, 180);
  }, { passive: true });

  addEventListener("resize", () => { measure(); if (!animating) scrollTo(0, yOf(index)); });

  measure();
  addEventListener("load", measure);

  return { goTo, index: () => index, count: () => slides.length };
}
