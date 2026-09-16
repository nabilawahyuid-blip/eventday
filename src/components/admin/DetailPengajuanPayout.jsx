import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  ShieldCheck,
  ArrowRight,
  Building2,
  Check,
  FileText,
  Image as ImageIcon,
} from "lucide-react";

import Sidebar from "../shared/Sidebar";
import Navbar from "../shared/Navbar";

import "./DetailPengajuanPayout.css";

function DetailPengajuanPayout() {
  const navigate = useNavigate();

  const [decision, setDecision] = useState("");
  const [note, setNote] = useState("");

  const handleBack = () => {
    navigate("/admin/pengajuan-payout");
  };

  const handleConfirm = () => {
    if (!decision) {
      alert("Silakan pilih keputusan terlebih dahulu.");
      return;
    }

    if (decision === "approved") {
      alert("Pengajuan payout disetujui.");
    } else {
      alert("Pengajuan payout ditolak.");
    }
  };

  const handleViewDocument = (documentName) => {
    alert(`Membuka dokumen: ${documentName}`);
  };

  return (
    <div className="detail-payout-page">
      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN */}
      <main className="detail-payout-main">
        {/* NAVBAR */}
        <Navbar />

        <div className="detail-payout-content">

          {/* =====================================================
              TOP
          ===================================================== */}

          <div className="detail-payout-back">
            <button
              type="button"
              onClick={handleBack}
            >
              <ArrowLeft
                size={15}
                strokeWidth={1.8}
              />

              <span>Kembali ke Daftar Payout</span>
            </button>
          </div>


          {/* =====================================================
              PAGE HEADER
          ===================================================== */}

          <div className="detail-payout-header">

            <div className="detail-payout-title-wrapper">

              <h1>
                Review Pengajuan Payout
              </h1>

              <span className="detail-payout-status">
                PENDING
              </span>

              <span className="detail-payout-id">
                #PO-20241025-089
              </span>

            </div>

            <span className="detail-payout-request-date">
              Diajukan pada 25 Okt 2024, 14:30 WIB
            </span>

          </div>


          {/* =====================================================
              MAIN GRID
          ===================================================== */}

          <div className="detail-payout-grid">

            {/* =================================================
                LEFT CONTENT
            ================================================= */}

            <div className="detail-payout-left">


              {/* =================================================
                  EVENT & PAYOUT
              ================================================= */}

              <section className="detail-payout-card event-payout-card">

                <div className="detail-card-header">

                  <h2>
                    Rincian Event &amp; Payout
                  </h2>

                  <span>
                    Kalkulasi Sistem Otomatis
                  </span>

                </div>

                <div className="detail-card-divider"></div>


                <div className="event-payout-grid">

                  {/* EVENT */}

                  <div className="detail-field">

                    <span className="detail-field-label">
                      NAMA EVENT
                    </span>

                    <strong>
                      Jakarta Music Festival 2024
                    </strong>

                  </div>


                  {/* TICKET */}

                  <div className="detail-field">

                    <span className="detail-field-label">
                      TOTAL TIKET TERJUAL
                    </span>

                    <strong>
                      1.450 / 1.500{" "}
                      <small>(96.6%)</small>
                    </strong>

                  </div>


                  {/* REVENUE */}

                  <div className="detail-field">

                    <span className="detail-field-label">
                      TOTAL PENDAPATAN KOTOR
                    </span>

                    <strong>
                      Rp 725.000.000
                    </strong>

                  </div>


                  {/* FEE */}

                  <div className="detail-field">

                    <span className="detail-field-label">
                      BIAYA LAYANAN / PLATFORM FEE (5%)
                    </span>

                    <strong className="fee-value">
                      -Rp 36.250.000
                    </strong>

                  </div>

                </div>


                {/* NET PAYOUT */}

                <div className="net-payout-box">

                  <div className="net-payout-info">

                    <span>
                      TOTAL DANA DIAJUKAN (NET PAYOUT)
                    </span>

                    <small>
                      Jumlah bersih yang akan ditransfer ke rekening EO
                    </small>

                  </div>

                  <strong>
                    Rp 688.750.000
                  </strong>

                </div>

              </section>


              {/* =================================================
                  BANK ACCOUNT
              ================================================= */}

              <section className="detail-payout-card bank-card">

                <div className="detail-card-header">

                  <h2>
                    Rekening Tujuan Transfer
                  </h2>

                </div>

                <div className="detail-card-divider"></div>


                <div className="bank-grid">

                  {/* BANK */}

                  <div className="detail-field">

                    <span className="detail-field-label">
                      BANK TUJUAN
                    </span>

                    <div className="bank-name">

                      <span className="bank-logo">
                        BCA
                      </span>

                      <strong>
                        Bank Central Asia (BCA)
                      </strong>

                    </div>

                  </div>


                  {/* ACCOUNT NUMBER */}

                  <div className="detail-field">

                    <span className="detail-field-label">
                      NOMOR REKENING
                    </span>

                    <strong className="normal-value">
                      8927 1638 29
                    </strong>

                  </div>


                  {/* ACCOUNT NAME */}

                  <div className="detail-field">

                    <span className="detail-field-label">
                      ATAS NAMA REKENING
                    </span>

                    <strong>
                      PT HARMONI MUSIK INDONESIA
                    </strong>

                  </div>


                  {/* VALIDATION */}

                  <div className="detail-field">

                    <span className="detail-field-label">
                      STATUS VALIDASI REKENING
                    </span>

                    <span className="verified-badge">

                      <Check
                        size={14}
                        strokeWidth={2}
                      />

                      Terverifikasi Otomatis

                    </span>

                  </div>

                </div>

              </section>


              {/* =================================================
                  DOCUMENTS
              ================================================= */}

              <section className="detail-payout-card document-card">

                <div className="detail-card-header">

                  <h2>
                    Dokumen Pendukung Payout
                  </h2>

                </div>

                <div className="detail-card-divider"></div>


                <div className="document-list">

                  {/* DOCUMENT 1 */}

                  <div className="document-item">

                    <div className="document-item-left">

                      <div className="document-icon pdf-icon">

                        <FileText
                          size={17}
                          strokeWidth={1.8}
                        />

                      </div>

                      <div className="document-info">

                        <strong>
                          Laporan Rekonsiliasi Penjualan Tiket.pdf
                        </strong>

                        <span>
                          PDF • 3.2 MB
                        </span>

                      </div>

                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleViewDocument(
                          "Laporan Rekonsiliasi Penjualan Tiket.pdf"
                        )
                      }
                    >
                      Lihat Dokumen
                    </button>

                  </div>


                  {/* DOCUMENT 2 */}

                  <div className="document-item">

                    <div className="document-item-left">

                      <div className="document-icon pdf-icon">

                        <FileText
                          size={17}
                          strokeWidth={1.8}
                        />

                      </div>

                      <div className="document-info">

                        <strong>
                          Surat Permohonan Pencairan Dana Resmi.pdf
                        </strong>

                        <span>
                          PDF • 1.1 MB
                        </span>

                      </div>

                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleViewDocument(
                          "Surat Permohonan Pencairan Dana Resmi.pdf"
                        )
                      }
                    >
                      Lihat Dokumen
                    </button>

                  </div>


                  {/* DOCUMENT 3 */}

                  <div className="document-item">

                    <div className="document-item-left">

                      <div className="document-icon image-icon">

                        <ImageIcon
                          size={17}
                          strokeWidth={1.8}
                        />

                      </div>

                      <div className="document-info">

                        <strong>
                          Buku Rekening Perusahaan (Validasi).png
                        </strong>

                        <span>
                          PNG • 850 KB
                        </span>

                      </div>

                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleViewDocument(
                          "Buku Rekening Perusahaan (Validasi).png"
                        )
                      }
                    >
                      Lihat Dokumen
                    </button>

                  </div>

                </div>

              </section>

            </div>


            {/* =================================================
                RIGHT ACTION
            ================================================= */}

            <aside className="superadmin-card">

              {/* TITLE */}

              <div className="superadmin-header">

                <ShieldCheck
                  size={21}
                  strokeWidth={1.9}
                />

                <h2>
                  Aksi Superadmin
                </h2>

              </div>


              {/* DECISION */}

              <div className="decision-buttons">

                <button
                  type="button"
                  className={`decision-button reject ${
                    decision === "rejected"
                      ? "selected"
                      : ""
                  }`}
                  onClick={() =>
                    setDecision("rejected")
                  }
                >
                  Tolak
                </button>

                <button
                  type="button"
                  className={`decision-button approve ${
                    decision === "approved"
                      ? "selected"
                      : ""
                  }`}
                  onClick={() =>
                    setDecision("approved")
                  }
                >
                  Setujui
                </button>

              </div>


              {/* NOTE */}

              <div className="internal-note">

                <label>
                  CATATAN INTERNAL (OPSIONAL)
                </label>

                <textarea
                  value={note}
                  onChange={(e) =>
                    setNote(e.target.value)
                  }
                  placeholder={
                    "Tambahkan catatan persetujuan\natau alasan penolakan..."
                  }
                />

              </div>


              {/* CONFIRM */}

              <button
                type="button"
                className="confirm-decision-button"
                onClick={handleConfirm}
              >
                <span>
                  Konfirmasi Keputusan
                </span>

                <ArrowRight
                  size={18}
                  strokeWidth={1.8}
                />
              </button>


              {/* INFO */}

              <div className="transfer-info">

                <div className="transfer-info-icon">
                  i
                </div>

                <p>
                  Dana yang disetujui akan diproses
                  transfer otomatis via Payment
                  Gateway atau kliring manual dalam
                  1x24 jam kerja.
                </p>

              </div>

            </aside>

          </div>

        </div>
      </main>
    </div>
  );
}

export default DetailPengajuanPayout;