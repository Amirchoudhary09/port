export function createScroller(slides, onIndex) {
  const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
  const ease = t => t < .5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3) / 2;

  let index = 0;
  let animating = false;
  let raf = 0;
  let lockTimer = 0;
  let settleTimer = 0;

  const last = () => slides.length - 1;
  const clampIndex = i => Math.max(0, Math.min(last(), i));

  let deckTop = 0;
  let slideH = 0;

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

  function finishAnimation() {
    animating = false;
    document.documentElement.style.scrollSnapType = '';
    clearTimeout(lockTimer);
    lockTimer = setTimeout(() => {}, 90);
  }

  function goTo(i, instant = false) {
    i = clampIndex(i);
    const from = scrollY;
    const to = yOf(i);
    const dist = to - from;

    cancelAnimationFrame(raf);
    clearTimeout(settleTimer);

    if (i !== index) {
      index = i;
      onIndex(index);
    }

    if (instant || reduce || Math.abs(dist) < 1) {
      animating = false;
      document.documentElement.style.scrollSnapType = 'none';
      scrollTo(0, to);
      document.documentElement.style.scrollSnapType = '';
      return;
    }

    // CSS scroll-snap can fight a programmatic reverse scroll. Disable it only
    // while our controlled animation is running, then restore it afterwards.
    document.documentElement.style.scrollSnapType = 'none';
    animating = true;

    const duration = Math.min(1000, 380 + Math.abs(dist) / innerHeight * 420);
    const start = performance.now();

    function step(now) {
      const p = Math.min((now - start) / duration, 1);
      scrollTo(0, from + dist * ease(p));

      if (p < 1) {
        raf = requestAnimationFrame(step);
      } else {
        scrollTo(0, to);
        finishAnimation();
      }
    }

    raf = requestAnimationFrame(step);
  }

  addEventListener('scroll', () => {
    if (animating) return;

    const i = nearest(scrollY);
    if (i !== index) {
      index = i;
      onIndex(index);
    }

    clearTimeout(settleTimer);
    settleTimer = setTimeout(() => {
      if (!animating && Math.abs(scrollY - yOf(index)) > 2) {
        goTo(index);
      }
    }, 180);
  }, { passive: true });

  addEventListener('resize', () => {
    measure();
    if (!animating) scrollTo(0, yOf(index));
  });

  measure();
  addEventListener('load', measure);

  return { goTo, index: () => index, count: () => slides.length };
}
