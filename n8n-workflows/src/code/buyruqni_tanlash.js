// "Buyruqni tanlash" — Buyruqlar varag'idan ishlatiladigan qatorni oladi.
// Status='Boshlash' bo'lgan OXIRGI qatorni, bo'lmasa eng oxirgi qatorni tanlaydi.
const rows = $input.all().map((i) => i.json);
if (!rows.length) {
  throw new Error("Buyruqlar varag'i bo'sh. Avval bir qator to'ldiring.");
}

let chosen = null;
for (let i = rows.length - 1; i >= 0; i--) {
  if (String(rows[i]['Status'] || '').trim() === 'Boshlash') {
    chosen = rows[i];
    break;
  }
}
if (!chosen) chosen = rows[rows.length - 1];

const vaqtMap = {
  'Bugun': { date_posted: 'last-day', cutoffDays: 1 },
  'Oxirgi hafta': { date_posted: 'last-week', cutoffDays: 7 },
  'Oxirgi oy': { date_posted: 'last-month', cutoffDays: 30 },
  'Oxirgi 3 oy': { date_posted: 'last-year', cutoffDays: 90 },
  'Oxirgi 6 oy': { date_posted: 'last-year', cutoffDays: 180 },
  "So'ngi yil": { date_posted: 'last-year', cutoffDays: 365 },
};

const vaqt = String(chosen['Vaqt'] || '').trim();
const v = vaqtMap[vaqt] || { date_posted: 'last-month', cutoffDays: 30 };
const miqdor = parseInt(chosen['Miqdor'], 10) || 10;

return [
  {
    json: {
      query: String(chosen['Buyruq'] || '').trim(),
      miqdor: miqdor,
      date_posted: v.date_posted,
      cutoffDays: v.cutoffDays,
      row_number: chosen.row_number,
    },
  },
];
