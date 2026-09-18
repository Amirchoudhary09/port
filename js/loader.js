import { SECTIONS } from './config.js';

/**
 * Slides are written straight into index.html — one <section class="slide">
 * per SECTIONS entry — so crawlers, link previews and no-JS visitors all see
 * the real content. This collects them in config order and warns if the two
 * files have drifted apart.
 */
export function mountSections() {
  const deck = document.getElementById('deck');
  const slides = [];

  SECTIONS.forEach((s, i) => {
    const slide = deck.querySelector(`section.slide[id="${s.id}"]`);
    if (!slide) {
      console.warn(`config.js lists "${s.id}" but index.html has no <section class="slide" id="${s.id}">`);
      return;
    }
    slide.style.setProperty('--i', i + 1);        // stacking order for the sticky swap
    slide.dataset.index = i;
    if (!slide.hasAttribute('aria-label')) slide.setAttribute('aria-label', s.label);
    slides.push(slide);
  });

  return slides;
}
