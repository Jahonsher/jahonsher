// Bu skript 2 ta n8n workflow JSON faylini quradi: WF1 (Qidiruv) va WF2 (Skript).
// Code node'lar manbasi src/code/*.js fayllaridan o'qiladi (escaping muammosiz).
const fs = require('fs');
const path = require('path');

const CODE_DIR = path.join(__dirname, 'src', 'code');
const OUT_DIR = __dirname;

function code(name) {
  return fs.readFileSync(path.join(CODE_DIR, name), 'utf8');
}

// Credential placeholderlari — import qilingach n8n ichida qayta tanlanadi.
const CRED = {
  telegram: { telegramApi: { id: 'REPLACE_TELEGRAM', name: 'Telegram API' } },
  sheets: { googleApi: { id: 'REPLACE_GOOGLE', name: 'Google API (Service Account)' } },
  scrape: { httpHeaderAuth: { id: 'REPLACE_SCRAPE', name: 'ScrapeCreators (x-api-key)' } },
  gemini: { httpHeaderAuth: { id: 'REPLACE_GEMINI', name: 'Gemini (x-goog-api-key)' } },
};

const SHEET_DOC = { __rl: true, value: 'PASTE_SHEET_ID', mode: 'id' };
function sheet(name) {
  return { __rl: true, value: name, mode: 'list', cachedResultName: name };
}

let _id = 0;
function nid() { return 'n' + (++_id); }

// ---- node yasash yordamchilari ----
function codeNode(name, file, pos) {
  return {
    parameters: { mode: 'runOnceForAllItems', jsCode: code(file) },
    id: nid(), name, type: 'n8n-nodes-base.code', typeVersion: 2, position: pos,
  };
}
function tg(name, chatExpr, text, pos) {
  return {
    parameters: {
      chatId: chatExpr,
      text,
      additionalFields: {},
    },
    id: nid(), name, type: 'n8n-nodes-base.telegram', typeVersion: 1.2,
    position: pos, credentials: CRED.telegram,
  };
}
function sheetsRead(name, sheetName, pos) {
  return {
    parameters: {
      documentId: SHEET_DOC,
      sheetName: sheet(sheetName),
      options: {},
    },
    id: nid(), name, type: 'n8n-nodes-base.googleSheets', typeVersion: 4.5,
    position: pos, credentials: CRED.sheets,
  };
}
function sheetsAppend(name, sheetName, pos) {
  return {
    parameters: {
      operation: 'append',
      documentId: SHEET_DOC,
      sheetName: sheet(sheetName),
      columns: { mappingMode: 'autoMapInputData', value: {}, matchingColumns: [] },
      options: {},
    },
    id: nid(), name, type: 'n8n-nodes-base.googleSheets', typeVersion: 4.5,
    position: pos, credentials: CRED.sheets,
  };
}
function sheetsUpdate(name, sheetName, fields, pos) {
  // fields: { 'Status': 'Tayyor', 'row_number': '={{ ... }}' }
  const schema = [];
  const value = {};
  for (const k of Object.keys(fields)) {
    value[k] = fields[k];
    schema.push({
      id: k, displayName: k, required: false, defaultMatch: k === 'row_number',
      display: true, type: 'string', canBeUsedToMatch: true,
    });
  }
  return {
    parameters: {
      operation: 'update',
      documentId: SHEET_DOC,
      sheetName: sheet(sheetName),
      columns: {
        mappingMode: 'defineBelow',
        value,
        matchingColumns: ['row_number'],
        schema,
      },
      options: {},
    },
    id: nid(), name, type: 'n8n-nodes-base.googleSheets', typeVersion: 4.5,
    position: pos, credentials: CRED.sheets,
  };
}
function httpGet(name, url, queryParams, cred, pos, opts) {
  const p = {
    method: 'GET',
    url,
    authentication: 'genericCredentialType',
    genericAuthType: 'httpHeaderAuth',
    options: opts || {},
  };
  if (queryParams) {
    p.sendQuery = true;
    p.queryParameters = { parameters: queryParams };
  }
  const node = {
    parameters: p,
    id: nid(), name, type: 'n8n-nodes-base.httpRequest', typeVersion: 4.2,
    position: pos, credentials: cred,
  };
  return node;
}
function geminiHttp(name, cred, pos) {
  return {
    parameters: {
      method: 'POST',
      url: '=https://generativelanguage.googleapis.com/v1beta/models/' +
        "{{ $('SCRIPT PROMPT').first().json.geminiModel }}:generateContent",
      authentication: 'genericCredentialType',
      genericAuthType: 'httpHeaderAuth',
      sendBody: true,
      specifyBody: 'json',
      jsonBody: '={{ JSON.stringify($json.geminiBody) }}',
      options: {},
    },
    id: nid(), name, type: 'n8n-nodes-base.httpRequest', typeVersion: 4.2,
    position: pos, credentials: cred,
    onError: 'continueRegularOutput', alwaysOutputData: true,
  };
}

// =====================================================================
// WORKFLOW 1 — Qidiruv (Search Flow)
// =====================================================================
function buildWF1() {
  _id = 0;
  const N = {};
  N.trigger = {
    parameters: { updates: ['message'], additionalFields: {} },
    id: nid(), name: 'Telegram Trigger', type: 'n8n-nodes-base.telegramTrigger',
    typeVersion: 1.2, position: [-600, 300], credentials: CRED.telegram,
  };
  N.switch = {
    parameters: {
      rules: {
        values: [
          {
            conditions: {
              options: { caseSensitive: false, leftValue: '', typeValidation: 'loose' },
              conditions: [{
                leftValue: '={{ $json.message.text }}',
                rightValue: '/search',
                operator: { type: 'string', operation: 'startsWith' },
              }],
              combinator: 'and',
            },
            renameOutput: true, outputKey: 'search',
          },
          {
            conditions: {
              options: { caseSensitive: false, leftValue: '', typeValidation: 'loose' },
              conditions: [{
                leftValue: '={{ $json.message.text }}',
                rightValue: '/script',
                operator: { type: 'string', operation: 'startsWith' },
              }],
              combinator: 'and',
            },
            renameOutput: true, outputKey: 'script',
          },
        ],
      },
      options: {},
    },
    id: nid(), name: 'Buyruqni aniqlash', type: 'n8n-nodes-base.switch',
    typeVersion: 3, position: [-380, 300],
  };

  const chatTrig = "={{ $('Telegram Trigger').item.json.message.chat.id }}";

  N.qidirMsg = tg('Qidirilmoqda xabar', chatTrig,
    '🔎 Videolaringiz qidirilmoqda... Biroz kuting.', [-160, 120]);
  N.buyruqlarRead = sheetsRead('Buyruqlar oqish', 'Buyruqlar', [60, 120]);
  N.buyruqTanla = codeNode('Buyruqni tanlash', 'buyruqni_tanlash.js', [280, 120]);
  N.instaDedup = sheetsRead('Instagram dedup oqish', 'Instagram', [500, 120]);
  N.loopSet = codeNode('Loop sozlash', 'loop_sozlash.js', [720, 120]);
  N.tekshir = codeNode('Tekshirish', 'tekshirish.js', [940, 120]);
  N.davom = {
    parameters: {
      conditions: {
        options: { caseSensitive: true, typeValidation: 'loose' },
        conditions: [{
          leftValue: '={{ $json.done }}',
          rightValue: '',
          operator: { type: 'boolean', operation: 'true', singleValue: true },
        }],
        combinator: 'and',
      },
      options: {},
    },
    id: nid(), name: 'Davom etamizmi', type: 'n8n-nodes-base.if',
    typeVersion: 2, position: [1160, 120],
  };
  N.scSearch = httpGet('ScrapeCreators qidiruv',
    'https://api.scrapecreators.com/v2/instagram/reels/search',
    [
      { name: 'query', value: '={{ $json.query }}' },
      { name: 'date_posted', value: '={{ $json.date_posted }}' },
      { name: 'page', value: '={{ $json.page }}' },
    ], CRED.scrape, [1380, 320], {});
  N.filtr = codeNode('Filtr va yigish', 'filtr_yigish.js', [1160, 320]);

  N.yakuniy = codeNode('Yakuniy natija', 'yakuniy_natija.js', [1380, 0]);
  N.yoyish = codeNode('Videolarni yoyish', 'videolarni_yoyish.js', [1600, 0]);
  N.instaAppend = sheetsAppend('Instagram append', 'Instagram', [1820, 0]);
  N.buyruqUpd = sheetsUpdate('Buyruqlar yangilash', 'Buyruqlar',
    {
      'row_number': "={{ $('Yakuniy natija').first().json.cmdRow }}",
      'Status': 'Tayyor',
    }, [2040, 0]);
  N.saqlandi = tg('Saqlandi xabar', chatTrig,
    "=✅ {{ $('Yakuniy natija').first().json.count }} ta video jadvalga saqlandi!",
    [2260, 0]);

  // SCRIPT branch
  N.chatSet = {
    parameters: {
      assignments: {
        assignments: [{
          id: 'a1', name: 'chatId',
          value: '={{ $json.message.chat.id }}', type: 'number',
        }],
      },
      options: {},
    },
    id: nid(), name: 'chatId tayyorlash', type: 'n8n-nodes-base.set',
    typeVersion: 3.4, position: [-160, 480],
  };
  N.execWf2 = {
    parameters: {
      workflowId: { __rl: true, value: 'PASTE_WF2_ID', mode: 'id', cachedResultName: '2 - Skript (Script Flow)' },
      options: {},
    },
    id: nid(), name: 'Skript oqimini chaqirish', type: 'n8n-nodes-base.executeWorkflow',
    typeVersion: 1.2, position: [60, 480],
  };

  const nodes = Object.values(N);

  const connections = {
    'Telegram Trigger': { main: [[{ node: 'Buyruqni aniqlash', type: 'main', index: 0 }]] },
    'Buyruqni aniqlash': {
      main: [
        [{ node: 'Qidirilmoqda xabar', type: 'main', index: 0 }],
        [{ node: 'chatId tayyorlash', type: 'main', index: 0 }],
      ],
    },
    'Qidirilmoqda xabar': { main: [[{ node: 'Buyruqlar oqish', type: 'main', index: 0 }]] },
    'Buyruqlar oqish': { main: [[{ node: 'Buyruqni tanlash', type: 'main', index: 0 }]] },
    'Buyruqni tanlash': { main: [[{ node: 'Instagram dedup oqish', type: 'main', index: 0 }]] },
    'Instagram dedup oqish': { main: [[{ node: 'Loop sozlash', type: 'main', index: 0 }]] },
    'Loop sozlash': { main: [[{ node: 'Tekshirish', type: 'main', index: 0 }]] },
    'Tekshirish': { main: [[{ node: 'Davom etamizmi', type: 'main', index: 0 }]] },
    'Davom etamizmi': {
      main: [
        [{ node: 'Yakuniy natija', type: 'main', index: 0 }],
        [{ node: 'ScrapeCreators qidiruv', type: 'main', index: 0 }],
      ],
    },
    'ScrapeCreators qidiruv': { main: [[{ node: 'Filtr va yigish', type: 'main', index: 0 }]] },
    'Filtr va yigish': { main: [[{ node: 'Tekshirish', type: 'main', index: 0 }]] },
    'Yakuniy natija': { main: [[{ node: 'Videolarni yoyish', type: 'main', index: 0 }]] },
    'Videolarni yoyish': { main: [[{ node: 'Instagram append', type: 'main', index: 0 }]] },
    'Instagram append': { main: [[{ node: 'Buyruqlar yangilash', type: 'main', index: 0 }]] },
    'Buyruqlar yangilash': { main: [[{ node: 'Saqlandi xabar', type: 'main', index: 0 }]] },
    'chatId tayyorlash': { main: [[{ node: 'Skript oqimini chaqirish', type: 'main', index: 0 }]] },
  };

  return {
    name: '1 - Qidiruv (Search Flow)',
    nodes, connections, settings: { executionOrder: 'v1' }, active: false,
  };
}

// =====================================================================
// WORKFLOW 2 — Skript (Script Flow), 3 bosqichli
// =====================================================================
function buildWF2() {
  _id = 0;
  const chatTask = "={{ $('Vazifani tanlash').first().json.chatId }}";
  const nodes = [];

  const trigger = {
    parameters: { inputSource: 'passthrough' },
    id: nid(), name: 'Boshlanish WF1 dan', type: 'n8n-nodes-base.executeWorkflowTrigger',
    typeVersion: 1.1, position: [-700, 300],
  };
  const bajaril = tg('Bajarilmoqda xabar', '={{ $json.chatId }}',
    '⏳ So\'rovingiz bajarilmoqda...', [-480, 300]);
  const scriptPrompt = {
    parameters: {
      assignments: {
        assignments: [
          {
            id: 'p1', name: 'prompt', type: 'string',
            value: '=PLACEHOLDER — bu yerga script-prompt.md matnini joylashtiring (4-qadam).',
          },
          { id: 'p2', name: 'geminiModel', type: 'string', value: 'gemini-2.5-flash' },
        ],
      },
      options: {},
    },
    id: nid(), name: 'SCRIPT PROMPT', type: 'n8n-nodes-base.set',
    typeVersion: 3.4, position: [-260, 300],
  };
  const instaRead = sheetsRead('Instagram oqish', 'Instagram', [-40, 300]);
  const skriptRead = sheetsRead('Skriptlar oqish', 'Skriptlar', [180, 300]);
  const raskRead = sheetsRead('Raskadrovka oqish', 'Raskadrovka', [400, 300]);
  const vazifa = codeNode('Vazifani tanlash', 'vazifani_tanlash.js', [620, 300]);
  const rejim = {
    parameters: {
      rules: {
        values: [
          mkRule('A'), mkRule('S'), mkRule('B'),
        ],
      },
      options: { fallbackOutput: 'extra' },
    },
    id: nid(), name: 'Rejim', type: 'n8n-nodes-base.switch',
    typeVersion: 3, position: [840, 300],
  };
  function mkRule(mode) {
    return {
      conditions: {
        options: { caseSensitive: true, typeValidation: 'loose' },
        conditions: [{
          leftValue: '={{ $json.mode }}',
          rightValue: mode,
          operator: { type: 'string', operation: 'equals' },
        }],
        combinator: 'and',
      },
      renameOutput: true, outputKey: mode,
    };
  }

  // --- A branch ---
  const aPost = httpGet('A Post info',
    'https://api.scrapecreators.com/v1/instagram/post',
    [
      { name: 'url', value: chatTaskField('havola') },
      { name: 'download_media', value: 'true' },
    ], CRED.scrape, [1080, -120], {});
  const aDl = {
    parameters: {
      method: 'GET',
      url: "={{ $('A Post info').first().json.data.xdt_shortcode_media.video_url }}",
      options: { response: { response: { responseFormat: 'file', outputPropertyName: 'data' } } },
    },
    id: nid(), name: 'A Video yuklab olish', type: 'n8n-nodes-base.httpRequest',
    typeVersion: 4.2, position: [1300, -120],
  };
  const aB64 = codeNode('A Video base64', 'video_base64.js', [1520, -120]);
  const aGem = geminiHttp('A Gemini RASKADROVKA', CRED.gemini, [1740, -120]);
  const aText = codeNode('A Raskadrovka matni', 'raskadrovka_matni.js', [1960, -120]);
  const aAppend = sheetsAppend('A Raskadrovka append', 'Raskadrovka', [2180, -120]);
  const aUpd = sheetsUpdate('A Instagram yangilash', 'Instagram',
    {
      'row_number': "={{ $('Vazifani tanlash').first().json.instaRow }}",
      'Status': 'Raskadrovka tayyor',
    }, [2400, -120]);
  const aMsg = tg('A xabar', chatTask,
    "✅ Raskadrovka tayyor! Skript yozdirish uchun o'sha qatorda Status='Skript yaratish' qiling va /script yuboring.",
    [2620, -120]);

  // --- S branch ---
  const sTrans = httpGet('S Transcript',
    'https://api.scrapecreators.com/v2/instagram/media/transcript',
    [{ name: 'url', value: chatTaskField('havola') }],
    CRED.scrape, [1080, 200], {});
  sTrans.onError = 'continueRegularOutput';
  sTrans.alwaysOutputData = true;
  const sPrompt = codeNode('S Skript prompt', 'skript_prompt.js', [1300, 200]);
  const sGem = geminiHttp('S Gemini SKRIPT', CRED.gemini, [1520, 200]);
  const sText = codeNode('S Skript matni', 'skript_matni.js', [1740, 200]);
  const sAppend = sheetsAppend('S Skriptlar append', 'Skriptlar', [1960, 200]);
  const sUpd = sheetsUpdate('S Raskadrovka yangilash', 'Raskadrovka',
    {
      'row_number': "={{ $('Vazifani tanlash').first().json.raskRow }}",
      'Status': 'Skript tayyor',
    }, [2180, 200]);
  const sMsg = tg('S xabar', chatTask,
    "✅ Skript tayyor! Skriptlar varag'ini tekshiring.", [2400, 200]);

  // --- B branch ---
  const bData = codeNode('B malumot', 'b_malumot.js', [1080, 480]);
  const bBody = codeNode('B Skrinshot va body', 'skrinshot_body.js', [1300, 480]);
  const bGem = geminiHttp('B Gemini QAYTA YOZISH', CRED.gemini, [1520, 480]);
  const bText = codeNode('B Qayta yozilgan', 'qayta_yozilgan.js', [1740, 480]);
  const bUpd = sheetsUpdate('B Skriptlar yangilash', 'Skriptlar',
    {
      'row_number': '={{ $json.row_number }}',
      'Skript': '={{ $json.Skript }}',
      'Status': '={{ $json.Status }}',
    }, [1960, 480]);
  const bMsg = tg('B xabar', chatTask, '✅ Qayta yozilgan skript tayyor!', [2180, 480]);

  // --- none ---
  const noneMsg = tg('none xabar', chatTask,
    "ℹ️ Hozircha vazifa yo'q.\n\nIshlash tartibi:\n• Instagram varag'ida Status='Skript yasash' → raskadrovka qiladi\n• Raskadrovka varag'ida Status='Skript yaratish' → skript yozadi\n• Skriptlar varag'ida Status='Qayta yozish' → qayta yozadi",
    [1080, 760]);

  function chatTaskField(f) {
    return "={{ $('Vazifani tanlash').first().json." + f + ' }}';
  }

  nodes.push(
    trigger, bajaril, scriptPrompt, instaRead, skriptRead, raskRead, vazifa, rejim,
    aPost, aDl, aB64, aGem, aText, aAppend, aUpd, aMsg,
    sTrans, sPrompt, sGem, sText, sAppend, sUpd, sMsg,
    bData, bBody, bGem, bText, bUpd, bMsg,
    noneMsg,
  );

  const connections = {
    'Boshlanish WF1 dan': { main: [[{ node: 'Bajarilmoqda xabar', type: 'main', index: 0 }]] },
    'Bajarilmoqda xabar': { main: [[{ node: 'SCRIPT PROMPT', type: 'main', index: 0 }]] },
    'SCRIPT PROMPT': { main: [[{ node: 'Instagram oqish', type: 'main', index: 0 }]] },
    'Instagram oqish': { main: [[{ node: 'Skriptlar oqish', type: 'main', index: 0 }]] },
    'Skriptlar oqish': { main: [[{ node: 'Raskadrovka oqish', type: 'main', index: 0 }]] },
    'Raskadrovka oqish': { main: [[{ node: 'Vazifani tanlash', type: 'main', index: 0 }]] },
    'Vazifani tanlash': { main: [[{ node: 'Rejim', type: 'main', index: 0 }]] },
    'Rejim': {
      main: [
        [{ node: 'A Post info', type: 'main', index: 0 }],
        [{ node: 'S Transcript', type: 'main', index: 0 }],
        [{ node: 'B malumot', type: 'main', index: 0 }],
        [{ node: 'none xabar', type: 'main', index: 0 }],
      ],
    },
    // A
    'A Post info': { main: [[{ node: 'A Video yuklab olish', type: 'main', index: 0 }]] },
    'A Video yuklab olish': { main: [[{ node: 'A Video base64', type: 'main', index: 0 }]] },
    'A Video base64': { main: [[{ node: 'A Gemini RASKADROVKA', type: 'main', index: 0 }]] },
    'A Gemini RASKADROVKA': { main: [[{ node: 'A Raskadrovka matni', type: 'main', index: 0 }]] },
    'A Raskadrovka matni': { main: [[{ node: 'A Raskadrovka append', type: 'main', index: 0 }]] },
    'A Raskadrovka append': { main: [[{ node: 'A Instagram yangilash', type: 'main', index: 0 }]] },
    'A Instagram yangilash': { main: [[{ node: 'A xabar', type: 'main', index: 0 }]] },
    // S
    'S Transcript': { main: [[{ node: 'S Skript prompt', type: 'main', index: 0 }]] },
    'S Skript prompt': { main: [[{ node: 'S Gemini SKRIPT', type: 'main', index: 0 }]] },
    'S Gemini SKRIPT': { main: [[{ node: 'S Skript matni', type: 'main', index: 0 }]] },
    'S Skript matni': { main: [[{ node: 'S Skriptlar append', type: 'main', index: 0 }]] },
    'S Skriptlar append': { main: [[{ node: 'S Raskadrovka yangilash', type: 'main', index: 0 }]] },
    'S Raskadrovka yangilash': { main: [[{ node: 'S xabar', type: 'main', index: 0 }]] },
    // B
    'B malumot': { main: [[{ node: 'B Skrinshot va body', type: 'main', index: 0 }]] },
    'B Skrinshot va body': { main: [[{ node: 'B Gemini QAYTA YOZISH', type: 'main', index: 0 }]] },
    'B Gemini QAYTA YOZISH': { main: [[{ node: 'B Qayta yozilgan', type: 'main', index: 0 }]] },
    'B Qayta yozilgan': { main: [[{ node: 'B Skriptlar yangilash', type: 'main', index: 0 }]] },
    'B Skriptlar yangilash': { main: [[{ node: 'B xabar', type: 'main', index: 0 }]] },
  };

  return {
    name: '2 - Skript (Script Flow)',
    nodes, connections, settings: { executionOrder: 'v1' }, active: false,
  };
}

const wf1 = buildWF1();
const wf2 = buildWF2();
fs.writeFileSync(path.join(OUT_DIR, '1_Qidiruv_Search_Flow.json'), JSON.stringify(wf1, null, 2));
fs.writeFileSync(path.join(OUT_DIR, '2_Skript_Script_Flow.json'), JSON.stringify(wf2, null, 2));
console.log('WF1 nodes:', wf1.nodes.length);
console.log('WF2 nodes:', wf2.nodes.length);
console.log('OK — fayllar yozildi.');
