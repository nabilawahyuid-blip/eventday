# API.md - Eventday REST API Documentation

> **Status dokumen: 2026-09-30.** Revisi ini menambahkan §10-§14 yang documenting seluruh permukaan
> endpoint yang **dipanggil frontend sekarang** (Admin, EO, Organizer, Checkout, Payment, Refund,
> Profile). Revisi sebelumnya hanya mendokumentasikan Auth + Customer Event Catalog dan menandai sisanya
> "SCHEMA ONLY" — itu sudah tidak akurat, karena FE sudah memanggil semuanya.
>
> **Aturan pembacaan:** bagian yang bertanda ✅ punya kontrak backend yang terverifikasi (ditulis ulang
> dari spesifikasi Java aslinya). Bagian bertanda ⚠️ **belum diverifikasi terhadap backend** — ini
> rekonstruksi dari kode frontend `src/services/*.js`, dipakai supaya tidak ada endpoint yang "dokumentasi
> tapi tidak ada". Perlakukan sebagai **kontrak yang harus dikonfirmasi backend**, bukan fakta.

Base URL lokal: `http://localhost:8082` · Tunnel: `VITE_NGROK_URL` / `VITE_API_URL` (lihat `AGENTS.md`)

> **Response Standard:** Semua API memakai format **`{msg, status, data}`** — `status` = HTTP code,
> `msg` = pesan, `data` = payload / `null`.

```json
// sukses auth (token via Set-Cookie HttpOnly, tidak di JSON)
{"msg":"Login berhasil!","status":200,"data":{"userId":"...","name":"...","role":"CUSTOMER","expiresIn":86400}}
// error
{"msg":"Email atau password salah!","status":400,"data":null}
// 401/403 dari Security
{"msg":"Unauthorized: token tidak ada atau tidak valid","status":401,"data":""}
{"msg":"Forbidden: akses ditolak","status":403,"data":""}
```

## ⚠️ Catatan penting tentang cara FE memanggil

Ini yang paling sering jadi sumber bug, dan tidak konsisten antar-service:

- **Hanya `authService.js` yang meng-unwrap response.** Semua service lain memakai `apiFetch`
  (`src/services/api.js:113`) yang mengembalikan wrapper `{msg,status,data}` **mentah**. Jadi
  `const d = (await getAdminEvents()).data` — **bukan** `await getAdminEvents()` langsung.
- Semua request `apiFetch` mengirim `credentials: "include"` dan path **relatif** (`/api/...`) → lewat
  Vite proxy. Header `Authorization: Bearer <localStorage.token>` ditambahkan sebagai fallback, tapi
  karena backend menyembunyikan token via `@JsonIgnore`, `localStorage.token` praktis **tidak pernah ada**.
  Kebenaran autentikasi ada di **HttpOnly cookie `access_token`**.
- Endpoint export (`*/export`) **tidak** bisa lewat `apiFetch` — response-nya binary/CSV. Semua export
  melewati `src/services/downloadExport.js`.
- Frontend sengaja memakai prefix **`/api/...`**, bukan `/api/v1/...`. Backend mengizinkan alias legacy.

---

# Daftar Endpoint

## Auth (Public) ✅

| # | Method | Endpoint | Dipakai oleh | HTTP |
|---|--------|----------|--------------|------|
| 1 | POST | `/api/auth/register` | `authService.register` | `201` sukses, `400` duplikat |
| 2 | POST | `/api/auth/verify-otp` | `authService.verifyOtp` | `200` |
| 3 | POST | `/api/auth/resend-otp` | `authService.resendOtp` | `200` |
| 4 | POST | `/api/auth/login` | `authService.login` | `200` |
| 5 | POST | `/api/auth/google` | `authService.loginGoogle` | `200` / `201` baru |
| 6 | POST | `/api/auth/reset-password` | `authService.forgotPassword` + `.resetPassword` (2 tahap, 1 endpoint) | `200` |

Alias `/api/v1/auth/**` juga permit.

## Customer — Event Catalog (Protected) ✅

| # | Method | Endpoint | Dipakai oleh | HTTP |
|---|--------|----------|--------------|------|
| 7 | GET | `/api/events` | `eventService.getEvents` | `200` |
| 8 | GET | `/api/events/featured` | `eventService.getFeaturedEvents` | `200` |
| 9 | GET | `/api/events/{id}` | `eventService.getEventDetail`, `organizerEventService.getPublicEventDetail` | `200` / `404` |
| 10 | GET | `/api/events/categories` | `organizerEventService.getEventCategories` | `200` |

## Customer — Ticket, Transaksi, Refund, Profile (Protected) ⚠️

Rekonstruksi dari FE. Kontrak **belum diverifikasi** — konfirmasi ke backend sebelum dianggap final.

| # | Method | Endpoint | Service | Catatan |
|---|--------|----------|---------|---------|
| 11 | GET | `/api/transactions/history` | `ticketService.getTransactionHistory` | Dipakai `TransaksiCustomer`, `MyTicket`. **Tidak dipaginasi** — FE memfilter sendiri |
| 12 | GET | `/api/tickets/my-tickets` | `ticketService.getMyTicketsAuth` | Tanpa query = pakai session |
| 13 | GET | `/api/tickets/my-tickets?userEmail=` | `ticketService.getMyTickets` | Versi lama berbasis email |
| 14 | GET | `/api/tickets/issued-detail?ticketCode=&userEmail=` | `ticketService.getTicketDetail` | Mengembalikan QR + attendee |
| 15 | GET | `/api/tickets/by-order/{orderId}` | `ticketService.getTicketsByOrder` | Endpoint yang benar untuk detail tiket satu order |
| 16 | POST | `/api/tickets/scan` | `ticketService.scanTicket` | ⚠️ **Nol pemanggil** — dead export |
| 17 | GET | `/api/tickets/refund/refund-history` | `refundService.getRefundHistory` | Prefix `/tickets/`, bukan `/refund/` — bukan typo FE |
| 18 | GET | `/api/user/profile` | `profileService.getProfile` | Dipakai 5 halaman |
| 19 | PUT | `/api/user/profile/save` | `profileService.updateProfile` | Body `{name, phone, nik}` |
| 20 | POST | `/api/user/avatar` | `profileService.uploadAvatar` | `multipart/form-data` field `file` |
| 21 | POST | `/api/user/logout` | `profileService.logoutUser` | Menghapus cookie server |
| 22 | PUT | `/api/account/change-password` | `profileService.changePassword` | `{oldPassword, newPassword}` |
| 23 | GET | `/api/refund/banks` | `refundService.getRefundBanks` | Dipakai form pengajuan refund |
| 24 | GET | `/api/refund/order-summary?orderId=` | `refundService.getRefundOrderSummary` | **Dipanggil N+1** dari `RefundList` |
| 25 | GET | `/api/refund/refund-detail/info?refundId=` | `refundService.getRefundDetail` | |
| 26 | GET | `/api/refund/refund-detail/download-proof?refundId=` | `refundService.getRefundProof` | ⚠️ **Nol pemanggil** — dead export |
| 27 | POST | `/api/refund/submit` | `refundService.submitRefund` | `{orderId, reason, bankCode, accountNumber, accountHolderName}` |

## Checkout & Payment (Protected) ⚠️

Dipakai `customer/Checkout.jsx`. Alur Midtrans Snap lengkap, sudah live.

| # | Method | Endpoint | Service | Catatan |
|---|--------|----------|---------|---------|
| 28 | POST | `/api/checkout/initiate` | `checkoutService.initiateCheckout` | `{tierId, quantity}` → balikan order + `expiredAt` (countdown Checkout) |
| 29 | POST | `/api/checkout/attendees` | `checkoutService.saveAttendees` | `{orderId, attendees[]}` — data pembeli per kuantitas |
| 30 | POST | `/api/checkout/calculation` | `checkoutService.calcCheckout` | `{tierId, quantity, discountAmount}` — fallback kalau summary gagal |
| 31 | GET | `/api/checkout/summary?orderId=` | `checkoutService.getCheckoutSummary` | Sumber total yang otoritatif |
| 32 | POST | `/api/checkout/process` | `checkoutService.processCheckout` | ⚠️ **Nol pemanggil** — order bisa menggantung `PENDING` |
| 33 | POST | `/api/payments/charge` | `paymentService.chargePayment` | `{orderId, grossAmount, customerName, customerEmail}` → `snapToken` |
| 34 | GET | `/api/payments/verify?orderId=&transactionId=` | `paymentService.verifyPayment` | Dipanggil setelah `onSuccess` Snap |

> **Bug flow yang belum tertutup:** karena `processCheckout` tidak pernah dipanggil, tidak ada lock
> `WAITING_PAYMENT`. Kalau user menutup popup Midtrans, order tetap `PENDING` dan Checkout menampilkan
> "Menunggu Pembayaran".

## Admin (Protected - role ADMIN) ⚠️

Semua prefix `/api/admin/**`, satu file service per fitur.

### Dashboard ⚠️
| Method | Endpoint | Service |
|--------|----------|---------|
| GET | `/api/admin/dashboard/metrics` | `adminDashboardService.getAdminDashboardMetrics` |
| GET | `/api/admin/dashboard/recent-events` | `getAdminRecentEvents` (punya fallback tolerant) |
| GET | `/api/admin/dashboard/recent-transactions` | `getAdminRecentTransactions` (fallback tolerant) |

### Event ⚠️
| Method | Endpoint | Service | Catatan |
|--------|----------|---------|---------|
| GET | `/api/admin/events?status&category&organizerId&dateFrom&dateTo&search&page&size` | `adminEventService.getAdminEvents` | |
| GET | `/api/admin/events/{id}` | `getAdminEventDetail` | |
| GET | `/api/admin/events/{id}/sales` | `getAdminEventSales` | |
| POST | `/api/admin/events` | `createAdminEvent` | **`multipart`** (`event` = Blob JSON + `file`). FE fallback otomatis ke JSON polos kalau backend balas `content-type not supported` |
| PUT | `/api/admin/events/{id}` | `updateAdminEvent` | Multipart, fallback JSON sama seperti di atas |
| PATCH | `/api/admin/events/{id}/approve` | `approveAdminEvent` | Dipakai `DetailEvent` |
| PATCH | `/api/admin/events/{id}/reject` | `rejectAdminEvent` | Body `{rejectionReason}` |
| PATCH | `/api/admin/events/{id}/status` | `updateAdminEventStatus` | **Alias legacy.** Hanya dipakai `TambahEvent` sebagai fallback auto-publish. Hapus setelah migrasi selesai |
| DELETE | `/api/admin/events/{id}` | `deleteAdminEvent` | Soft delete (FE memperlakukan `DELETED` sebagai status) |
| GET | `/api/admin/events/export` | `exportAdminEvents` | Lewat `downloadExport.js` |

### User ⚠️
| Method | Endpoint | Service |
|--------|----------|---------|
| GET | `/api/admin/users?role=` | `adminUserService.getAdminUsers` |
| GET | `/api/admin/users/{id}` | `getAdminUserDetail` |
| PATCH | `/api/admin/users/{id}/status` | `updateAdminUserStatus` — body `{status}` |
| PATCH | `/api/admin/users/{id}/suspend` | `suspendAdminUser` — tanpa body |

### EO Application ⚠️
| Method | Endpoint | Service | Catatan |
|--------|----------|---------|---------|
| GET | `/api/admin/eo-applications?status=` | `adminEoService.getEoApplications` | `status` = `UNVERIFIED` / `VERIFIED` / `REJECTED` |
| GET | `/api/admin/eo-applications/{id}` | `getEoApplicationDetail` | |
| PATCH | `/api/admin/eo-applications/{id}/status` | `updateEoApplicationStatus` | `{status, rejectionReason}` |
| GET | `/api/admin/eo-applications/{id}/documents/company-deed` | `getCompanyDeedDocument` | Balikan `{documentUrl}`, FE `window.open` |
| GET | `/api/admin/eo-applications/{id}/documents/company-deed/download` | `downloadCompanyDeedDocument` | ⚠️ **Nol pemanggil** di UI |

### Ticket ⚠️
| Method | Endpoint | Service | Catatan |
|--------|----------|---------|---------|
| GET | `/api/admin/tickets?eventId&status&userId&dateFrom&dateTo&page&size` | `adminTicketService.getAdminTickets` | |
| GET | `/api/admin/tickets/{id}` | `getAdminTicketDetail` | |
| GET | `/api/admin/tickets/inventory?eventId=` | `getAdminTicketInventory` | Param `eventId` ada tapi FE selalu memanggil tanpa argumen |
| POST | `/api/admin/tickets/generate` | `generateAdminTickets` | `{orderId}` |
| POST | `/api/admin/tickets/{id}/checkin` | `checkinAdminTicket` | Fallback otomatis ke `PUT` kalau `405` |
| POST | `/api/admin/tickets/{id}/revoke` | `revokeAdminTicket` | Fallback ke `PUT` juga |
| GET | `/api/admin/tickets/export` | `exportAdminTickets` | Lewat `downloadExport.js` |

### Transaksi ⚠️
| Method | Endpoint | Service | Catatan |
|--------|----------|---------|---------|
| GET | `/api/admin/transactions?status&eventId&userId&dateFrom&dateTo&minAmount&maxAmount&page&size` | `adminTransactionService.getAdminTransactions` | |
| GET | `/api/admin/transactions/{id}` | `getAdminTransactionDetail` | |
| PATCH | `/api/admin/transactions/{id}/status` | `updateAdminTransactionStatus` | `{status, adminNote}` — **FE tidak pernah mengirim `adminNote`** |
| GET | `/api/admin/transactions/export` | `exportAdminTransactions` | Lewat `downloadExport.js` |

### Payout ⚠️
| Method | Endpoint | Service | Catatan |
|--------|----------|---------|---------|
| GET | `/api/admin/payouts?status=` | `adminPayoutService.getAdminPayouts` | ⚠️ Backend apparently **share tabel `refund_requests`**. FE menyaring di client baris yang `organizerId` null |
| GET | `/api/admin/payouts/{id}` | `getAdminPayoutDetail` | |
| PATCH | `/api/admin/payouts/{id}/status` | `updateAdminPayoutStatus` | `{status, adminNote}` |
| GET | `/api/admin/payouts/{id}/documents/reconciliation` | `getPayoutReconciliation` | |

> **Risiko numerik:** `DetailPengajuanPayout.jsx:234` jatuh ke fee platform hardcode **5%** kalau backend
> tidak mengirim field fee. Di layar finansial ini bisa menampilkan nominal bersih yang salah.
> **Pastikan backend selalu mengirim fee.**

### Audit Log & Settings ⚠️
| Method | Endpoint | Service | Catatan |
|--------|----------|---------|---------|
| GET | `/api/admin/audit-logs?page&size` | `adminAuditService.getAdminAuditLogs` | FE memanggil `size:100` lalu memfilter sendiri |
| GET | `/api/admin/audit-logs/export` | `exportAdminAuditLogs` | ⚠️ **Nol pemanggil** |
| GET | `/api/admin/audit-logs/export/csv` | `exportAdminAuditLogsCSV` | JSON-wrapped CSV (bukan binary). FE punya fallback CSV builder client-side |
| GET | `/api/admin/settings/general` | `adminSettingsService.getAdminGeneralSettings` | |
| PUT | `/api/admin/settings/general` | `updateAdminGeneralSettings` | FE kirim `{appName, contactEmail, adminFee, orderExpiryMinutes}` |
| POST | `/api/admin/settings/upload-logo` | `uploadAdminPlatformLogo` | `multipart` field `file` |

> **⚠️ Dua field tidak pernah terkirim:** `PengaturanPlatform.jsx` meng-edit `mataUang` dan `zonaWaktu`
> tapi keduanya tidak ada di payload PUT. Saat ini UI mengedit setting yang diam-diam tidak disimpan.

## Organizer / EO (Protected - role ORGANIZER) ⚠️

### Dashboard ⚠️
| Method | Endpoint | Service |
|--------|----------|---------|
| GET | `/api/organizer/dashboard` | `organizerDashboardService.getOrganizerDashboard` — ⚠️ **Nol pemanggil** |
| GET | `/api/organizer/dashboard/metrics` | `getOrganizerDashboardMetrics` |
| GET | `/api/organizer/dashboard/recent-events` | `getOrganizerRecentEvents` |
| GET | `/api/organizer/dashboard/recent-transactions` | `getOrganizerRecentTransactions` |

> **Peringatan kontrak:** `DashboardEO.jsx` membaca metric dengan key **snake_case** (`active_events`,
> `total_revenue`, `tickets_sold`) tanpa fallback camelCase. Kalau backend konsisten mengembalikan
> `activeEvents` / `totalRevenue` / `ticketsSold`, semua kartu statistik EO akan tampil **0**.

### Event ⚠️
| Method | Endpoint | Service | Catatan |
|--------|----------|---------|---------|
| GET | `/api/organizer/events` | `organizerEventService.getOrganizerEvents` | |
| GET | `/api/organizer/events/draft` | `getOrganizerDraftEvents` | Dipanggil **bersamaan** dengan list di atas → draft bisa tampil 2× |
| GET | `/api/organizer/events/{id}` | `getOrganizerEventDetail` | |
| GET | `/api/organizer/events/{id}/sales-summary` | `getOrganizerEventSalesSummary` | Consumed `tickets_sold`. **N+1** dari `EventEO` |
| GET | `/api/organizer/events/{id}/payout-balance` | `organizerPayoutService.getOrganizerEventPayoutBalance` | **N+1** dari `PengajuanPayoutEO` |
| POST | `/api/organizer/events` | `createOrganizerEvent` | |
| PUT | `/api/organizer/events/update/{id}` | `updateOrganizerEvent` | ⚠️ **Bukan RESTful** — `update/` di path, dan `eventId` ikut di body. Jangan "rapikan" tanpa cek backend |
| POST | `/api/organizer/events/publish` | `publishOrganizerEvent` | |
| POST | `/api/organizer/events/banner` | `uploadOrganizerEventBanner` | `multipart` field `file` |
| POST | `/api/organizer/events/lineup-image` | `uploadOrganizerLineupImage` | `multipart` field `file` |

> **Bug kategori:** `AddEvent.jsx` punya fallback list yang memuat `ENTERTAINMENT`, `TECHNOLOGY`,
> `SEMINAR_WORKSHOP`, `COMMUNITY`. Keempatnya **tidak valid** (§Enum) → backend `Category.valueOf` →
> `400 No enum constant`. `constants/categories.js` sudah menyediakan `VALID_CATEGORIES` +
> `normalizeCategoryForBackend` untuk merapikan, tapi tidak dipakai di halaman itu.

### Registrasi & Dokumen ⚠️
| Method | Endpoint | Service | Catatan |
|--------|----------|---------|---------|
| POST | `/api/organizer/register` | `organizerRegisterService.registerOrganizer` | `multipart`: `organizer_name`, `npwp_number`, `bank_name`, `bank_account_number` |
| POST | `/api/organizer/documents/upload` | `uploadOrganizerDocument` | `multipart`: `file` + `documentType` (`PORTFOLIO` / `AKTA_PERUSAHAAN`) |
| GET | `/api/organizer/profile/document` | `organizerProfileService.getOrganizerProfileDocuments` | |

### Profil ⚠️
| Method | Endpoint | Service |
|--------|----------|---------|
| GET | `/api/organizer/profile` | `organizerProfileService.getOrganizerProfile` |
| PUT | `/api/organizer/profile` | `updateOrganizerProfile` |
| POST | `/api/organizer/profile/avatar` | `uploadOrganizerAvatar` — `multipart` |
| POST | `/api/organizer/profile/upload-portfolio` | `uploadOrganizerPortfolio` — `multipart` |
| POST | `/api/organizer/profile/upload-deed` | `uploadOrganizerDeed` — `multipart` |

> **Bug avatar:** `ProfileEO.jsx` membaca avatar dari `data.avatar_url` tanpa lewat `resolveBannerUrl()`.
> Kalau backend mengembalikan path relatif `/uploads/...`, gambar rusak di luar dev proxy.
> Bandingkan `EditProfileCustomer.jsx` yang malah menyimpan base64 data-URI ke `localStorage`.

### Transaksi, Refund, Payout, Auth ⚠️
| Method | Endpoint | Service | Catatan |
|--------|----------|---------|---------|
| GET | `/api/organizer/refunds` | `organizerRefundService.getOrganizerRefunds` | |
| GET | `/api/organizer/refunds/detail?id=` | `getOrganizerRefundDetail` | `id` di **query**, bukan path |
| PATCH | `/api/organizer/refunds/{id}/status` | `updateOrganizerRefundStatus` | `{status}` |
| GET | `/api/organizer/payouts` | `organizerPayoutService.getOrganizerPayouts` | |
| GET | `/api/organizer/payouts/detail?id=` | `getOrganizerPayoutDetail` | ⚠️ **Nol pemanggil** |
| POST | `/api/organizer/payouts` | `createOrganizerPayout` | |
| GET | `/api/organizer/bank-accounts` | `getOrganizerBankAccounts` | Dipakai form payout, `is_primary` menentukan default |
| POST | `/api/organizer/auth/logout` | `organizerAuthService.logoutOrganizer` | **Hanya** dipanggil `SidebarEO.jsx` |
| POST | `/api/organizer/auth/change-password` | `organizerProfileService.changeOrganizerPassword` | `{oldPassword, newPassword}` |

> **Tidak ada endpoint detail transaksi EO.** `DetailTransaksiEO.jsx` mengambil list
> `/dashboard/recent-transactions` lalu `.find()` di client. Transaksi lama tidak bisa dibuka.

## Legacy / Unused ⚠️

Tidak dipanggil frontend mana pun. Ada untuk GSA, atau sisa integrasi Django.

| Method | Endpoint | Service |
|--------|----------|---------|
| GET | `/home/hero-banner` | `homeSearchService.getHeroBanners` |
| GET | `/home/event-card?page&size` | `homeSearchService.getHomeEventCards` |
| GET | `/home/locations` | `homeSearchService.getLocations` |
| GET | `/search/results?...` | `homeSearchService.searchEvents` |
| GET | `/search/locations` | `homeSearchService.getSearchLocations` |
| GET | `/search/categories` | `homeSearchService.getSearchCategories` |

> Catatan: `homeSearchService` **tidak** memakai prefix `/api`. Kalau diaktifkan, path-nya perlu
> `/home/...` langsung ke origin backend atau via proxy terpisah.

---

# Detail Endpoint (terverifikasi)

Bagian ini berasal dari spesifikasi Java aslinya dan **tidak berubah** dari revisi sebelumnya.

## 1. Auth - Register

**POST** `/api/v1/auth/register` → `201`

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "username": "johndoe_99",
  "phone": "08123456789",
  "password": "secret123",
  "role": "CUSTOMER",
  "nik": "3201234567890123"
}
```
| Field | Required | Validasi |
|---|---|---|
| name | Yes | max 100 |
| email | Yes | `@Email`, unique |
| username | Yes | `3-20`, `^[a-zA-Z0-9_]+$`, unique |
| phone | No | max 15 |
| password | Yes | min 6, di-BCrypt ke `auth.password` |
| role | No | `CUSTOMER`/`ORGANIZER`/`ADMIN`, fallback `CUSTOMER` |
| nik | No | `^\d{16}$`, unique |

Flow `AuthService.java:61`: cek duplikat `email/username/nik` → `save User` → `save Auth(INACTIVE)` →
generate OTP 6-digit (`app.otp.length=6`, exp `5 menit`) → `save otp` → `sendOtpEmail` (Mailtrap, gagal →
log warn + OTP tetap di-log) → `audit REGISTER`.

### Response `201`
```json
{
  "msg":"Registrasi berhasil! OTP telah dikirim ke email Anda.",
  "status":201,
  "data":{
    "message":"Registrasi berhasil! OTP telah dikirim ke email Anda.",
    "userId":"uuid","name":"John Doe","email":"john@example.com",
    "username":"johndoe_99","role":"CUSTOMER","token":null,"expiresIn":null
  }
}
```
### Error `400`
```json
{"msg":"Email sudah terdaftar!","status":400,"data":null}
{"msg":"Username sudah terdaftar!","status":400,"data":null}
{"msg":"NIK sudah terdaftar!","status":400,"data":null}
{"msg":"name: Nama tidak boleh kosong, username: Username 3-20 karakter","status":400,"data":null}
```

> Setelah register, user **INACTIVE** — harus `verify-otp` dulu baru bisa login.

---

## 2. Auth - Verify OTP

**POST** `/api/v1/auth/verify-otp` → `200`

```json
{"email":"john@example.com","otpCode":"123456"}
```
```json
{"msg":"OTP terverifikasi! Akun aktif, silakan login.","status":200,"data":null}
```
Error `400`: `"Kode OTP tidak valid!"` / `"Kode OTP sudah expired!"`

> **Perilaku FE yang tidak sesuai:** untuk flow `otpFlow === "forgot-password"`, `OTP.jsx` **tidak
> memanggil endpoint ini sama sekali** — hanya menaruh kode di `sessionStorage` lalu meneruskan ke
> `/forgot-password/reset`. Verifikasi 100% diserahkan ke `POST /reset-password` tahap 2.

---

## 3. Auth - Resend OTP

**POST** `/api/v1/auth/resend-otp` → `200`

```json
{"email":"john@example.com"}
```
```json
{"msg":"OTP baru berhasil dikirim ke email Anda!","status":200,"data":null}
```

> Tidak ada cooldown di FE — endpoint bisa di-hit berulang.

---

## 4. Auth - Login

**POST** `/api/v1/auth/login` → `200`

Support **email ATAU username** + password. Backend `LoginRequest.java:6` `getIdentifier()` deteksi
`contains("@")` → cari by email else username, fallback cross-check.

```json
{"email":"john@example.com","password":"123456"}
{"username":"johndoe_99","password":"123456"}
{"identifier":"johndoe_99","password":"123456"}
```

Flow `AuthService.java:124`: resolve identifier → `findByUserUserId` → `matches` → cek `status ACTIVE` else
`Akun belum aktif!` → `jwtTokenProvider.generateToken(userId,email,role)` `86400000ms` → update
`aksesToken/expiredToken/ACTIVE`.

### Response `200` — **Token TIDAK muncul di JSON (HttpOnly Cookie)**
```json
{
  "msg":"Login berhasil!",
  "status":200,
  "data":{
    "message":"Login berhasil!",
    "userId":"uuid","name":"John Doe","email":"john@example.com",
    "username":"johndoe_99","role":"CUSTOMER","expiresIn":86400
  }
}
```
`Set-Cookie: access_token=eyJhbG...; Path=/; HttpOnly; Max-Age=86400; SameSite=Lax` — token **tidak ada di
`data.token`** (hidden via `@JsonIgnore`). Request selanjutnya kirim otomatis via `Cookie: access_token` atau
manual `Authorization: Bearer <token>` (filter support keduanya, `JwtAuthenticationFilter.java:32`).

Error `400`:
```json
{"msg":"Email atau username harus diisi!","status":400,"data":null}
{"msg":"Email atau password salah!","status":400,"data":null}
{"msg":"Akun belum aktif! Silakan verifikasi OTP terlebih dahulu.","status":400,"data":null}
```

---

## 5. Auth - Google Login

**POST** `/api/v1/auth/google` → `200` (login) / `201` (registrasi baru)

Flow `AuthService.java:190`:
1. `GET https://oauth2.googleapis.com/tokeninfo?id_token=<idToken>` (RestTemplate)
2. cek `aud==google.client-id` (`875040780549-...apps.googleusercontent.com`), cek `exp`,
   `email_verified==true`
3. `findByEmail` → jika null buat `User(name,email,username auto dari email, role=CUSTOMER)`
4. `findByUserUserId` → jika null buat `Auth(password dummy BCrypt UUID, authGoogle=sub[0:20])` else
   update `authGoogle`
5. `generateToken()` → `aksesToken/expiredToken/ACTIVE` → `audit REGISTER_GOOGLE/LOGIN_GOOGLE`

```json
{"idToken":"eyJhbGciOiJSUzI1NiIs...Google ID Token..."}
```
```json
{"msg":"Login via Google berhasil!","status":200,"data":{"message":"...","userId":"...","name":"...","email":"...","username":"...","role":"CUSTOMER","expiresIn":86400}}
{"msg":"Registrasi via Google berhasil!","status":201,"data":{...}}
```
Error `400` `{"msg":"Token Google tidak valid: ...","status":400,"data":null}`

---

## 6. Auth - Reset Password (Lupa Password)

**POST** `/api/v1/auth/reset-password` — **single endpoint 2 tahap**.

* **Tahap 1** `code` kosong → minta kode ke email
* **Tahap 2** `code` terisi → verifikasi & ganti password

Backend `ResetPasswordRequest.java:8` support alias: `code` alias `token`/`otp`, `newPassword` alias
`password`/`new_password`. `AuthService.java:302` pakai `getEffectiveCode()` trim.

**Tahap 1** `{"email":"john@example.com"}` → `200`
```json
{"msg":"Kode reset password berhasil dikirim ke email Anda!","status":200,"data":null}
```
Generate 6-digit (`app.reset-password.code-length=6`), simpan `auth.reset_token` +
`auth.reset_expired_at` exp `15 menit`, kirim via `EmailService`.

**Tahap 2** `{"email":"...","code":"123456","newPassword":"newPassword123"}` → `200`
```json
{"msg":"Password berhasil direset! Silakan login dengan password baru.","status":200,"data":null}
```
Error `400`: `"Password baru minimal 6 karakter"` / `"Kode reset password tidak valid/expired"`

---

## 7. Middleware JWT & Protected Routes

Semua selain `/api/v1/auth/**` butuh JWT. `SecurityConfig.java:31` `STATELESS`.
`JwtAuthenticationFilter.java:23`: `Authorization: Bearer <token>` → `validate` → `getUserId/role` → cek
`auth.status ACTIVE && aksesToken==token` → `SecurityContext ROLE_*` → `anyRequest.authenticated()`.

Config `application.properties`:
```properties
jwt.secret=eventday-super-secret-key-min-32-chars-change-in-production-123456
jwt.expiration-ms=86400000 # 24 jam -> data.expiresIn 86400
google.client-id=875040780549-1jq8bicaq1ne1ltjt7bfjcfjo82e5dj0.apps.googleusercontent.com
```

> **Tidak ada route guard di FE.** `App.jsx` merender semua halaman tanpa cek role/sesi; tiap halaman
> baru 401 di `useEffect`-nya sendiri setelah render. Guard role hanya di sisi client pada 3 komponen
> dan bisa dilewati dengan mengedit `localStorage.role`. Penegakan role yang sesungguhnya hanya di backend.

---

## 8. Customer - Events Catalog (Dashboard)

### GET `/api/v1/events`

**Auth:** JWT wajib. Role `CUSTOMER` / `ORGANIZER` / `ADMIN` boleh akses.

| Param | Tipe | Deskripsi | Default | Contoh |
|---|---|---|---|---|
| `category` | string | Filter kategori. `Semua` = tanpa param | all | `?category=MUSIC_FESTIVAL` |
| `search` | string | Pencarian judul / venue | — | `?search=Neon` |
| `location` | string | Filter lokasi/venue | — | `?location=Jakarta` |
| `page` | int | Pagination 0-based | `0` | `?page=0&size=12` |
| `size` | int | Page size | `12` | |
| `sort` | string | `latest` (default), `price_asc`, `price_desc`, `date_asc` | `latest` | `?sort=latest` |

```json
{
  "msg": "Berhasil mengambil daftar event",
  "status": 200,
  "data": {
    "content": [
      {
        "id":"uuid","title":"Neon Nights 2024","category":"MUSIC_FESTIVAL","categoryLabel":"Musik",
        "date":"2026-12-15T19:00:00","dateDisplay":"15 Dec 2026","time":"19:00",
        "location":"Stadion Utama GBK","price":200000,"priceDisplay":"Rp 200.000",
        "image":"https://images.unsplash.com/photo-...","status":"AVAILABLE","isFeatured":true
      }
    ],
    "page":0,"size":12,"totalElements":42,"totalPages":4
  }
}
```

> **Notes:**
> - `price` = harga terendah dari semua tier event.
> - `status` `PUBLISHED` ditampilkan sebagai `AVAILABLE`.
> - Frontend render `empty-events` bila `content.length === 0`.
> - **Bug FE:** `CustomerDashboard.jsx` mengirim `size: 100` lalu melakukan "pagination" sendiri di client.
>   Halaman admin juga fetch `size: 20` → praktis hanya 20 record terbaru yang terjangkau.

---

## 9. Customer - Event Detail

### GET `/api/v1/events/{id}`

**Auth:** JWT. **Path:** `id` UUID event.

```json
{
  "msg": "Berhasil mengambil detail event",
  "status": 200,
  "data": {
    "id":"uuid","title":"Neon Nights 2024","category":"MUSIC_FESTIVAL","categoryLabel":"Musik",
    "date":"2026-12-15T19:00:00","dateDisplay":"15 Desember 2026",
    "location":"Stadion Utama GBK","description":"Festival musik elektronik terbesar...",
    "image":"https://images.unsplash.com/photo-...","status":"PUBLISHED","statusLabel":"Tersedia",
    "facilities":["Parkir Luas","Wifi Gratis","Food Court"],
    "lineup":[{"name":"Bintang Tamu","image":""}],
    "tickets":[
      {"id":"uuid-tier","name":"Early Bird","label":"Early Bird","price":200000,
       "priceDisplay":"Rp 200.000","quota":100,"remaining":42,
       "saleStart":"2026-10-01T00:00:00","saleEnd":null},
      {"id":"uuid-tier","name":"Regular","label":"Regular","price":300000,
       "priceDisplay":"Rp 300.000","quota":200,"remaining":150}
    ]
  }
}
```

**Mapping ke frontend:**
- `event.tickets[]` → `TicketBox` accordion di `DetailEventCustomer.jsx`
- `event.lineup` → daftar bintang tamu (FE menerima **array objek** `{name,image}` **atau** string comma)
- `event.facilities` → list string (dipisah dari kolom `facility` TEXT, delimiter koma)
- `quantity` state lokal → `navigate(/checkout/:id)` bawa `{eventId, eventTitle, ticketId, quantity, ...}`

Error `404` `{"msg":"Event tidak ditemukan","status":404,"data":null}`

> **Bug FE:** `DetailEventCustomer.jsx` jatuh ke `FALLBACK_EVENT` (data lorem ipsum, "Bintang Tamu",
> Early Bird/Regular) saat request gagal **atau `tickets` kosong** — sehingga harga palsu bisa dibeli.

---

# Error Format Global ✅

`dto/ApiResponse.java:10` + `GlobalExceptionHandler.java:10` + `SecurityConfig.java:33` — semua return
`{msg,status,data}`:

* Validasi `@Valid` → `400` `{"msg":"username: Username 3-20 karakter","status":400,"data":null}`
* `RuntimeException` → `400`
* `AuthenticationException` → `401`
* `AccessDeniedException` → `403`
* `Exception` → `500`
* Sukses → `200` / `201` (register/google baru)

Network tab Chrome/Fetch: cek `Response` → `msg` untuk toast, `status` untuk branching, `data` untuk
payload. `HomeController.java:10` juga sudah `{msg,status:200,data:"OK"}`.

---

# Enum ✅

* `User.role`: `CUSTOMER` (default) / `ORGANIZER` / `ADMIN`
* `Auth.status`: `INACTIVE` / `ACTIVE`
* `events.status`: `DRAFT` / `PUBLISHED` / `CANCELLED` / `COMPLETED` (API kirim `AVAILABLE` sebagai alias `PUBLISHED`; FE juga menangani `DELETED` dari soft-delete admin)
* `events.category`: **`MUSIC_FESTIVAL` / `CONFERENCE` / `EXHIBITION` / `CULINARY` saja** — backend pakai `Category.valueOf` strict
* `orders.status`: `PENDING` / `PAID` / `EXPIRED` / `CANCELLED`
* `ticket_items.status`: `UNREDEEMED` / `REDEEMED` / `EXPIRED` — FE juga menangani `USED`, `CHECKED_IN`, `REVOKED`, `REFUNDED`
* `refund_requests.status`: `PENDING` / `APPROVED` / `REJECTED`
* `organizers.verification_status`: `UNVERIFIED` / `VERIFIED` / `REJECTED`
* `bookings`: `PENDING`

> **Peringatan kategori — bug yang sudah terbukti.** Backend menolak nilai di luar 4 enum di atas
> dengan `400 No enum constant Category.X`.Fg nevertheless ada kode yang mengirim nilai lain:
> `eo/AddEvent.jsx` (fallback list) dan `customer/CustomerDashboard.jsx` (chip filter) memakai
> `ENTERTAINMENT`, `TECHNOLOGY`, `SEMINAR_WORKSHOP`, `COMMUNITY` → **4 dari 9 chip kategori di dashboard
> customer mengembalikan 400**. Sumber kebenaran ada di `src/constants/categories.js`
> (`VALID_CATEGORIES`, `categoryLabel`, `normalizeCategoryForBackend`).

---

# Flow Diagram Frontend

```
register {name,email,username,password} --201 {msg,status:201,data} OTP--> verify-otp {email,otpCode} --200--> login {identifier,password} --200 + Set-Cookie access_token--> Cookie HttpOnly
                                                                                                     |
google GIS idToken ------------------------POST /google --200/201 + Set-Cookie------------------------+
                                                                                                     |
lupa password: POST /reset-password {email} --200--> email code --> POST /reset-password {email,code,newPassword} --200--> login baru

CUSTOMER FLOW (setelah login, Cookie HttpOnly):
  GET /events?category=&search=  --> CustomerDashboard grid + hero
  GET /events/featured            --> Hero slider (3 event)
  GET /events/{id}               --> DetailEventCustomer (pilih tier + qty)
  POST /checkout/initiate        --> orderId + expiredAt (countdown)
  POST /checkout/attendees       --> data pembeli
  GET  /checkout/summary         --> total otoritatif
  POST /payments/charge          --> snapToken --> window.snap.pay()
  GET  /payments/verify          --> sukses --> /customer/ticket-success
                                     [TIDAK ADA processCheckout → order bisa menggantung PENDING]

EO FLOW (role ORGANIZER):
  /organizer/dashboard/metrics|recent-events|recent-transactions  --> DashboardEO
  /organizer/events (+ /draft)                                     --> EventEO [N+1 sales-summary]
  /organizer/events/update/{id}  (path non-RESTful)                --> EditEventEO
  /organizer/refunds (+ /detail?id=)                               --> RefundEO
  /organizer/payouts + /organizer/bank-accounts + /events/{id}/payout-balance --> PengajuanPayoutEO [N+1]

ADMIN FLOW (role ADMIN):
  /admin/dashboard/metrics|recent-events|recent-transactions       --> DashboardAdmin
  /admin/events (+ /approve, /reject, /status, /export)            --> EventManagement, DetailEvent, EditEvent
  /admin/users (+ /status, /suspend)                               --> UserManagement, DetailUser
  /admin/eo-applications (+ /status, /documents/company-deed)      --> PengajuanAkunEO
  /admin/tickets (+ /inventory, /generate, /checkin, /revoke, /export) --> Tiket
  /admin/transactions (+ /status, /export)                         --> Transaksi
  /admin/payouts (+ /status, /documents/reconciliation)            --> PengajuanPayout
  /admin/audit-logs (+ /export/csv)                                --> AuditLog
  /admin/settings/general (+ /upload-logo)                         --> PengaturanPlatform
```

DB: `users --1:1-- auth (hash+googleId+token+resetToken) --1:N-- otp` (`password_reset_tokens` dihapus,
digabung ke `auth`)

---

# Catatan Praktis untuk Developer

1. **Base URL tidak di-hardcode di FE.** Semua path relatif `/api/...` → lewat Vite proxy →
   `VITE_NGROK_URL`. Ganti target cukup ubah `.env`, tidak perlu edit kode.
2. **`apiFetch` tidak meng-unwrap.** `const d = (await getAdminEvents()).data`. `authService` berbeda —
   sudah meng-unwrap sendiri.
3. **Jangan edit `src/services/api.js`.** Untuk endpoint export, tambah ke `downloadExport.js`.
4. **Selalu `credentials: 'include'`.** Tanpa itu cookie `access_token` tidak terkirim dan semua
   request jadi `401`.
5. Header `ngrok-skip-browser-warning` **wajib** di proxy (`vite.config.js:38`). Tanpa itu ngrok free-tier
   mengembalikan halaman interstitial `ERR_NGROK_6024`, bukan JSON.
6. **CORS** `*` allow, `maxAge 3600`, `allowCredentials true` — aman untuk ngrok.
7. Timing: OTP `5 menit`, reset code `15 menit`, JWT `24 jam`.
8. `ApiLoggingFilter.java:10` log tiap hit: `[API HIT] POST /api/v1/auth/login -> 200 (45ms)`.
9. Customer events paginated `?page&size` — default `page 0 size 12`.
10. Harga number IDR, format `Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR"})`.
11. Gambar `/uploads/*` **harus** lewat proxy yang sama — `<img>`/`background-image` tidak bisa mengirim
    header custom, jadi akses langsung ke ngrok akan kena interstitial. `src/utils/bannerUrl.js`
   entonang helper ini; di mode production path relatif digabung dengan `VITE_API_URL`.

---

# Yang Masih Perlu Dikonfirmasi ke Backend

- Kontrak §10-§14 seluruhnya (Admin, Organizer, Checkout, Payment, Refund, Profile, Ticket) — ditandai ⚠️
  karena direkonstruksi dari FE, bukan dari spesifikasi backend.
- **Naming konvensi:** metric EO `snake_case` vs `camelCase` (lihat catatan di §Organizer Dashboard).
- **Field `fee` pada `/api/admin/payouts/{id}`** — pastikan selalu dikirim, jangan sampai FE jatuh ke
  fallback 5% yang hardcode.
- **Field `adminNote`** pada update status transaksi & payout — FE punya parameter tapi tidak pernah
  mengirimnya, jadi catatan audit admin saat ini tidak terekam.
- **Endpoint detail transaksi EO** — tidak ada; `DetailTransaksiEO` harus `.find()` dari list recent.
- **`/api/admin/payouts` dan `/api/admin/eo-applications` apparently berbagi tabel `refund_requests`** —
  perlu konfirmasi supaya bisa dihapus workaround client-side-nya.
- **`RescheduleRequest` sudah dihapus** — jangan panggil.
