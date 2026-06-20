// "B Skrinshot va body" — har bir Insights skrinshot URL'ini yuklab base64'ga o'tkazadi,
// inline rasm sifatida qo'shadi va qayta yozish promptini quradi.
const data = $input.first().json;
const parts = [];

const prompt =
  'Quyida KAM ko\'rilgan (viral bo\'lmagan) Instagram videoning Insights statistikasi skrinshotlari, ' +
  'referans (yaxshi ishlagan) videoning raskadrovkasi va eski skript berilgan.\n' +
  '1) AVVAL Insights skrinshotlariga qarab, eski video NEGA viral bo\'lmaganini batafsil tahlil qil ' +
  '(retention, hook, ko\'rilish manbalari va h.k.).\n' +
  '2) SO\'NG referans raskadrovka va eski skript asosida, ' + (data.tili || 'Uzbek') +
  ' tilida VIRAL bo\'ladigan qilib skriptni QAYTA YOZ. ' +
  'Yangi skript kuchli hook, aniq struktura va call-to-action bilan bo\'lsin.\n\n' +
  'ESKI SKRIPT:\n' + (data.oldScript || '(yo\'q)') +
  '\n\nREFERANS RASKADROVKA:\n' + (data.referans || '(yo\'q)') +
  '\n\nVIDEO TAVSIFI:\n' + (data.opisaniya || '(yo\'q)');

for (const u of data.urls || []) {
  try {
    const buf = await this.helpers.httpRequest({
      url: u,
      method: 'GET',
      encoding: 'arraybuffer',
      returnFullResponse: false,
    });
    const b64 = Buffer.from(buf).toString('base64');
    let mime = 'image/jpeg';
    if (/\.png(\?|$)/i.test(u)) mime = 'image/png';
    else if (/\.webp(\?|$)/i.test(u)) mime = 'image/webp';
    parts.push({ inline_data: { mime_type: mime, data: b64 } });
  } catch (e) {
    // bu rasmni o'tkazib yuboramiz
  }
}

parts.push({ text: prompt });

const geminiBody = {
  contents: [{ parts: parts }],
  generationConfig: { temperature: 0.9, maxOutputTokens: 8192 },
};

return [{ json: { geminiBody: geminiBody } }];
