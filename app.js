const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzI7-Q4C-9yYlbsj-WLtkk6gJBlXLMKAIIhQDelw6TRLCqqc7x5_SaGkvSeodgeEJs/exec';

const form = document.querySelector('#incident-form');
const status = document.querySelector('#form-status');
const submitButton = form.querySelector('[type="submit"]');

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;

  const payload = new URLSearchParams(new FormData(form));
  submitButton.disabled = true;
  submitButton.textContent = 'SENDING…';
  status.textContent = 'Meldung wird gesendet…';

  try {
    // Apps Script must append the report and send a confirmation email to submitterEmail.
    // no-cors avoids a browser preflight; the response is opaque, so server success cannot be verified here.
    await fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      body: payload
    });

    form.reset();
    status.textContent = 'Anfrage gesendet. Bitte prüfe Google Sheet und Posteingang auf die Bestätigung.';
    document.querySelector('.dialog-content').scrollTo({ top: 0, behavior: 'smooth' });
    window.setTimeout(() => {
      document.querySelector('#dialog').hidden = true;
      document.body.classList.remove('dialog-open');
      status.textContent = '';
    }, 3500);
  } catch {
    status.textContent = 'Senden fehlgeschlagen. Prüfe Internetverbindung und Apps-Script-Bereitstellung.';
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = 'EINREICHEN';
  }
});

document.querySelector('#open-form').addEventListener('click', () => {
  document.querySelector('#dialog').hidden = false;
  document.body.classList.add('dialog-open');
  document.querySelector('#dialog input')?.focus();
});

document.querySelector('#close-form').addEventListener('click', closeForm);
document.querySelector('#cancel-form').addEventListener('click', closeForm);
document.querySelector('#dialog').addEventListener('click', (event) => {
  if (event.target === event.currentTarget) closeForm();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !document.querySelector('#dialog').hidden) closeForm();
});

function closeForm() {
  document.querySelector('#dialog').hidden = true;
  document.body.classList.remove('dialog-open');
  status.textContent = '';
}
