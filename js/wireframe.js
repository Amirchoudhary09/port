/**
 * 3D floating geometry scene — Three.js WebGL.
 * Replaces the 2D wireframe water plane with floating 3D shapes that drift,
 * rotate, and follow the cursor through camera parallax.  Sits behind
 * everything and quietly signals "graphics".
 */
import * as THREE from 'three';
import { pointer } from './cursor.js';

export function initWireframe() {
  const cv = document.getElementById('mesh');
  if (!cv) return;
  if (matchMedia('(prefers-reduced-motion:reduce)').matches) return;

  /* ---- renderer ---- */
  const renderer = new THREE.WebGLRenderer({ canvas: cv, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight);

  /* ---- scene + camera ---- */
  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 500);
  camera.position.z = 32;

  /* ---- palette (matches CSS vars) ---- */
  const PAL = [0x7c5cff, 0x22d3ee, 0xff6b9d, 0x3b82f6];

  /* ---- helpers ---- */
  const meshes = [];

  function add(geo, i, opts = {}) {
    const mat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(PAL[i % PAL.length]),
      wireframe: true,
      transparent: true,
      opacity: opts.opacity ?? (0.14 + Math.random() * 0.14),
    });
    const m = new THREE.Mesh(geo, mat);
    const s = opts.scale ?? (0.9 + Math.random() * 2.2);
    m.scale.setScalar(s);
    m.position.set(
      opts.x ?? (Math.random() - 0.5) * 52,
      opts.y ?? (Math.random() - 0.5) * 28,
      opts.z ?? (Math.random() - 0.5) * 20 - 8,
    );
    m.userData = {
      rx: (Math.random() - 0.5) * 0.007,
      ry: (Math.random() - 0.5) * 0.007,
      rz: (Math.random() - 0.5) * 0.003,
      fSpd: 0.25 + Math.random() * 0.65,
      fAmp: 0.4 + Math.random() * 1.8,
      ph:   Math.random() * Math.PI * 2,
      baseY: m.position.y,
    };
    scene.add(m);
    meshes.push(m);
  }

  /* ---- primary shapes (count adapts to screen) ---- */
  const mobile = innerWidth < 700;
  const N = mobile ? 5 : 10;

  const geos = [
    () => new THREE.IcosahedronGeometry(1, 0),
    () => new THREE.OctahedronGeometry(1, 0),
    () => new THREE.TetrahedronGeometry(1, 0),
    () => new THREE.TorusGeometry(0.7, 0.25, 8, 16),
    () => new THREE.TorusKnotGeometry(0.55, 0.2, 48, 8),
    () => new THREE.DodecahedronGeometry(1, 0),
    () => new THREE.IcosahedronGeometry(0.8, 1),
    () => new THREE.BoxGeometry(1, 1, 1),
    () => new THREE.ConeGeometry(0.7, 1.4, 6),
    () => new THREE.CylinderGeometry(0.5, 0.5, 1.2, 8),
  ];
  for (let i = 0; i < N; i++) add(geos[i % geos.length](), i);

  /* ---- large, very faint background accents for extra depth ---- */
  if (!mobile) {
    for (let i = 0; i < 3; i++) {
      add(
        new THREE.IcosahedronGeometry(3.5 + Math.random() * 2, 1), i,
        { opacity: 0.03 + Math.random() * 0.025, z: -22 - Math.random() * 14, scale: 3 + Math.random() * 2 },
      );
    }
  }

  /* ---- animation loop ---- */
  let paused = false, mx = 0, my = 0;
  document.addEventListener('visibilitychange', () => { paused = document.hidden; });

  (function frame() {
    requestAnimationFrame(frame);
    if (paused) return;

    const t = performance.now() * 0.001;

    // smooth camera parallax following cursor
    mx += ((pointer.x / innerWidth  - 0.5) * 2 - mx) * 0.025;
    my += ((pointer.y / innerHeight - 0.5) * 2 - my) * 0.025;
    camera.position.x =  mx * 3.5;
    camera.position.y = -my * 2.5;
    camera.lookAt(0, 0, -5);

    for (const m of meshes) {
      const d = m.userData;
      m.rotation.x += d.rx;
      m.rotation.y += d.ry;
      m.rotation.z += d.rz;
      m.position.y = d.baseY + Math.sin(t * d.fSpd + d.ph) * d.fAmp;
    }

    renderer.render(scene, camera);
  })();

  /* ---- responsive ---- */
  let rt;
  addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(() => {
      camera.aspect = innerWidth / innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(innerWidth, innerHeight);
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    }, 150);
  });
}
