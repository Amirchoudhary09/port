/** Shared pointer position — the particle field reads this too. */
export const pointer = { x: innerWidth / 2, y: innerHeight / 2 };

export function initCursor() {
  const dot = document.getElementById('dot');
  const ring = document.getElementById('ring');
  const spot = document.getElementById('spot');
  const bg = document.querySelector('.bg');
  let rx = pointer.x, ry = pointer.y;

  addEventListener('mousemove', e => {
    pointer.x = e.clientX; pointer.y = e.clientY;
    dot.style.transform = `translate(${pointer.x}px,${pointer.y}px)`;
    spot.style.setProperty('--mx', pointer.x + 'px');
    spot.style.setProperty('--my', pointer.y + 'px');
    bg.style.transform =
      `translate3d(${(innerWidth / 2 - pointer.x) * .018}px,${(innerHeight / 2 - pointer.y) * .018}px,0)`;
  });

  (function loop() {
    rx += (pointer.x - rx) * .16;
    ry += (pointer.y - ry) * .16;
    ring.style.transform = `translate(${rx}px,${ry}px)`;
    requestAnimationFrame(loop);
  })();

  // grow the ring over interactive things (delegated, so it covers loaded sections)
  const hot = 'a,button,.chip,.card,.cert';
  document.addEventListener('mouseover', e => {
    if (e.target.closest(hot)) document.body.classList.add('hot');
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest(hot)) document.body.classList.remove('hot');
  });
}
