# BACKEND_CHECKLIST.md — untuk tim backend Eventday

> Status: 2026-10-01. Daftar ini disusun dari audit sisi frontend (`C:\Users\KOPIKO\eventday`,
> branch `tiket`). Setiap item menyertakan lokasi kode frontend yang terdampak, kode yang
> sebenarnya dipanggil, dan apa yang perlu diubah/dikonfirmasi di sisi backend.

---

## BLOKER — konfirmasi sebelum rilis

### 1. Abaikan field `role` pada `POST /api/auth/register`
- FE: `src/services/authService.js:140-151` mengirim body
  `{ name, username, email, phone, password, nik, role }` dengan `role` default `"CUSTOMER"`
  (`src/components/auth/Register.jsx:195`).
- **Risiko:** bila DTO backend mengikat `role` apa adanya, siapa pun bisa mendaftar sebagai
  `ADMIN` hanya dengan mengubah satu field request. **Pastikan server mengabaikan field ini
  dan selalu membuat user CUSTOMER** (atau tolak request yang menyertakannya).

### 2. Pastikan SEMUA endpoint `/api/admin/**` dan `/eo/**` menegakkan role
- FE: `src/App.jsx:68-321` — **tidak ada route guard sama sekali**. Semua route
  `/admin/*`, `/eo/*`, `/customer/*` dirender untuk pengunjung anonim; satu-satunya
  pertahanan adalah 401/403 dari backend per endpoint.
- **Risiko:** satu controller yang lupa `@PreAuthorize` = kebocoran data penuh. Audit seluruh
  controller admin/organizer.

### 3. Rotasi `jwt.secret` yang ter-commit di repo
- `API.md:473` memuat `jwt.secret=eventday-super-secret-key-...` dalam plaintext.
- Bila nilai itu (atau pernah) menjadi secret live, **siapa pun dengan akses repo bisa menempa
  JWT role apa pun**. Rotasi secret-nya, pindahkan ke secret store, dan hapus dari file +
  riwayat git.

---

## Kontrak rusak (FE memanggil, BE belum tentu menyediakan)

### 4. `POST /api/checkout/process` tidak pernah dipanggil siapa pun
- FE: `src/services/checkoutService.js:27` — export `processCheckout` punya **nol pemanggil**.
- Akibat: order bisa menggantung `PENDING` selamanya ("Menunggu Pembayaran" tanpa jalan keluar).
  Konfirmasi ke tim FE apakah endpoint ini memang alur yang benar, atau alur mana yang
  menggantikannya.

### 5. Enum `Category` strict — hanya 4 nilai valid
- Valid: `MUSIC_FESTIVAL`, `CONFERENCE`, `EXHIBITION`, `CULINARY`
  (`src/constants/categories.js:5-10`, backend `Category.valueOf`).
- FE (sisi EO) mengirim 4 nilai invalid: `TECHNOLOGY`, `ENTERTAINMENT`, `SEMINAR_WORKSHOP`,
  `COMMUNITY` — `src/components/eo/AddEvent.jsx:107-131,390`,
  `src/components/eo/EditEventEO.jsx:88-109,413`, dan sebagai query `?category=`
  dari `src/components/customer/CustomerDashboard.jsx:20-30,312-315`.
- Bila backend tetap strict, 4 dari 9 chip kategori di dashboard customer selalu 400.
  Putuskan: tambah enum di backend, atau FE dibatasi ke 4 nilai valid.

### 6. Endpoint kirim email e-ticket belum terkonfirmasi
- FE mencoba `POST /api/tickets/send-email` lalu fallback
  `POST /api/orders/{id}/resend-ticket` (`src/services/ticketService.js:56-97`).
- Tidak ada di `API.md`. Konfirmasi endpoint mana yang benar (atau buatkan), supaya badge
  "e-ticket terkirim" bisa muncul.

---

## Koreksi data & bentuk respons

### 7. Standarkan bentuk list: array vs Spring `Page`
- ~15 halaman FE mengasumsikan `res.data` adalah array langsung dan akan kosong/throw bila
  backend mengembalikan `{ content, totalElements, totalPages }`. Contoh paling kasar:
  `src/components/eo/PengajuanPayoutEO.jsx:141` menampilkan saldo **Rp 0**,
  `src/components/eo/RefundEO.jsx:328` melempar saat `.map`.
- Daftar lengkap ada di audit FE. Putuskan satu kontrak per endpoint dan dokumentasikan.

### 8. Param `sort` untuk list event
- FE mengurutkan terbaru-dibuat → terlama hanya di dalam halaman aktif
  (`src/components/admin/EventManagement.jsx:291-296`) karena backend tidak punya param sort.
  Tambahkan mis. `?sort=createdAt,desc` agar urutan global konsisten antar halaman.

### 9. Dugaan tabel `refund_requests` dipakai bersama payout
- `GET /api/admin/payouts` tampaknya membaca tabel yang sama dengan refund
  (`src/components/admin/PengajuanPayout.jsx:92-96` memfilter `organizerId != null` di client).
  Konfirmasi skema yang benar.

### 10. Selalu kirim `platformFee` pada respons payout
- Bila field fee tidak ada, FE memakai fallback hardcode **5%**
  (`src/components/admin/DetailPengajuanPayout.jsx:234`) dan nominal bersih di layar finansial
  bisa salah. Pastikan backend selalu mengirim fee.

---

## Operasional

### 11. URL tunnel nyata di file tracked + riwayat git
- `.env.example:3` memuat `VITE_NGROK_URL=https://zngjfn0w-8082.asse.devtunnels.ms/`.
  Riwayat git juga menyimpan `.env` berisi URL ngrok/devtunnels live (komit `ea5ef70`,
  `ba6f957`). Anggap hostname tersebut publik; rotasi/revoke bila masih live, ganti contoh
  dengan placeholder.

### 12. Midtrans: key produksi + lazy-load script Snap
- `index.html:8-11` memuat SDK **sandbox** + sandbox client key di SEMUA route termasuk login.
  Siapkan key produksi dan muat script hanya di route checkout/pembayaran.

---

## Batasan yang diketahui di sisi FE (tidak butuh aksi backend)

- Filter `DELETED` di Event Management jalan client-side setelah backend memaginasi
  (`src/components/admin/EventManagement.jsx:291-301`), jadi satu halaman bisa tampil
  < 10 kartu sementara bar paginasi memakai angka backend. Perlu filter `status` backend
  ("semua kecuali DELETED") bila ingin angka pas — item opsional, bukan bloker.
- `getAdminEventsTolerant` (`src/services/adminEventService.js:210-245`) menggabungkan
  hingga 20 halaman jadi satu `Page` sintetis `totalPages: 1` saat ada row kategori busuk
  di DB; rapikan nilai `category` busuk (mis. `"Musik"`, `"ENTERTAINMENT"`) ke 4 enum valid
  agar fallback ini tidak pernah terpicu.
