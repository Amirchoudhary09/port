/**
 * Contact slide: the form and the click-to-reveal phone number.
 *
 * Delivery without any third-party account: the message is encrypted right
 * here in the browser (AES-256-GCM, key wrapped with RSA-OAEP) and dropped on
 * an ntfy.sh topic that only ever holds ciphertext. A GitHub Actions job in
 * Amir's private contact-inbox repo picks it up, decrypts it with the matching
 * private key and files it as an issue — which GitHub emails to him.
 * If the drop fails (no network, a browser without WebCrypto) the visitor's own
 * mail app opens with the message instead, so nothing is ever lost.
 */
const TO    = 'amirchoudharyb03@gmail.com';
const PHONE = { text: '+91 94571 14241', href: 'tel:+919457114241' };
const DROP  = 'https://ntfy.sh';
const TOPIC = 'amir-portfolio-inbox-c9f395c61d19';
// public half of contact-inbox/key.pem (SPKI, base64) — regenerate both together
const PUBLIC_KEY =
  'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA3xDboXMBC0hAsma3MB0F1j0pQCYdY+G20AIkJrUNPksdspakIsOKalDKSEiaG56KAC0+BQq+YIf5fdu/OPNe' +
  'ai71oaCC70kgi9XoZgTlVwQR4qmVwiJ/ekS78cGAi5a4qP1kZ2priUs5/onA+a59ns9Z4VeYDYG50wAt+nGmaJclOtgt4OBhSIkE3+7wUU21Nv5GqV8t10PImAKM724j' +
  'Y/7H8gOOrPEkcDxVn425BIm93sNf6GVMAbVGhILdBzARXN8SfOpFFuwW+gNw5TkTsnFUCgvOTF6tAlHG/5LnUiBDwR32rpSeLDNpIU0emVgeVJPHE8Sx8D+FoRIRVbB6' +
  'uQIDAQAB';

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

/* ---- the envelope: AES-GCM for the message, RSA-OAEP for the AES key ---- */
const b64 = buf => btoa(String.fromCharCode(...new Uint8Array(buf)));

async function seal(payload) {
  const der = Uint8Array.from(atob(PUBLIC_KEY), c => c.charCodeAt(0));
  const rsa = await crypto.subtle.importKey('spki', der, { name: 'RSA-OAEP', hash: 'SHA-256' }, false, ['encrypt']);
  const aes = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt']);
  const iv  = crypto.getRandomValues(new Uint8Array(12));
  const ct  = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, aes, new TextEncoder().encode(JSON.stringify(payload)));
  const k   = await crypto.subtle.encrypt({ name: 'RSA-OAEP' }, rsa, await crypto.subtle.exportKey('raw', aes));
  return { v: 1, k: b64(k), iv: b64(iv), ct: b64(ct) };
}

async function drop(payload) {
  const envelope = await seal(payload);
  // plain text body = no CORS preflight; ntfy reads the JSON publish format from the body
  const r = await fetch(DROP, { method: 'POST', body: JSON.stringify({ topic: TOPIC, title: 'portfolio-message', message: JSON.stringify(envelope) }) });
  if (!r.ok) throw new Error(`drop box answered ${r.status}`);
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
    message: v => (v.trim().length >= 10 && v.trim().length <= 1500) || 'Between 10 and 1500 characters, please.',
  };

  function say(msg, kind = '') {
    status.textContent = msg;
    status.className = 'form__status' + (kind && ' ' + kind);
  }

  /** fallback: hand the message to the visitor's mail app, with a copy button in case there is none */
  function openMailApp(d, why) {
    location.href = mailtoFor(d);
    say(`${why} Your email app has opened with the message — just press Send there. `, 'err');
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
      await drop({ ...data, when: Date.now(), page: location.href });
      form.reset();
      label.textContent = 'Sent ✓';
      btn.classList.add('ok');
      say("Message sent — I'll get back to you soon.", 'ok');
    } catch {
      openMailApp(data, "Couldn't reach the inbox.");
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
