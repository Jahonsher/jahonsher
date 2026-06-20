// "Tekshirish" — loop to'xtash shartlarini tekshiradi va done=true/false qaytaradi.
const st = $getWorkflowStaticData('global').searchState;

let done = false;
if (Date.now() - st.startTime > 5 * 60 * 1000) done = true; // 5 daqiqa timeout
if (st.collected.length >= st.miqdor) done = true; // yetarli yig'ildi
if (st.noMore) done = true; // boshqa natija yo'q
if (st.page > 20) done = true; // sahifa limiti

return [
  {
    json: {
      done: done,
      page: st.page,
      query: st.query,
      date_posted: st.date_posted,
      collected: st.collected.length,
    },
  },
];
