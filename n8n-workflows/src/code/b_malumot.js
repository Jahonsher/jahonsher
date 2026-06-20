// "B malumot" — Raskadrovka varag'idan shu Post ID'ga mos raskadrovka/tilni topadi,
// Insights skrinshotlari matnidan URL'larni ajratadi.
const task = $('Vazifani tanlash').first().json;
const rask = $('Raskadrovka oqish').all().map((i) => i.json);

let referans = '';
let tili = 'Uzbek';
const pid = String(task.postId || '').trim();
for (const r of rask) {
  if (String(r['Post IDsi'] || '').trim() === pid) {
    referans = r['Raskadrovka'] || '';
    tili = r['Skript tili'] || tili;
    break;
  }
}

const urls = (String(task.insights || '').match(/https?:\/\/[^\s,;"']+/g) || []).slice(0, 6);

return [
  {
    json: {
      referans: referans,
      tili: tili,
      urls: urls,
      oldScript: task.oldScript || '',
      opisaniya: task.opisaniya || '',
    },
  },
];
