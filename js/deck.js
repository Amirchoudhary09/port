/**
 * Slide deck visuals.
 * Slides are sticky, so the next one physically rises over the current one.
 * We feed each slide a --p (0 → 1 = how far it has been covered) and let CSS
 * scale / fade / blur it out, which reads as one page swapping upward.
 * The scroll motion itself lives in js/smoothscroll.js.
 */
export function initDeck(slides) {
  const prog = document.getElementById('prog');
  const clamp = v => v < 0 ? 0 : v > 1 ? 1 : v;
  let ticking = false, scroller = null;

  function frame() {
    ticking = false;
    const vh = innerHeight;

    for (let i = 0; i < slides.length; i++) {
      const next = slides[i + 1];
      const p = next ? clamp(1 - next.getBoundingClientRect().top / vh) : 0;
      slides[i].style.setProperty('--p', p.toFixed(3));
    }

    const max = document.documentElement.scrollHeight - innerHeight;
    prog.style.width = (max > 0 ? scrollY / max * 100 : 0) + '%';
  }

  function onScroll() {
    if (!ticking) { ticking = true; requestAnimationFrame(frame); }
  }

  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  frame();

  /** play the lift-in animation for the slide we just landed on */
  function enter(i) {
    const slide = slides[i];
    if (!slide) return;
    slide.classList.remove('entering');
    void slide.offsetWidth;                       // restart the animation
    slide.classList.add('entering');
    slide.addEventListener('animationend', function off() {
      slide.classList.remove('entering');
      slide.removeEventListener('animationend', off);
    });
    history.replaceState(null, '', '#' + slide.id);
  }

  /** wire keyboard paging and in-page anchors once the scroller exists */
  function bind(sc) {
    scroller = sc;

    addEventListener('keydown', e => {
      const step = { ArrowDown: 1, PageDown: 1, ' ': 1, ArrowUp: -1, PageUp: -1 };
      const paging = e.key in step || e.key === 'Home' || e.key === 'End';
      if (!paging || e.target.closest('input,textarea')) return;
      e.preventDefault();
      if (e.key === 'Home') return scroller.goTo(0);
      if (e.key === 'End') return scroller.goTo(slides.length - 1);
      scroller.goTo(scroller.index() + step[e.key]);
    });

    document.addEventListener('click', e => {
      const a = e.target.closest('a[href^="#"]');
      if (!a || a.closest('#nav')) return;        // the nav handles its own clicks
      const i = slides.findIndex(s => '#' + s.id === a.getAttribute('href'));
      if (i < 0) return;
      e.preventDefault();
      scroller.goTo(i);
    });
  }

  return { enter, bind };
}
