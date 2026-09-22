# AGENTS.md — eventday

## Stack
- Vite 5 + React 18 + `react-router-dom` 7 + `@react-oauth/google` — SPA only, no SSR.
- ESM (`"type": "module"`). No TypeScript, no tests, no linter/formatter config.
- `vite.config.js:1` wires `@vitejs/plugin-react` — required for HMR/fast-refresh (previously missing, fixed 2026-09).

## Commands
```bash
npm install          # install (no lockfile enforcement)
npm run dev          # Vite dev server — URL printed in terminal
npm run build        # vite build -> dist/
npm run preview      # serve built dist/
```
- No `test` / `lint` / `typecheck` scripts. Verification is `npm run build`.

## Structure
- `src/main.jsx:1` — entry, mounts `App` + imports `src/styles.css` (global).
- `src/App.jsx:42` — all routes + `GoogleOAuthProvider` (hardcoded `GOOGLE_CLIENT_ID` at `src/App.jsx:42`).
- `src/components/` — one `.jsx` + co-located `.css` per page/feature:
  - `auth/` — `Login.jsx`, `Register.jsx`, `ForgotPassword.jsx`, `OTP.jsx`, `ResetPassword.jsx`
  - `admin/` — `DashboardAdmin.jsx`, `EventManagement.jsx`, `DetailEvent.jsx`, `EditEvent.jsx`, `TambahEvent.jsx`, `UserManagement.jsx`, `DetailUser.jsx`, `PengajuanAkunEO.jsx`, `DetailPengajuanEo.jsx`, `PengajuanPayout.jsx`, `DetailPengajuanPayout.jsx`, `Transaksi.jsx`, `Tiket.jsx`, `AuditLog.jsx`, `PengaturanPlatform.jsx` + `EventBannerUpload.jsx` (helper). **Penyeragaman tampilan admin:** tiap CSS halaman diberi blok `/* PENYERAGAMAN ... */` di akhir file, scoped ke root class halaman (`.event-management-page`, `.transaction-page`, `.detail-payout-page`, dst; untuk DashboardAdmin/TambahEvent/DetailPengajuanEo yang sama-sama root `.admin-dashboard` di-scope via class turunan seperti `.dashboard-wrapper`/`.form-header`). Standarnya: judul 26px/700/-0.3px `#242331`, sub 14px `#6f7482`, stat 32px, **kartu statistik seragam di semua halaman admin: min-height 130px, padding 20px 22px, radius 12px, angka 32px, label 13px, icon 36x36 r10px, grid gap 16px** (Dashboard/Transaksi/PengajuanAkunEO/Tiket/PengajuanPayout), th 13px/td 14px, badge 12px, tombol 14px (h 40-42px), input 14px, pagination 13px. `admin-theme.css` sudah DIHAPUS — jangan dibuat ulang. **Layout tetap antar menu:** setiap CSS admin juga diberi blok `/* LAYOUT ADMIN SERAGAM */` (di akhir, setelah PENYERAGAMAN) yang di-scope ke root class halaman di dalam `@media (min-width:1101px)`: main `margin-left:220px; width:calc(100% - 220px)` (mengikuti Sidebar 220px; EventManagement dulu 230px) dan content `max-width:1400px; margin:auto; padding:24px 28px 40px`. Untuk 3 halaman ber-root `.admin-dashboard` (DashboardAdmin/TambahEvent/DetailPengajuanEo) bloknya **identik** karena memakai class global `.dashboard-wrapper`/`.dashboard-main`/`.dashboard-content` — kalau diubah, ubah ketiganya; jangan set ulang `.dashboard-wrapper { width: calc(100% - 260px) }` seperti lama (itu bocor antar halaman).
  - `eo/` — `DashboardEO.jsx`, `EventEO.jsx`, `AddEvent.jsx`, `TransaksiEO.jsx`, `DetailTransaksiEO.jsx`, `RefundEO.jsx`, `ProfileEO.jsx`
  - `customer/` — `CustomerDashboard.jsx` (sudah terhubung BE via `eventService.js`), `DetailEventCustomer.jsx`, `Checkout.jsx`, `TicketSuccess.jsx`, `MyTicket.jsx`, `RefundRequest.jsx`, `RefundList.jsx` (sisanya masih mock, `API.md` §8-9 sudah live di BE, §10-19 masih SCHEMA ONLY)
  - `shared/` — `Navbar.jsx`, `NavbarEO.jsx`, `NavbarCustomer.jsx`, `Sidebar.jsx`, `SidebarEO.jsx`, `Button.jsx`, `FormInput.jsx`
- `src/services/authService.js:10` — all auth API calls; `API_BASE=https://a2c2-2400-9800-3cd-197d-71d1-7b90-e13c-943f.ngrok-free.app` (ngrok → localhost:8082, override via `VITE_API_URL`), `fetchWithAuth` pakai `credentials:'include'` agar `Set-Cookie: access_token` HttpOnly dari BE terkirim (BE `@JsonIgnore` hide `data.token`). Helpers `isWrappedResponse`/`normalizeSuccess`/`extractErrorMessage` unwrap `msg`. **Baru:** `eventService.js` (getEvents/getFeatured/getEventById) sudah ada, `order/ticket/refundService` masih TODO.
- `src/services/admin*.js` — **9 file, satu fitur per file, SEMUA sudah dipakai UI admin (rev.14):** `adminDashboardService` (metrics/recent-events/recent-transactions), `adminUserService` (list/detail/PATCH status/suspend), `adminEoService` (list/detail/PATCH status/company-deed + **download**), `adminPayoutService` (list/detail/PATCH status + adminNote/reconciliation), `adminEventService` (CRUD multipart/**approve/reject**/sales/export), `adminTicketService` (list/detail/**POST /tickets** generate/revoke→REVOKED/checkin/**inventory?eventId**/export), `adminTransactionService` (list/detail/PATCH status/export), `adminAuditService` (list/export/export-csv), `adminSettingsService` (GET/PUT settings/general + upload-logo). `api.js` menyediakan `apiFetch` + `toQueryString` (credentials include, Bearer fallback, Vite proxy `/api/admin/**`) — **api.js TIDAK BOLEH diubah**; helper `downloadFromEndpoint` (menangani export binary & CSV-string) ada di file terpisah `src/services/downloadExport.js`. Legacy `adminSettingService.js` (duplikat) & `adminService.js` (getAdminEvents→dashboard) sudah DIHAPUS — jangan dibuat ulang. `updateAdminEventStatus` (`/events/{id}/status`) tersisa hanya sebagai alias legacy untuk auto-publish fallback di TambahEvent — UI approve/reject pakai `/approve` + `/reject`.
- `API.md:1` — canonical REST contract. Status 2026-09-10: **Auth aktif + Customer Event Catalog 7-9 aktif di BE**, **10-19 SCHEMA ONLY** (FE lebih lengkap mock). Response `{msg,status,data}`, register `201`, JWT 24h HttpOnly cookie, OTP 5min, reset code 15min, order expiry 15min.

## Routing
Centralized in `src/App.jsx:49`. Groups:
- Auth (`/`, `/register`, `/forgot-password`, `/otp`, `/forgot-password/reset`)
- Admin (`/admin/*` 7 routes, `/event-management` + alias `/admin/event-management`, `/admin/event/:id`, `/admin/users`, `/admin/users/:id`, `/admin/pengajuan-eo`, `/admin/transaksi`, `/admin/tiket`)
- EO (`/eo/dashboard`, `/eo/event`, `/eo/event/create`, `/eo/transaksi`, `/eo/transaksi/:id`, `/eo/refund`, `/eo/profil`)
- Customer (`/customer/dashboard`, `/customer/event/:id`, `/checkout/:id`, `/customer/ticket-success`, `/customer/tickets`, `/customer/refund`, `/customer/refund-list`) — **duplikat route terdeteksi** di `src/App.jsx:158-216`: `/customer/dashboard`, `/customer/event/:id`, `/checkout/:id`, `/customer/ticket-success`, `/customer/tickets`, `/customer/refund` didefinisikan 2× (React Router pakai entri terakhir, tidak error tapi perlu dirapikan). Belum ada `/customer/history`, `/customer/profile`, `/customer/refund/:id` padahal di-link dari `CustomerDashboard.jsx:199,204,210`, `NavbarCustomer.jsx:110,122`, `RefundList.jsx:41` (akan 404).

## Backend / Env
- No `.env` files, no env loading. Backend URL and Google Client ID are hardcoded strings — must be edited directly in `src/services/authService.js:10` and `src/App.jsx:42`.
- ngrok URL `https://a2c2-2400-9800-3cd-197d-71d1-7b90-e13c-943f.ngrok-free.app` **aktif** → `http://localhost:8082` (`API.md:3`). FE `authService.js:10` + `eventService.js:5` pakai `API_BASE` ini + `fetchWithAuth` `credentials:'include'` + header `ngrok-skip-browser-warning`. Untuk lokal tanpa ngrok set `VITE_API_URL=http://localhost:8082`.
- `forgotPassword` and `resetPassword` both `POST` to the same endpoint `/reset-password` (`src/services/authService.js:402,478`) — differentiated by payload (`{email}` vs `{email, code, newPassword}`). Backend `ResetPasswordRequest` supports aliases `code`/`token`/`otp` + `newPassword`/`password`.
- JWT via **HttpOnly Cookie `access_token` + `Authorization: Bearer` fallback** (`API.md:7`, `Downloads/AGENTS.md:177`). BE `AuthResponse.token` `@JsonIgnore` — token tidak ada di JSON, hanya `Set-Cookie`. FE `authService.js:10` `fetchWithAuth` kirim keduanya (`credentials:'include'` + header jika ada `localStorage token`). Only Auth public, lainnya `401/403` `{msg,status,data}`. `google.client-id` `875040780549-...`.
- Customer: `7-9` (`GET /api/v1/events`, `/featured`, `/{id}`) sudah **Live** di BE (`EventController.java`), FE `CustomerDashboard.jsx` sudah fetch via `eventService.js`. `10-19` (orders/payments/tickets/refunds) masih **SCHEMA ONLY** di BE — FE spek lengkap sebagai kontrak di `API.md` §10-13.

## Endpoint Status Matrix (FE vs BE) — untuk sinkron AI backend

> Sumber tunggal: `API.md` §Daftar Endpoint. Kolom **Status Frontend** menjelaskan kesiapan UI di `src/components/customer/*`.

| # | Endpoint | Status Frontend | Status Backend | File / Catatan |
|---|----------|-----------------|----------------|----------------|
| 1 | `POST /api/v1/auth/register` | ✅ Done — `Register.jsx:36` + `authService.js:84` | ✅ Live 8082 | Auth aktif |
| 2 | `POST /api/v1/auth/verify-otp` | ✅ Done — `OTP.jsx` | ✅ Live |  |
| 3 | `POST /api/v1/auth/resend-otp` | ✅ Done — `OTP.jsx` | ✅ Live |  |
| 4 | `POST /api/v1/auth/login` | ✅ Done — `Login.jsx:26` | ✅ Live | `identifier` email/username |
| 5 | `POST /api/v1/auth/google` | ✅ Done — GIS | ✅ Live |  |
| 6 | `POST /api/v1/auth/reset-password` | ✅ Done — `ForgotPassword.jsx` + `ResetPassword.jsx` | ✅ Live | 2 tahap 1 endpoint |
| 7 | `GET /api/v1/events` | ✅ Terhubung — `eventService.js:getEvents()` | ✅ Live BE | `CustomerDashboard.jsx:33` sudah fetch `credentials:include` |
| 8 | `GET /api/v1/events/featured` | ✅ Terhubung — `eventService.js:getFeaturedEvents()` | ✅ Live BE | `CustomerDashboard.jsx:12` sudah fetch |
| 9 | `GET /api/v1/events/{id}` | 🎨 UI Done / Mock — `getEventById()` siap | ✅ Live BE | `DetailEventCustomer.jsx:14` siap di-wire |
| 10 | `POST /api/v1/orders` | 🎨 UI Done / Mock | ⏳ Spek siap | `Checkout.jsx:135` `alert()` saja |
| 11 | `GET /api/v1/orders` | ⚠️ Link ada, Page 404 | ⏳ Spek siap | `NavbarCustomer.jsx:110` → `/customer/history` belum ada route |
| 12 | `GET /api/v1/orders/{id}` | 🎨 Mock | ⏳ Spek siap | `Checkout.jsx:30` |
| 13 | `POST /api/v1/payments` | 🎨 Mock | ⏳ Spek siap | `Checkout.jsx:135` |
| 14 | `GET /api/v1/tickets/me` | 🎨 Mock | ⏳ Spek siap | `MyTicket.jsx:9` 3 status |
| 15 | `GET /api/v1/tickets/{code}` | 🎨 Mock | ⏳ Spek siap | `TicketSuccess.jsx:9` QR `api.qrserver.com` |
| 16 | `GET /api/v1/orders/{orderId}/tickets` | 🎨 Mock | ⏳ Spek siap | `TicketSuccess.jsx:9` |
| 17 | `POST /api/v1/refunds` | 🎨 Mock | ⏳ Spek siap | `RefundRequest.jsx:33` enum bank |
| 18 | `GET /api/v1/refunds` | 🎨 Mock | ⏳ Spek siap | `RefundList.jsx:9` |
| 19 | `GET /api/v1/refunds/{id}` | ⚠️ Link ada, Route 404 | ⏳ Spek siap | `RefundList.jsx:41` → `/customer/refund/:id` belum ada |

**Legenda:** ✅ Done = UI + fetch + JWT sudah terhubung | 🎨 UI Done / Mock = UI jadi, data hardcode, belum `fetch` | ⚠️ Link ada, Route 404 = tombol `navigate()` ada tapi `App.jsx:158-216` belum ada `<Route>` | ⏳ Spek siap = kontrak ada di `API.md §8-13`, backend tinggal implement | **PR selanjutnya FE:** buat `src/services/eventService.js`, `orderService.js`, `ticketService.js`, `refundService.js` lalu ganti semua hardcode ke `fetch` + `Authorization`.

### Admin rev.14 — status sinkron FE (2026-09-22)

**Semua 15 halaman admin sudah terhubung ke service lokal FE** (prefix `/api/admin/**` via `api.js:apiFetch`). Halaman yang sebelumnya mock kini live:
- `Transaksi.jsx` → `adminTransactionService` (list+filter+pagination+export+PATCH status; statistik PAID/PENDING/GAGAL diturunkan dari snapshot).
- `Tiket.jsx` → `adminTicketService` (list+search+pagination+export+checkin/revoke; statistik turunan).
- `PengajuanPayout.jsx` → `adminPayoutService` (list+statistik pending/approved/rejected).
- `DetailPengajuanPayout.jsx` → `adminPayoutService` (detail via `useParams`, PATCH status+adminNote, dokumen rekonsiliasi via `getPayoutReconciliation`).
- `AuditLog.jsx` → `adminAuditService` (list size=100 snip + filter client, export CSV prefer backend `/export/csv`, fallback build client; fallback mock bila BE mati).
- `PengaturanPlatform.jsx` → `adminSettingsService` (GET/PUT `/settings/general` — nama sistem, email kontak, **admin fee, masa berlaku order** — + upload logo ≤5MB).

**Penyelarasan endpoint ke rev.14:**
- Event approve/reject: `PATCH /events/{id}/approve` + `/reject` (UI `DetailEvent.jsx` sudah pakai); `/events/{id}/status` hanya alias legacy.
- Ticket generate: `POST /api/admin/tickets` (body `{orderId}`), bukan `/tickets/generate`. Revoke → status **REVOKED**. Inventory: `GET /api/admin/tickets/inventory?eventId=` (tanpa path param).
- EO deed: tambah `GET /eo-applications/{id}/documents/company-deed/download`.
- Duplikat/legacy dihapus: `adminSettingService.js` (dupe settings), `adminService.js` (dupe dashboard), fungsi audit dipindah ke `adminAuditService.js`.

**Selisih kontrak presisi terbaru (sinkron dengan AGENTS.md backend rev.14, HEAD `4680644`):**
- Settings payload: `PUT /admin/settings/general` harus `{appName, contactEmail, adminFee, orderExpiryMinutes}` (BE `AdminSettingsRequest`); GET mengembalikan `Map<String,String>` — FE membaca `contactEmail` (bukan `adminEmail`), `adminFee`/`orderExpiryMinutes` dikirim sebagai Number.
- Dashboard metrics: BE `AdminDashboardMetricsResponse` memakai **`totalPlatformRevenue`** (bukan `totalRevenue`) + `totalTicketsSold`/`totalEvents`/`activeEvents`/`totalUsers` — `DashboardAdmin.jsx` membaca `totalPlatformRevenue ?? totalRevenue`.
- Rekonsiliasi payout: `GET /admin/payouts/{id}/documents/reconciliation` → field **`reconciliationDocumentUrl`** (`DetailPengajuanPayout.jsx` baca dengan fallback ke `url`/`fileUrl`).
- Audit export CSV: `GET /admin/audit-logs/export/csv` membungkus **string CSV dalam `ApiResponse`** (BUKAN binary attachment). Helper `src/services/downloadExport.js:downloadFromEndpoint` menangani dua bentuk export (blob binary events/tickets/transactions VS CSV-string audit) — jangan pakai `apiFetch` untuk endpoint export.
- `downloadCompanyDeedDocument` (`/documents/company-deed/download`) ada di service tapi belum dipakai UI; `getCompanyDeedDocument` → `{documentUrl}` yang dipakai `DetailPengajuanEo.jsx`.

**Detail transaksi/tiket DITAMBAHKAN (sesi ini):** `DetailTransaksi.jsx` (`/admin/transaksi/:id`) + `DetailTiket.jsx` (`/admin/tiket/:id`) dibuat, memakai ulang layout/CSS `DetailPengajuanPayout.css` (tanpa file CSS baru → penyeragaman admin otomatis konsisten). Klak ID di `Transaksi.jsx` → `navigate('/admin/transaksi/:id')`; `Tiket.jsx` → area info item `navigate('/admin/tiket/:id')`. Service `getAdminTransactionDetail`/`getAdminTicketDetail` sudah ada sejak awal — kini benar-benar dipakai.

## State & Auth Flow
- Auth persistence: `localStorage` keys `token`, `userId`, `name`, `username`, `email`, `role` (`src/components/auth/Login.jsx:26`, `src/components/auth/Register.jsx:36`). **Update:** BE hide token (`@JsonIgnore`), `token` di `localStorage` hanya untuk fallback `Authorization` — utama adalah `Cookie: access_token` HttpOnly via `fetchWithAuth credentials:'include'` (`authService.js:10`).
- OTP flow uses `sessionStorage` `otpEmail` + `otpFlow="register"` (`src/components/auth/Register.jsx:202`) and query param `?email=` on `/otp`.
- `login` accepts `identifier` (email if contains `@`, else username) — see `src/services/authService.js:274`.
- Google login sends `idToken` (credential) to `POST /google` (`src/services/authService.js:351`).
- Customer mock state (belum terhubung backend):
  - `CustomerDashboard.jsx:8,33` — **`Terhubung`** via `eventService.js:getEvents()` / `getFeaturedEvents()` dengan `credentials:include`, `activeCategory` → `?category=MUSIC_FESTIVAL`, `search` live, `handleBuyTicket` → `navigate(/customer/event/:id)`. Fallback ke mock 6 item jika BE mati.
  - `DetailEventCustomer.jsx:12,14` — `quantity` lokal, `event` hardcode, `TicketBox` Early Bird/Regular, `navigate(/checkout/:id)` bawa qty via state (belum ada `eventService`)
  - `Checkout.jsx:10,17,30` — timer `14*60+57` (15min expiry), `buyers` array per `quantity`, `location.state` untuk event, `adminFee=5000`, `ticketTotal=price*quantity`
  - `MyTicket.jsx:9` — `tickets` hardcode 3 status `used/unused/expired` → `GET /api/v1/tickets/me`
  - `TicketSuccess.jsx:9` — `tickets` hardcode `TK-894-ABC`, QR via `api.qrserver.com`, → `GET /api/v1/orders/{id}/tickets`
  - `RefundRequest.jsx:9` — `formData` bank fields enum BCA/BRI/BNI/Mandiri/CIMB/BSI → `POST /api/v1/refunds`
  - `RefundList.jsx:9` — `refunds` hardcode 4 item `approved/pending/rejected` → `GET /api/v1/refunds`

## Conventions
- Language: UI and most comments in Indonesian.
- Styling: global `src/styles.css` + per-component CSS; no CSS modules/Tailwind.
- Not a git repo — no CI, hooks, or branch conventions to follow.

## Gotchas
- No error boundaries; API errors are `alert()` + `console.error`.
- `vite preview` requires a prior `vite build`.
- **Customer masih mock (kecuali dashboard):** `CustomerDashboard.jsx` sudah fetch, tapi `DetailEventCustomer/Checkout/MyTicket/TicketSuccess/Refund*` masih hardcode. Jangan demo tanpa `credentials:'include'` — akan `401` meski token valid. Timer checkout hardcode, bukan dari `expiredAt` backend.
- **Penyebab tidak tersambung (sudah diperbaiki):** `API_URL` ngrok mati `a2c2-...` + `fetch` tanpa `credentials:'include'` + FE expect `data.token` yang BE hide via `@JsonIgnore`. Fix di `authService.js:10` (`API_BASE=http://localhost:8082`, `fetchWithAuth`).
- **Duplikat route** di `src/App.jsx:158-216` — bersihkan agar tidak bingung AI backend baca routing. Missing routes `/customer/history`, `/customer/profile`, `/customer/refund/:id` akan 404.
- **Service layer customer:** baru `eventService.js` ada, `orderService.js`/`ticketService.js`/`refundService.js` masih TODO — buat dengan helper yang sama (`getResponseData`, `normalizeSuccess`, `extractErrorMessage`).
- **Enum mismatch risiko:** frontend `MUSIC FESTIVAL` (spasi) vs BE `MUSIC_FESTIVAL` (underscore) — BE sudah return keduanya (`category` + `categoryLabel`), FE normalisasi `replace(/_/g," ")`.
