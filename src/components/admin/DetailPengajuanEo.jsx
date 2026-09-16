import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../shared/Sidebar";
import Navbar from "../shared/Navbar";
import "./DetailPengajuanEo.css";

export default function DetailPengajuanEo() {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <div className="admin-dashboard">
      <Sidebar />
      <div className="dashboard-wrapper">
        <Navbar />

        <main className="dashboard-main">
          <div className="dashboard-content">
            
            {/* Tombol Kembali */}
            <div className="back-section">
              <button onClick={() => navigate("/admin/pengajuan-eo")} className="btn-back">
                ← Back to List
              </button>
            </div>

            {/* Header Judul & Status */}
            <div className="page-header-row">
              <div className="header-title-group">
                <h1 className="page-title">Review Application</h1>
                <span className="badge-status pending">PENDING</span>
              </div>
              <span className="submission-date">
                Submitted on Oct 24, 2023
              </span>
            </div>

            {/* Layout Grid Utama */}
            <div className="review-grid-layout">
              
              {/* KOLOM KIRI (Informasi) */}
              <div className="review-left-column">
                
                {/* Informasi Pribadi */}
                <div className="info-card">
                  <h3 className="card-section-title">Informasi Pribadi</h3>
                  <div className="info-grid-2">
                    <div>
                      <p className="info-label">NAMA LENGKAP</p>
                      <p className="info-value">Budi Santoso</p>
                    </div>
                    <div>
                      <p className="info-label">EMAIL</p>
                      <p className="info-value">budi.santoso@harmoni.co.id</p>
                    </div>
                    <div>
                      <p className="info-label">NO WHATSAPP</p>
                      <p className="info-value">+62 812-3456-7890</p>
                    </div>
                    <div>
                      <p className="info-label">NOMOR IDENTITAS (NIK)</p>
                      <p className="info-value">3171234567890123</p>
                    </div>
                  </div>
                </div>

                {/* Informasi EO */}
                <div className="info-card">
                  <h3 className="card-section-title">Informasi Event Organizer</h3>
                  <div className="info-grid-2">
                    <div>
                      <p className="info-label">NAMA AKUN EO</p>
                      <p className="info-value">PT Harmoni Musik Indonesia</p>
                    </div>
                    <div>
                      <p className="info-label">NPWP (OPSIONAL)</p>
                      <p className="info-value">01.234.567.8-901.000</p>
                    </div>
                  </div>
                </div>

                {/* Dokumen Pendukung */}
                <div className="info-card">
                  <h3 className="card-section-title">Dokumen Pendukung</h3>
                  <div className="document-list">
                    
                    <div className="document-item">
                      <div className="document-info-group">
                        <span className="doc-icon">📄</span>
                        <div>
                          <p className="doc-name">CV/Portofolio</p>
                          <p className="doc-size">PDF • 2.4 MB</p>
                        </div>
                      </div>
                      <button onClick={() => alert("Preview Dokumen")} className="btn-outline-doc">
                        Lihat Dokumen
                      </button>
                    </div>

                    <div className="document-item">
                      <div className="document-info-group">
                        <span className="doc-icon">📄</span>
                        <div>
                          <p className="doc-name">Akta Perusahaan</p>
                          <p className="doc-size">PDF • 1.1 MB</p>
                        </div>
                      </div>
                      <button onClick={() => alert("Preview Dokumen")} className="btn-outline-doc">
                        Lihat Dokumen
                      </button>
                    </div>

                  </div>
                </div>

              </div>

              {/* KOLOM KANAN (Aksi Superadmin) */}
              <div className="review-right-column">
                <div className="action-card-sticky">
                  <h3 className="card-section-title">🛡️ Aksi Superadmin</h3>

                  <div className="action-button-group">
                    <button type="button" className="btn-action-reject">
                      Tolak
                    </button>
                    <button type="button" className="btn-action-approve">
                      Setujui
                    </button>
                  </div>

                  <div className="notes-group">
                    <label className="info-label" style={{ display: 'block', marginBottom: '6px' }}>
                      CATATAN INTERNAL (OPSIONAL)
                    </label>
                    <textarea rows="3" placeholder="Tambahkan catatan..." className="textarea-notes" />
                  </div>

                  <button type="button" onClick={() => alert("Berhasil dikonfirmasi (Mock)")} className="btn-confirm-decision">
                    Konfirmasi Keputusan →
                  </button>
                </div>
              </div>

            </div>

          </div>
        </main>
      </div>
    </div>
  );
}