import { SECTIONS, ICONS } from './config.js';

/** Build the top icon nav and return a setter for the active slide. */
export function mountNav(onJump) {
  const nav = document.getElementById('nav');

  nav.innerHTML = SECTIONS.map((s, i) => `
    <a href="#${s.id}" aria-label="${s.label}" data-index="${i}">
      <svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[s.icon] || ''}</svg>
      <span>${s.label}</span>
    </a>`).join('') +
    `<div class="count"><b>01</b>/${String(SECTIONS.length).padStart(2, '0')}</div>`;

  const links = [...nav.querySelectorAll('a')];
  const counter = nav.querySelector('.count b');

  nav.addEventListener('click', e => {
    const a = e.target.closest('a');
    if (!a) return;
    e.preventDefault();
    onJump(+a.dataset.index);
  });

  return function setActive(index) {
    links.forEach((a, i) => a.classList.toggle('on', i === index));
    if (counter) counter.textContent = String(index + 1).padStart(2, '0');
    // keep the active pill visible when the nav has to scroll on narrow screens
    const a = links[index];
    if (a && nav.scrollWidth > nav.clientWidth) {
      nav.scrollTo({ left: a.offsetLeft - nav.clientWidth / 2 + a.offsetWidth / 2, behavior: 'smooth' });
    }
  };
}
