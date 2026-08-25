/**
 * Contact form.
 * There is no backend here, so the form composes a mailto: link and hands the
 * message to whatever mail client the visitor already uses — nothing is sent
 * anywhere by the page itself. Validation is ours so the styling stays consistent.
 */
export function initForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const err = form.querySelector('.form__err');
  const btn = form.querySelector('button[type=submit]');
  const TO = 'amirchoudharyb03@gmail.com';

  const valid = {
    name: v => v.trim().length >= 2 || 'Please add your name.',
    email: v => /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(v.trim()) || 'That email address looks off.',
    message: v => v.trim().length >= 10 || 'Tell me a little more — 10 characters minimum.'
  };

  form.addEventListener('input', e => {
    e.target.classList.remove('bad');
    err.textContent = '';
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    const data = {};

    for (const key of Object.keys(valid)) {
      const field = form.elements[key];
      data[key] = field.value;
      const check = valid[key](field.value);
      if (check !== true) {
        field.classList.add('bad');
        field.focus();
        err.textContent = check;
        return;
      }
    }

    const subject = `Portfolio enquiry — ${data.name.trim()}`;
    const body = `${data.message.trim()}\n\n—\n${data.name.trim()}\n${data.email.trim()}`;
    location.href = `mailto:${TO}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    const label = btn.textContent;
    btn.textContent = 'Opening your mail app…';
    btn.disabled = true;
    setTimeout(() => { btn.textContent = label; btn.disabled = false; form.reset(); }, 2600);
  });
}
