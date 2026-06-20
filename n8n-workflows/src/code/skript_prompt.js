// "S Skript prompt" — transcript + raskadrovka + caption asosida yakuniy Gemini promptini quradi.
const task = $('Vazifani tanlash').first().json;
const sp = $('SCRIPT PROMPT').first().json;

let transcript = '';
try {
  const r = $input.first().json || {};
  transcript = r.transcript || r.text ||
    (r.data && (r.data.transcript || r.data.text)) || '';
  if (typeof transcript === 'object') transcript = JSON.stringify(transcript);
} catch (e) {
  transcript = '';
}

const tili = task.skriptTili || 'Uzbek';
const basePrompt = sp.prompt || '';

const prompt =
  basePrompt +
  '\n\n--- SKRIPT TILI: ' + tili + ' ---\n' +
  '\nTRANSKRIPT (asl video matni):\n' + (transcript || '(yo\'q)') +
  '\n\nRASKADROVKA (asl video tahlili):\n' + (task.raskadrovka || '(yo\'q)') +
  '\n\nVIDEO TAVSIFI (caption):\n' + (task.opisaniya || '(yo\'q)') +
  '\n\nYUQORIDAGILARDAN foydalanib, ' + tili +
  ' tilida YANGI, original va viral bo\'ladigan tayyor video skript yoz. ' +
  'Skript hook (birinchi 3 soniya), asosiy qism va call-to-action bilan tuzilgan bo\'lsin.';

const geminiBody = {
  contents: [{ parts: [{ text: prompt }] }],
  generationConfig: { temperature: 0.9, maxOutputTokens: 8192 },
};

return [{ json: { geminiBody: geminiBody } }];
