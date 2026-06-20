// "Videolarni yoyish" — videos massivini alohida item'larga yoyadi (append uchun).
const videos = $json.videos || [];
if (!videos.length) return [];
return videos.map((v) => ({ json: v }));
