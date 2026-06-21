# Google Sheets tuzilmasi — 4 ta varaq

Har bir varaqning **1-qatori** (sarlavhalar) AYNAN quyidagicha bo'lishi shart.
Har bir so'zni alohida katakka yozing (A1, B1, C1 ...). Harf-harfigacha bir xil.

---

## 1) Varaq nomi: `Buyruqlar`

| A | B | C | D | E |
|---|---|---|---|---|
| Buyruq | Vaqt | Status | Opisaniya | Miqdor |

Ruxsat etilgan qiymatlar:
- **Vaqt**: `Bugun` / `Oxirgi hafta` / `Oxirgi oy` / `Oxirgi 3 oy` / `Oxirgi 6 oy` / `So'ngi yil`
- **Status**: `Boshlash` / `Tayyor`
- **Miqdor**: `5` / `10` / `25` / `50` / `100`

---

## 2) Varaq nomi: `Instagram`

| A | B | C | D | E | F | G | H | I | J | K | L | M | N |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Akkaunt | Opisaniya | Havola | Status | Skript tili | Obunachilar | Faollik | Ko'rilishlar | Layklar | Kommentlar | Post sanasi | Kiritilish sanasi | Post IDsi | Akkaunt IDsi |

Ruxsat etilgan qiymatlar:
- **Status**: `Yangi` / `Ish jarayonda` / `Skript yasash` / `Raskadrovka tayyor` / `Skript tayyor` / `To'g'ri kelmaydi` / `Ba'zisi to'g'ri keladi` / `Qaytarilgan`
- **Skript tili**: `Русский` / `Uzbek` / `English`

> `Faollik` ustuni (G) — 0..100 oralig'idagi raqam. Rangi (qizil→sariq→yashil) Google Sheets'da Conditional Formatting orqali sozlanadi (4-qadam).

---

## 3) Varaq nomi: `Skriptlar`

| A | B | C | D | E | F | G | H | I | J | K |
|---|---|---|---|---|---|---|---|---|---|---|
| Sana | Manba | Skript | Raskadrovka | Kamentlar | Opisaniya | Status | Havola | Akkaunt | Post IDsi | Insights skrinshotlari |

Ruxsat etilgan qiymatlar:
- **Status**: `Yangi` / `Tayyor` / `Qayta yozish` / `Qayta yozilgan`

> `Raskadrovka` (D) — skript yozilganda o'sha skriptning raskadrovkasi SHU qatorga ham yoziladi.
> `Insights skrinshotlari` (K) — qayta yozish uchun ochiq rasm URL'lari (postimages.org kabi). Google Drive havolasi EMAS.

---

## 4) Varaq nomi: `Raskadrovka`

| A | B | C | D | E | F | G |
|---|---|---|---|---|---|---|
| Sana | Akkaunt | Post IDsi | Havola | Skript tili | Raskadrovka | Status |

Ruxsat etilgan qiymatlar:
- **Status**: `Yangi` / `Tayyor` / `Skript yaratish` / `Skript tayyor`

> `Raskadrovka` (F) — video soniyalar bo'yicha to'liq tahlil.

---

## ⚠️ Eng muhim eslatma
Jadvalni yaratgach, uni **Service Account**ning `client_email` manziliga (JSON fayl ichidagi)
**Editor** huquqi bilan **Share** qiling. Aks holda bot jadvalga yoza olmaydi.
