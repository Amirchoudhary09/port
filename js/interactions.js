/** 3D tilt + cursor glow on project cards, and magnetic buttons. */
export function initTilt(root = document) {
  root.querySelectorAll('.tilt').forEach(card => {
    const glow = card.querySelector('.glow');
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      card.style.transform =
        `perspective(900px) rotateX(${(r.height / 2 - y) / 28}deg) rotateY(${(x - r.width / 2) / 28}deg) translateY(-6px)`;
      if (glow) { glow.style.left = x + 'px'; glow.style.top = y + 'px'; }
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
}

export function initMagnetic(root = document) {
  root.querySelectorAll('.btn').forEach(b => {
    b.addEventListener('mousemove', e => {
      const r = b.getBoundingClientRect();
      b.style.transform =
        `translate(${(e.clientX - r.left - r.width / 2) * .22}px,${(e.clientY - r.top - r.height / 2) * .35 - 3}px)`;
    });
    b.addEventListener('mouseleave', () => { b.style.transform = ''; });
  });
}
