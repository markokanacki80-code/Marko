const STORAGE_KEY = 'digitaler-unfall-meldeblock-v1';
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzI7-Q4C-9yYlbsj-WLtkk6gJBlXLMKAIIhQDelw6TRLCqqc7x5_SaGkvSeodgeEJs/exec';
const fieldNames = {
  injuredName: 'Name des Verletzten',
  incidentDateTime: 'Datum / Uhrzeit',
  location: 'Standort',
  department: 'Abteilung / Bereich',
  materialsUsed: 'Was wurde dem Verbandskasten entnommen?',
  accidentDescription: 'Unfallhergang',
  injuryDescription: 'Art und Umfang der Verletzung',
  firstAidDateTime: 'Erste Hilfe Datum/Uhrzeit',
  firstAider: 'Name des Erste-Hilfe-Leistenden',
  firstAidMeasures: 'Art und Weise der Maßnahme',
  witnesses: 'Zeugen des Hergangs bzw. Erste Hilfe Maßnahme'
};

const dialog = document.querySelector('#dialog');
const form = document.querySelector('#incident-form');
const status = document.querySelector('#form-status');
const submitButton = form.querySelector('[type="submit"]');

function getRecords() {
  try {
    const records = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(records) ? records : [];
  } catch {
    return [];
  }
}

function refreshCount() {
  const count = getRecords().length;
  document.querySelector('#record-count').textContent = count;
  document.querySelector('#export-home').disabled = count === 0;
  document.querySelector('#header-export').disabled = count === 0;
}

function openForm() {
  dialog.hidden = false;
  document.body.classList.add('dialog-open');
  document.querySelector('#dialog input')?.focus();
}

function closeForm() {
  dialog.hidden = true;
  document.body.classList.remove('dialog-open');
  status.textContent = '';
}

function excelDate(value) {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('de-DE');
}

function exportExcel() {
  const records = getRecords();
  if (!records.length) {
    alert('Es gibt noch keine lokal gespeicherten Meldungen zum Exportieren. Für alle Einträge exportiere bitte direkt aus Google Tabellen.');
    return;
  }
  if (!window.XLSX) {
    alert('Der Excel-Export benötigt eine Internetverbindung. Deine lokal gespeicherten Meldungen bleiben erhalten.');
    return;
  }
  const rows = records.map((record) => {
    const row = { 'Gespeichert am': new Date(record.savedAt).toLocaleString('de-DE') };
    for (const [key, label] of Object.entries(fieldNames)) {
      row[label] = key.endsWith('DateTime') ? excelDate(record[key]) : (record[key] || '');
    }
    return row;
  });
  const sheet = XLSX.utils.json_to_sheet(rows);
  sheet['!cols'] = Object.keys(rows[0]).map((key) => ({ wch: Math.min(42, Math.max(18, key.length + 2)) }));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, 'Lokale Meldungen');
  XLSX.writeFile(workbook, `Unfallmeldungen_lokal_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

document.querySelector('#open-form').addEventListener('click', openForm);
document.querySelector('#close-form').addEventListener('click', closeForm);
document.querySelector('#cancel-form').addEventListener('click', closeForm);
document.querySelector('#export-home').addEventListener('click', exportExcel);
document.querySelector('#header-export').addEventListener('click', exportExcel);
dialog.addEventListener('click', (event) => {
  if (event.target === dialog) closeForm();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !dialog.hidden) closeForm();
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;

  const data = Object.fromEntries(new FormData(form).entries());
  const record = { ...data, savedAt: new Date().toISOString() };
  const body = new URLSearchParams(record);
  submitButton.disabled = true;
  submitButton.textContent = 'SENDING…';
  status.textContent = 'Meldung wird gesendet…';

  try {
    // URL-encoded form data is a simple request, avoiding a CORS preflight.
    // Apps Script's no-cors response is opaque, so the browser cannot verify
    // whether the script successfully appended the row. Check the Sheet after testing.
    await fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      body
    });

    const records = getRecords();
    records.push(record);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
      refreshCount();
    } catch {
      // A local backup failure must not discard the request already sent to Apps Script.
    }

    form.reset();
    status.textContent = 'Anfrage gesendet. Bitte prüfe die Google-Tabelle, ob der Eintrag angekommen ist.';
    document.querySelector('.dialog-content').scrollTo({ top: 0, behavior: 'smooth' });
    window.setTimeout(closeForm, 3000);
  } catch {
    status.textContent = 'Senden fehlgeschlagen. Prüfe deine Internetverbindung und die Apps-Script-Bereitstellung.';
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = 'EINREICHEN';
  }
});

refreshCount();
