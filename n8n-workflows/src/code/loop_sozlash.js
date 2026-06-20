// "Loop sozlash" — qidiruv holatini (searchState) global staticData'ga yozadi.
const cmd = $('Buyruqni tanlash').first().json;
const instaRows = $('Instagram dedup oqish').all().map((i) => i.json);

const existing = {};
for (const r of instaRows) {
  const id = String(r['Post IDsi'] || '').trim();
  if (id) existing[id] = true;
}

const cutoffTs = Math.floor(Date.now() / 1000) - cmd.cutoffDays * 24 * 60 * 60;

const st = {
  query: cmd.query,
  date_posted: cmd.date_posted,
  cutoffTs: cutoffTs,
  miqdor: cmd.miqdor,
  page: 1,
  startTime: Date.now(),
  collected: [],
  existing: existing,
  noMore: false,
  cmdRow: cmd.row_number,
};

$getWorkflowStaticData('global').searchState = st;

return [{ json: { started: true } }];
