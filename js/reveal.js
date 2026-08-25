/** Staggered reveal for anything marked .rv, plus animated stat counters. */
export function initReveal(root = document) {
  const io = new IntersectionObserver(es => {
    es.forEach((e, i) => {
      if (!e.isIntersecting) return;
      setTimeout(() => e.target.classList.add('in'), i * 90);
      io.unobserve(e.target);
    });
  }, { threshold: .12, rootMargin: '0px 0px -40px' });
  root.querySelectorAll('.rv').forEach(n => io.observe(n));
}

export function initCounters(root = document) {
  const io = new IntersectionObserver(es => {
    es.forEach(e => {
      if (!e.isIntersecting) return;
      const n = e.target, to = +n.dataset.to;
      const pre = n.dataset.pre || '', suf = n.dataset.suf || '';
      const t0 = performance.now(), dur = 1600;
      (function step(t) {
        const p = Math.min((t - t0) / dur, 1);
        n.textContent = pre + Math.round(to * (1 - Math.pow(1 - p, 3))) + suf;
        if (p < 1) requestAnimationFrame(step);
      })(t0);
      io.unobserve(n);
    });
  }, { threshold: .6 });
  root.querySelectorAll('.stat b').forEach(n => io.observe(n));
}
