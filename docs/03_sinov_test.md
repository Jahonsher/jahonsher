# 4-QADAM: Sinov va ishga tushirish

## 1. script-prompt.md ni kiritish (eng oxirida)
1. n8n → **WF2** ("2 - Skript (Script Flow)") ni oching.
2. **"SCRIPT PROMPT"** tugunini 2 marta bosing.
3. `prompt` maydonidagi placeholder matnni o'chirib, o'zingizning
   `script-prompt.md` matningizni TO'LIQ joylashtiring.
4. `geminiModel` = `gemini-2.5-flash` (o'zgartirmang, agar boshqa model kerak
   bo'lmasa).
5. Saqlang (Save).
> Eslatma: JSON qayta import qilinsa bu maydon yana placeholder'ga qaytadi —
> shuning uchun buni eng oxirida qiling.

## 2. Faollik ustuni rangi (Conditional Formatting)
1. Google Sheets → `Instagram` varag'ini oching.
2. `Faollik` ustuni harfini bosib, butun ustunni belgilang (masalan G ustuni).
3. Yuqori menyu: **Format** → **Conditional formatting**.
4. O'ng paneldagi **Color scale** (Rang shkalasi) yorlig'ini tanlang.
5. Quyidagicha sozlang:
   - **Minpoint**: Min number = `0` → to'q **qizil**
   - **Midpoint**: Number = `50` → **sariq**
   - **Maxpoint**: Max number = `100` → yorqin **yashil**
6. **Done** bosing. Endi Faollik raqamlari rangli ko'rinadi.

## 3. /search testi
1. `Buyruqlar` varag'iga 1 ta qator to'ldiring:
   - **Buyruq**: kalit so'z (masalan `fitness`)
   - **Vaqt**: `Oxirgi oy`
   - **Miqdor**: `10`
   - **Status**: `Boshlash`
2. Telegram'da botga **`/search`** yuboring.
3. Kutilgan natija:
   - Bot "🔎 qidirilmoqda..." deydi.
   - `Instagram` varag'iga videolar tushadi (Status=`Yangi`).
   - `Buyruqlar` qatori Status=`Tayyor` bo'ladi.
   - Bot "✅ X ta video saqlandi!" deydi.

## 4. /script — 3 bosqich testi (ketma-ket)

### A — Raskadrovka
1. `Instagram` varag'ida bitta qatorda Status = `Skript yasash` qiling.
2. Telegram'da **`/script`** yuboring.
3. Natija: `Raskadrovka` varag'iga raskadrovka tushadi (Status=`Tayyor`),
   Instagram qatori Status=`Raskadrovka tayyor` bo'ladi.

### S — Skript
1. O'sha `Raskadrovka` qatorida Status = `Skript yaratish` qiling.
2. **`/script`** yuboring.
3. Natija: `Skriptlar` varag'iga yangi skript tushadi (raskadrovkasi bilan bitta
   qatorda, Status=`Tayyor`), Raskadrovka qatori Status=`Skript tayyor` bo'ladi.

### B — Qayta yozish
1. `Skriptlar` varag'idagi o'sha qatorda:
   - `Insights skrinshotlari` ustuniga ochiq rasm URL'larini qo'ying
     (postimages.org kabi; vergul yoki yangi qatorda bir nechta bo'lsa ham bo'ladi).
   - Status = `Qayta yozish` qiling.
2. **`/script`** yuboring.
3. Natija: o'sha qatordagi `Skript` qayta yozilib, Status=`Qayta yozilgan` bo'ladi.

## Muammolar bo'lsa (debugging)
- n8n → **Executions** bo'limidan oxirgi ishga tushishni oching, qaysi tugun
  qizil (xato) bo'lganini ko'ring.
- Gemini 403 → tugunga noto'g'ri Header Auth ulangan (Gemini emas).
- Sheets yozmayapti → Service Account jadvalga Editor qilib ulashilmagan.
- Instagram ustunlari bo'sh → ScrapeCreators javob maydonlari boshqacha;
  "Filtr va yigish" kodini moslash kerak (real javobni yuboring).
