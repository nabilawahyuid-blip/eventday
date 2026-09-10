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
  - `admin/` — `DashboardAdmin.jsx`, `EventManagement.jsx`, `DetailEvent.jsx`, `UserManagement.jsx`, `DetailUser.jsx`, `PengajuanAkunEO.jsx`, `Transaksi.jsx`, `Tiket.jsx`
  - `eo/` — `DashboardEO.jsx`, `EventEO.jsx`, `AddEvent.jsx`, `TransaksiEO.jsx`, `DetailTransaksiEO.jsx`, `RefundEO.jsx`, `ProfileEO.jsx`
  - `customer/` — `CustomerDashboard.jsx`, `DetailEventCustomer.jsx`, `Checkout.jsx`, `TicketSuccess.jsx`, `MyTicket.jsx`, `RefundRequest.jsx`, `RefundList.jsx` (**semua masih mock data**, menunggu backend `API.md` §8-13)
  - `shared/` — `Navbar.jsx`, `NavbarEO.jsx`, `NavbarCustomer.jsx`, `Sidebar.jsx`, `SidebarEO.jsx`, `Button.jsx`, `FormInput.jsx`
- `src/services/authService.js:12` — all auth API calls; base `API_URL` hardcoded (canonical per `API.md:3` is `http://localhost:8082` — sync backend 2026-09-09, port 8082, wrapper `{msg,status,data}`). Helpers `isWrappedResponse`/`normalizeSuccess`/`extractErrorMessage` unwrap `msg` for toast. **Belum ada `eventService.js`/`orderService.js` — perlu dibuat saat integrasi customer.**
- `API.md:1` — canonical REST contract. Status 2026-09-10: **Auth aktif**, **Customer spek lengkap (§8-13) siap untuk backend**, Admin/EO masih SCHEMA ONLY. Response `{msg,status,data}`, register `201`, JWT 24h, OTP 5min, reset code 15min, order expiry 15min.

## Routing
Centralized in `src/App.jsx:49`. Groups:
- Auth (`/`, `/register`, `/forgot-password`, `/otp`, `/forgot-password/reset`)
- Admin (`/admin/*` 7 routes, `/event-management` + alias `/admin/event-management`, `/admin/event/:id`, `/admin/users`, `/admin/users/:id`, `/admin/pengajuan-eo`, `/admin/transaksi`, `/admin/tiket`)
- EO (`/eo/dashboard`, `/eo/event`, `/eo/event/create`, `/eo/transaksi`, `/eo/transaksi/:id`, `/eo/refund`, `/eo/profil`)
- Customer (`/customer/dashboard`, `/customer/event/:id`, `/checkout/:id`, `/customer/ticket-success`, `/customer/tickets`, `/customer/refund`, `/customer/refund-list`) — **duplikat route terdeteksi** di `src/App.jsx:158-216`: `/customer/dashboard`, `/customer/event/:id`, `/checkout/:id`, `/customer/ticket-success`, `/customer/tickets`, `/customer/refund` didefinisikan 2× (React Router pakai entri terakhir, tidak error tapi perlu dirapikan). Belum ada `/customer/history`, `/customer/profile`, `/customer/refund/:id` padahal di-link dari `CustomerDashboard.jsx:199,204,210`, `NavbarCustomer.jsx:110,122`, `RefundList.jsx:41` (akan 404).

## Backend / Env
- No `.env` files, no env loading. Backend URL and Google Client ID are hardcoded strings — must be edited directly in `src/services/authService.js:12` and `src/App.jsx:42`.
- ngrok URL (`9538-...ngrok-free.app`) is ephemeral; expect it to be dead and need replacement. Canonical is now `http://localhost:8082`. `API_URL` di `authService.js:13` fallback ke ngrok lama — **ganti ke `http://localhost:8082/api/v1/auth` saat testing lokal**.
- `forgotPassword` and `resetPassword` both `POST` to the same endpoint `/reset-password` (`src/services/authService.js:402,478`) — differentiated by payload (`{email}` vs `{email, code, newPassword}`). Backend `ResetPasswordRequest` supports aliases `code`/`token`/`otp` + `newPassword`/`password`.
- JWT via `Authorization: Bearer <token>` (`API.md:7`). Only Auth endpoints are public; others return 401/403 with `{msg,status,data}` (`API.md:7`). `google.client-id` filled `875040780549-...apps.googleusercontent.com`.
- Customer endpoints (§8-13) design: `GET /api/v1/events?category=&search=&page=&size=`, `GET /api/v1/events/{id}`, `POST /api/v1/orders`, `GET /api/v1/tickets/me`, `GET /api/v1/orders/{id}/tickets`, `POST /api/v1/refunds`, `GET /api/v1/refunds`. Semua paginated, semua `{msg,status,data}`.

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
| 7 | `GET /api/v1/events` | 🎨 UI Done / Mock | ⏳ Spek siap — belum implement | `CustomerDashboard.jsx:33,102` 6 event hardcode |
| 8 | `GET /api/v1/events/featured` | 🎨 UI Done / Mock | ⏳ Spek siap | `CustomerDashboard.jsx:12` 3 hero |
| 9 | `GET /api/v1/events/{id}` | 🎨 UI Done / Mock | ⏳ Spek siap | `DetailEventCustomer.jsx:14` quantity lokal |
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

## State & Auth Flow
- Auth persistence: `localStorage` keys `token`, `userId`, `name`, `username`, `email`, `role` (`src/components/auth/Login.jsx:26`, `src/components/auth/Register.jsx:36`).
- OTP flow uses `sessionStorage` `otpEmail` + `otpFlow="register"` (`src/components/auth/Register.jsx:202`) and query param `?email=` on `/otp`.
- `login` accepts `identifier` (email if contains `@`, else username) — see `src/services/authService.js:274`.
- Google login sends `idToken` (credential) to `POST /google` (`src/services/authService.js:351`).
- Customer mock state (belum terhubung backend):
  - `CustomerDashboard.jsx:8,33` — `activeCategory` + `events` hardcode 6 item, `heroEvents` 3 item, `categoryMap` `Semua→ALL` etc., `handleBuyTicket` → `navigate(/customer/event/:id)`
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
- **Customer masih mock:** semua `src/components/customer/*.jsx` pakai data hardcode, belum fetch. Jangan demo ke backend tanpa ganti ke `fetch` + `Authorization` header. Timer checkout hardcode, bukan dari `expiredAt` backend.
- **Duplikat route** di `src/App.jsx:158-216` — bersihkan agar tidak bingung AI backend baca routing. Missing routes `/customer/history`, `/customer/profile`, `/customer/refund/:id` akan 404.
- **Belum ada service layer customer:** `src/services/` hanya `authService.js`. Saat integrasi buat `eventService.js`, `orderService.js`, `ticketService.js`, `refundService.js` dengan helper yang sama (`getResponseData`, `normalizeSuccess`, `extractErrorMessage`).
- **Enum mismatch risiko:** frontend `MUSIC FESTIVAL` (spasi) vs backend kemungkinan `MUSIC_FESTIVAL` (underscore) — sepakati di `API.md` §8-9 pakai display string dengan spasi.
