import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../shared/Sidebar";
import Navbar from "../shared/Navbar";

import "./PengajuanAkunEO.css";

function PengajuanAkunEO() {
  const navigate = useNavigate();

  // ==
  // DATA PENGAJUAN EO SEMENTARA
  // ==

  const [applications, setApplications] = useState([
    {
      id: 1,
      company: "PT Harmoni Musik Indonesia",
      applicant: "Budi Santoso",
      date: "24 Okt 2023",
      status: "Pending Verifikasi",
      statusClass: "pending",
    },
    {
      id: 2,
      company: "CV Gelora Event Nusantara",
      applicant: "Siti Aminah",
      date: "23 Okt 2023",
      status: "Pending Verifikasi",
      statusClass: "pending",
    },
    {
      id: 3,
      company: "Maju Jaya Productions",
      applicant: "Anton Wibowo",
      date: "20 Okt 2023",
      status: "Disetujui",
      statusClass: "approved",
    },
    {
      id: 4,
      company: "PT Kreasi Anak Bangsa",
      applicant: "Rina Maharani",
      date: "18 Okt 2023",
      status: "Ditolak",
      statusClass: "rejected",
    },
  ]);

  // ==
  // STATE FILTER
  // ==

  const [filter, setFilter] = useState("Semua");

  // ==
  // FILTER DATA
  // ==

  const filteredApplications = applications.filter((item) => {
    if (filter === "Semua") {
      return true;
    }

    if (filter === "Pending") {
      return item.status === "Pending Verifikasi";
    }

    if (filter === "Disetujui") {
      return item.status === "Disetujui";
    }

    if (filter === "Ditolak") {
      return item.status === "Ditolak";
    }

    return true;
  });

  // ==
  // DETAIL PENGAJUAN
  // ==

  const handleDetail = (application) => {
    navigate(`/admin/pengajuan-eo/${application.id}`);
  };

  // ==
  // FILTER BUTTON
  // ==

  const handleFilter = () => {
    if (filter === "Semua") {
      setFilter("Pending");
    } else if (filter === "Pending") {
      setFilter("Disetujui");
    } else if (filter === "Disetujui") {
      setFilter("Ditolak");
    } else {
      setFilter("Semua");
    }
  };

  // ==
  // EXPORT
  // ==

  const handleExport = () => {
    console.log("Export data pengajuan EO");
  };

  // ==
  // RENDER
  // ==

  return (
    <div className="pengajuan-eo-page">

      {/* ======
          SIDEBAR
      ======= */}

      <Sidebar />

      {/* ======
          MAIN
      ======= */}

      <main className="pengajuan-eo-main">

        {/* ======
            NAVBAR
        ======= */}

        <Navbar />

        {/* ======
            CONTENT
        ======= */}

        <section className="pengajuan-eo-content">

          {/* ====
              PAGE HEADER
          ===== */}

          <div className="pengajuan-header">

            <div className="pengajuan-heading">

              <h1>
                Pengajuan Akun EO
              </h1>

              <p>
                Review dan verifikasi pengajuan Event Organizer baru.
              </p>

            </div>

            <div className="pengajuan-actions">

              <button
                type="button"
                className="filter-button"
                onClick={handleFilter}
              >
                <span>☰</span>
                Filter
              </button>

              <button
                type="button"
                className="export-button"
                onClick={handleExport}
              >
                <span>↓</span>
                Export Data
              </button>

            </div>

          </div>

          {/* ====
              STATISTICS
          ===== */}

          <div className="pengajuan-statistics">

            {/* TOTAL PENDING */}

            <div className="stat-card pending-card">

              <div className="stat-card-top">

                <span className="stat-label">
                  TOTAL PENDING
                </span>

                <div className="stat-icon pending-icon">
                  ◷
                </div>

              </div>

              <h2>
                24
              </h2>

              <p>
                Menunggu verifikasi
              </p>

            </div>

            {/* DISETUJUI */}

            <div className="stat-card approved-card">

              <div className="stat-card-top">

                <span className="stat-label">
                  DISETUJUI BULAN INI
                </span>

                <div className="stat-icon approved-icon">
                  ✓
                </div>

              </div>

              <h2>
                156
              </h2>

              <p>
                Pengajuan disetujui
              </p>

            </div>

            {/* DITOLAK */}

            <div className="stat-card rejected-card">

              <div className="stat-card-top">

                <span className="stat-label">
                  DITOLAK
                </span>

                <div className="stat-icon rejected-icon">
                  ×
                </div>

              </div>

              <h2>
                8
              </h2>

              <p>
                Pengajuan ditolak
              </p>

            </div>

          </div>

          {/* ====
              APPLICATION LIST
          ===== */}

          <div className="application-panel">

            {/* PANEL HEADER */}

            <div className="application-panel-header">

              <div>

                <h2>
                  Daftar Pengajuan
                </h2>

                <p>
                  Daftar Event Organizer yang mengajukan akun.
                </p>

              </div>

              <div className="current-filter">
                {filter}
              </div>

            </div>

            {/* ==
                APPLICATION LIST
            === */}

            <div className="application-list">

              {filteredApplications.length > 0 ? (

                filteredApplications.map((application) => (

                  <div
                    className="application-item"
                    key={application.id}
                  >

                    {/* COMPANY ICON */}

                    <div className="company-icon">
                      ▣
                    </div>

                    {/* COMPANY INFORMATION */}

                    <div className="company-info">

                      <h3>
                        {application.company}
                      </h3>

                      <div className="company-meta">

                        <span>
                          {application.applicant}
                        </span>

                        <span className="meta-dot">
                          •
                        </span>

                        <span>
                          {application.date}
                        </span>

                      </div>

                    </div>

                    {/* STATUS */}

                    <div
                      className={`application-status ${application.statusClass}`}
                    >
                      {application.status}
                    </div>

                    {/* ACTION */}

                    <button
                      type="button"
                      className="detail-button"
                      onClick={() =>
                        handleDetail(application)
                      }
                    >
                      {application.status === "Disetujui"
                        ? "Lihat Profil"
                        : "Lihat Detail"}
                    </button>

                  </div>

                ))

              ) : (

                <div className="empty-application">
                  Tidak ada pengajuan yang ditemukan.
                </div>

              )}

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}

export default PengajuanAkunEO;