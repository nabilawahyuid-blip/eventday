import React from "react";
import { useNavigate } from "react-router-dom";
import "./KebijakanPrivasi.css";

function KebijakanPrivasi() {
  const navigate = useNavigate();

  return (
    <div className="privacy-page">

      {/* Header */}
      <header className="privacy-header">
        <button
          className="privacy-back-button"
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

        <h1>Kebijakan Privasi</h1>

        <div className="privacy-safe-badge">
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
      <main className="privacy-main">

        <div className="privacy-content">

          {/* Komitmen Privasi */}
          <section className="privacy-intro-card">

            <div className="privacy-intro-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 3L19 6V11C19 15.5 16 19.5 12 21C8 19.5 5 15.5 5 11V6L12 3Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
                <path
                  d="M9 12L11 14L15 9"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <div className="privacy-intro-text">
              <h2>Komitmen Privasi EventDay</h2>

              <p>
                Kami menghargai privasi dan kepercayaan pengguna tiket serta
                Event Organizer kami. Halaman ini menjelaskan bagaimana data
                Anda dikumpulkan, dilindungi, dan dikelola.
              </p>
            </div>

            <div className="privacy-updated">
              Terakhir diperbarui: Oktober 2024
            </div>

          </section>

          {/* Section 1 */}
          <section className="privacy-section">

            <div className="privacy-section-title">
              <span className="privacy-number">1</span>
              <h2>Informasi yang Kami Kumpulkan</h2>
            </div>

            <p className="privacy-description">
              Dalam menyediakan layanan tiket event yang mulus dan aman, kami
              mengumpulkan kategori data berikut:
            </p>

            <ul className="privacy-list">

              <li>
                <span className="privacy-bullet"></span>

                <p>
                  <strong>Data Akun:</strong> Nama lengkap, alamat email aktif,
                  nomor telepon WhatsApp, dan foto profil.
                </p>
              </li>

              <li>
                <span className="privacy-bullet"></span>

                <p>
                  <strong>Transaksi & Pembayaran:</strong> Riwayat pembelian
                  tiket, metode pembayaran yang dipilih, serta bukti transfer
                  (kami tidak menyimpan kredensial kartu kredit lengkap).
                </p>
              </li>

              <li>
                <span className="privacy-bullet"></span>

                <p>
                  <strong>Verifikasi Event Organizer:</strong> Kartu identitas
                  legal (KTP), nama organisasi/badan usaha, serta rekening bank
                  pencairan dana tiket.
                </p>
              </li>

            </ul>

          </section>

          {/* Section 2 */}
          <section className="privacy-section">

            <div className="privacy-section-title">
              <span className="privacy-number">2</span>
              <h2>Cara Kami Menggunakan Data Anda</h2>
            </div>

            <p className="privacy-description">
              Data Anda digunakan secara eksklusif untuk kepentingan
              operasional dan kenyamanan Anda:
            </p>

            <div className="privacy-use-list">

              <div className="privacy-use-item">

                <div className="privacy-use-icon">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M6 5H18V19H6C4.9 19 4 18.1 4 17V7C4 5.9 4.9 5 6 5Z"
                      stroke="currentColor"
                      strokeWidth="1.7"
                    />
                    <path
                      d="M8 9H16M8 13H14"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                <p>
                  Penerbitan e-tiket resmi & enkripsi QR Code unik untuk
                  validasi gerbang masuk.
                </p>

              </div>

              <div className="privacy-use-item">

                <div className="privacy-use-icon">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="3"
                      y="5"
                      width="18"
                      height="14"
                      rx="2"
                      stroke="currentColor"
                      strokeWidth="1.7"
                    />
                    <path
                      d="M3 7L12 13L21 7"
                      stroke="currentColor"
                      strokeWidth="1.7"
                    />
                  </svg>
                </div>

                <p>
                  Pengiriman faktur, konfirmasi pemesanan, dan notifikasi
                  jadwal event secara real-time.
                </p>

              </div>

              <div className="privacy-use-item">

                <div className="privacy-use-icon">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 3L19 6V11C19 15.5 16 19.5 12 21C8 19.5 5 15.5 5 11V6L12 3Z"
                      stroke="currentColor"
                      strokeWidth="1.7"
                    />
                    <path
                      d="M9 12L11 14L15 9"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <p>
                  Pencegahan calo tiket, manipulasi transaksi, dan sistem
                  deteksi bot otomatis.
                </p>

              </div>

            </div>

          </section>

          {/* Section 3 */}
          <section className="privacy-section">

            <div className="privacy-section-title">
              <span className="privacy-number">3</span>
              <h2>Pembagian dengan Pihak Ketiga</h2>
            </div>

            <p className="privacy-description">
              Kami tidak pernah menjual data pribadi Anda. Data hanya
              dibagikan secara terbatas kepada:
            </p>

            <ul className="privacy-check-list">

              <li>
                <span className="privacy-check">✓</span>

                <p>
                  <strong>Payment Gateway Berizin:</strong> Untuk otorisasi dan
                  pemrosesan pembayaran yang sah.
                </p>
              </li>

              <li>
                <span className="privacy-check">✓</span>

                <p>
                  <strong>Penyelenggara Event Terkait:</strong> Khusus daftar
                  nama peserta dan kode tiket untuk verifikasi check-in di
                  lokasi acara.
                </p>
              </li>

            </ul>

          </section>

          {/* Section 4 */}
          <section className="privacy-section privacy-rights-section">

            <div className="privacy-section-title">
              <span className="privacy-number">4</span>
              <h2>Hak dan Kendali Pengguna</h2>
            </div>

            <p className="privacy-description">
              Sesuai peraturan perlindungan data pribadi, Anda memiliki hak
              penuh untuk:
            </p>

            <div className="privacy-rights-grid">

              {/* Akses */}
              <div className="privacy-right-card">

                <div className="privacy-right-icon">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M2.5 12C4.7 7.8 8 5.5 12 5.5C16 5.5 19.3 7.8 21.5 12C19.3 16.2 16 18.5 12 18.5C8 18.5 4.7 16.2 2.5 12Z"
                      stroke="currentColor"
                      strokeWidth="1.7"
                    />
                    <circle
                      cx="12"
                      cy="12"
                      r="3"
                      stroke="currentColor"
                      strokeWidth="1.7"
                    />
                  </svg>
                </div>

                <strong>Akses</strong>

                <p>
                  Melihat data diri yang tersimpan
                </p>

              </div>

              {/* Koreksi */}
              <div className="privacy-right-card">

                <div className="privacy-right-icon">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M4 20H8L19 9C20.1 7.9 20.1 6.1 19 5C17.9 3.9 16.1 3.9 15 5L4 16V20Z"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M13.5 6.5L17.5 10.5"
                      stroke="currentColor"
                      strokeWidth="1.7"
                    />
                  </svg>
                </div>

                <strong>Koreksi</strong>

                <p>
                  Memperbarui data di menu profil
                </p>

              </div>

              {/* Penghapusan */}
              <div className="privacy-right-card">

                <div className="privacy-right-icon">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M5 7H19"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                    />
                    <path
                      d="M9 7V4H15V7"
                      stroke="currentColor"
                      strokeWidth="1.7"
                    />
                    <path
                      d="M7 7L8 20H16L17 7"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M10 11V16M14 11V16"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                <strong>Penghapusan</strong>

                <p>
                  Permohonan penutupan & hapus akun
                </p>

              </div>

              {/* Bantuan */}
              <div className="privacy-right-card">

                <div className="privacy-right-icon">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M4 13V11C4 6.6 7.6 3 12 3C16.4 3 20 6.6 20 11V13"
                      stroke="currentColor"
                      strokeWidth="1.7"
                    />
                    <rect
                      x="3"
                      y="12"
                      width="5"
                      height="7"
                      rx="2"
                      stroke="currentColor"
                      strokeWidth="1.7"
                    />
                    <rect
                      x="16"
                      y="12"
                      width="5"
                      height="7"
                      rx="2"
                      stroke="currentColor"
                      strokeWidth="1.7"
                    />
                    <path
                      d="M16 19C15.2 20.3 13.8 21 12 21H10"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                <strong>Bantuan & DPO</strong>

                <p>
                  Hubungi kontak petugas data kami
                </p>

              </div>

            </div>

          </section>

        </div>

      </main>

      {/* Footer */}
      <footer className="privacy-footer">
        © 2027 EVENTDAY. Hak cipta dilindungi undang-undang.
      </footer>

    </div>
  );
}

export default KebijakanPrivasi;