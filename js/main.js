import { mountSections, guardFileProtocol } from './loader.js';
import { mountNav } from './nav.js';
import { initDeck } from './deck.js';
import { createScroller } from './smoothscroll.js';
import { initTyping } from './typing.js';
import { initReveal, initCounters } from './reveal.js';
import { initCursor } from './cursor.js';
import { initTilt, initMagnetic } from './interactions.js';
import { initForm } from './form.js';
import { initParticles } from './particles.js';
import { initWireframe } from './wireframe.js';
import { initTerminal } from './terminal.js';

(async function boot() {
  initCursor();
  initWireframe();
  initParticles();

  if (guardFileProtocol()) return;

  const slides = await mountSections();

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
  initForm();
  initTerminal();

  // land on the right slide when the page is opened with a hash
  if (location.hash) {
    const i = slides.findIndex(s => '#' + s.id === location.hash);
    if (i > 0) requestAnimationFrame(() => scroller.goTo(i, true));
  }
  document.body.classList.add('ready');
})();
