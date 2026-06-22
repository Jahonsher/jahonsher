# POLLING yechimi (IPv6 webhook muammosi uchun)

## Nega kerak?
Hostinger VPS'ga **kiruvchi IPv6** ulanishlar yetib bormaydi (Hostinger tarmoq cheklovi).
Telegram domenning AAAA (IPv6) yozuvini ko'rib avval IPv6'ga ulanmoqchi bo'ladi → timeout →
webhook ishlamaydi. AAAA yozuvini o'chirib bo'lmaydi (avtomatik hstgr.cloud hostname).

## Yechim: webhook o'rniga POLLING
n8n **o'zi** Telegram'dan xabarlarni so'rab turadi (chiquvchi IPv4 — bu ishlaydi).
Kiruvchi ulanish kerak emas → IPv6 muammosi umuman ta'sir qilmaydi.

Fayl: `workflows/1_Qidiruv_POLLING.json`

## O'rnatish qadamlari

1. **Eski webhook'ni o'chirish** (bir marta), brauzerda:
   `https://api.telegram.org/bot<TOKEN>/deleteWebhook?drop_pending_updates=true`

2. **Eski WF1 (webhook versiya) ni o'chirish**: n8n → eski "1 - Qidiruv (Search Flow)" ni
   **Inactive** qiling yoki o'chiring (ikkalasi birga ishlamasin).

3. **Yangi WF1 (POLLING) ni import qilish**: n8n → Workflows → Import from File →
   `1_Qidiruv_POLLING.json`.

4. **Bot tokenini kiritish**: yangi WF1 → **"TG TOKEN"** tugunini oching →
   `token` maydoniga BotFather tokeningizni qo'ying (PASTE_BOT_TOKEN_HERE o'rniga).

5. **Credential va sheet'larni biriktirish** (oldingidek):
   - Telegram tugunlar (Qidirilmoqda xabar, Saqlandi xabar) → Telegram API
   - Google Sheets tugunlar → Google API + Document + Sheet
   - ScrapeCreators qidiruv → "scrape creators"
   - Skript oqimini chaqirish → WF2 ni tanlang

6. **Aktivlashtirish**: yangi WF1 (POLLING) ni **Active** qiling.
   - Schedule har 10 soniyada Telegram'ni tekshiradi.

## Tekshirish
- `Buyruqlar` varag'iga qator qo'shing (Status=Boshlash), Telegram'da `/search` yuboring.
- ~10 soniya ichida bot javob beradi.

## Eslatma
- Bir vaqtda bitta buyruq yuboring (qidiruv tugaguncha kuting), keyin keyingisini.
- WF2 (skript) o'zgarmaydi — u Execute Workflow orqali chaqiriladi.
