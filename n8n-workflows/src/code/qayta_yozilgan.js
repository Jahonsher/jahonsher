// "B Qayta yozilgan" — Gemini javobidan yangi (qayta yozilgan) skriptni oladi.
const resp = $input.first().json || {};
let text = '';
try {
  text = resp.candidates[0].content.parts.map((p) => p.text || '').join('\n').trim();
} catch (e) {
  text = '';
}
if (!text) {
  text = '[Qayta yozilgan skript olinmadi — Gemini javobini tekshiring. Xato: ' +
    JSON.stringify(resp.error || resp).slice(0, 300) + ']';
}

const task = $('Vazifani tanlash').first().json;

return [
  {
    json: {
      'row_number': task.skriptRow,
      'Skript': text,
      'Status': 'Qayta yozilgan',
    },
  },
];
