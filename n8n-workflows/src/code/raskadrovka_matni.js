// "A Raskadrovka matni" — Gemini javobidan matnni yig'adi va Raskadrovka qatorini tayyorlaydi.
const resp = $input.first().json || {};
let text = '';
try {
  const parts = resp.candidates[0].content.parts;
  text = parts.map((p) => p.text || '').join('\n').trim();
} catch (e) {
  text = '';
}
if (!text) {
  text = '[Raskadrovka olinmadi — Gemini javobini tekshiring. Xato: ' +
    JSON.stringify(resp.error || resp).slice(0, 300) + ']';
}

const task = $('Vazifani tanlash').first().json;
const sana = new Date().toISOString().slice(0, 10);

return [
  {
    json: {
      'Sana': sana,
      'Akkaunt': task.account,
      'Post IDsi': task.postId,
      'Havola': task.havola,
      'Skript tili': task.skriptTili,
      'Raskadrovka': text,
      'Status': 'Tayyor',
    },
  },
];
