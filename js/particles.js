import { pointer } from './cursor.js';

/** Flow-field constellation with depth-simulated 3D parallax. */
export function initParticles() {
  const cv = document.getElementById('stars');
  const cx = cv.getContext('2d', { alpha: true });
  const TINTS = ['124,92,255', '34,211,238', '255,107,157', '255,255,255'];
  const LINK = 128, REPEL = 170, CURSOR_R = 200;
  let ps = [], W, H, DPR, t = 0, paused = false, resizeTimer;

  /* cheap smooth pseudo-noise → curl-like motion */
  const flow = (x, y, t) =>
    (Math.sin(x * 0.0016 + t) +
     Math.sin(y * 0.0019 - t * 0.7) +
     Math.sin((x + y) * 0.0011 + t * 1.3)) * Math.PI;

  function size() {
    DPR = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    cv.width = W * DPR; cv.height = H * DPR;
    cv.style.width = W + 'px'; cv.style.height = H + 'px';
    cx.setTransform(DPR, 0, 0, DPR, 0, 0);
    const n = Math.min(150, Math.floor(W * H / 11000));
    ps = Array.from({ length: n }, () => {
      const z = Math.random();                        // 0 = far, 1 = close
      return {
        x: Math.random() * W, y: Math.random() * H,
        vx: 0, vy: 0, z,
        r:  0.3 + z * 1.8 + Math.random() * 0.4,     // bigger when close
        sp: 0.12 + z * 0.35,                          // faster when close
        tint: TINTS[(Math.random() * 4) | 0],
        ph: Math.random() * 6.28,
        baseAlpha: 0.15 + z * 0.35,                   // brighter when close
      };
    });
  }

  size();
  addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(size, 150); });
  document.addEventListener('visibilitychange', () => { paused = document.hidden; });

  (function draw() {
    requestAnimationFrame(draw);
    if (paused) return;
    t += 0.0016;
    cx.clearRect(0, 0, W, H);

    const mx = pointer.x, my = pointer.y;

    for (const p of ps) {
      const depthFactor = 0.3 + p.z * 0.7;
      const a = flow(p.x, p.y, t);
      p.vx += Math.cos(a) * 0.055 * depthFactor;
      p.vy += Math.sin(a) * 0.055 * depthFactor;

      const dx = p.x - mx, dy = p.y - my, d = Math.hypot(dx, dy) || 1;
      if (d < REPEL) {
        const f = (1 - d / REPEL) * 1.5 * depthFactor;
        p.vx += (dx / d) * f; p.vy += (dy / d) * f;
      }

      p.vx *= 0.94; p.vy *= 0.94;
      p.x += p.vx * p.sp * 3; p.y += p.vy * p.sp * 3;

      if (p.x < -20) p.x = W + 20; else if (p.x > W + 20) p.x = -20;
      if (p.y < -20) p.y = H + 20; else if (p.y > H + 20) p.y = -20;

      const twinkle = 0.5 + 0.5 * Math.sin(t * 60 + p.ph);
      const near = d < CURSOR_R;

      /* cursor thread */
      if (near) {
        cx.beginPath(); cx.moveTo(p.x, p.y); cx.lineTo(mx, my);
        cx.strokeStyle = `rgba(34,211,238,${(1 - d / CURSOR_R) * .30 * (0.5 + p.z * 0.5)})`;
        cx.lineWidth = .7; cx.stroke();
      }

      /* particle dot — depth drives glow */
      const glowR = p.r * (near ? 1.8 : 1);
      cx.beginPath();
      cx.arc(p.x, p.y, glowR, 0, 6.2832);
      cx.fillStyle = `rgba(${near ? '34,211,238' : p.tint},${(near ? .9 : p.baseAlpha) * (0.55 + twinkle * .45)})`;
      if (p.z > 0.7 || near) {
        cx.shadowBlur  = near ? 14 : 6 * p.z;
        cx.shadowColor = near ? 'rgba(34,211,238,.8)' : `rgba(${p.tint},.6)`;
      }
      cx.fill();
      cx.shadowBlur = 0;
    }

    /* connection lines — only between particles at similar depths */
    for (let i = 0; i < ps.length; i++) {
      for (let j = i + 1; j < ps.length; j++) {
        const a = ps[i], b = ps[j];
        if (Math.abs(a.z - b.z) > 0.35) continue;
        const dx = a.x - b.x; if (dx > LINK || dx < -LINK) continue;
        const dy = a.y - b.y; if (dy > LINK || dy < -LINK) continue;
        const d = Math.hypot(dx, dy);
        if (d > LINK) continue;
        const avgZ = (a.z + b.z) / 2;
        cx.beginPath(); cx.moveTo(a.x, a.y); cx.lineTo(b.x, b.y);
        cx.strokeStyle = `rgba(${a.tint},${(1 - d / LINK) * (0.06 + avgZ * 0.14)})`;
        cx.lineWidth = .5; cx.stroke();
      }
    }
  })();
}
