/**
 * Contact slide: the form (FormSubmit.co over fetch, plain POST as the no-JS
 * fallback) and the click-to-reveal phone number.
 */
const TO    = 'amirchoudharyb03@gmail.com';
const PHONE = { text: '+91 94571 14241', href: 'tel:+919457114241' };

export function initContact() {
  initPhoneReveal();
  initForm();
}

/** the number is never in the HTML — it's swapped in when someone asks for it */
function initPhoneReveal() {
  const btn = document.getElementById('reveal-phone');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const a = document.createElement('a');
    a.className = 'c-block';
    a.href = PHONE.href;
    a.innerHTML = btn.innerHTML;                  // same icon + layout
    a.querySelector('.c-details strong').textContent = PHONE.text;
    btn.replaceWith(a);
    a.focus();
  }, { once: true });
}

function initForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  form.noValidate = true;                         // the messages below replace the browser bubbles

  const status = form.querySelector('.form__status');
  const btn    = form.querySelector('button[type=submit]');
  const label  = btn.querySelector('.btn-send__label');
  const idle   = label.textContent;

  const rules = {
    name:    v => v.trim().length >= 2  || 'Please add your name.',
    email:   v => /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(v.trim()) || 'That email address looks off.',
    subject: v => v.trim().length >= 3  || 'Give the message a subject.',
    message: v => v.trim().length >= 10 || 'Tell me a little more — 10 characters minimum.',
  };

  function say(msg, kind = '') {
    status.textContent = msg;
    status.className = 'form__status' + (kind && ' ' + kind);
  }

  form.addEventListener('input', e => {
    e.target.classList.remove('bad');
    if (status.classList.contains('err')) say('');
  });

  let busy = false;
  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (busy) return;

    const data = {};
    for (const key in rules) {
      const field = form.elements[key];
      const check = rules[key](field.value);
      if (check !== true) {
        field.classList.add('bad');
        field.focus();
        say(check, 'err');
        return;
      }
      data[key] = field.value.trim();
    }

    // honeypot filled in → a bot; pretend it worked and drop it
    if (form.elements._honey && form.elements._honey.value) {
      form.reset();
      say("Message sent — I'll get back to you soon.", 'ok');
      return;
    }

    busy = true;
    btn.disabled = true;
    label.textContent = 'Sending…';
    say('');

    try {
      const r = await fetch(`https://formsubmit.co/ajax/${TO}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        // box = FormSubmit's framed email; _replyto lets Amir hit Reply and reach the sender
        body: JSON.stringify({ ...data, _subject: `Portfolio message from ${data.name} — ${data.subject}`, _template: 'box', _replyto: data.email }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || String(j.success) === 'false') throw new Error(j.message || `HTTP ${r.status}`);

      form.reset();
      label.textContent = 'Sent ✓';
      btn.classList.add('ok');
      say("Message sent — I'll get back to you soon.", 'ok');
    } catch (err) {
      // never leave someone stuck: hand them a ready-made email instead
      const body = `${data.message}\n\n— ${data.name} (${data.email})`;
      const why = /activat/i.test(err.message) ? "The form isn't switched on yet. " : `Couldn't send right now (${err.message}). `;
      say(why, 'err');
      const a = document.createElement('a');
      a.href = `mailto:${TO}?subject=${encodeURIComponent(data.subject)}&body=${encodeURIComponent(body)}`;
      a.textContent = 'Email me directly instead →';
      status.append(a);
    } finally {
      busy = false;
      setTimeout(() => {
        btn.disabled = false;
        btn.classList.remove('ok');
        label.textContent = idle;
      }, 3000);
    }
  });
}
