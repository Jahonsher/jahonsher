// "S Skript matni" — Gemini javobidan skriptni oladi va Skriptlar qatorini tayyorlaydi.
// MUHIM: raskadrovka SHU qatorga ham yoziladi.
const resp = $input.first().json || {};
let text = '';
try {
  text = resp.candidates[0].content.parts.map((p) => p.text || '').join('\n').trim();
} catch (e) {
  text = '';
}
if (!text) {
  text = '[Skript olinmadi — Gemini javobini tekshiring. Xato: ' +
    JSON.stringify(resp.error || resp).slice(0, 300) + ']';
}

const task = $('Vazifani tanlash').first().json;
const sana = new Date().toISOString().slice(0, 10);

return [
  {
    json: {
      'Sana': sana,
      'Manba': task.havola,
      'Skript': text,
      'Raskadrovka': task.raskadrovka || '',
      'Kamentlar': '',
      'Opisaniya': task.opisaniya || '',
      'Status': 'Tayyor',
      'Havola': task.havola,
      'Akkaunt': task.account,
      'Post IDsi': task.postId,
      'Insights skrinshotlari': '',
    },
  },
];
