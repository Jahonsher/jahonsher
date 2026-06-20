// "A Video base64" — yuklangan videoni base64'ga o'tkazib, Gemini raskadrovka so'rovini quradi.
const buffer = await this.helpers.getBinaryDataBuffer(0, 'data');
const b64 = buffer.toString('base64');

const task = $('Vazifani tanlash').first().json;
const tili = task.skriptTili || 'Uzbek';

const prompt =
  'Quyidagi Instagram Reels videosini SONIYALAR bo\'yicha to\'liq raskadrovka qil. ' +
  'Har bir sahna uchun aniq ko\'rsat: vaqt oralig\'i (masalan 0-3s, 3-6s ...), ' +
  'kadrda nima ko\'rinayapti, ekrandagi matnlar (text overlay), personajlar harakati, ' +
  'kamera harakati, montaj va o\'tishlar (transition), ovoz/musiqa hissi. ' +
  'Iloji boricha batafsil va tartibli yoz. Javobni ' + tili + ' tilida yoz.';

const geminiBody = {
  contents: [
    {
      parts: [
        { inline_data: { mime_type: 'video/mp4', data: b64 } },
        { text: prompt },
      ],
    },
  ],
  generationConfig: { temperature: 0.4, maxOutputTokens: 8192 },
};

return [{ json: { geminiBody: geminiBody } }];
