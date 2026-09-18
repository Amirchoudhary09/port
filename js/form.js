/**
 * Contact slide: the form and the click-to-reveal phone number.
 *
 * Delivery: the visitor's own mail app opens with the message addressed to
 * Amir — no third party, nothing to activate, the mail comes from the
 * visitor's address so "Reply" just works.
 *
 * FormSubmit.co can deliver silently instead (visitor never leaves the page),
 * but only after Amir clicks the one-time "Activate Form" email it sends.
 * Flip FORMSUBMIT_ACTIVATED to true once that's done; the mail-app path stays
 * as the fallback if FormSubmit ever fails.
 */
const TO    = 'amirchoudharyb03@gmail.com';
const PHONE = { text: '+91 94571 14241', href: 'tel:+919457114241' };
const FORMSUBMIT_ACTIVATED = false;

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

const subjectFor = d => `Portfolio message from ${d.name} — ${d.subject}`;
const bodyFor    = d => `${d.message}\n\n— ${d.name}\n${d.email}`;
const mailtoFor  = d => `mailto:${TO}?subject=${encodeURIComponent(subjectFor(d))}&body=${encodeURIComponent(bodyFor(d))}`;

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

  /** hand the message to the visitor's mail app, with a copy button in case there is none */
  function openMailApp(d) {
    location.href = mailtoFor(d);
    say('Your email app has opened with the message — just press Send there. ', 'ok');
    const copy = document.createElement('button');
    copy.type = 'button';
    copy.className = 'form__copy';
    copy.textContent = 'No mail app? Copy the message';
    copy.addEventListener('click', () => {
      navigator.clipboard.writeText(`To: ${TO}\nSubject: ${subjectFor(d)}\n\n${bodyFor(d)}`)
        .then(() => { copy.textContent = `Copied — paste it into an email to ${TO}`; })
        .catch(() => { copy.textContent = `Email ${TO} with your message`; });
    });
    status.append(copy);
  }

  async function sendViaFormSubmit(d) {
    const r = await fetch(`https://formsubmit.co/ajax/${TO}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ ...d, _subject: subjectFor(d), _template: 'box', _replyto: d.email }),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok || String(j.success) === 'false') throw new Error(j.message || `HTTP ${r.status}`);
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

    if (!FORMSUBMIT_ACTIVATED) { openMailApp(data); return; }

    busy = true;
    btn.disabled = true;
    label.textContent = 'Sending…';
    say('');
    try {
      await sendViaFormSubmit(data);
      form.reset();
      label.textContent = 'Sent ✓';
      btn.classList.add('ok');
      say("Message sent — I'll get back to you soon.", 'ok');
    } catch {
      openMailApp(data);                          // never leave someone stuck
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
