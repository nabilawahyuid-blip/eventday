# API.md - Eventday REST API Documentation

Base URL: `http://localhost:8082`

> **Status 2026-09-10:** Modul **Auth** aktif (port 8082, wrapper `{msg,status,data}`). Modul **Customer** sudah di-design di frontend (mock data) — spek di bawah adalah **KONTRAK UNTUK BACKEND** agar AI backend bisa langsung implement. Modul lain (Admin/EO) tetap SCHEMA ONLY.
> **Last Updated:** 2026-09-10 — sinkron dengan `src/App.jsx`, `src/components/customer/*`, `src/services/authService.js:12`.
> **Response Standard:** Semua API pakai format **`{msg, status, data}`** — `status` = HTTP code, `msg` = pesan, `data` = payload / `null`.

```json
// sukses
{"msg":"Login berhasil!","status":200,"data":{"userId":"...","name":"...","token":"eyJ..."}}
// error validasi
{"msg":"Email atau password salah!","status":400,"data":null}
// 401/403 dari Security
{"msg":"Unauthorized: token tidak ada atau tidak valid","status":401,"data":""}
{"msg":"Forbidden: akses ditolak","status":403,"data":""}
```

> Semua endpoint selain `/api/v1/auth/**` butuh `Authorization: Bearer <token>` (lihat §7).

---

## Daftar Endpoint Auth (Public)

| # | Method | Endpoint | Deskripsi | HTTP | Status Frontend | Status Backend |
|---|--------|----------|-----------|------|-----------------|----------------|
| 1 | POST | `/api/v1/auth/register` | Registrasi + kirim OTP | `201` sukses, `400` duplikat | ✅ Done — `Register.jsx:36` + `authService.js:84` terintegrasi | ✅ Live (port 8082) |
| 2 | POST | `/api/v1/auth/verify-otp` | Aktivasi akun | `200` | ✅ Done — `OTP.jsx` terintegrasi | ✅ Live |
| 3 | POST | `/api/v1/auth/resend-otp` | Kirim ulang OTP | `200` | ✅ Done — `OTP.jsx` terintegrasi | ✅ Live |
| 4 | POST | `/api/v1/auth/login` | Login email/username | `200` | ✅ Done — `Login.jsx:26` + `authService.js:262` | ✅ Live |
| 5 | POST | `/api/v1/auth/google` | Login Google GIS | `200` / `201` baru | ✅ Done — `Login.jsx` Google GIS | ✅ Live |
| 6 | POST | `/api/v1/auth/reset-password` | Lupa password 2 tahap | `200` | ✅ Done — `ForgotPassword.jsx` + `ResetPassword.jsx` | ✅ Live |

Alias legacy `POST /api/auth/**` juga permit.

> **Legenda Status Frontend (Auth):** ✅ Done = UI + `authService.js` sudah `fetch` + `Authorization` + error `msg` handling.

## Daftar Endpoint Customer (Protected - JWT)

| # | Method | Endpoint | Deskripsi | File Frontend | Status Frontend | Status Backend |
|---|--------|----------|-----------|---------------|-----------------|----------------|
| 7 | GET | `/api/v1/events` | List event dashboard + filter kategori/search | `CustomerDashboard.jsx:33,102` | 🎨 UI Done / Mock — 6 event hardcode, `categoryMap` `Semua→ALL` | ⏳ Spek siap — belum implement |
| 8 | GET | `/api/v1/events/featured` | Hero slider (opsional `?featured=true`) | `CustomerDashboard.jsx:12` | 🎨 UI Done / Mock — 3 hero hardcode | ⏳ Spek siap |
| 9 | GET | `/api/v1/events/{id}` | Detail event + lineup + tiket | `DetailEventCustomer.jsx:14` | 🎨 UI Done / Mock — `quantity` lokal, `TicketBox` Early Bird/Regular | ⏳ Spek siap |
| 10 | POST | `/api/v1/orders` | Checkout / buat pesanan | `Checkout.jsx:135` | 🎨 UI Done / Mock — `alert()` saja, `buyers[]` + timer `14:57` lokal | ⏳ Spek siap |
| 11 | GET | `/api/v1/orders` | Riwayat pesanan (history) | `NavbarCustomer.jsx:110` | ⚠️ UI Link ada, Page belum ada (`/customer/history` 404) | ⏳ Spek siap |
| 12 | GET | `/api/v1/orders/{id}` | Detail pesanan + status pembayaran | `Checkout.jsx:30` | 🎨 UI Done / Mock — `location.state` | ⏳ Spek siap |
| 13 | POST | `/api/v1/payments` | Bayar pesanan | `Checkout.jsx:135` | 🎨 UI Done / Mock — belum hit API | ⏳ Spek siap |
| 14 | GET | `/api/v1/tickets/me` | Tiket saya (MyTicket) | `MyTicket.jsx:9` | 🎨 UI Done / Mock — 3 tiket `used/unused/expired` | ⏳ Spek siap |
| 15 | GET | `/api/v1/tickets/{code}` | Detail tiket + QR | `TicketSuccess.jsx:9` | 🎨 UI Done / Mock — QR via `api.qrserver.com` | ⏳ Spek siap |
| 16 | GET | `/api/v1/orders/{orderId}/tickets` | Tiket per pesanan (TicketSuccess) | `TicketSuccess.jsx:9` | 🎨 UI Done / Mock — `TK-894-ABC` hardcode | ⏳ Spek siap |
| 17 | POST | `/api/v1/refunds` | Ajukan refund | `RefundRequest.jsx:33` | 🎨 UI Done / Mock — validasi bank enum BCA/BRI/BNI/Mandiri/CIMB/BSI | ⏳ Spek siap |
| 18 | GET | `/api/v1/refunds` | List refund milik customer | `RefundList.jsx:9` | 🎨 UI Done / Mock — 4 item `approved/pending/rejected` | ⏳ Spek siap |
| 19 | GET | `/api/v1/refunds/{id}` | Detail refund | `RefundList.jsx:40` | ⚠️ UI Link ada, Route belum ada (`/customer/refund/:id` 404) | ⏳ Spek siap |

> Base canonical `/api/v1/...`. Jika backend sudah terlanjur pakai `/api/events` tanpa `v1`, tetap support alias via `SecurityConfig` permit alias, tapi frontend akan hit `/api/v1`.
> Semua endpoint customer mengembalikan `{msg,status,data}` dan `401` bila token missing.

### Legenda Status Frontend (Customer)

| Badge | Arti | Tindak lanjut |
|---|---|---|
| ✅ Done | UI + service `fetch` + JWT sudah terhubung, siap demo ke backend | Tidak perlu ubah, tinggal pakai |
| 🎨 UI Done / Mock | UI jadi, data masih hardcode `useState` / `const`, belum `fetch` | Ganti hardcode → `fetch` + `Authorization: Bearer` (lihat §8-13 wiring) |
| ⚠️ UI Link ada, Page/Route belum ada | Tombol `navigate()` sudah ada tapi `App.jsx` belum ada `<Route>` | Tambah route dulu, baru integrasi API |
| 🔲 Belum ada | Belum ada UI maupun API | Buat dari nol |

### Ringkasan Status Frontend Customer Dashboard

| Area | Status FE | Catatan untuk AI Backend |
|---|---|---|
| Dashboard list & filter kategori/search | 🎨 Mock | `CustomerDashboard.jsx:118 filteredEvents` — ganti ke `GET /api/v1/events?category=&search=` |
| Dashboard hero slider | 🎨 Mock | `heroEvents[3]` — opsi `GET /api/v1/events/featured` atau `?featured=true` |
| Detail event + pilih tiket/qty | 🎨 Mock | `quantity` lokal — kirim `ticketTypeId+quantity` ke `POST /orders` |
| Checkout + timer 15m | 🎨 Mock | Timer hardcode `14*60+57` — ganti ke `expiredAt` dari `POST /orders` response |
| My Tickets | 🎨 Mock | `GET /api/v1/tickets/me` |
| Ticket Success + QR | 🎨 Mock | `GET /api/v1/orders/{id}/tickets` |
| Refund form & list | 🎨 Mock | `POST /api/v1/refunds` + `GET /api/v1/refunds` |
| History / Profile / Refund detail | ⚠️ 404 | Route belum ada di `App.jsx:158-216`, backend spek sudah siap tapi FE belum render |

---

## 1. Auth - Register

**POST** `/api/v1/auth/register` → `201`

### Request
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

Flow `AuthService.java:61`: cek duplikat `email/username/nik` → `save User` → `save Auth(INACTIVE)` → generate OTP 6-digit `app.otp.length=6` exp `5 menit` → `save otp` → `sendOtpEmail` (Mailtrap, gagal → log warn + OTP tetap di log) → `audit REGISTER`.

### Response `201`
```json
{
  "msg":"Registrasi berhasil! OTP telah dikirim ke email Anda.",
  "status":201,
  "data":{
    "message":"Registrasi berhasil! OTP telah dikirim ke email Anda.",
    "userId":"uuid",
    "name":"John Doe",
    "email":"john@example.com",
    "username":"johndoe_99",
    "role":"CUSTOMER",
    "token":null,
    "expiresIn":null
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

```bash
curl -X POST localhost:8082/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@mail.com","username":"john123","password":"123456"}'
# Network tab: Status 201, Response {msg, status:201, data:{...}}
```

> Setelah register, user **INACTIVE** — harus `verify-otp` dulu baru bisa login.

---

## 2. Auth - Verify OTP

**POST** `/api/v1/auth/verify-otp` → `200`

### Request
```json
{"email":"john@example.com","otpCode":"123456"}
```

### Response `200`
```json
{"msg":"OTP terverifikasi! Akun aktif, silakan login.","status":200,"data":null}
```
### Error `400`
```json
{"msg":"Kode OTP tidak valid!","status":400,"data":null}
{"msg":"Kode OTP sudah expired!","status":400,"data":null}
```

```bash
curl -X POST localhost:8082/api/v1/auth/verify-otp -H "Content-Type: application/json" -d '{"email":"john@mail.com","otpCode":"123456"}'
```

---

## 3. Auth - Resend OTP

**POST** `/api/v1/auth/resend-otp` → `200`

### Request
```json
{"email":"john@example.com"}
```

### Response `200`
```json
{"msg":"OTP baru berhasil dikirim ke email Anda!","status":200,"data":null}
```

```bash
curl -X POST localhost:8082/api/v1/auth/resend-otp -H "Content-Type: application/json" -d '{"email":"john@mail.com"}'
```

---

## 4. Auth - Login

**POST** `/api/v1/auth/login` → `200`

Support **email ATAU username ATAU identifier** + password. Backend `LoginRequest.java:6` `getIdentifier()` deteksi `contains("@")` → cari by email else username, fallback cross-check.

### Request varian
```json
{"email":"john@example.com","password":"123456"}
{"username":"johndoe_99","password":"123456"}
{"identifier":"johndoe_99","password":"123456"}
```

Flow `AuthService.java:124`: resolve identifier → `findByUserUserId` → `matches` → cek `status ACTIVE` else `Akun belum aktif!` → `jwtTokenProvider.generateToken(userId,email,role)` `86400000ms` → `update aksesToken/expiredToken/ACTIVE` → return.

### Response `200`
```json
{
  "msg":"Login berhasil!",
  "status":200,
  "data":{
    "message":"Login berhasil!",
    "userId":"uuid",
    "name":"John Doe",
    "email":"john@example.com",
    "username":"johndoe_99",
    "role":"CUSTOMER",
    "token":"eyJhbGciOiJIUzI1NiJ9...",
    "expiresIn":86400
  }
}
```
`data.expiresIn` detik (`86400` = 24 jam). Simpan `data.token` → header `Authorization: Bearer <token>`.

### Error `400`
```json
{"msg":"Email atau username harus diisi!","status":400,"data":null}
{"msg":"Email atau password salah!","status":400,"data":null}
{"msg":"Akun belum aktif! Silakan verifikasi OTP terlebih dahulu.","status":400,"data":null}
```

```bash
curl -X POST localhost:8082/api/v1/auth/login -H "Content-Type: application/json" -d '{"email":"john@mail.com","password":"123456"}'
# ambil token: data.token
TOKEN=$(curl -s -X POST localhost:8082/api/v1/auth/login -H "Content-Type: application/json" -d '{"email":"john@mail.com","password":"123456"}' | jq -r .data.token)
```

---

## 5. Auth - Google Login

**POST** `/api/v1/auth/google` → `200` (login) / `201` (registrasi baru)

Flow `AuthService.java:190`:
1. `GET https://oauth2.googleapis.com/tokeninfo?id_token=<idToken>` (RestTemplate)
2. cek `aud==google.client-id` (`875040780549-...apps.googleusercontent.com`), cek `exp`, `email_verified==true`
3. `findByEmail` → jika null buat `User(name,email,username auto dari email, role=CUSTOMER)`
4. `findByUserUserId` → jika null buat `Auth(password dummy BCrypt UUID, authGoogle=sub[0:20])` else update `authGoogle`
5. `generateToken()` → `aksesToken/expiredToken/ACTIVE` → `audit REGISTER_GOOGLE/LOGIN_GOOGLE`

### Request
```json
{"idToken":"eyJhbGciOiJSUzI1NiIs...Google ID Token..."}
```

### Response `200` / `201`
```json
{"msg":"Login via Google berhasil!","status":200,"data":{"message":"Login via Google berhasil!","userId":"...","name":"...","email":"...","username":"...","role":"CUSTOMER","token":"eyJ...","expiresIn":86400}}
{"msg":"Registrasi via Google berhasil!","status":201,"data":{...}}
```
Error `400` `{"msg":"Token Google tidak valid: ...","status":400,"data":null}`

```bash
curl -X POST localhost:8082/api/v1/auth/google -H "Content-Type: application/json" -d '{"idToken":"eyJ...GoogleIDToken"}'
```

**Frontend GIS:** `https://accounts.google.com/gsi/client` + `data-client_id=google.client-id` → `res.credential` → `POST /google` → `data.token`.

---

## 6. Auth - Reset Password (Lupa Password)

**POST** `/api/v1/auth/reset-password` — **single endpoint 2 tahap**.

*   **Tahap 1** `code` kosong → minta kode ke email
*   **Tahap 2** `code` terisi → verifikasi & ganti password

Backend `ResetPasswordRequest.java:8` support alias: `code` alias `token`/`otp`, `newPassword` alias `password`/`new_password`. `AuthService.java:302` pakai `getEffectiveCode()` trim.

### Tahap 1 - Minta Kode
```json
{"email":"john@example.com"}
```
Response `200`:
```json
{"msg":"Kode reset password berhasil dikirim ke email Anda!","status":200,"data":null}
```
Generate 6-digit `app.reset-password.code-length=6`, simpan `auth.reset_token` + `auth.reset_expired_at` exp `15 menit` (digabung ke `auth` sesuai mentor), kirim via `EmailService`.

```bash
curl -X POST localhost:8082/api/v1/auth/reset-password -H "Content-Type: application/json" -d '{"email":"john@mail.com"}'
```

### Tahap 2 - Reset Password
```json
{"email":"john@example.com","code":"123456","newPassword":"newPassword123"}
```
Juga valid: `{"email":"...","token":"123456","password":"..."}`
Response `200`:
```json
{"msg":"Password berhasil direset! Silakan login dengan password baru.","status":200,"data":null}
```
Error `400`:
```json
{"msg":"Password baru minimal 6 karakter","status":400,"data":null}
{"msg":"Kode reset password tidak valid/expired","status":400,"data":null}
```

```bash
curl -X POST localhost:8082/api/v1/auth/reset-password -H "Content-Type: application/json" -d '{"email":"john@mail.com","code":"123456","newPassword":"newPass123"}'
```

---

## 7. Middleware JWT & Protected Routes

Semua selain `/api/v1/auth/**` butuh JWT. `SecurityConfig.java:31` `STATELESS`.

`JwtAuthenticationFilter.java:23`: `Authorization: Bearer <token>` → `validate` → `getUserId/role` → cek `auth.status ACTIVE && aksesToken==token` → `SecurityContext ROLE_*` → `anyRequest.authenticated()`.

`SecurityConfig.java` kini return standard `msg/status/data` untuk `401/403`:

```json
// tanpa token
{"msg":"Unauthorized: token tidak ada atau tidak valid","status":401,"data":""}
// token salah/expired/inactive
{"msg":"Forbidden: akses ditolak","status":403,"data":""}
```

```bash
TOKEN=$(curl -s -X POST localhost:8082/api/v1/auth/login -H "Content-Type: application/json" -d '{"email":"john@mail.com","password":"123456"}' | jq -r .data.token)
curl localhost:8082/api/v1/events -H "Authorization: Bearer $TOKEN"
curl localhost:8082/api/events  # alias legacy -> 401 {msg, status:401} jika tanpa token
curl localhost:8082/ # -> 200 {msg, status:200, data:"OK"}
```

Config `application.properties`:
```properties
jwt.secret=eventday-super-secret-key-min-32-chars-change-in-production-123456
jwt.expiration-ms=86400000 # 24 jam -> data.expiresIn 86400
google.client-id=875040780549-1jq8bicaq1ne1ltjt7bfjcfjo82e5dj0.apps.googleusercontent.com
```

---

## 8. Customer - Events Catalog (Dashboard)

### GET `/api/v1/events` — List event untuk `CustomerDashboard.jsx`

**Auth:** `Bearer` required. Role `CUSTOMER` / `ORGANIZER` / `ADMIN` boleh akses, tapi frontend customer hanya butuh `CUSTOMER`.

**Query Params (semua opsional):**

| Param | Tipe | Deskripsi | Contoh |
|---|---|---|---|
| `category` | string | Filter kategori display. Mapping frontend `categoryMap` : `MUSIC FESTIVAL`,`CONFERENCE`,`EXHIBITION`,`CULINARY` . `Semua` = tanpa param. | `?category=MUSIC%20FESTIVAL` |
| `search` | string | Pencarian judul / venue / artis (frontend `navbar-search` input `CustomerDashboard.jsx:176`, `NavbarCustomer.jsx:70`) | `?search=Neon` |
| `location` | string | Filter lokasi (tombol `Jakarta, ID` — belum aktif, siapkan) | `?location=Jakarta` |
| `page` | int | Pagination 0-based, default `0` | `?page=0&size=12` |
| `size` | int | Page size, default `12` |  |
| `sort` | string | `latest` (default), `price_asc`, `price_desc`, `date_asc` | `?sort=latest` |
| `featured` | boolean | Jika `true` hanya event featured untuk hero slider | `?featured=true` |

**Response `200`:**
```json
{
  "msg": "Berhasil mengambil daftar event",
  "status": 200,
  "data": {
    "content": [
      {
        "id": 1,
        "title": "Neon Nights 2024",
        "category": "MUSIC FESTIVAL",
        "categoryLabel": "Musik",
        "date": "2024-08-15T19:00:00",
        "dateDisplay": "15 Aug 2024",
        "time": "19:00",
        "location": "Stadium Utama Gelora Bung Karno",
        "price": 500000,
        "priceDisplay": "Rp 500.000",
        "image": "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1000&q=80",
        "status": "AVAILABLE",
        "isFeatured": true
      }
    ],
    "page": 0,
    "size": 12,
    "totalElements": 42,
    "totalPages": 4
  }
}
```

> **Catatan untuk backend:**
> - Saat ini `CustomerDashboard.jsx:33` masih hardcode 6 event + 3 hero. Setelah endpoint hidup, ganti dengan `fetch('/api/v1/events')` + `fetch('/api/v1/events?featured=true')` atau `?sort=latest&size=3`.
> - `categoryMap` di `CustomerDashboard.jsx:110` harus sinkron dengan `event.category` di DB. Enum backend disarankan: `MUSIC_FESTIVAL`, `CONFERENCE`, `EXHIBITION`, `CULINARY` (simpan tanpa spasi, transform di API).
> - Harga di frontend `String` `Rp 500.000` — backend kirim `price` number + `priceDisplay` optional.
> - Pagination wajib — frontend akan render `empty-events` bila `content.length === 0`.

**Alternatif Hero:**

Opsi A (disarankan): `GET /api/v1/events/featured` → khusus 3 event hero.
Opsi B: `GET /api/v1/events?featured=true&size=3`

Response sama tapi `content` length 3, `isFeatured=true`.

```bash
curl -H "Authorization: Bearer $TOKEN" "localhost:8082/api/v1/events?category=MUSIC%20FESTIVAL&search=Neon&page=0&size=12"
curl -H "Authorization: Bearer $TOKEN" "localhost:8082/api/v1/events/featured"
```

**Error:**
```json
{"msg":"Unauthorized: token tidak ada atau tidak valid","status":401,"data":""}
```

### Frontend TODO wiring
```js
// src/services/eventService.js (belum ada, buat baru)
export const getEvents = (params, token) =>
  fetch(`http://localhost:8082/api/v1/events?${new URLSearchParams(params)}`, {
    headers: { Authorization: `Bearer ${token}` }
  }).then(r=>r.json()); // {msg,status,data}
```

---

## 9. Customer - Event Detail

### GET `/api/v1/events/{id}` — Detail `DetailEventCustomer.jsx`

**Auth:** `Bearer`

**Path:** `id` UUID atau integer (frontend `useParams().id` string, saat ini mock `id || 1`).

**Response `200`:**
```json
{
  "msg": "Berhasil mengambil detail event",
  "status": 200,
  "data": {
    "id": "1",
    "title": "Judul Event",
    "category": "MUSIC FESTIVAL",
    "categoryLabel": "Kategori Event",
    "date": "2027-02-02T20:00:00",
    "dateDisplay": "02 Februari 2027",
    "location": "Lokasi/Venue Event",
    "description": "Lorem ipsum dolor sit amet ...",
    "image": "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1400&q=85",
    "status": "AVAILABLE",
    "statusLabel": "Tersedia",
    "lineup": [
      {"name": "Bintang Tamu", "image": ""},
      {"name": "Bintang Tamu", "image": ""},
      {"name": "Bintang Tamu", "image": ""}
    ],
    "tickets": [
      {
        "id": "ticket_type_1",
        "name": "Early Bird",
        "label": "Presale",
        "price": 200000,
        "priceDisplay": "Rp 200.000",
        "quota": 100,
        "remaining": 42,
        "saleStart": "2027-01-01T00:00:00",
        "saleEnd": "2027-01-31T23:59:59"
      },
      {
        "id": "ticket_type_2",
        "name": "Regular",
        "label": "Regular",
        "price": 300000,
        "priceDisplay": "Rp 300.000",
        "quota": 200,
        "remaining": 150
      }
    ]
  }
}
```

**Mapping ke frontend `DetailEventCustomer.jsx:14-49`:**
- `event.tickets.earlyBird.price` → `data.tickets[0].price` (backend array, frontend sekarang object `earlyBird`/`regular`). Backend pakai array agar extensible; frontend akan map `tickets[0]` → Early Bird, `tickets[1]` → Regular.
- `event.lineup` → `data.lineup`
- `quantity` state `DetailEventCustomer.jsx:12` — belum kirim ke backend, hanya lokal. Saat `Beli Tiket` → `navigate(/checkout/:id)` bawa `quantity` + `selectedTicketId` via `location.state` atau query `?qty=2&ticketTypeId=xxx`.

**Error `404`:**
```json
{"msg":"Event tidak ditemukan","status":404,"data":null}
```

```bash
curl -H "Authorization: Bearer $TOKEN" localhost:8082/api/v1/events/1
```

---

## 10. Customer - Orders / Checkout

### POST `/api/v1/orders` — Buat pesanan `Checkout.jsx:135`

**Auth:** `Bearer` (CUSTOMER). Backend ambil `userId` dari JWT, jangan dari body.

**Request:**
```json
{
  "eventId": "1",
  "ticketTypeId": "ticket_type_1",
  "quantity": 2,
  "buyers": [
    {"name": "Adit Ramadhan", "email": "adit@mail.com", "nik": "3201234567890123"},
    {"name": "Adam", "email": "adam@mail.com", "nik": "3201234567890124"}
  ]
}
```

| Field | Validasi |
|---|---|
| eventId | required, must exist, `status AVAILABLE/PUBLISHED` |
| ticketTypeId | required, must belong to event |
| quantity | required, `1..5` (atau sesuai kebijakan), `quantity === buyers.length` |
| buyers[].name | required, max 100 |
| buyers[].email | required, `@Email` |
| buyers[].nik | required, `^\d{16}$`, unique per event (cegah duplikat NIK di event sama) |

**Flow backend:**
1. Validasi event & ticketType quota `remaining >= quantity`
2. Hitung `ticketTotal = price * quantity`, `adminFee = 5000` (konstanta, bisa config `app.fee.admin=5000`), `totalPayment = ticketTotal + adminFee`
3. Buat `orders` (atau `bookings`) `status=PENDING`, `expiredAt = now + 15 menit` (sesuai timer `Checkout.jsx:10` `14*60+57`)
4. Kurangi `remaining` (optimistic lock / `SELECT FOR UPDATE`)
5. Audit `ORDER_CREATED`

**Response `201`:**
```json
{
  "msg": "Pesanan berhasil dibuat, selesaikan pembayaran dalam 15 menit",
  "status": 201,
  "data": {
    "orderId": "ORD-987654",
    "orderCode": "#ORD-987654",
    "eventId": "1",
    "eventTitle": "Konser Musik Akbar 2024",
    "eventDate": "02 Februari 2027, 20:00 WIB",
    "eventLocation": "Stadion Utama GBK, Senayan, Jakarta",
    "ticketTypeId": "ticket_type_1",
    "ticketName": "Early Bird",
    "quantity": 2,
    "price": 200000,
    "ticketTotal": 400000,
    "adminFee": 5000,
    "totalPayment": 405000,
    "status": "PENDING",
    "expiredAt": "2027-02-02T20:15:00",
    "buyers": [
      {"name":"Adit Ramadhan","email":"adit@mail.com","nik":"3201234567890123"},
      {"name":"Adam","email":"adam@mail.com","nik":"3201234567890124"}
    ]
  }
}
```

**Error:**
```json
{"msg":"Stok tiket tidak mencukupi","status":400,"data":null}
{"msg":"NIK sudah terdaftar untuk event ini","status":400,"data":null}
{"msg":"Event tidak ditemukan","status":404,"data":null}
```

```bash
curl -X POST localhost:8082/api/v1/orders \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"eventId":"1","ticketTypeId":"ticket_type_1","quantity":2,"buyers":[{"name":"Adit","email":"adit@mail.com","nik":"3201234567890123"},{"name":"Adam","email":"adam@mail.com","nik":"3201234567890124"}]}'
```

### GET `/api/v1/orders` — Riwayat pesanan (untuk `Riwayat` / `History`)

Query `?page=0&size=10&status=PENDING` optional.

Response `200` `data.content` array order summary (same shape tanpa buyers).

### GET `/api/v1/orders/{id}` — Detail pesanan

Response `200` same as POST `data`.

---

## 11. Customer - Payments

### POST `/api/v1/payments` atau `POST /api/v1/orders/{orderId}/pay`

Dua opsi — pilih salah satu dan konsisten. Frontend `Checkout.jsx:135` saat ini hanya `alert`, belum hit API. Rekomendasi:

**POST** `/api/v1/payments` dengan body `{"orderId":"ORD-987654","method":"VIRTUAL_ACCOUNT_BCA"}`

atau **POST** `/api/v1/payments/pay/{orderId}` (sesuai schema-only `API.md:306`).

**Request:**
```json
{"orderId":"ORD-987654","method":"VIRTUAL_ACCOUNT","bank":"BCA"}
```

**Response `200`:**
```json
{
  "msg":"Pembayaran berhasil",
  "status":200,
  "data":{
    "orderId":"ORD-987654",
    "paymentStatus":"PAID",
    "paidAt":"2027-02-02T20:05:00",
    "ticketsGenerated":2
  }
}
```

> Setelah `PAID`, backend generate `ticket_items` 2 row dengan `code` unik `TK-894-ABC` etc., `status UNREDEEMED`, QR data = `code`. Frontend akan redirect ke `/customer/ticket-success` yang kemudian fetch `GET /api/v1/orders/{orderId}/tickets`.

---

## 12. Customer - Tickets

### GET `/api/v1/tickets/me` — Tiket Saya `MyTicket.jsx:9`

**Auth:** `Bearer`

**Query:** `?status=UNREDEEMED|REDEEMED|EXPIRED` optional, `page,size`

**Response `200`:**
```json
{
  "msg":"Berhasil mengambil tiket saya",
  "status":200,
  "data":{
    "content":[
      {
        "id":1,
        "code":"TK-894-ABC",
        "title":"Neon Nights 2024",
        "category":"MUSIC FESTIVAL",
        "image":"https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=900&q=85",
        "date":"2024-08-15T19:00:00",
        "dateDisplay":"15 Aug 2024 • 19:00",
        "location":"Stadium Utama Gelora Bung Karno",
        "status":"UNREDEEMED",
        "statusLabel":"Belum Di Gunakan",
        "statusType":"unused",
        "orderId":"ORD-987654"
      },
      {
        "id":3,
        "code":"TK-896-ABC",
        "title":"Taste of Nusantara",
        "category":"EXHIBITION",
        "image":"https://...",
        "dateDisplay":"05 Oct 2024 • 10:00",
        "location":"JIExpo Kemayoran",
        "status":"EXPIRED",
        "statusLabel":"Tiket Expired",
        "statusType":"expired"
      }
    ],
    "page":0,"size":10,"totalElements":3
  }
}
```

Mapping:
- `statusType` frontend: `used` → `REDEEMED`, `unused` → `UNREDEEMED`, `expired` → `EXPIRED`.
- `MyTicket.jsx:45` `handleDetailTicket` → `navigate(/customer/ticket-success?ticket=${id})` → sebaiknya `GET /api/v1/tickets/{code}`.

### GET `/api/v1/tickets/{code}` — Detail per tiket

```json
{
  "msg":"Berhasil mengambil detail tiket",
  "status":200,
  "data":{
    "code":"TK-894-ABC",
    "name":"Adit Ramadhan",
    "ticketType":"Early Bird",
    "paymentStatus":"Lunas",
    "usageStatus":"Belum Di Gunakan",
    "qrData":"TK-894-ABC",
    "qrUrl":"https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=TK-894-ABC",
    "event":{"title":"Judul Event","date":"02 Februari 2027, 20:00","location":"Lokasi/Venue Event"},
    "orderId":"ORD-987654"
  }
}
```

### GET `/api/v1/orders/{orderId}/tickets` — Tiket per pesanan `TicketSuccess.jsx:9`

Response `200` `data` = `{ orderId, event, tickets: [ {code,name,ticketType,paymentStatus,usageStatus}, ... ] }`

```json
{
  "msg":"Tiket berhasil diterbitkan",
  "status":200,
  "data":{
    "orderId":"ORD-987654",
    "event":{"title":"Judul Event","date":"02 Februari 2027, 20:00","location":"Lokasi/Venue Event"},
    "tickets":[
      {"code":"TK-894-ABC","name":"Adit Ramadhan","ticketType":"Early Bird","paymentStatus":"Lunas","usageStatus":"Belum Di Gunakan"},
      {"code":"TK-895-ABC","name":"Adam","ticketType":"Early Bird","paymentStatus":"Lunas","usageStatus":"Belum Di Gunakan"}
    ]
  }
}
```

`TicketSuccess.jsx:33` `qrUrl = https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${code}` — backend cukup kirim `code`, QR generate di frontend atau via `qrUrl`.

---

## 13. Customer - Refunds

### POST `/api/v1/refunds` — Ajukan refund `RefundRequest.jsx:33`

**Auth:** `Bearer`

**Request:**
```json
{
  "orderId":"ORD-987654",
  "ticketCode":"TK-894-ABC",
  "name":"Adit Ramadhan",
  "bankAccountName":"Adit Ramadhan",
  "accountNumber":"1234567890",
  "bankName":"BCA",
  "reason":"Berhalangan hadir karena sakit"
}
```

| Field | Validasi |
|---|---|
| orderId | required, milik user |
| ticketCode | required jika refund per-tiket, optional jika per-order |
| name | required |
| bankAccountName | required |
| accountNumber | required, numeric `8-16` |
| bankName | required, enum `BCA,BRI,BNI,Mandiri,CIMB,BSI` (`RefundRequest.jsx:196`) |
| reason | required, min 10 |

**Response `201`:**
```json
{
  "msg":"Pengajuan refund berhasil dikirim",
  "status":201,
  "data":{
    "refundId":1,
    "orderId":"ORD-987654",
    "status":"PENDING",
    "statusLabel":"Pending",
    "createdAt":"2027-02-03T10:00:00"
  }
}
```

Error `400` `{"msg":"Tiket sudah digunakan tidak bisa refund","status":400,"data":null}`

### GET `/api/v1/refunds` — List refund `RefundList.jsx:9`

**Auth:** `Bearer` — hanya milik user (filter `where userId = JWT`)

**Query:** `?page&size&status=PENDING|APPROVED|REJECTED`

**Response `200`:**
```json
{
  "msg":"Berhasil mengambil daftar refund",
  "status":200,
  "data":{
    "content":[
      {"id":1,"title":"Judul Event","date":"2024-08-15T19:00:00","dateDisplay":"15 Aug 2024 • 19:00 (Waktu Pengajuan)","status":"APPROVED","statusLabel":"Disetujui","statusType":"approved"},
      {"id":2,"title":"Judul Event","dateDisplay":"16 Aug 2024 • 19:00 (Waktu Pengajuan)","status":"PENDING","statusLabel":"Pending","statusType":"pending"},
      {"id":3,"status":"REJECTED","statusLabel":"Ditolak","statusType":"rejected"}
    ],
    "page":0,"size":10,"totalElements":4
  }
}
```

Mapping `statusType` : `APPROVED->approved`, `PENDING->pending`, `REJECTED->rejected`.

### GET `/api/v1/refunds/{id}` — Detail refund

```json
{
  "msg":"Berhasil mengambil detail refund",
  "status":200,
  "data":{
    "id":1,
    "orderId":"ORD-987654",
    "orderCode":"#ORD-987654",
    "title":"Judul Event",
    "ticketType":"2x Early Bird",
    "name":"Adit Ramadhan",
    "ticketName":"2x Tiket Early Bird",
    "total":400000,
    "bankAccountName":"Adit Ramadhan",
    "accountNumber":"1234567890",
    "bankName":"BCA",
    "reason":"Berhalangan hadir",
    "status":"PENDING",
    "statusLabel":"Pending",
    "createdAt":"2024-08-16T19:00:00",
    "decidedAt":null,
    "refundAmount":null
  }
}
```

> Frontend `RefundList.jsx:41` `navigate(/customer/refund/${id})` — route ini belum ada di `App.jsx` (hanya `/customer/refund` tanpa param). Backend spek siap, frontend perlu tambah route `/customer/refund/:id` nanti.

---

## ⏳ Modul Lain — SCHEMA ONLY (belum aktif)

| Modul | Rencana Endpoint | Status | HTTP |
|---|---|---|---|
| Admin Events | `POST /api/v1/admin/events`, `PUT /api/v1/admin/events/{id}` | DB ready | `401/403` dengan `{msg,status,data}` |
| EO Events | `POST /api/v1/eo/events`, `GET /api/v1/eo/events/me` | DB ready | `401/403` |
| Orders | `POST /api/v1/orders` (customer sudah spek di atas) | Spek siap | `401` tanpa token |
| Payments | `POST /api/v1/payments/pay/{orderId}` (legacy) | Spek siap | `401` |
| Tickets scan | `POST /api/v1/tickets/scan/{ticketItemId}` | DB ready | `401/403` |
| Settings | `GET/PUT /api/v1/settings/**` | DB ready | `401/403` |
| Audit | `GET /api/v1/audit/**` | hanya log internal | `401/403` |

`RescheduleRequest` **dihapus** — jangan panggil.

---

## Error Format Global (sudah rapi)

`dto/ApiResponse.java:10` `GlobalExceptionHandler.java:10` + `SecurityConfig.java:33` — semua return `{msg,status,data}`:

*   Validasi `@Valid` → `400` `{"msg":"username: Username 3-20 karakter","status":400,"data":null}`
*   `RuntimeException` → `400`
*   `AuthenticationException` → `401`
*   `AccessDeniedException` → `403`
*   `Exception` → `500`
*   Sukses → `200` / `201` (register/google baru/order/refund)

Network tab Chrome/Fetch: cek `Response` → `msg` untuk toast, `status` untuk branching, `data` untuk payload. `HomeController.java:10` juga sudah `{msg,status:200,data:"OK"}`.

---

## Enum

*   `User.role`: `CUSTOMER` (default) / `ORGANIZER` / `ADMIN`
*   `Auth.status`: `INACTIVE` / `ACTIVE`
*   `events.status`: `DRAFT` / `PUBLISHED` / `CANCELLED` / `COMPLETED` (tampilkan `AVAILABLE` di API sebagai alias `PUBLISHED`)
*   `events.category`: `MUSIC_FESTIVAL` / `CONFERENCE` / `EXHIBITION` / `CULINARY` (API kirim display `MUSIC FESTIVAL` dst)
*   `orders.status`: `PENDING` / `PAID` / `EXPIRED` / `CANCELLED`
*   `ticket_items.status`: `UNREDEEMED` / `REDEEMED` / `EXPIRED`
*   `refund_requests.status`: `PENDING` / `APPROVED` / `REJECTED`
*   `payments.status`: `UNPAID` / `PAID` / `FAILED`
*   Lain schema-only: `organizers.verification_status UNVERIFIED`, `bookings/orders PENDING`

---

## Flow Diagram Frontend (pakai `.data`)

```
register {name,email,username,password} --201 {msg,status:201,data} OTP--> verify-otp {email,otpCode} --200 {msg,status:200}--> login {identifier,password} --200 {msg,status:200,data.token}--> simpan data.token
                                                                                                            |
google GIS idToken ------------------------POST /google --200/201 {msg,status,data.token}----------------+
                                                                                                            |
lupa password: POST /reset-password {email} --200 {msg}--email code--> POST /reset-password {email,code,newPassword} --200 {msg}--> login baru

CUSTOMER FLOW (setelah login, Bearer token):
  GET /events?category=&search=  --> CustomerDashboard grid + hero
  GET /events/{id}               --> DetailEventCustomer (pilih qty + ticketType)
  POST /orders {eventId,ticketTypeId,quantity,buyers} --201 {orderId} --> Checkout timer 15m
  POST /payments {orderId} --200 PAID --> GET /orders/{id}/tickets --> TicketSuccess (QR per ticket.code)
  GET /tickets/me                --> MyTicket (filter unused/used/expired)
  POST /refunds {orderId,reason,bank...} --201 --> GET /refunds --> RefundList
  GET /refunds/{id}              --> Detail refund
```

DB: `users --1:1-- auth (hash+googleId+token+resetToken) --1:N-- otp` (`password_reset_tokens` dihapus, digabung ke `auth`)
Customer: `events --1:N-- ticket_types --1:N-- ticket_items --N:1-- orders --1:N-- refunds` ; `orders --1:N-- order_buyers (name,email,nik)`

---

## Notes Frontend (copy-paste ready dengan `msg/status/data`)

```js
// helper fetch standar (sudah ada di authService.js:23 getResponseData + normalizeSuccess)
async function api(path, body, token){
  const res = await fetch(`http://localhost:8082${path}`, {
    method: body ? 'POST' : 'GET',
    headers:{'Content-Type':'application/json', ...(token&&{Authorization:`Bearer ${token}`})},
    body: body ? JSON.stringify(body) : undefined
  });
  const json = await res.json(); // {msg, status, data}
  if(!res.ok) throw new Error(json.msg); // tampilkan json.msg di toast
  return json; // pakai json.data
}

// contoh customer
const token = localStorage.getItem('token');
const ev = await api('/api/v1/events?category=MUSIC%20FESTIVAL', null, token); // ev.data.content
const detail = await api('/api/v1/events/1', null, token); // detail.data.tickets
const order = await api('/api/v1/orders', {eventId:"1",ticketTypeId:"ticket_type_1",quantity:2,buyers:[{name,email,nik}]}, token); // order.data.orderId
const tickets = await api(`/api/v1/orders/${order.data.orderId}/tickets`, null, token);
const myTickets = await api('/api/v1/tickets/me', null, token);
const refund = await api('/api/v1/refunds', {orderId, bankName, accountNumber, reason}, token);
```

1. Base `http://localhost:8082`, `Content-Type: application/json` selalu.
2. Cek `json.status` (bukan `res.status` saja) & `json.msg` untuk notifikasi.
3. Register `201` → langsung ke form OTP.
4. Login `200` → `data.token` + `data.expiresIn`.
5. Tanpa token → `401/403` dengan `msg` yang sama — redirect ke login.
6. `CORS *` sudah allow, `maxAge 3600`, `allowCredentials true` — aman untuk ngrok.
7. OTP `5 menit`, Reset code `15 menit`, JWT `24 jam`, Order expiry `15 menit`.
8. `ApiLoggingFilter.java:10` log tiap hit: `[API HIT] POST /api/v1/auth/login -> 200 (45ms)`.
9. Customer endpoints semua paginated `?page&size` — default `page 0 size 12` untuk list, `size 10` untuk tickets/refunds.
10. Harga selalu number (IDR tanpa desimal), frontend format `Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR"})` atau `Rp. ${n.toLocaleString("id-ID")}` (lihat `Checkout.jsx:70`, `DetailEventCustomer.jsx:58`).
```

