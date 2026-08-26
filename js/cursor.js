/** Shared pointer position — the particle field reads this too. */
export const pointer = { x: innerWidth / 2, y: innerHeight / 2 };

export function initCursor() {
  const dot  = document.getElementById('dot');
  const ring = document.getElementById('ring');
  const spot = document.getElementById('spot');
  const bg   = document.querySelector('.bg');
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
    const dx = pointer.x - rx;
    const dy = pointer.y - ry;
    rx += dx * .16;
    ry += dy * .16;

    // 3D directional tilt — ring banks into the direction of travel
    const tiltX = Math.max(-35, Math.min(35, -dy * 0.7));
    const tiltY = Math.max(-35, Math.min(35,  dx * 0.7));
    ring.style.transform =
      `translate(${rx}px,${ry}px) perspective(200px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;

    requestAnimationFrame(loop);
  })();

  // touch devices have no pointer — drift a virtual one so the constellation,
  // the spotlight and the orb parallax stay alive there too
  if (matchMedia("(hover:none)").matches) {
    let a = 0;
    (function drift() {
      a += 0.0016;
      pointer.x = innerWidth  * (0.5  + 0.34 * Math.sin(a * 1.3));
      pointer.y = innerHeight * (0.45 + 0.30 * Math.sin(a * 0.9 + 1.2));
      spot.style.setProperty("--mx", pointer.x + "px");
      spot.style.setProperty("--my", pointer.y + "px");
      bg.style.transform =
        "translate3d(" + ((innerWidth / 2 - pointer.x) * .02) + "px," +
                         ((innerHeight / 2 - pointer.y) * .02) + "px,0)";
      requestAnimationFrame(drift);
    })();
  }

  // grow the ring over interactive things (delegated, so it covers loaded sections)
  const hot = 'a,button,.chip,.card,.cert';
  document.addEventListener('mouseover', e => {
    if (e.target.closest(hot)) document.body.classList.add('hot');
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest(hot)) document.body.classList.remove('hot');
  });
}
