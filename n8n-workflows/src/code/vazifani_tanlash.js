// "Vazifani tanlash" — ustuvorlik A -> S -> B bilan bitta kutilayotgan vazifani tanlaydi.
const insta = $('Instagram oqish').all().map((i) => i.json);
const skript = $('Skriptlar oqish').all().map((i) => i.json);
const rask = $('Raskadrovka oqish').all().map((i) => i.json);
const chatId = $('Boshlanish WF1 dan').first().json.chatId;

function findFirst(rows, status) {
  for (const r of rows) {
    if (String(r['Status'] || '').trim() === status) return r;
  }
  return null;
}
// Post ID bo'yicha Instagram caption (opisaniya) topish
function captionFor(postId) {
  for (const r of insta) {
    if (String(r['Post IDsi'] || '').trim() === String(postId || '').trim()) {
      return r['Opisaniya'] || '';
    }
  }
  return '';
}

let task;

const a = findFirst(insta, 'Skript yasash');
if (a) {
  task = {
    mode: 'A',
    havola: a['Havola'],
    postId: a['Post IDsi'],
    account: a['Akkaunt'],
    accountId: a['Akkaunt IDsi'],
    skriptTili: a['Skript tili'] || 'Uzbek',
    opisaniya: a['Opisaniya'] || '',
    instaRow: a.row_number,
  };
} else {
  const s = findFirst(rask, 'Skript yaratish');
  if (s) {
    task = {
      mode: 'S',
      havola: s['Havola'],
      postId: s['Post IDsi'],
      account: s['Akkaunt'],
      skriptTili: s['Skript tili'] || 'Uzbek',
      raskadrovka: s['Raskadrovka'] || '',
      opisaniya: captionFor(s['Post IDsi']),
      raskRow: s.row_number,
    };
  } else {
    const b = findFirst(skript, 'Qayta yozish');
    if (b) {
      task = {
        mode: 'B',
        havola: b['Havola'],
        postId: b['Post IDsi'],
        account: b['Akkaunt'],
        oldScript: b['Skript'] || '',
        opisaniya: b['Opisaniya'] || '',
        insights: b['Insights skrinshotlari'] || '',
        skriptRow: b.row_number,
      };
    } else {
      task = { mode: 'none' };
    }
  }
}

task.chatId = chatId;
return [{ json: task }];
