import { SECTIONS } from './config.js';

/** Fetch every section partial and mount it as a slide inside #deck. */
export async function mountSections() {
  const deck = document.getElementById('deck');

  const parts = await Promise.all(
    SECTIONS.map(s =>
      fetch(`sections/${s.file}`)
        .then(r => { if (!r.ok) throw new Error(r.status); return r.text(); })
        .catch(() => `<p class="load-err">Could not load <code>sections/${s.file}</code>.</p>`)
    )
  );

  deck.innerHTML = SECTIONS.map((s, i) => `
    <section class="slide" id="${s.id}" style="--i:${i + 1}" data-index="${i}" aria-label="${s.label}">
      <div class="slide__inner">
        <div class="wrap ${s.cls || ''}">${parts[i]}</div>
      </div>
    </section>`).join('');

  return [...deck.querySelectorAll('.slide')];
}

/** Opening index.html straight from disk blocks fetch — say so instead of showing a blank page. */
export function guardFileProtocol() {
  if (location.protocol !== 'file:') return false;
  document.body.insertAdjacentHTML('afterbegin', `
    <div class="boot-note">
      <h2>Run this through a local server</h2>
      <p>The portfolio is split into modules, and browsers block <code>fetch()</code> on <code>file://</code>.</p>
      <p>In VS Code: right-click <code>index.html</code> → <b>Open with Live Server</b>,<br>
      or run <code>npx serve .</code> (or double-click <code>start.bat</code>) and open the printed URL.</p>
    </div>`);
  return true;
}
