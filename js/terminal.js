import { SECTIONS } from './config.js';

/**
 * "Amir.AI" — a small fake shell that knows this portfolio.
 * Every command is a function of (args, shell) that returns a string, a list
 * of lines, or nothing when it acted on its own (goto / matrix / clear).
 * Lines may contain [text](url) links; everything else is rendered as text.
 */
const EMAIL  = 'amirchoudharyb03@gmail.com';
const RESUME = 'Amir-Choudhary-Resume.pdf';
const LINKS = {
  github:   'https://github.com/Amirchoudhary09',
  linkedin: 'https://linkedin.com/in/amirchoudhary09',
  leetcode: 'https://leetcode.com/u/AMIR09/',
  gfg:      'https://www.geeksforgeeks.org/profile/amirchoudharyb09',
};

const COMMANDS = {
  help: () => [
    'Commands:',
    '  about · skills · projects · experience · education · hackathons · certs',
    '  contact · socials · resume · goto <section> · ls · matrix · clear',
    'Tab autocompletes, ↑ / ↓ walk the history.',
  ],

  about: () =>
    "I'm Amir Choudhary — Software Development Engineer at Wasp3D, Noida. Days go into real-time rendering in C++ / DirectX 12 " +
    "(planar reflections, water, HLSL shaders); before that I shipped full-stack MERN products with JWT/OAuth auth and AI integrations. " +
    '900+ DSA problems solved, B.Tech CS (AI & ML) finishing 2026.',

  whoami: () => 'visitor — the interesting one is Amir, try `about`.',

  skills: () => [
    'Languages   C++ · JavaScript · TypeScript · Python · SQL · HLSL',
    'Graphics    DirectX 12 / 9 · shaders · render pipelines · GPU profiling',
    'Frontend    React · Next.js · Redux · Tailwind CSS · React Query',
    'Backend     Node · Express · REST · JWT · OAuth 2.0 · Mongoose · WebSockets · Zod',
    'Data / AI   MongoDB Atlas · MySQL · Gemini API · OpenAI API · LangChain · RAG',
  ],

  projects: () => [
    '1. Real-time Water & Planar Reflections — C++ / DirectX 12 / HLSL, Wasp3D engine',
    `2. DirectX 12 Procedural Mesh Renderer — C++ / Win32 / HLSL · [code](${LINKS.github}/Cube_by_dx12)`,
    `3. AshGuard — women-safety app, 200+ users · [live](https://enchantress-ashguard.vercel.app/) · [code](${LINKS.github}/ASHGUARD)`,
    `4. Gemini Function-Calling Agents — Node + Gemini 2.5 Flash · [code](${LINKS.github}/gen-ai)`,
    `5. Lost & Found Community Platform — MERN · [live](https://lost-and-find-ytbs.vercel.app/) · [code](${LINKS.github}/lost-and-find)`,
    `6. AI Trip Planner — React + Gemini · [live](https://enchantress-trips-planner.vercel.app/) · [code](${LINKS.github}/Travel-Itinerary-Planner-)`,
    'Type `goto projects` to see them properly.',
  ],

  experience: () => [
    'Wasp3D — Software Development Engineer · Apr 2026 – present · Noida',
    '  · reflection pipeline 2 render targets → 1: ~50% less GPU bandwidth',
    '  · real-time water: ripples, flow maps, distortion, planar reflections',
    '  · HLSL vertex / pixel shader work across lighting, materials, sampling',
    'Bluestocks Fintech — SDE Intern · Mar – May 2025 · remote',
    '  · React + Tailwind services page, Express / MongoDB CRUD APIs, Agile sprints',
  ],

  education: () =>
    'B.Tech, Computer Science (AI & ML) — G.L. Bajaj Institute of Technology and Management, Greater Noida · 2022–2026 · CGPA 8.01 / 10',

  hackathons: () => [
    'Top 3    Adobe Emerge Hackathon 2025 — IIT Delhi (national)',
    'Top 6    Hack For Impact 2025 — IIIT Delhi',
    'Top 10   HackSprint Hackathon 2024 — GDG, GL Bajaj',
    `900+ DSA problems on [LeetCode](${LINKS.leetcode}) (max rating 1600) and [GeeksforGeeks](${LINKS.gfg})`,
  ],

  certs: () => [
    'Jun 2024  Google for Developers — Virtual Internship',
    'May 2025  Cisco — CCNA / Python',
    'Jan 2025  Web Development Competition (inter-college) — See Caller',
    'Nov 2024  Coding Competition — HackSprint, GDG GL Bajaj',
  ],

  contact: () => [
    `Email  [${EMAIL}](mailto:${EMAIL})`,
    'Or use the form: `goto contact`.',
  ],

  socials: () => [
    `GitHub    [${LINKS.github}](${LINKS.github})`,
    `LinkedIn  [${LINKS.linkedin}](${LINKS.linkedin})`,
    `LeetCode  [${LINKS.leetcode}](${LINKS.leetcode})`,
    `GfG       [${LINKS.gfg}](${LINKS.gfg})`,
  ],

  resume: () => `Here you go → [${RESUME}](${RESUME}) — opens in a new tab.`,

  goto: (args, sh) => {
    const q = args.join(' ').toLowerCase();
    const s = SECTIONS.find(x => x.id === q || x.label.toLowerCase().startsWith(q));
    if (!q || !s) return { err: `goto: unknown section "${q}". Try: ${SECTIONS.map(x => x.id).join(', ')}` };
    sh.jump(s.id);
    return `→ ${s.label}`;
  },

  ls: () => SECTIONS.map(s => s.id + '/').join('  '),
  pwd: () => '/home/visitor/amir-portfolio',
  date: () => new Date().toString(),
  echo: args => args.join(' '),
  sudo: () => 'visitor is not in the sudoers file. This incident will be reported. 🙂',
  rm: () => 'rm: permission denied — the portfolio stays.',
  exit: () => "There's no exit, only `goto contact`. 😄",
  hi: () => 'Hey! Type `help` to see what I know.',

  matrix: (args, sh) => { sh.matrix(); return 'Wake up, Neo… (any key stops the rain)'; },
  clear: (args, sh) => { sh.clear(); },
};

// what the quick buttons and old habits send
const ALIASES = {
  'about me': 'about', me: 'about', 'tech stack': 'skills', stack: 'skills', tech: 'skills',
  work: 'experience', job: 'experience', achievements: 'hackathons', awards: 'hackathons',
  certificates: 'certs', certifications: 'certs', cv: 'resume', email: 'contact',
  links: 'socials', social: 'socials', github: 'socials', linkedin: 'socials',
  open: 'goto', cd: 'goto', 'secret matrix rain': 'matrix', 'matrix rain': 'matrix',
  'clear terminal': 'clear', cls: 'clear', '?': 'help', hello: 'hi', hey: 'hi',
};

export function initTerminal() {
  const root = document.getElementById('ai-terminal');
  if (!root) return;

  const input   = document.getElementById('ai-input');
  const history = document.getElementById('ai-history');
  const body    = document.getElementById('ai-body');

  const typed = [];                               // command history for ↑ / ↓
  let cursor = 0;
  let stopRain = null;

  const shell = {
    clear: () => { history.textContent = ''; },
    jump:  id => document.querySelector(`#nav a[href="#${id}"]`)?.click(),
    matrix: () => { stopRain?.(); stopRain = matrixRain(body); },
  };

  /** render one line; [text](url) becomes a real link, everything else is plain text */
  function line(text, type) {
    const div = document.createElement('div');
    div.className = `term-line ${type}`;
    const re = /\[([^\]]+)\]\((https?:\/\/[^)\s]+|mailto:[^)\s]+|[\w.-]+\.pdf)\)/g;
    let last = 0, m;
    while ((m = re.exec(text))) {
      div.append(text.slice(last, m.index));
      const a = document.createElement('a');
      a.textContent = m[1]; a.href = m[2];
      if (!m[2].startsWith('mailto:')) { a.target = '_blank'; a.rel = 'noopener'; }
      div.append(a);
      last = re.lastIndex;
    }
    div.append(text.slice(last));
    history.append(div);
    body.scrollTop = body.scrollHeight;
  }

  function reply(out) {
    if (out == null) return;
    if (out.err) return line(out.err, 'err');
    const lines = Array.isArray(out) ? out : [out];
    lines.forEach((l, i) => line((i ? '  ' : '> Amir.AI: ') + l, 'ai-msg'));
  }

  function run(raw) {
    const text = raw.trim();
    if (!text) return;
    typed.push(text); cursor = typed.length;

    const prompt = document.createElement('div');
    prompt.className = 'term-line user-msg';
    const p = document.createElement('span'); p.className = 'prompt'; p.textContent = 'visitor@amir-ai:~$';
    prompt.append(p, ' ' + text);
    history.append(prompt);

    const lower = text.toLowerCase();
    let [name, ...args] = lower.split(/\s+/);
    if (ALIASES[lower]) { name = ALIASES[lower]; args = []; }
    else if (ALIASES[name]) name = ALIASES[name];
    if (name === 'echo') args = text.split(/\s+/).slice(1);   // keep the user's casing

    const cmd = COMMANDS[name];
    setTimeout(() => {
      if (cmd) return reply(cmd(args, shell));
      const near = Object.keys(COMMANDS).find(c => c.startsWith(name.slice(0, 3)) && name.length > 2);
      line(`command not found: ${name}` + (near ? ` — did you mean \`${near}\`?` : " — type 'help'."), 'err');
    }, 260);
  }

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') { run(input.value); input.value = ''; }
    else if (e.key === 'ArrowUp')   { e.preventDefault(); if (cursor > 0) input.value = typed[--cursor]; }
    else if (e.key === 'ArrowDown') { e.preventDefault(); input.value = cursor < typed.length - 1 ? typed[++cursor] : (cursor = typed.length, ''); }
    else if (e.key === 'Tab') {
      e.preventDefault();
      const v = input.value.trim().toLowerCase();
      if (!v) return;
      const hits = Object.keys(COMMANDS).filter(c => c.startsWith(v));
      if (hits.length === 1) input.value = hits[0] + ' ';
      else if (hits.length > 1) line(hits.join('  '), 'sys');
    }
  });

  root.querySelectorAll('.qb').forEach(b => b.addEventListener('click', () => run(b.dataset.cmd || b.textContent)));

  // clicking anywhere in the shell puts the caret back in the input
  body.addEventListener('click', e => { if (!e.target.closest('button,a')) input.focus({ preventScroll: true }); });
}

/**
 * Matrix rain over the terminal body, in the site's cyan. Runs ~7 s or until
 * a key / click; returns a function that stops it early.
 */
function matrixRain(host, duration = 7000) {
  const cv = document.createElement('canvas');
  cv.className = 'matrix';
  host.append(cv);

  const ctx = cv.getContext('2d');
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const W = host.clientWidth, H = host.clientHeight;
  cv.width = W * dpr; cv.height = H * dpr;
  cv.style.width = W + 'px'; cv.style.height = H + 'px';
  ctx.scale(dpr, dpr);

  const fs = 14, cols = Math.ceil(W / fs);
  const drops = Array.from({ length: cols }, () => -Math.random() * 40);
  const glyphs = 'アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789<>/{}[]=+*#$%&';
  const pick = () => glyphs[(Math.random() * glyphs.length) | 0];

  ctx.fillStyle = '#05060a';
  ctx.fillRect(0, 0, W, H);
  ctx.font = `${fs}px "JetBrains Mono", ui-monospace, monospace`;

  let raf = 0, last = 0;
  const t0 = performance.now();

  function frame(now) {
    if (now - last > 42) {                         // ~24 fps reads more "terminal" than 60
      last = now;
      ctx.fillStyle = 'rgba(5,6,10,.16)';
      ctx.fillRect(0, 0, W, H);
      for (let i = 0; i < cols; i++) {
        const y = drops[i] * fs;
        if (y > 0) {
          ctx.fillStyle = '#eaf9ff';               // bright head
          ctx.fillText(pick(), i * fs, y);
          ctx.fillStyle = Math.random() < .5 ? '#22d3ee' : '#7c5cff';
          ctx.fillText(pick(), i * fs, y - fs);    // trail picks up the site palette
        }
        drops[i] = y > H && Math.random() > .96 ? 0 : drops[i] + 1;
      }
    }
    if (now - t0 < duration) raf = requestAnimationFrame(frame);
    else stop();
  }

  function stop() {
    cancelAnimationFrame(raf);
    removeEventListener('keydown', stop, true);
    host.removeEventListener('pointerdown', stop, true);
    cv.remove();
  }
  addEventListener('keydown', stop, true);
  host.addEventListener('pointerdown', stop, true);
  raf = requestAnimationFrame(frame);
  return stop;
}
