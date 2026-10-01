# AGENTS.md — eventday

> **Status dokumen: 2026-09-30, disinkronkan ulang terhadap kode aktual (HEAD `7b1c3e6`).**
> Revisi sebelumnya mendeskripsikan codebase yang lebih lama dan sudah tidak akurat — lihat bagian
> ["Yang sudah tidak lagi berlaku"](#yang-sudah-tidak-lagi-berlaku) di akhir dokumen. Setiap klaim di
> bawah ini diverifikasi langsung terhadap file di repo.

## Stack
- Vite 5 (`^5.4.10`) + React 18 (`^18.3.1`) + `react-router-dom` 7 (`^7.18.3`) + `@react-oauth/google` — SPA only, no SSR.
- ESM (`"type": "module"`). **Tidak ada TypeScript, tidak ada test, tidak ada konfigurasi linter/formatter.**
- `vite.config.js:10` memuat `@vitejs/plugin-react`, `server.proxy`, dan `preview.proxy`.
- Lib UI: `sweetalert2` 11 (dibungkus `src/utils/alert.js`), `lucide-react` + `react-icons` (keduanya dipakai, dicampur antar-file).
- `.github/workflows/deploy-fe-prod-eventday.yml` — CI: `npm ci` → injeksi `.env` dari secret `VITE_NGROK_URL` → `npm run build` → `scp dist/*` ke `/var/www/eventday-fe/`. Deploy dipicu push ke `main`.

## Commands
```bash
npm install          # install (node_modules TIDAK ada di repo → wajib run dulu)
npm run dev          # Vite dev server, host:true port 5173
npm run build        # vite build -> dist/
npm run preview      # serve dist/, port 4173 (butuh build sebelumnya)
```
- Tidak ada script `test` / `lint` / `typecheck`. **Verifikasi satu-satunya adalah `npm run build`.**
- `build_check.txt` di root adalah **artefak basi dari mesin lain** (`C:/xampp/htdocs/...`) yang mencatat kegagalan build pada import `showInformation` yang sudah tidak ada. Jangan dipakai sebagai acuan.

## Environment — ini bagian yang paling mudah salah paham
Ada **dua env var berbeda dengan peran berbeda**, dan `.env` lokal hanya menyetel yang pertama:

| Var | Dibaca oleh | Fungsi | Status |
|---|---|---|---|
| `VITE_NGROK_URL` | `vite.config.js:59,62` | Target untuk `server.proxy` dan `preview.proxy` | **Hanya di-injeksi di CI** dari secret. Tidak ada di `.env` lokal. |
| `VITE_API_URL` | `src/utils/bannerUrl.js:22` | Base URL absolut untuk gambar `/uploads/*` di mode production | Ada di `.env` lokal (`https://zngjfn0w-8082.asse.devtunnels.ms/`) |

Konsekuensi:
- **Secara lokal, `server.proxy` menunjuk `undefined`.** Dev tetap bisa jalan hanya karena `apiFetch` memakai path relatif (`/api/...`) terhadap origin frontend, dan response-nya dilayani oleh apa pun yang sedang listen di 5173. Kalau butuh proxy beneran secara lokal, set `VITE_NGROK_URL`.
- `bannerUrl.js:22` punya hardcoded fallback `https://api-eventday.dnabisa.tech`. **Perhatikan: tanda hubung, bukan titik.** `DashboardEO.jsx` punya resolver sendiri yang memakai titik (`api.eventday.dnabisa.tech`) — kedua bentuk itu berbeda domain dan salah satunya salah.
- `.env` sudah masuk `.gitignore`. Tidak ada file `.env` yang boleh di-commit.

## Structure
```
src/
  main.jsx                 mount App (StrictMode) + import styles.css
  App.jsx:71-320           SEMUA route, tanpa route guard
  styles.css               reset global + 1 CSS var + blok utility class MATI
  components/
    auth/     (5)   Login, Register, ForgotPassword, OTP, ResetPassword
    admin/    (18)  DashboardAdmin, EventManagement, TambahEvent, DetailEvent, EditEvent,
                   UserManagement, DetailUser, PengajuanAkunEO, DetailPengajuanEo,
                   Transaksi, DetailTransaksi, Tiket, DetailTiket, PengajuanPayout,
                   DetailPengajuanPayout, AuditLog, PengaturanPlatform, EventBannerUpload*
    eo/       (14)  DashboardEO, EventEO, DetailEventEO, AddEvent, EditEventEO,
                   TransaksiEO, DetailTransaksiEO, RefundEO, DetailRefundEO,
                   ProfileEO, RegisterEO, StatusRegisterEO, PayoutEO, PengajuanPayoutEO
    customer/ (15)  CustomerDashboard, DetailEventCustomer, Checkout, TicketSuccess,
                   MyTicket, OrderDetail, TransaksiCustomer, RefundRequest, RefundList,
                   RefundDetail, ProfileCustomer, EditProfileCustomer,
                   ChangePasswordCustomer, KebijakanPrivasi, SyaratKetentuan
    shared/   (9)   Navbar, NavbarEO, NavbarCustomer, Sidebar, SidebarEO,
                   ProfileSidebar, FooterCustomer, Button*, FormInput*
  services/   (27)  lihat tabel di bawah
  utils/      (4)   tokenManager*, alert, alert.css, bannerUrl
  constants/  (1)   categories.js
* = kode mati / orphan, lihat "Dead code"
```
Konvensi penamaan: satu `.jsx` + satu `.css` ko-lokasi per halaman, diimpor dari dalam `.jsx` itu sendiri.

## Routing (`src/App.jsx:71-320`)
**Tidak ada route guard sama sekali.** Tidak ada `<ProtectedRoute>`, tidak ada cek role. Setiap route `/admin/*`, `/eo/*`, `/customer/*` tetap render untuk pengunjung anonim lalu 401 di `useEffect` miliknya sendiri. Enforcement role hanya ada di sisi client pada 3 komponen (`NavbarCustomer`, `ProfileSidebar`, `FooterCustomer`) dan bisa dilewati dengan mengedit `localStorage.role`.

| Group | Route |
|---|---|
| Auth | `/`, `/register`, `/forgot-password`, `/forgot-password/reset`, `/otp` |
| Admin (17) | `/admin/dashboard`, `/event-management` **+ alias** `/admin/event-management`, `/admin/event/:id`, `/admin/event/edit/:id`, `/admin/tambah-event`, `/admin/users`, `/admin/users/:id`, `/admin/pengajuan-eo`, `/admin/pengajuan-eo/:id`, `/admin/transaksi`, `/admin/transaksi/:id`, `/admin/tiket`, `/admin/tiket/:id`, `/admin/pengajuan-payout`, `/admin/pengajuan-payout/:id`, `/admin/audit-log`, `/admin/pengaturan` |
| EO (13) | `/register-eo`, `/register-eo/status`, `/eo/dashboard`, `/eo/event`, `/eo/event/create`, `/eo/event/:id`, `/eo/event/edit/:id`, `/eo/transaksi`, `/eo/transaksi/:id`, `/eo/refund`, `/eo/refund/detail`, `/eo/profil`, `/eo/payout`, `/eo/payout/pengajuan` |
| Customer (14) | `/customer/dashboard`, `/customer/event/:id`, `/checkout/:id`, `/customer/ticket-success`, `/customer/tickets`, `/customer/refund`, `/customer/refund-list`, `/customer/refund/:id`, `/customer/orders/:orderId`, `/customer/history`, `/customer/profile`, `/customer/profile/edit`, `/customer/change-password`, `/customer/privacy`, `/customer/terms` |

**Duplikat route sudah dibersihkan.** Semua target `navigate()` resolve, **kecuali** `FooterCustomer.jsx:49,58` yang memakai path relatif (lihat Known Bugs).

Redirect setelah login (`Login.jsx:60-79`, `Register.jsx:78-92`): `ADMIN`→`/admin/dashboard`, `ORGANIZER`→`/eo/dashboard`, `CUSTOMER`→`/customer/dashboard`. **Tidak konsisten:** `Login` menampilkan error untuk role tak dikenal lalu diam di `/`, sedangkan `Register` diam-diam fallback ke `/customer/dashboard`.

## Lapis fetch — tiga, dan tidak diseragamkan
Ini bagian yang paling mudah broke. **Jangan menyatukan tanpa alasan.**

| File | Dipakai untuk | Ciri khusus |
|---|---|---|
| `src/services/api.js:113` `apiFetch` | Workhorse, ~20 service | Path **relatif** (`/api/...`) → lewat Vite proxy. `credentials:'include'` + header `Bearer` dari `localStorage.token` bila ada. Otomatis buang `Content-Type` untuk `FormData`. **Return wrapper `{msg,status,data}` MENTAH tanpa unwrap** → tiap halaman harus `res?.data` sendiri. Lempar `Error` dengan `.status` + `.data`attached. |
| `src/services/authService.js:80` `authFetch` | Auth saja | Prefix `/api` sendiri, **tidak** pakai `apiFetch`. Punya `normalizeSuccess` yang **sudah** meng-unwrap payload dan inject `message`/`msg`/`_status`/`_msg`. |
| `src/services/downloadExport.js:20` | Export binary/CSV | Fetch terpisah. Auto-deteksi binary vs CSV-string-dalam-JSON, trigger download blob dengan BOM `\ufeff`. **Jangan pakai `apiFetch` untuk endpoint export.** |

`apiFetch(path, { raw: true })` adalah jalur lain ke URL absolut (`api.js:89-107`) memakai `VITE_NGROK_URL`.

### Aturan keras
- **`src/services/api.js` tidak boleh diubah.** Ini konvensi tim yang harus diwariskan apa adanya. Kalau butuh fitur export, tambahkan ke `downloadExport.js` (file itu ada justru karena alasan ini).
- `toQueryString` (`api.js:75`) memfilter `undefined`/`null`/`""` secara otomatis — tidak perlu rapikan manual.

## Service layer (27 file)

### Customer / transaksi
| File | Prefix | Status |
|---|---|---|
| `eventService.js` | `/api/events` | ✅ 3/3 dipakai |
| `ticketService.js` | `/api/tickets/*`, `/api/transactions/history` | ✅ dipakai; `scanTicket` **unused** |
| `refundService.js` | `/api/refund/*` | ✅ dipakai; `getRefundProof` **unused** |
| `checkoutService.js` | `/api/checkout/*` | ✅ dipakai; **`processCheckout` tidak pernah dipanggil** |
| `paymentService.js` | `/api/payments/*` | ✅ dipakai (Midtrans Snap) |
| `profileService.js` | `/api/user/*`, `/api/account/*` | ✅ dipakai; `getTransactionHistory` unused |
| `homeSearchService.js` | `/home/*`, `/search/*` | ❌ **DEAD — nol importer** |

### Admin (9 file, satu fitur per file, semua dipakai UI)
`adminDashboardService`, `adminUserService`, `adminEoService`, `adminPayoutService`, `adminEventService`, `adminTicketService`, `adminTransactionService`, `adminAuditService`, `adminSettingsService` — semuanya prefix `/api/admin/**` lewat `apiFetch`.

Detail penting:
- `adminDashboardService.getAdminRecentEvents/Transactions` punya **fallback tolerant**: kalau error cocok `/no enum constant.*category\./i`, ia pindah ke `getAdminEventsTolerant` dan menandai `_partial: true` (data sebagian, halaman bermasalah dilewati).
- `getAdminEventsTolerant` / `getAdminTransactionsTolerant` (`adminEventService.js`, `adminTransactionService.js`) mengimplementasikan workaround yang sama: chunk size 10, max 20 halaman, halaman yang kena enum error di-skip dan dihitung di `_skippedPages`.
- `adminEventService.createAdminEvent/updateAdminEvent` kirim **multipart** (`event` sebagai Blob JSON + `file`), dengan fallback ke JSON polos kalau backend balas `content-type not supported` (set flag `_bannerSkipped`).
- `adminTicketService.postTicketAction` coba `POST`, fallback ke `PUT` kalau 405.
- Approve/reject event = `PATCH /events/{id}/approve` + `/reject`. `updateAdminEventStatus` (`/events/{id}/status`) **hanya** alias legacy, dipakai di `TambahEvent.jsx` sebagai fallback auto-publish.
- Export: `adminAuditService.exportAdminAuditLogsCSV` (JSON-wrapped CSV) vs `exportAdminEvents/Tickets/Transactions` (via `downloadFromEndpoint`).

### EO (8 file)
`organizerEventService` (11/13 fn dipakai), `organizerDashboardService` (3/4), `organizerProfileService` (7/7), `organizerRefundService` (3/3), `organizerRegisterService` (2/2), `organizerPayoutService` (`getOrganizerPayoutDetail` unused), `organizerTransactionService` ❌ **DEAD — nol importer** (TransaksiEO pakai `organizerDashboardService`), `organizerAuthService` (`logoutOrganizer` dipakai **hanya** oleh `SidebarEO.jsx:16`).

`organizerEventService.updateOrganizerEvent` memakai `PUT /api/organizer/events/update/{id}` (bukan RESTful `/{id}`) dan menyertakan `eventId` di body. Jangan "rapikan" tanpa cek backend.

## Auth & session
- **Mekanisme utama: HttpOnly cookie `access_token`** (24 jam) + `credentials:'include'`. Backend menyembunyikan `token` dari JSON via `@JsonIgnore`, jadi `data.token` praktis tidak pernah ada.
- Fallback `Authorization: Bearer` dari `localStorage.token` dihantarkan di 4 tempat: `api.js:21`, `downloadExport.js:26`, `organizerRegisterService.js:51`, plus `api.js:getHeaders()`.
- **Key `localStorage`:** `token`, `eventday_token` (write-only, **tidak dibaca siapa pun**), `userId`, `name`, `username`, `email`, `role`, `avatarUrl` (base64 data-URI — lihat Known Bugs).
- **Key `sessionStorage`:** `otpEmail`, `otpFlow` (`"register"` | `"forgot-password"`), `resetToken` (**OTP plaintext**), `resetEmail`, `issued_tickets`.
- `utils/tokenManager.js` managing `eventday_token` + `token` tapi **nol importer** — `Login.jsx:30-31` dan `Register.jsx:38-39` menulis langsung secara manual. Jangan tambah pemakaian baru ke file ini tanpaigentinya dulu.

### Ada EMPAT implementasi logout yang berbeda
| Sumber | Panggil API? | Bersihkan storage? |
|---|---|---|
| `shared/Sidebar.jsx` (admin) | ❌ tidak | `localStorage.clear()` + `sessionStorage.clear()` |
| `shared/SidebarEO.jsx` | ✅ `logoutOrganizer()` | `clear()` keduanya |
| `shared/ProfileSidebar.jsx` | ✅ `logoutUser()` | 6 `removeItem` selektif — **miss `eventday_token` dan `sessionStorage`** |
| `shared/NavbarCustomer.jsx` (hamburger "Keluar") | ❌ tidak | ❌ tidak — cuma `navigate("/")` |

Hanya cookie HttpOnly yang jadi kebenaran di sisi server, dan hanya 2 dari 4 yang berusaha mengosongkannya.

## Konvensi styling admin
Setiap file CSS admin diakhiri dua blok, dalam urutan ini:
1. `/* PENYERAGAMAN ... */` — scoped ke root class halaman (`.transaction-page`, `.detail-payout-page`, dst). Standar: judul 26px/700/-0.3px `#242331`, sub 14px `#6f7482`, **kartu statistik seragam (min-height 130px, padding 20px 22px, radius 12px, angka 32px, label 13px, icon 36×36 r10px, grid gap 16px)**, th 13px/td 14px, badge 12px, tombol 14px (h 40-42px), input 14px, pagination 13px.
2. `/* LAYOUT ADMIN SERAGAM */` — `@media (min-width:1101px)`, mengunci offset sidebar 220px dan `max-width:1400px` untuk content.

**Tiga halaman berbagi root class `.admin-dashboard`** (`DashboardAdmin`, `TambahEvent`, `DetailPengajuanEo`) dan karena itu ketiga file CSS-nya memuat blok layout yang **identik byte-per-byte** (via `.dashboard-wrapper` / `.dashboard-main` / `.dashboard-content`). Kalau diubah, ubah ketiganya. Jangan set ulang `.dashboard-wrapper { width: calc(100% - 260px) }` seperti versi lama — itu bocor antar halaman.

`DetailTransaksi.jsx` dan `DetailTiket.jsx` sengaja **tidak punya CSS sendiri**; keduanya mengimpor `DetailPengajuanPayout.css` sebagai shell detail bersama.

Layout family yang ada: (A) `.admin-dashboard` → Sidebar → `.dashboard-wrapper` → Navbar → `main.dashboard-main` → `.dashboard-content`; (B) `<root>-page` → Sidebar → `main.<x>-main` → Navbar → `.<x>-content`. Family A cuma 3 halaman, sisanya family B.

## Design system
Praktis tidak ada di level token. **Satu** CSS variable di seluruh repo (`--page-gutter-mobile`). Warna hardcoded hex; ada ~6 ungu/indigo berbeda (`#5146e5`, `#2f66ff`, `#4036c9`, `#453bd0`). Dua font bersaing: Poppins (`:root` di `styles.css`) vs Arial yang dideklarasikan ulang di kelima file CSS auth.

`styles.css` juga membawa reset element `label` dan `input` yang **bocor ke 74 komponen**, dan blok `@media (max-width:600px)` dengan `!important` di ~40 class. Dan karena `main.jsx` meng-import `App` **sebelum** `styles.css`, CSS global diinjeksi **terakhir** dan menang di setiap specificity tie — itulah alasan `.login-card` global Menimpa `Login.css`.

## Known Bugs (sudah diverifikasi, belum diperbaiki)

**Fungsional, prioritas tinggi:**
1. `shared/FooterCustomer.jsx:49,58` — `navigate("../register-eo")` dan `startsWith("../register-eo")`. React Router me-resolve `navigate` terhadap hierarki route, jadi tab "Buat Event" untuk non-organizer tidak ke mana-mana dan active-check selalu false.
2. `admin/PengaturanPlatform.jsx:324-327` — tombol simpan `type="submit"` **dan** `onClick={handleSave}` → save jalan dua kali per klik.
3. `shared/NavbarCustomer.jsx` — "Keluar" di hamburger hanya `navigate("/")`. Tidak panggil API, tidak bersihkan storage, tidak bersihkan cookie. **Sesi tetap hidup sepenuhnya.**
4. `admin/AuditLog.jsx` — 280 baris data audit 2023 hardcode dipakai mentah setiap panggilan API gagal. Menutupi kegagalan backend dengan data palsu — tidak pantas di halaman audit.
5. `admin/AuditLog.jsx:606` — `Swal.fire({html: ...})` menyisipkan field log tanpa escaping → XSS kalau ada nilai mengandung HTML.
6. `admin/Transaksi.jsx:123` — filter tanggal default "Last 30 Days". Digabung dengan fetch `size:20` di EventManagement / Transaksi / Tiket / AuditLog, UI admin hanya bisa menjangkau ~20 record terbaru per resource, data lama tersembunyi tanpa indikasi.
7. `admin/DetailEvent.jsx` — approve/reject/delete jalan **tanpa `showConfirm`**, berbeda dari setiap mutasi admin lain. Alasan reject hardcoded `"Ditolak oleh admin"`, tanpa input.
8. `admin/DetailPengajuanPayout.jsx:234` — fallback fee platform hardcode **5%** kalau API tidak mengirimnya → nominal payout bersih bisa salah di layar finansial.
9. `eo/AddEvent.jsx` + `customer/CustomerDashboard.jsx` — mengirim kategori `ENTERTAINMENT`, `TECHNOLOGY`, `SEMINAR_WORKSHOP`, `COMMUNITY` yang oleh `constants/categories.js` dinyatakan invalid. Backend pakai `valueOf` strict → **4 dari 9 chip kategori di dashboard customer balik 400**.
10. `admin/EditEvent.jsx` — merender dropzone tapi tidak memakai `EventBannerUpload` dan memanggil `updateAdminEvent(id, payload)` tanpa file. Dropzone dekoratif; banner hanya bisa diubah via URL.
11. `eo/DetailEventEO.jsx` — fetch `salesSummary`/`salesError` lalu tidak merender keduanya. Tiga state mati + satu request sia-sia.
12. `eo/StatusRegisterEO.jsx:13` — tombol setelah registrasi EO diarahkan ke `/customer/dashboard`, seharusnya `/eo/dashboard`.

**Kebocoran token ke log:** `OTP.jsx` mencetak `"OTP CODE"`/`"RESET TOKEN"` (kode reset password plaintext) dan `ResetPassword.jsx` mencetak `"RESET TOKEN"`. `Login.jsx:104,142-144` mencetak objek response login penuh (bisa berisi PII). Sekitar 25 `console.log` lain masih tertinggal (DashboardAdmin:110-111, EventManagement:171, UserManagement:45, DetailUser:40,89,141, DetailEvent:79,87, DetailPengajuanEo:53,206, AuditLog:633, dst).

**Bug kecil tapi belum diperbaiki:**
- `auth/Register.jsx:712` — SVG ikon mata pada field "Ulangi Kata Sandi" punya path rusak, ikon tampil patah.
- `auth/ResetPassword.jsx:283-285,332-334` — tombol show/hide password memakai glyph identik di kedua state → tidak ada feedback visual.
- `customer/RefundDetail.jsx:41` — **memutasi objek hasil fetch** (`refundData.orderSummary = ...`), bukan merge di state. Plus guard di ~142-152 bisa throw kalau `orderSummary` null.
- `customer/EditProfileCustomer.jsx` — hasil `uploadAvatar(file)` dibuang; avatar disimpan sebagai **base64 data-URI ke `localStorage["avatarUrl"]`** (masalah kuota & privasi), bukan pakai `avatarUrl` yang dikembalikan API.
- `admin/DetailUser.jsx:102` — `getStatusLabel` dipakai sebelum deklarasinya (TDZ hazard, aman sekarang karena dipanggil saat runtime).
- `admin/UserManagement.jsx:293` — `handleUserAction` duplikat persis `handleUserClick`; `handleFilter` `async` tanpa `await`.
- `admin/DetailTiket.jsx` — `handleAction` tidak punya guard, jadi tiket `EXPIRED/REFUNDED/REVOKED` tetap dapat tombol "Revoke" yang tidak berarti (bandingkan `Tiket.jsx` yang benar mengembalikan `null`).
- `admin/Tiket.jsx` — state `dataWarning` dirender tapi tidak pernah di-assign (dead, copy-paste dari Transaksi).
- `admin/DetailEventEO` hardcode `status-badge active` tanpa memetakan status sebenarnya.
- `eo/EventEO.jsx` — progress bar fake: `width: sold > 0 ? "100%" : "0%"`, tidak ada rasio ke kuota. Draft juga bisa tampil dua kali (endpoint draft + filter list).
- `eo/DashboardEO.jsx` — baca metric **snake_case** (`active_events`, `total_revenue`, `tickets_sold`) tanpa fallback camelCase →FK nol kalau BE_return camelCase. Plus resolver gambar duplikat dengan domain typo (lihat Environment).
- `eo/AddEvent.jsx` — `permissionFile` dikumpulkan tapi tidak pernah dikirim (UI mati). Hanya `schedules[0]` yang dipakai; baris jadwal ekstra dibuang diam-diam.
- `admin/PengaturanPlatform.jsx` — `mataUang`/`zonaWaktu` diedit tapi tidak pernah dikirim (no-op senyap). Dropzone mengiklankan "tarik dan lepas" tapi tidak ada handler drag sama sekali.
- `admin/PengajuanAkunEO.jsx` — tombol Export cuma stub `showWarning("Ekspor Belum Tersedia")`; tidak ada pagination (satu-satunya halaman list tanpa itu).
- `admin/DetailTransaksi.jsx` & `DetailTiket.jsx` — tidak punya guard `if (!id)` (mengacute `GET .../undefined`); `DetailPengajuanPayout` sudah punya, termasuk check `"undefined"`.
- `admin/DetailEventEO` / `admin/Tiket.jsx` — label status English ("Ticket Overview", "Success/Pending/Rejected") di|Pages yang lain Indonesia.
- `customer/Checkout.jsx` — fallback uang hardcode (`adminFee = 5000`, tax 10%) dan fallback event mock aktif bila `location.state` hilang → deep-link langsung ke `/checkout/:id` menampilkan data palsu. `buyer.phone` direferensikan padahal field aslinya `phoneNumber`.
- `customer/MyTicket.jsx` — `REFUND_STATUSES` dideklarasikan dua kali (module scope ~L68 dan di dalam komponen ~L258, yang innerPrefs shadow). N+1 hingga 15 `getTicketDetail`. `getEvents` dipakai untuk cari eventId by judul (match string rapuh) untuk flow "lanjutkan bayar".
- `shared/Navbar.jsx:24-61` — `getPageInfo()` **tidak punya case** untuk `/admin/audit-log`, `/admin/pengajuan-payout`, `/admin/pengaturan` → tiga halaman itu judulnya jatuh ke "Admin Portal" generik.
- `shared/Sidebar.jsx` — baca 4 key foto legacy (`photo`, `profilePhoto`, `avatar`, `picture`) yang **tidak pernah ditulis** siapa pun; key yang benar-benar dipakai (`avatarUrl`) tidak ada di daftar.
- `shared/NavbarCustomer.jsx:198,322` — `searchRef` di-*attach* ke dua elemen berbeda (desktop + mobile overlay), sehingga deteksi click-outside rusak untuk salah satunya. Kegagalan `getProfile` ditelan `catch {}` kosong.
- `customer/ProfileCustomer.jsx` - tidak render `ProfileSidebar`, melainkan menduplikasi daftar menu yang sama secara manual → dua sumber kebenaran.
- `index.html` — memuat Midtrans Snap dari host **sandbox** (`app.sandbox.midtrans.com`) dengan sandbox client key, **di setiap route termasuk login**. `<title>` hardcoded "Eventday — Login" untuk semua halaman, tidak ada `document.title` management.
- `customer/RefundRequest.jsx` — `orderId` hanya dari `location.state`, tanpa query param atau pemilih order → navigasi langsung ke `/customer/refund` merender form yang tidak terpakai.
- `customer/ChangePasswordCustomer.jsx` — suksesnya **logout-user** (bersihkan 6 key, navigate `/`) tanpa dialog konfirmasi.
- `eo/RegisterEO.jsx` — baca `registerResponse?.token` lalu tulis ke localStorage, padahal BE menyembunyikan token (`@JsonIgnore`) → dead code.
- `eo/PengajuanPayoutEO.jsx` + `eo/RefundEO.jsx` + `customer/RefundRequest.jsx` + `eo/ProfileEO.jsx` — masih pakai `alert()`/`window.confirm()` mentah, bukan `utils/alert.js` (ketidakkonsistenan UX dengan halaman yang lebih baru).
- `eo/DetailRefundEO.jsx` — **100% mock**, tombol Tolak/Setujui/Konfirmasi **tanpa `onClick`**, tidak ada `useParams`/`useNavigate`, dan nol link masuk. Halaman orphan.

## Dead code
| Item | Status |
|---|---|
| `shared/Button.jsx` + `.css` | Nol importer. Tidak punya `disabled`/`className`/`...rest`. |
| `shared/FormInput.jsx` + `.css` | Nol importer. Tidak punya `error`/`required`/`disabled`. |
| `utils/tokenManager.js` | Nol importer (meski ada side-effect `purgeForeignTokens()` saat import — yang juga tak pernah jalan). |
| `services/organizerTransactionService.js` | Nol importer. |
| `services/homeSearchService.js` | Nol importer. |
| `eo/EditEvent.css` | Orphan — `EditEventEO.jsx` mengimpor `AddEvent.css`. Keduanya root class `.add-event-page` tapi sudah berbeda. |
| `admin/AuditLog.jsx` `mockAuditData` | 280 baris — lihat Known Bugs #4. |
| `DetailRefundEO.jsx` | Orphan, tidak fungsional. |
| `localStorage.eventday_token` | Write-only, tidak dibaca siapa pun. |
| `sessionStorage.forgotName` | Tidak pernah ditulis. |
| Event `admin-sidebar:close` | Tidak pernah di-dispatch (listener ada di `Sidebar.jsx`). |
| Export `checkoutService.processCheckout`, `ticketService.scanTicket`, `refundService.getRefundProof`, `profileService.getTransactionHistory`, `organizerPayoutService.getOrganizerPayoutDetail`, `organizerDashboardService.getOrganizerDashboard` | Ada tapi nol pemanggil. |
| `styles.css` blok `.page` … `.register-button` | Dead — superseded per-page CSS. |
| `import React` di ~30 `.jsx` | Harmless di automatic JSX transform. |

## Yang sudah tidak lagi berlaku
Catatan dari revisi `AGENTS.md` sebelumnya yang **sudah salah** terhadap kode sekarang — jangan dik.Accept.:
- ~~Route customer didefinisikan 2×~~ → sudah dirapikan.
- ~~`/customer/history`, `/customer/profile`, `/customer/refund/:id` akan 404~~ → semua sudah ada.
- ~~"`order/ticket/refundService` masih TODO"~~ → ketiganya sudah ada dan dipakai.
- ~~"`adminService.js` / `adminSettingService.js` sudah dihapus, jangan dibuat ulang"~~ → memang tidak ada, benar, tapi **9 service `admin*.js` yang sekarang aktif tidak tercatat sama sekali** di revisi lama.
- ~~Hanya `eventService.js` yang tersambung dari sisi customer~~ →saarang hampir semua halaman customer/EO/admin sudah live.
- ~~`API.md` §10-19 SCHEMA ONLY, FE masih mock~~ → FE sekarang memanggil permukaan endpoint yang jauh lebih luas (lihat `API.md`).
- ~~"Tidak ada error boundaries; API errors adalah `alert()`"~~ →benar untuk halaman lama, tapi halaman baru sudah pakai SweetAlert2.
- ~~Port 8082 + URL ngrok hardcoded di `authService.js:10`~~ → **tidak ada lagi**. `authService.js` sekarang murni lewat path relatif `/api/...`; port/tunnel diatur lewat `VITE_NGROK_URL` / `VITE_API_URL`.
- ~~"admin-theme.css sudah DIHAPUS — jangan dibuat ulang"~~ → masih berlaku, tapi tidak ada lagi penyebutan blok `PENYERAGAMAN`/`LAYOUT ADMIN SERAGAM` di revisi lama.

## Konvensi umum
- Bahasa UI dan komentar: **Indonesia** (terkecuali `admin/Navbar.jsx`, `admin/Tiket.jsx`, `eo/PayoutEO.jsx` yang sebagian English).
- Alert: `utils/alert.js` (`showSuccess/showError/showWarning/showInfo/showLoading/showConfirm/showToast/showInputDialog`) + `closeAlert`. Jangan pakai `alert()`/`window.confirm()` di kode baru.
- Format uang: `Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" })` — **dideklarasikan ulang per-file**, tidak ada util bersama. Tanggal: `toLocaleDateString("id-ID")`, kecuali `admin/Transaksi.jsx` yang pakai `"en-GB"`.
- Tidak ada shared form component yang dipakai; `FormInput`/`Button` mati, semua halaman hand-roll.
- Responsive: breakpoint ad-hoc per file (admin mulai 1101px, EO 850-1100px, customer 768px). Tidak ada skala bersama.
- `npm run build` adalah satu-satunya verifikasi. Selalu jalankan setelah perubahan.

## Gotcha saatngoding
- **Jangan edit `src/services/api.js`.** Butuh endpoint export → pakai `downloadExport.js`.
- `apiFetch` **tidak** meng-unwrap response. `const d = (await getAdminEvents()).data` — bukan `await getAdminEvents()` langsung. (`authService` berbeda: sudah meng-unwrap.)
- Kalau ubah salah satu dari 3 file CSS `.admin-dashboard`, **ubah ketiganya**.
- Kalau bikin halaman admin baru, salin **kedua** blok (PENYERAGAMAN + LAYOUT) dari `Transaksi.css` sebagai template, dan set root class unik supaya tidak bocor.
- `DetailTransaksi`/`DetailTiket` **sengaja** tanpa CSS — jangan bikinkan, mereka memakai `DetailPengajuanPayout.css`.
- Injeksi CSS global menang atas per-page CSS (lihat Design system) — hindari menamai class seperti yang sudah ada di `styles.css`.
- Kategori event: hanya `MUSIC_FESTIVAL`, `CONFERENCE`, `EXHIBITION`, `CULINARY` yang valid. Pakai `constants/categories.js` (`VALID_CATEGORIES`, `categoryLabel`, `normalizeCategoryForBackend`) daripada menulis enum sendiri.
- Header `ngrok-skip-browser-warning` **wajib** untuk akses backend lewat proxy — tanpa itu ngrok free-tier mengembalikan halaman interstitial `ERR_NGROK_6024`, bukan konten asli. Dan karena `<img>`/`background-image` tidak bisa kirim header custom, **semua** akses gambar `/uploads` juga harus lewat proxy (`vite.config.js:48`).
