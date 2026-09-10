import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import SidebarEO from "../shared/SidebarEO";
import NavbarEO from "../shared/NavbarEO";
import "./DetailTransaksiEO.css";

function DetailTransaksi() {
  const navigate = useNavigate();
  const { id } = useParams();

  // ==
  // DATA DUMMY
  // NANTI BISA DIGANTI DENGAN DATA DARI API
  // ==

  const transactions = {
    "TRX-9921": {
      id: "TRX-9921",
      status: "Lunas",
      statusClass: "paid",

      customer: {
        name: "Budi Santoso",
        email: "budi.santoso@example.com",
        phone: "+62 812 3456 7890",
        identity: "KTP - 3171234567890001",
      },

      event: {
        name: "Konser Musik Akbar 2024",
        category: "Festival Musik Nasional",
        date: "15 Agustus 2024",
        time: "18:00 WIB",
        location: "Stadion Utama Gelora Bung Karno",
        city: "Jakarta, Indonesia",
      },

      ticket: {
        name: "VIP Festival - Day Pass",
        quantity: 2,
        price: 1500000,
      },

      payment: {
        method: "BCA Virtual Account",
        bank: "BCA",
        date: "10 Juli 2024, 14:32 WIB",
        reference: "BCA-VA-9876543210",
      },

      summary: {
        subtotal: 3000000,
        service: 150000,
        tax: 330000,
        total: 3480000,
      },
    },

    "TRX-9922": {
      id: "TRX-9922",
      status: "Lunas",
      statusClass: "paid",

      customer: {
        name: "Nama Customer",
        email: "customer@example.com",
        phone: "+62 812 1234 5678",
        identity: "KTP - 3171234567890002",
      },

      event: {
        name: "Music Festival 2024",
        category: "Music Festival",
        date: "24 Oktober 2024",
        time: "14:00 WIB",
        location: "Stadion Utama",
        city: "Jakarta, Indonesia",
      },

      ticket: {
        name: "Regular Festival",
        quantity: 1,
        price: 750000,
      },

      payment: {
        method: "BCA Virtual Account",
        bank: "BCA",
        date: "24 Oktober 2024, 13:20 WIB",
        reference: "BCA-VA-9876543211",
      },

      summary: {
        subtotal: 750000,
        service: 37500,
        tax: 82500,
        total: 870000,
      },
    },
  };

  const transaction =
    transactions[id] || transactions["TRX-9921"];

  // ==
  // FORMAT RUPIAH
  // ==

  const formatRupiah = (number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number);
  };

  // ==
  // KEMBALI
  // ==

  const handleBack = () => {
    navigate("/eo/transaksi");
  };

  // ==
  // DOWNLOAD E-TICKET
  // ==

  const handleDownload = () => {
    alert("E-Ticket berhasil diunduh.");
  };

  return (
    <div className="detail-transaksi-page">

      {/* ======
          SIDEBAR
      ====== */}

      <SidebarEO />

      {/* ======
           MAIN
       ====== */}

      <main className="detail-transaksi-main">

        {/* NAVBAR */}

        <NavbarEO />

        {/* ======
            CONTENT
        ====== */}

        <div className="detail-transaksi-content">

          {/* ======
              BACK
          ====== */}

          <button
            type="button"
            className="back-transaction-button"
            onClick={handleBack}
          >
            ← Kembali ke Daftar Transaksi
          </button>

          {/* ======
              HEADER
          ====== */}

          <div className="detail-transaction-header">

            <div>
              <h1>
                Detail Transaksi
              </h1>

              <p>
                ID: {transaction.id}
              </p>
            </div>

            <span
              className={`detail-status ${transaction.statusClass}`}
            >
              ✓ {transaction.status}
            </span>

          </div>

          {/* ======
              MAIN GRID
          ====== */}

          <div className="detail-transaction-grid">

            {/* =
                LEFT COLUMN
            = */}

            <div className="detail-left-column">

              {/* ======
                  INFORMASI PELANGGAN
              ====== */}

              <section className="detail-box">

                <div className="detail-box-title">

                  <div className="detail-title-icon">
                    ♙
                  </div>

                  <h2>
                    Informasi Pelanggan
                  </h2>

                </div>

                <div className="detail-divider"></div>

                <div className="customer-info-grid">

                  <div className="info-field">
                    <span>
                      NAMA LENGKAP
                    </span>

                    <strong>
                      {transaction.customer.name}
                    </strong>
                  </div>

                  <div className="info-field">
                    <span>
                      EMAIL
                    </span>

                    <strong>
                      {transaction.customer.email}
                    </strong>
                  </div>

                  <div className="info-field">
                    <span>
                      NOMOR TELEPON
                    </span>

                    <strong>
                      {transaction.customer.phone}
                    </strong>
                  </div>

                  <div className="info-field">
                    <span>
                      TIPE IDENTITAS
                    </span>

                    <strong>
                      {transaction.customer.identity}
                    </strong>
                  </div>

                </div>

              </section>


              {/* ======
                  DETAIL ACARA
              ====== */}

              <section className="detail-box event-detail-box">

                <div className="detail-box-title">

                  <div className="detail-title-icon">
                    ▣
                  </div>

                  <h2>
                    Detail Acara
                  </h2>

                </div>

                <div className="detail-divider"></div>

                <div className="event-detail-content">

                  {/* EVENT IMAGE */}

                  <div className="event-detail-image">

                    <div className="event-image-pattern">

                      <span>
                        EVENTDAY
                      </span>

                      <strong>
                        MUSIC
                        <br />
                        FESTIVAL
                      </strong>

                    </div>

                  </div>

                  {/* EVENT INFO */}

                  <div className="event-detail-info">

                    <h3>
                      {transaction.event.name}
                    </h3>

                    <p className="event-category">
                      ♪ {transaction.event.category}
                    </p>

                    <div className="event-info-grid">

                      <div>
                        <span>
                          ▣ TANGGAL & WAKTU
                        </span>

                        <strong>
                          {transaction.event.date}
                        </strong>

                        <strong>
                          {transaction.event.time}
                        </strong>
                      </div>

                      <div>
                        <span>
                          ◉ LOKASI
                        </span>

                        <strong>
                          {transaction.event.location}
                        </strong>

                        <strong>
                          {transaction.event.city}
                        </strong>
                      </div>

                    </div>

                  </div>

                </div>

              </section>

            </div>


            {/* =
                RIGHT COLUMN
            = */}

            <div className="detail-right-column">

              {/* ======
                  RINGKASAN PESANAN
              ====== */}

              <section className="detail-box order-summary-box">

                <div className="detail-box-title">

                  <div className="detail-title-icon">
                    ▤
                  </div>

                  <h2>
                    Ringkasan Pesanan
                  </h2>

                </div>

                <div className="detail-divider"></div>

                <div className="ticket-summary">

                  <div className="ticket-summary-main">

                    <strong>
                      {transaction.ticket.name}
                    </strong>

                    <span>
                      {transaction.ticket.quantity} Tiket
                    </span>

                  </div>

                  <strong className="ticket-price">
                    {formatRupiah(
                      transaction.ticket.price *
                      transaction.ticket.quantity
                    )}
                  </strong>

                </div>

                <div className="price-list">

                  <div>
                    <span>
                      Subtotal
                    </span>

                    <strong>
                      {formatRupiah(
                        transaction.summary.subtotal
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Biaya Layanan (5%)
                    </span>

                    <strong>
                      {formatRupiah(
                        transaction.summary.service
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Pajak (11%)
                    </span>

                    <strong>
                      {formatRupiah(
                        transaction.summary.tax
                      )}
                    </strong>
                  </div>

                </div>

                <div className="total-payment">

                  <div>
                    <span>
                      Total
                    </span>

                    <strong>
                      Pembayaran
                    </strong>
                  </div>

                  <strong>
                    {formatRupiah(
                      transaction.summary.total
                    )}
                  </strong>

                </div>

              </section>


              {/* ======
                  DETAIL PEMBAYARAN
              ====== */}

              <section className="detail-box payment-detail-box">

                <div className="detail-box-title">

                  <div className="detail-title-icon">
                    ▣
                  </div>

                  <h2>
                    Detail Pembayaran
                  </h2>

                </div>

                <div className="detail-divider"></div>

                <div className="payment-info">

                  <div>
                    <span>
                      METODE PEMBAYARAN
                    </span>

                    <strong>
                      {transaction.payment.bank}
                      &nbsp; {transaction.payment.method}
                    </strong>
                  </div>

                  <div>
                    <span>
                      TANGGAL TRANSAKSI
                    </span>

                    <strong>
                      {transaction.payment.date}
                    </strong>
                  </div>

                  <div>
                    <span>
                      ID REFERENSI BANK
                    </span>

                    <strong className="reference-number">
                      {transaction.payment.reference}
                    </strong>
                  </div>

                </div>

                <button
                  type="button"
                  className="download-ticket-button"
                  onClick={handleDownload}
                >
                  ↓ &nbsp; Unduh E-Ticket
                </button>

              </section>

            </div>

          </div>

        </div>

      </main>

    </div>
  );
}

export default DetailTransaksi;