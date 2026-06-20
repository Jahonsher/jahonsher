// "Filtr va yig'ish" — ScrapeCreators javobidan reels'larni ajratib, filtrlab,
// searchState.collected ichiga to'playdi. So'ng page++ qiladi.
const st = $getWorkflowStaticData('global').searchState;
const resp = $input.first().json || {};

// Javobdan reels massivini turli ehtimoliy joylardan topish (himoyalangan).
let reels = [];
if (Array.isArray(resp.reels)) reels = resp.reels;
else if (Array.isArray(resp.results)) reels = resp.results;
else if (Array.isArray(resp.items)) reels = resp.items;
else if (Array.isArray(resp.data)) reels = resp.data;
else if (resp.data && Array.isArray(resp.data.items)) reels = resp.data.items;

function num(x) {
  const n = Number(x);
  return isNaN(n) ? 0 : n;
}
// Bir nechta ehtimoliy yo'ldan birinchi mavjud qiymatni oladi.
function pick(o, paths) {
  for (const p of paths) {
    let cur = o;
    let ok = true;
    for (const k of p.split('.')) {
      if (cur && typeof cur === 'object' && k in cur) cur = cur[k];
      else { ok = false; break; }
    }
    if (ok && cur !== undefined && cur !== null && cur !== '') return cur;
  }
  return undefined;
}

let added = 0;
for (const r of reels) {
  const m = r.media || r.node || r; // ba'zan asl obyekt media ichida bo'ladi
  const user = m.user || m.owner || r.user || {};

  const code = pick(m, ['code', 'shortcode']) || '';
  const pk = String(pick(m, ['pk', 'id', 'media_id']) || '').split('_')[0];
  const postId = String(code || pk || '').trim();
  if (!postId) continue;

  // dedup: jadvalda yoki shu yugurishda allaqachon bormi?
  if (st.existing[postId]) continue;

  const views = num(pick(m, ['play_count', 'ig_play_count', 'view_count', 'video_view_count', 'views']));
  if (!(views > 10000)) continue; // ko'rilish 10 000 dan ko'p bo'lsin

  const takenAt = num(pick(m, ['taken_at', 'taken_at_timestamp', 'device_timestamp']));
  if (takenAt && takenAt < st.cutoffTs) continue; // vaqt oralig'i

  const likes = num(pick(m, ['like_count', 'likes', 'edge_liked_by.count', 'edge_media_preview_like.count']));
  const comments = num(pick(m, ['comment_count', 'comments', 'edge_media_to_comment.count']));
  const caption = pick(m, ['caption.text', 'caption', 'edge_media_to_caption.edges.0.node.text']) || '';
  const account = pick(user, ['username']) || '';
  const accountId = String(pick(user, ['pk', 'id']) || '');
  const followers = num(pick(user, ['follower_count', 'edge_followed_by.count']));
  const havola = code
    ? `https://www.instagram.com/reel/${code}/`
    : (pick(m, ['permalink', 'url']) || r.url || '');

  st.existing[postId] = true;
  st.collected.push({
    postId, havola, views, likes, comments,
    takenAt, caption: String(caption), account, accountId, followers,
  });
  added++;
  if (st.collected.length >= st.miqdor) break;
}

if (reels.length === 0 || added === 0) {
  // bu sahifada yangi natija bo'lmasa — to'xtaymiz
  if (reels.length === 0) st.noMore = true;
}
st.page = st.page + 1;

return [{ json: { added: added, total: st.collected.length, page: st.page } }];
