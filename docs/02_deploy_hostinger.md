# 3-QADAM: Hostinger + n8n deploy yo'riqnomasi

> Faqat Hostinger ishlatamiz. Dokploy / Cloudflare / Traefik KERAK EMAS.

## 1. Hostinger VPS + n8n (one-click)
1. hPanel'ga kiring: https://hpanel.hostinger.com
2. Yuqori menyudan **VPS** bo'limini oching.
3. **Yangi VPS** olayotganda (yoki "Setup" qilayotganda) **Operating System** bosqichida
   **Application** (yoki "OS with control panel / Application") yorlig'ini tanlang.
4. Ro'yxatdan **n8n** shablonini tanlang (qidiruvga `n8n` deb yozsangiz chiqadi).
5. Davom etib, root parol va boshqalarni o'rnating, **Finish setup** bosing.

## 2. Kutish va ochish
6. ~5–10 daqiqa kuting (Docker o'rnatadi, SSL avtomatik beriladi).
7. VPS panelida n8n'ning **public URL**'i ko'rinadi (masalan `https://srvXXXXX.hstgr.cloud`).
   Shu URL'ni brauzerda oching.

## 3. n8n owner akkaunti
8. Birinchi ochilganda n8n owner akkaunt so'raydi: **email + parol** kiriting. Saqlang.

## 4. (Ixtiyoriy) o'z domeningiz
9. Xohlasangiz hPanel orqali domen ulashingiz mumkin. Lekin SHART EMAS —
   `hstgr.cloud` URL'i ham to'liq ishlaydi (SSL bilan).
   ⚠️ n8n public URL to'g'ri bo'lsin (template buni avtomatik qiladi), aks holda
   Telegram webhook ro'yxatdan o'tmaydi.

## 5. Credential'lar yaratish (4 ta)
n8n'da chap menyu → **Credentials** → **Add credential**:

1. **Telegram API**
   - Qidiruvga `Telegram` yozing → **Telegram API**.
   - `Access Token` → BotFather bergan tokenni qo'ying.
   - Save.

2. **Google API (Service Account)**
   - Qidiruvga `Google` → **Google Service Account API** (yoki "Google API").
   - Authentication: **Service Account**.
   - `Service Account Email` → JSON ichidagi `client_email`.
   - `Private Key` → JSON ichidagi `private_key` (boshidan oxirigacha,
     `-----BEGIN PRIVATE KEY-----` ... `-----END PRIVATE KEY-----` bilan birga).
   - Save.

3. **Header Auth — ScrapeCreators**
   - Qidiruvga `Header Auth` → **Header Auth**.
   - Name: `x-api-key`
   - Value: ScrapeCreators kaliti.
   - Bu credential nomini **"ScrapeCreators (x-api-key)"** deb qo'ying. Save.

4. **Header Auth — Gemini**
   - Yana **Header Auth**.
   - Name: `x-goog-api-key`
   - Value: Gemini kaliti.
   - Nomini **"Gemini (x-goog-api-key)"** deb qo'ying. Save.
   - ⚠️ Ikkalasini ADASHTIRMANG! Aks holda Gemini'da 403 chiqadi.

## 6. Workflow'larni import qilish
n8n → chap menyu **Workflows** → o'ng yuqorida **Add workflow** yonidagi **...** (yoki
**Import from File**):
1. Avval **WF2**: `workflows/2_Skript_Script_Flow.json` ni import qiling.
2. Keyin **WF1**: `workflows/1_Qidiruv_Search_Flow.json` ni import qiling.

## 7. WF2 ID'sini WF1'ga ulash
3. WF2 ("2 - Skript (Script Flow)") ni oching → brauzer URL'idagi ID'ni nusxalang
   (masalan `.../workflow/AbCd1234` dagi `AbCd1234`).
4. WF1 ("1 - Qidiruv (Search Flow)") ni oching → **"Skript oqimini chaqirish"**
   (Execute Workflow) tugunini oching → Workflow ro'yxatidan WF2 ni tanlang
   (yoki ID'ni qo'ying).

## 8. Credential va sheet'larni har tugunga biriktirish
5. Har bir rangli/ogohlantirilgan tugunni ochib tekshiring:
   - **Telegram** tugunlari → Telegram API.
   - **Google Sheets** tugunlari → Google API; "Document" → o'z jadvalingiz;
     "Sheet" → kerakli varaq (tugun nomi ostida ko'rsatilgan: Buyruqlar/Instagram/
     Skriptlar/Raskadrovka).
   - **ScrapeCreators** HTTP tugunlari (Post info, Transcript, ScrapeCreators qidiruv)
     → "ScrapeCreators (x-api-key)".
   - **Gemini** HTTP tugunlari (Gemini RASKADROVKA / SKRIPT / QAYTA YOZISH)
     → "Gemini (x-goog-api-key)".

## 9. Faollashtirish
6. WF2 ni saqlang (alohida Active qilish shart emas — uni WF1 chaqiradi, lekin
   saqlangan/published bo'lsin).
7. WF1 ni **Active** (yoki Publish) qiling. Shunda Telegram webhook avtomatik
   ro'yxatdan o'tadi.
8. Tekshirish: Telegram'da botga `/start` yoki istalgan xabar yuboring — xato
   bermasligi kerak.
