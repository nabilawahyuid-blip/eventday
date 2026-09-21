import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../shared/Sidebar";
import Navbar from "../shared/Navbar";

import {
  getEoApplications,
} from "../../services/adminEoService";

import "./PengajuanAkunEO.css";

function PengajuanAkunEO() {
  const navigate = useNavigate();

  // ==========================================
  // STATE
  // ==========================================

  const [applications, setApplications] =
    useState([]);

  const [filter, setFilter] =
    useState("Semua");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // ==========================================
  // FETCH DATA
  // ==========================================

  const fetchApplications = async (
    status = ""
  ) => {
    try {
      setLoading(true);
      setError("");

      const response =
        await getEoApplications(status);

      console.log(
        "ADMIN EO APPLICATION RESPONSE:",
        response
      );

      const data =
        response?.data ?? response;

      if (!Array.isArray(data)) {
        throw new Error(
          "Data pengajuan EO tidak berbentuk array."
        );
      }

      setApplications(data);
    } catch (error) {
      console.error(
        "Gagal mengambil pengajuan EO:",
        error
      );

      setError(
        error?.message ||
          "Gagal mengambil data pengajuan EO."
      );

      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // LOAD AWAL
  // ==========================================

  useEffect(() => {
    fetchApplications();
  }, []);

  // ==========================================
  // FILTER
  // ==========================================

  const handleFilter = async (selectedFilter) => {
    setFilter(selectedFilter);

    let status = "";

    if (selectedFilter === "Pending") {
      status = "UNVERIFIED";
    }

    if (selectedFilter === "Disetujui") {
      status = "VERIFIED";
    }

    if (selectedFilter === "Ditolak") {
      status = "REJECTED";
    }

    await fetchApplications(status);
  };

  // ==========================================
  // DETAIL
  // ==========================================

  const handleDetail = (application) => {
    if (!application.organizerId) {
      console.error(
        "Organizer ID tidak ditemukan:",
        application
      );

      return;
    }

    navigate(
      `/admin/pengajuan-eo/${encodeURIComponent(
        application.organizerId
      )}`
    );
  };

  // ==========================================
  // FORMAT DATE
  // ==========================================

  const formatDate = (date) => {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString(
      "id-ID",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // ==========================================
  // STATUS LABEL
  // ==========================================

  const getStatusLabel = (status) => {
    switch (status) {
      case "UNVERIFIED":
        return "Pending Verifikasi";

      case "VERIFIED":
        return "Disetujui";

      case "REJECTED":
        return "Ditolak";

      default:
        return status || "-";
    }
  };

  // ==========================================
  // STATUS CLASS
  // ==========================================

  const getStatusClass = (status) => {
    switch (status) {
      case "UNVERIFIED":
        return "pending";

      case "VERIFIED":
        return "approved";

      case "REJECTED":
        return "rejected";

      default:
        return "pending";
    }
  };

  // ==========================================
  // STATISTICS
  // ==========================================

  const totalPending =
    applications.filter(
      (item) =>
        item.verificationStatus ===
        "UNVERIFIED"
    ).length;

  const totalApproved =
    applications.filter(
      (item) =>
        item.verificationStatus ===
        "VERIFIED"
    ).length;

  const totalRejected =
    applications.filter(
      (item) =>
        item.verificationStatus ===
        "REJECTED"
    ).length;

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="pengajuan-eo-page">

      {/* ======================================
          SIDEBAR
      ====================================== */}

      <Sidebar />

      {/* ======================================
          MAIN
      ====================================== */}

      <main className="pengajuan-eo-main">

        <Navbar />

        <section className="pengajuan-eo-content">

          {/* ==================================
              HEADER
          ================================== */}

          <div className="pengajuan-header">

            <div className="pengajuan-heading">

              <h1>
                Pengajuan Akun EO
              </h1>

              <p>
                Review dan verifikasi pengajuan
                Event Organizer baru.
              </p>

            </div>

            <div className="pengajuan-actions">

              {/* FILTER */}

              <div className="filter-wrapper">

                <button
                  type="button"
                  className="filter-button"
                  onClick={() => {
                    if (
                      filter === "Semua"
                    ) {
                      handleFilter(
                        "Pending"
                      );
                    } else if (
                      filter === "Pending"
                    ) {
                      handleFilter(
                        "Disetujui"
                      );
                    } else if (
                      filter === "Disetujui"
                    ) {
                      handleFilter(
                        "Ditolak"
                      );
                    } else {
                      handleFilter(
                        "Semua"
                      );
                    }
                  }}
                >
                  <span>☰</span>
                  Filter: {filter}
                </button>

              </div>

              {/* EXPORT */}

              <button
                type="button"
                className="export-button"
                onClick={() =>
                  alert(
                    "Export pengajuan EO belum tersedia di API backend."
                  )
                }
              >
                <span>↓</span>
                Export Data
              </button>

            </div>

          </div>

          {/* ==================================
              STATISTICS
          ================================== */}

          <div className="pengajuan-statistics">

            {/* PENDING */}

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
                {totalPending}
              </h2>

              <p>
                Menunggu verifikasi
              </p>

            </div>

            {/* APPROVED */}

            <div className="stat-card approved-card">

              <div className="stat-card-top">

                <span className="stat-label">
                  DISETUJUI
                </span>

                <div className="stat-icon approved-icon">
                  ✓
                </div>

              </div>

              <h2>
                {totalApproved}
              </h2>

              <p>
                Pengajuan disetujui
              </p>

            </div>

            {/* REJECTED */}

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
                {totalRejected}
              </h2>

              <p>
                Pengajuan ditolak
              </p>

            </div>

          </div>

          {/* ==================================
              APPLICATION PANEL
          ================================== */}

          <div className="application-panel">

            {/* PANEL HEADER */}

            <div className="application-panel-header">

              <div>

                <h2>
                  Daftar Pengajuan
                </h2>

                <p>
                  Daftar Event Organizer yang
                  mengajukan akun.
                </p>

              </div>

              <div className="current-filter">
                {filter}
              </div>

            </div>

            {/* ==================================
                ERROR
            ================================== */}

            {error && (
              <div className="empty-application">

                <p>
                  {error}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    handleFilter(filter)
                  }
                >
                  Coba Lagi
                </button>

              </div>
            )}

            {/* ==================================
                LIST
            ================================== */}

            <div className="application-list">

              {loading ? (

                <div className="empty-application">
                  Memuat pengajuan EO...
                </div>

              ) : applications.length > 0 ? (

                applications.map(
                  (application) => {

                    const status =
                      application.verificationStatus;

                    return (
                      <div
                        className="application-item"
                        key={
                          application.organizerId
                        }
                      >

                        {/* ICON */}

                        <div className="company-icon">
                          ▣
                        </div>

                        {/* INFO */}

                        <div className="company-info">

                          <h3>
                            {application.nameOrganizer ||
                              "-"}
                          </h3>

                          <div className="company-meta">

                            <span>
                              {application.userEmail ||
                                "-"}
                            </span>

                            <span className="meta-dot">
                              •
                            </span>

                            <span>
                              {formatDate(
                                application.createdAt
                              )}
                            </span>

                          </div>

                        </div>

                        {/* STATUS */}

                        <div
                          className={`application-status ${getStatusClass(
                            status
                          )}`}
                        >
                          {getStatusLabel(
                            status
                          )}
                        </div>

                        {/* DETAIL */}

                        <button
                          type="button"
                          className="detail-button"
                          onClick={() =>
                            handleDetail(
                              application
                            )
                          }
                        >
                          {status ===
                          "VERIFIED"
                            ? "Lihat Profil"
                            : "Lihat Detail"}
                        </button>

                      </div>
                    );
                  }
                )

              ) : (

                <div className="empty-application">
                  Belum ada pengajuan akun EO.
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