/**
 * A pocket-sized version of the water I work on at Wasp3D, in WebGL:
 * a height field (a few travelling sines + cursor ripples) → finite-difference
 * normals → Fresnel-weighted reflection of a procedural sky → a sun glint.
 * One fullscreen triangle, one fragment shader; renders only while on screen.
 */
export function initWater(root = document) {
  root.querySelectorAll('canvas.water').forEach(start);
}

const VERT = 'attribute vec2 p; void main(){ gl_Position = vec4(p, 0., 1.); }';

const FRAG = `
precision highp float;
uniform vec2  uRes;
uniform float uTime;
uniform vec4  uRip[8];          // xy = position on the water, z = birth time, w = strength

const vec3 SUN = vec3(0.3308, 0.1512, -0.9315);   // normalize(vec3(.35, .16, -1.))

vec3 sky(vec3 d){
  float h = clamp(d.y, 0., 1.);
  vec3 c = mix(vec3(.10, .06, .24), vec3(.02, .03, .07), pow(h, .45));   // violet horizon → near-black zenith
  c += vec3(.48, .36, 1.) * pow(1. - h, 8.) * .55;                         // horizon glow
  float s = max(dot(d, SUN), 0.);
  c += vec3(.13, .83, .93) * (pow(s, 600.) * 2.2 + pow(s, 24.) * .35);     // cyan sun + halo
  c += vec3(1., .42, .62) * pow(max(dot(d, vec3(-.62, .06, -.78)), 0.), 90.) * .25;   // pink glow, far left
  return c;
}

float waves(vec2 p, float t){
  float v = 0.;
  v += .030 * sin(p.x * 1.6 + t * 1.1);
  v += .024 * sin((p.x * .55 + p.y * 1.35) * 1.9 - t * 1.45);
  v += .016 * sin((p.y * 2.3 - p.x * .5) + t * .9);
  v += .008 * sin(p.x * 6.1 + p.y * 3.7 + t * 2.7);
  return v;
}

float ripples(vec2 p, float t){
  float v = 0.;
  for (int i = 0; i < 8; i++){
    vec4 r = uRip[i];
    float age = t - r.z;
    if (r.w <= 0. || age < 0.) continue;
    float d = length(p - r.xy);
    float front = age * 1.6;                                              // how far the ring has travelled
    float env = smoothstep(front, front - .45, d) * exp(-age * 1.1) * exp(-d * .9);
    v += r.w * .05 * env * sin(d * 26. - age * 10.);
  }
  return v;
}

float height(vec2 p, float t){ return waves(p, t) + ripples(p, t); }

void main(){
  vec2 q  = (gl_FragCoord.xy - .5 * uRes) / uRes.y;
  vec3 ro = vec3(0., 1., 0.);
  vec3 rd = normalize(vec3(q.x, q.y - .18, -1.));
  float t = uTime;
  vec3 col;

  if (rd.y >= -.002) {
    col = sky(rd);
  } else {
    float dist = -ro.y / rd.y;
    vec3 p = ro + rd * dist;
    float e = .012 + dist * .006;
    float hx = height(p.xz + vec2(e, 0.), t) - height(p.xz - vec2(e, 0.), t);
    float hz = height(p.xz + vec2(0., e), t) - height(p.xz - vec2(0., e), t);
    vec3 n = normalize(vec3(-hx, 2. * e, -hz));
    n = normalize(mix(vec3(0., 1., 0.), n, clamp(1.6 / (1. + dist * .15), 0., 1.)));   // calmer far field = less shimmer

    vec3 refl = sky(reflect(rd, n));
    float fres = .04 + .96 * pow(1. - max(dot(-rd, n), 0.), 5.);
    vec3 water = mix(vec3(.02, .22, .27), vec3(.010, .075, .105), 1. - exp(-dist * .28));
    col = mix(water, refl, fres);

    vec3 hv = normalize(SUN - rd);
    col += vec3(.75, .95, 1.) * pow(max(dot(n, hv), 0.), 260.) * .9;      // sun glint
    col = mix(col, sky(rd), 1. - exp(-dist * .045));                       // haze into the horizon
  }

  col *= 1. - .35 * dot(q, q);                                             // vignette
  gl_FragColor = vec4(col, 1.);
}`;

function start(cv) {
  const box = cv.parentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const gl = cv.getContext('webgl', { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: 'low-power' });
  if (!gl) { box.classList.add('nogl'); return; }

  const prog = gl.createProgram();
  for (const [type, src] of [[gl.VERTEX_SHADER, VERT], [gl.FRAGMENT_SHADER, FRAG]]) {
    const sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      console.warn('water shader:', gl.getShaderInfoLog(sh));
      box.classList.add('nogl');
      return;
    }
    gl.attachShader(prog, sh);
  }
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { box.classList.add('nogl'); return; }
  gl.useProgram(prog);

  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const uRes  = gl.getUniformLocation(prog, 'uRes');
  const uTime = gl.getUniformLocation(prog, 'uTime');
  const uRip  = gl.getUniformLocation(prog, 'uRip');

  /* ---- ripples: a ring buffer of 8, newest overwrites oldest ---- */
  const rip = new Float32Array(8 * 4);
  let ripN = 0;
  const t0 = performance.now();
  const now = () => (performance.now() - t0) / 1000;

  function addRipple(x, z, strength) {
    const i = (ripN++ % 8) * 4;
    rip[i] = x; rip[i + 1] = z; rip[i + 2] = now(); rip[i + 3] = strength;
  }

  /** screen point → point on the water plane, using the same camera as the shader */
  function toWorld(px, py) {
    const r = cv.getBoundingClientRect();
    const qx = (px - r.left - r.width / 2) / r.height;
    const qy = (r.height / 2 - (py - r.top)) / r.height;
    let dx = qx, dy = qy - .18, dz = -1;
    const l = Math.hypot(dx, dy, dz);
    dx /= l; dy /= l; dz /= l;
    if (dy >= -.002) return null;                 // above the horizon
    const dist = -1 / dy;                         // ro.y = 1
    return [dx * dist, dz * dist];
  }

  let lastPointer = 0;
  cv.addEventListener('pointermove', e => {
    const t = performance.now();
    if (t - lastPointer < 90) return;
    lastPointer = t;
    const w = toWorld(e.clientX, e.clientY);
    if (w) addRipple(w[0], w[1], .6);
  });
  cv.addEventListener('pointerdown', e => {
    lastPointer = performance.now();
    const w = toWorld(e.clientX, e.clientY);
    if (w) addRipple(w[0], w[1], 1.4);
  });

  /* ---- render loop: only while the card is on screen ---- */
  let running = false, raf = 0;

  function size() {
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    const w = Math.round(cv.clientWidth * dpr), h = Math.round(cv.clientHeight * dpr);
    if (w && h && (cv.width !== w || cv.height !== h)) {
      cv.width = w; cv.height = h;
      gl.viewport(0, 0, w, h);
    }
  }

  function frame() {
    raf = 0;
    if (!running) return;
    size();
    gl.uniform2f(uRes, cv.width, cv.height);
    gl.uniform1f(uTime, now());
    gl.uniform4fv(uRip, rip);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (!reduce) raf = requestAnimationFrame(frame);   // reduced motion: one still frame
  }
  // reduced motion draws its single frame right away (and again on resize) instead of waiting for a rAF
  const play = () => { running = true; if (reduce) frame(); else if (!raf) raf = requestAnimationFrame(frame); };
  const stop = () => { running = false; };

  new IntersectionObserver(es => es.forEach(e => (e.isIntersecting ? play() : stop())), { threshold: .05 }).observe(cv);
  addEventListener('resize', () => { if (reduce && running) frame(); });
  cv.addEventListener('webglcontextlost', e => { e.preventDefault(); stop(); });

  // the odd raindrop keeps it alive when nobody is hovering
  setInterval(() => {
    if (running && !reduce && performance.now() - lastPointer > 2500) {
      addRipple((Math.random() - .5) * 6, -2 - Math.random() * 6, .5 + Math.random() * .6);
    }
  }, 1400);
}
