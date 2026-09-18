import { mountSections } from './loader.js';
import { mountNav } from './nav.js';
import { initDeck } from './deck.js';
import { createScroller } from './smoothscroll.js';
import { initTyping } from './typing.js';
import { initReveal, initCounters } from './reveal.js';
import { initCursor } from './cursor.js';
import { initTilt, initMagnetic } from './interactions.js';
import { initContact } from './form.js';
import { initParticles } from './particles.js';
import { initTerminal } from './terminal.js';
import { initWater } from './water.js';

(function boot() {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // the three.js scene is desktop-only: a phone doesn't need a 170 KB WebGL bundle behind the text
  const wantsMesh = !reduce
    && matchMedia('(min-width: 768px) and (hover: hover)').matches
    && !(navigator.connection && navigator.connection.saveData);

  initCursor();
  initParticles();
  if (wantsMesh) import('./wireframe.js').then(m => m.initWireframe()).catch(() => {});

  const slides = mountSections();

  let scroller;                                   // nav clicks need it before it exists
  const setActive = mountNav(i => scroller.goTo(i));
  const deck = initDeck(slides);

  // the scroller owns the current index — nav highlight and slide animation follow it
  scroller = createScroller(slides, i => { setActive(i); deck.enter(i); });
  deck.bind(scroller);
  setActive(0);

  initTyping();
  initReveal();
  initCounters();
  initTilt();
  initMagnetic();
  initContact();
  initTerminal();
  initWater();

  // land on the right slide when the page is opened with a hash
  if (location.hash) {
    const i = slides.findIndex(s => '#' + s.id === location.hash);
    if (i > 0) requestAnimationFrame(() => scroller.goTo(i, true));
  }
  document.body.classList.add('ready');
})();
