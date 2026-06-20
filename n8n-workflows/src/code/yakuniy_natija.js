// "Yakuniy natija" — yig'ilganlarni miqdorgacha kesadi, Faollik hisoblaydi va
// Instagram varag'i ustunlariga mos obyektlar tayyorlaydi.
const st = $getWorkflowStaticData('global').searchState;
const list = (st.collected || []).slice(0, st.miqdor);

function faollik(views, likes, followers) {
  let reach;
  if (followers > 0) {
    const ratio = views / followers;
    reach = Math.min(100, (Math.log10(ratio + 1) / Math.log10(11)) * 100);
  } else {
    reach = views > 50000 ? 100 : (views / 50000) * 100;
  }
  let eng = 0;
  if (views > 0) {
    const er = likes / views;
    eng = Math.min(100, (er / 0.10) * 100);
  }
  const f = Math.round(0.6 * reach + 0.4 * eng);
  return Math.max(0, Math.min(100, f));
}

function ymd(ts) {
  if (!ts) return '';
  return new Date(ts * 1000).toISOString().slice(0, 10);
}
const today = new Date().toISOString().slice(0, 10);

const out = list.map((r) => ({
  'Akkaunt': r.account,
  'Opisaniya': r.caption,
  'Havola': r.havola,
  'Status': 'Yangi',
  'Skript tili': 'Uzbek',
  'Obunachilar': r.followers,
  'Faollik': faollik(r.views, r.likes, r.followers),
  "Ko'rilishlar": r.views,
  'Layklar': r.likes,
  'Kommentlar': r.comments,
  'Post sanasi': ymd(r.takenAt),
  'Kiritilish sanasi': today,
  'Post IDsi': r.postId,
  'Akkaunt IDsi': r.accountId,
}));

const cmdRow = st.cmdRow;
// holatni tozalaymiz (keyingi qidiruv toza boshlanishi uchun)
$getWorkflowStaticData('global').searchState = undefined;

return [{ json: { videos: out, count: out.length, cmdRow: cmdRow } }];
