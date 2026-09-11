import React from "react";
import { useNavigate } from "react-router-dom";
import FooterCustomer from "../shared/FooterCustomer";
import "./SyaratKetentuan.css";

function SyaratKetentuan() {
  const navigate = useNavigate();

  return (
    <div className="terms-page">

      {/* Header */}
      <header className="terms-header">
        <button
          className="terms-back-button"
          onClick={() => navigate(-1)}
          aria-label="Kembali"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M19 12H5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />

            <path
              d="M12 19L5 12L12 5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <h1>Syarat & Ketentuan</h1>

        <div className="terms-safe-badge">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 3L19 6V11C19 15.5 16 19.5 12 21C8 19.5 5 15.5 5 11V6L12 3Z"
              fill="currentColor"
            />

            <path
              d="M9 12L11 14L15 9"
              stroke="white"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          <span>Aman</span>
        </div>
      </header>

      {/* Main */}
      <main className="terms-main">

        <div className="terms-container">

          {/* 1. Ketentuan Umum */}
          <section className="terms-card">

            <div className="terms-title">
              <span className="terms-number">1</span>

              <h2>
                Ketentuan Umum & Pendahuluan
              </h2>
            </div>

            <div className="terms-content">

              <p>
                Selamat datang di <strong>EventDay</strong> ("Aplikasi",
                "Kami"). Dengan mendaftar, mengakses, atau menggunakan layanan
                kami, Anda menyetujui untuk terikat secara sah oleh Syarat dan
                Ketentuan ini.
              </p>

              <p>
                EventDay bertindak sebagai penyedia platform teknologi
                perantara yang mempertemukan Penyelenggara Acara
                (Event Organizer/EO) dengan Pengunjung atau Pembeli Tiket.
              </p>

            </div>

          </section>

          {/* 2. Akun Pengguna */}
          <section className="terms-card">

            <div className="terms-title">
              <span className="terms-number">2</span>

              <h2>
                Akun Pengguna & Keamanan
              </h2>
            </div>

            <div className="terms-content">

              <p>
                Pengguna wajib berusia minimal 17 tahun atau telah memiliki
                kartu identitas resmi untuk mendaftar akun maupun
                mengorganisir kegiatan.
              </p>

              <p>
                Anda bertanggung jawab penuh untuk menjaga kerahasiaan kata
                sandi dan informasi kredensial akun Anda. Seluruh aktivitas
                yang terjadi di bawah akun Anda merupakan tanggung jawab
                pribadi Anda.
              </p>

              <p>
                EventDay berhak menangguhkan atau menghapus akun jika
                ditemukan indikasi penyalahgunaan, data palsu, atau aktivitas
                mencurigakan.
              </p>

            </div>

          </section>

          {/* 3. Pembelian Tiket */}
          <section className="terms-card">

            <div className="terms-title">
              <span className="terms-number">3</span>

              <h2>
                Pembelian Tiket & Pembayaran
              </h2>
            </div>

            <div className="terms-content">

              <p>
                Harga tiket yang tertera adalah resmi yang ditentukan oleh
                Penyelenggara Acara dan dapat dikenakan biaya layanan
                administrasi atau pajak pemerintah yang berlaku.
              </p>

              <div className="payment-box">

                <strong>
                  Metode Pembayaran Resmi:
                </strong>

                <ul>
                  <li>
                    Virtual Account (BCA, Mandiri, BNI, BRI, Permata)
                  </li>

                  <li>
                    QRIS Standar Indonesia
                  </li>

                  <li>
                    Dompet Digital (GoPay, OVO, ShopeePay, DANA)
                  </li>

                  <li>
                    Kartu Kredit / Debit Online
                  </li>
                </ul>

              </div>

              <p>
                Setiap transaksi memiliki batas waktu pembayaran
                (time-limit). Tiket otomatis dibatalkan jika pelunasan tidak
                diselesaikan dalam batas waktu yang ditentukan.
              </p>

            </div>

          </section>

          {/* 4. Refund */}
          <section className="terms-card">

            <div className="terms-title">
              <span className="terms-number">4</span>

              <h2>
                Kebijakan Pengembalian (Refund)
              </h2>
            </div>

            <div className="terms-content">

              <p>
                Seluruh pembelian tiket bersifat final dan tidak dapat
                dikembalikan (<em>non-refundable</em>), kecuali dinyatakan lain
                secara resmi oleh pihak Penyelenggara Acara.
              </p>

              <p>
                Apabila acara dibatalkan secara sepihak oleh penyelenggara,
                mekanisme pengembalian dana akan diproses melalui menu
                <strong> Refund </strong>
                di aplikasi EventDay sesuai ketentuan waktu pemrosesan bank
                (7–14 hari kerja).
              </p>

              <p>
                Biaya kemudahan atau biaya admin payment gateway mungkin tidak
                dapat dikembalikan tergantung kebijakan perbankan terkait.
              </p>

            </div>

          </section>

          {/* 5. Batasan Tanggung Jawab */}
          <section className="terms-card">

            <div className="terms-title">
              <span className="terms-number">5</span>

              <h2>
                Batasan Tanggung Jawab
              </h2>
            </div>

            <div className="terms-content">

              <p>
                EventDay tidak bertanggung jawab atas kerugian fisik,
                materiil, kehilangan barang bawaan pribadi, maupun cidera
                selama berlangsungnya acara offline di lokasi penyelenggara.
              </p>

              <p>
                EventDay tidak menjamin bahwa kualitas performa acara akan
                sepenuhnya sesuai dengan ekspektasi personal pembeli.
              </p>

            </div>

          </section>

        </div>

      </main>

      {/* Footer + Mobile Bottom Navigation */}
      <FooterCustomer />

    </div>
  );
}

export default SyaratKetentuan;