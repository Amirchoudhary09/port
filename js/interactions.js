/** 3D tilt + cursor glow + light-streak shine on project cards, and magnetic buttons. */
export function initTilt(root = document) {
  root.querySelectorAll('.tilt').forEach(card => {
    const glow = card.querySelector('.glow');

    // inject a shine layer for the light-streak effect
    let shine = card.querySelector('.shine');
    if (!shine) {
      shine = document.createElement('div');
      shine.className = 'shine';
      card.appendChild(shine);
    }

    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      const px = x / r.width, py = y / r.height;

      // deep 3D tilt
      card.style.transition = 'none';
      card.style.transform =
        `perspective(800px) rotateX(${(0.5 - py) * 18}deg) rotateY(${(px - 0.5) * 18}deg) translateY(-8px) scale(1.02)`;

      if (glow) { glow.style.left = x + 'px'; glow.style.top = y + 'px'; }

      // light streak following cursor
      shine.style.background =
        `radial-gradient(circle at ${px * 100}% ${py * 100}%, rgba(255,255,255,.12), transparent 50%)`;
      shine.style.opacity = '1';

      // multi-layer parallax — children float at different 3D depths
      const h3  = card.querySelector('h3');
      const stk = card.querySelector('.stack');
      const lnk = card.querySelector('.links');
      if (h3)  h3.style.transform  = 'translateZ(35px)';
      if (stk) stk.style.transform = 'translateZ(22px)';
      if (lnk) lnk.style.transform = 'translateZ(45px)';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform .6s cubic-bezier(.22,1,.36,1)';
      card.style.transform = '';
      shine.style.opacity = '0';

      const h3  = card.querySelector('h3');
      const stk = card.querySelector('.stack');
      const lnk = card.querySelector('.links');
      if (h3)  h3.style.transform  = '';
      if (stk) stk.style.transform = '';
      if (lnk) lnk.style.transform = '';
    });
  });
}

export function initMagnetic(root = document) {
  root.querySelectorAll('.btn').forEach(b => {
    b.addEventListener('mousemove', e => {
      const r = b.getBoundingClientRect();
      const dx = (e.clientX - r.left - r.width / 2) * .22;
      const dy = (e.clientY - r.top  - r.height / 2) * .35 - 3;
      b.style.transform =
        `translate(${dx}px,${dy}px) rotateX(${-dy * .4}deg) rotateY(${dx * .4}deg)`;
    });
    b.addEventListener('mouseleave', () => { b.style.transform = ''; });
  });
}
