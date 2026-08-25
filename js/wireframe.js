/**
 * Background wireframe water plane.
 * A perspective grid displaced by two crossing sine waves — the same trick that
 * drives a real ripple / flow-map water shader, drawn here on a 2D canvas so it
 * costs nothing. It sits behind everything and quietly signals "graphics".
 */
export function initWireframe() {
  const cv = document.getElementById('mesh');
  if (!cv) return;
  const cx = cv.getContext('2d', { alpha: true });

  let COLS = 46, ROWS = 30;
  let W, H, DPR, t = 0, paused = false, resizeTimer;

  function size() {
    DPR = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    cv.width = W * DPR; cv.height = H * DPR;
    cv.style.width = W + 'px'; cv.style.height = H + 'px';
    cx.setTransform(DPR, 0, 0, DPR, 0, 0);
    // thin the mesh out on phones so it stays a smooth 60fps there too
    COLS = W < 560 ? 26 : W < 1000 ? 34 : 46;
    ROWS = W < 560 ? 18 : W < 1000 ? 24 : 30;
  }
  size();
  addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(size, 150); });
  document.addEventListener('visibilitychange', () => { paused = document.hidden; });

  const horizon = () => H * 0.52;

  /** project grid cell (i, j) to screen space, displaced by the wave field */
  function project(i, j) {
    const d = j / ROWS;                             // 0 at the horizon, 1 up close
    const depth = Math.pow(d, 2.15);
    const spread = W * (0.22 + 2.35 * Math.pow(d, 1.55));
    const x = W / 2 + (i / COLS - 0.5) * 2 * spread;

    // two crossing waves + a slow swell, scaled down with distance
    const u = i / COLS * 7.5, v = j / ROWS * 5.5;
    const wave =
      Math.sin(u * 1.6 + t * 1.15) * 1.0 +
      Math.sin(v * 2.1 - t * 0.85) * 0.7 +
      Math.sin((u + v) * 1.1 + t * 0.5) * 0.55;

    const y = horizon() + (H * 0.86) * depth - wave * (7 + 26 * depth);
    return [x, y, d];
  }

  function strokeFor(d) {
    // cyan far away, violet up close — fades out toward the horizon
    const a = 0.055 + 0.16 * d;
    const r = Math.round(60 + 70 * d), g = Math.round(190 - 90 * d), b = 255;
    return `rgba(${r},${g},${b},${a.toFixed(3)})`;
  }

  (function draw() {
    requestAnimationFrame(draw);
    if (paused) return;
    t += 0.0075;
    cx.clearRect(0, 0, W, H);
    cx.lineWidth = 1;

    // lines running across the plane
    for (let j = 1; j <= ROWS; j++) {
      cx.beginPath();
      for (let i = 0; i <= COLS; i++) {
        const [x, y] = project(i, j);
        i ? cx.lineTo(x, y) : cx.moveTo(x, y);
      }
      cx.strokeStyle = strokeFor(j / ROWS);
      cx.stroke();
    }

    // lines running into the distance
    for (let i = 0; i <= COLS; i += 2) {
      cx.beginPath();
      for (let j = 1; j <= ROWS; j++) {
        const [x, y] = project(i, j);
        j === 1 ? cx.moveTo(x, y) : cx.lineTo(x, y);
      }
      cx.strokeStyle = strokeFor(0.5);
      cx.stroke();
    }

    // specular glints on the crests
    for (let j = Math.max(2, ROWS - 12); j <= ROWS; j += 3) {
      for (let i = 0; i <= COLS; i += 3) {
        const [x, y, d] = project(i, j);
        const s = Math.sin(i * 1.6 + t * 1.15) * Math.cos(j * 0.9 - t);
        if (s < 0.72) continue;
        cx.beginPath();
        cx.arc(x, y, 1.1 + d, 0, 6.2832);
        cx.fillStyle = `rgba(190,240,255,${(0.10 + 0.22 * d).toFixed(3)})`;
        cx.fill();
      }
    }
  })();
}
