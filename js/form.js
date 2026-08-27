/**
 * Contact form using FormSubmit.co for direct email delivery.
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
    err.style.color = 'var(--c)';
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const data = {};

    for (const key of Object.keys(valid)) {
      const field = form.elements[key];
      if (!field) continue;
      data[key] = field.value;
      const check = valid[key](field.value);
      if (check !== true) {
        field.classList.add('bad');
        field.focus();
        err.textContent = check;
        return;
      }
    }
    
    // Also include subject if present
    const subjectField = form.elements['subject'];
    if (subjectField) data['subject'] = subjectField.value;

    const originalBtnHTML = btn.innerHTML;
    btn.textContent = 'Sending...';
    btn.disabled = true;

    try {
      const response = await fetch(`https://formsubmit.co/ajax/${TO}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: data.name.trim(),
          email: data.email.trim(),
          subject: data.subject ? data.subject.trim() : `Portfolio enquiry from ${data.name.trim()}`,
          message: data.message.trim()
        })
      });

      if (response.ok) {
        form.reset();
        err.style.color = 'var(--b)';
        err.textContent = 'Message sent successfully!';
      } else {
        throw new Error('Server returned an error');
      }
    } catch (error) {
      err.style.color = 'var(--c)';
      err.textContent = 'Failed to send message. Please try again.';
    } finally {
      setTimeout(() => { 
        btn.innerHTML = originalBtnHTML; 
        btn.disabled = false; 
        if (err.textContent === 'Message sent successfully!') err.textContent = '';
      }, 3000);
    }
  });
}

