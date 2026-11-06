const STORAGE_KEY = 'digitaler-unfall-meldeblock-v1';
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
    alert('Es gibt noch keine gespeicherten Meldungen zum Exportieren.');
    return;
  }
  if (!window.XLSX) {
    alert('Der Excel-Export benötigt eine Internetverbindung. Deine gespeicherten Meldungen bleiben erhalten.');
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
  XLSX.utils.book_append_sheet(workbook, sheet, 'Unfallmeldungen');
  XLSX.writeFile(workbook, `Unfallmeldungen_${new Date().toISOString().slice(0, 10)}.xlsx`);
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

form.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const data = Object.fromEntries(new FormData(form).entries());
  const records = getRecords();
  records.push({ ...data, savedAt: new Date().toISOString() });
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    refreshCount();
    form.reset();
    status.textContent = 'Bericht gespeichert. Die Daten bleiben auf diesem Gerät erhalten.';
    document.querySelector('.dialog-content').scrollTo({ top: 0, behavior: 'smooth' });
    window.setTimeout(closeForm, 1600);
  } catch {
    status.textContent = 'Speichern ist fehlgeschlagen. Der lokale Speicher ist möglicherweise voll.';
  }
});

refreshCount();
