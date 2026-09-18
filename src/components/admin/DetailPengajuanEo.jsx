import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Sidebar from "../shared/Sidebar";
import Navbar from "../shared/Navbar";

import {
  getEoApplicationDetail,
  updateEoApplicationStatus,
  getCompanyDeedDocument,
} from "../../services/adminEoService";

import "./DetailPengajuanEo.css";

export default function DetailPengajuanEo() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [application, setApplication] = useState(null);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [error, setError] = useState("");

  const [decision, setDecision] = useState("");
  const [notes, setNotes] = useState("");

  // ==========================================
  // GET DETAIL
  // ==========================================
  const fetchDetail = async () => {
    try {
      setLoading(true);
      setError("");

      if (!id) {
        throw new Error(
          "ID pengajuan EO tidak ditemukan."
        );
      }

      const response =
        await getEoApplicationDetail(id);

      console.log(
        "DETAIL PENGAJUAN EO RESPONSE:",
        response
      );

      const data = response?.data ?? response;

      if (!data || typeof data !== "object") {
        throw new Error(
          "Data pengajuan EO tidak ditemukan."
        );
      }

      setApplication(data);
    } catch (err) {
      console.error(
        "Gagal mengambil detail pengajuan EO:",
        err
      );

      setError(
        err?.message ||
          "Gagal mengambil detail pengajuan EO."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // LOAD
  // ==========================================
  useEffect(() => {
    fetchDetail();
  }, [id]);

  // ==========================================
  // BACK
  // ==========================================
  const handleBack = () => {
    navigate("/admin/pengajuan-eo");
  };

  // ==========================================
  // STATUS LABEL
  // ==========================================
  const getStatusLabel = (status) => {
    switch (status) {
      case "UNVERIFIED":
      case "PENDING":
        return "PENDING";

      case "VERIFIED":
        return "DISETUJUI";

      case "REJECTED":
        return "DITOLAK";

      default:
        return status || "-";
    }
  };

  // ==========================================
  // STATUS CLASS
  // ==========================================
  const getStatusClass = (status) => {
    switch (status) {
      case "VERIFIED":
        return "approved";

      case "REJECTED":
        return "rejected";

      case "UNVERIFIED":
      case "PENDING":
      default:
        return "pending";
    }
  };

  // ==========================================
  // DATE
  // ==========================================
  const formatDate = (date) => {
    if (!date) return "-";

    try {
      return new Date(date).toLocaleDateString(
        "id-ID",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      );
    } catch {
      return date;
    }
  };

  // ==========================================
  // UPDATE STATUS
  // ==========================================
  const handleDecision = (status) => {
    setDecision(status);
  };

  // ==========================================
  // CONFIRM DECISION
  // ==========================================
  const handleConfirmDecision = async () => {
    if (!application) return;

    if (!decision) {
      alert(
        "Silakan pilih Setujui atau Tolak terlebih dahulu."
      );
      return;
    }

    if (actionLoading) return;

    // Kalau ditolak, catatan wajib diisi
    if (
      decision === "REJECTED" &&
      !notes.trim()
    ) {
      alert(
        "Masukkan alasan penolakan terlebih dahulu."
      );
      return;
    }

    const statusText =
      decision === "VERIFIED"
        ? "menyetujui"
        : "menolak";

    const confirmed = window.confirm(
      `Yakin ingin ${statusText} pengajuan "${application.nameOrganizer}"?`
    );

    if (!confirmed) return;

    try {
      setActionLoading(true);

      console.log(
        "UPDATE EO STATUS:",
        application.organizerId,
        decision
      );

      const response =
        await updateEoApplicationStatus(
          application.organizerId,
          decision,
          decision === "REJECTED"
            ? notes.trim()
            : null
        );

      console.log(
        "UPDATE EO STATUS RESPONSE:",
        response
      );

      alert(
        decision === "VERIFIED"
          ? "Pengajuan EO berhasil disetujui."
          : "Pengajuan EO berhasil ditolak."
      );

      // kembali ke daftar
      navigate("/admin/pengajuan-eo");
    } catch (err) {
      console.error(
        "Gagal mengubah status pengajuan EO:",
        err
      );

      alert(
        err?.message ||
          "Gagal mengubah status pengajuan EO."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ==========================================
  // PREVIEW DOCUMENT
  // ==========================================
  const handleViewDeed = async () => {
    if (!application?.organizerId) return;

    try {
      const response =
        await getCompanyDeedDocument(
          application.organizerId
        );

      console.log(
        "COMPANY DEED RESPONSE:",
        response
      );

      const data = response?.data ?? response;

      /*
       * Backend harus mengembalikan URL/path
       * dokumen agar bisa dibuka.
       */
      const documentUrl =
        data?.url ||
        data?.fileUrl ||
        data?.documentUrl ||
        data?.downloadUrl;

      if (documentUrl) {
        window.open(
          documentUrl,
          "_blank",
          "noopener,noreferrer"
        );
        return;
      }

      alert(
        "Dokumen ditemukan, tetapi backend tidak mengirim URL dokumen."
      );
    } catch (err) {
      console.error(
        "Gagal mengambil dokumen:",
        err
      );

      alert(
        err?.message ||
          "Dokumen tidak dapat dibuka."
      );
    }
  };

  // ==========================================
  // LOADING
  // ==========================================
  if (loading) {
    return (
      <div className="admin-dashboard">
        <Sidebar />

        <div className="dashboard-wrapper">
          <Navbar />

          <main className="dashboard-main">
            <div className="dashboard-content">

              <div className="back-section">
                <button
                  onClick={handleBack}
                  className="btn-back"
                  type="button"
                >
                  ← Back to List
                </button>
              </div>

              <div className="info-card">
                Memuat detail pengajuan EO...
              </div>

            </div>
          </main>
        </div>
      </div>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================
  if (error || !application) {
    return (
      <div className="admin-dashboard">
        <Sidebar />

        <div className="dashboard-wrapper">
          <Navbar />

          <main className="dashboard-main">
            <div className="dashboard-content">

              <div className="back-section">
                <button
                  onClick={handleBack}
                  className="btn-back"
                  type="button"
                >
                  ← Back to List
                </button>
              </div>

              <div className="info-card">
                <h3>
                  Gagal mengambil data
                </h3>

                <p>
                  {error ||
                    "Pengajuan EO tidak ditemukan."}
                </p>

                <button
                  type="button"
                  onClick={fetchDetail}
                >
                  Coba Lagi
                </button>
              </div>

            </div>
          </main>
        </div>
      </div>
    );
  }

  const status =
    application.verificationStatus;

  return (
    <div className="admin-dashboard">

      <Sidebar />

      <div className="dashboard-wrapper">

        <Navbar />

        <main className="dashboard-main">

          <div className="dashboard-content">

            {/* ==================================
                BACK
            ================================== */}
            <div className="back-section">
              <button
                onClick={handleBack}
                className="btn-back"
                type="button"
              >
                ← Back to List
              </button>
            </div>

            {/* ==================================
                HEADER
            ================================== */}
            <div className="page-header-row">

              <div className="header-title-group">

                <h1 className="page-title">
                  Review Application
                </h1>

                <span
                  className={`badge-status ${getStatusClass(
                    status
                  )}`}
                >
                  {getStatusLabel(status)}
                </span>

              </div>

              <span className="submission-date">
                Submitted on{" "}
                {formatDate(
                  application.createdAt
                )}
              </span>

            </div>

            {/* ==================================
                GRID
            ================================== */}
            <div className="review-grid-layout">

              {/* ==================================
                  LEFT
              ================================== */}
              <div className="review-left-column">

                {/* ================================
                    INFORMASI USER
                ================================= */}
                <div className="info-card">

                  <h3 className="card-section-title">
                    Informasi Pribadi
                  </h3>

                  <div className="info-grid-2">

                    <div>
                      <p className="info-label">
                        NAMA LENGKAP
                      </p>

                      <p className="info-value">
                        {application.nameOrganizer ||
                          "-"}
                      </p>
                    </div>

                    <div>
                      <p className="info-label">
                        EMAIL
                      </p>

                      <p className="info-value">
                        {application.userEmail ||
                          "-"}
                      </p>
                    </div>

                    <div>
                      <p className="info-label">
                        NO WHATSAPP
                      </p>

                      <p className="info-value">
                        {application.userPhone ||
                          "-"}
                      </p>
                    </div>

                    <div>
                      <p className="info-label">
                        NOMOR IDENTITAS (NIK)
                      </p>

                      <p className="info-value">
                        -
                      </p>
                    </div>

                  </div>
                </div>

                {/* ================================
                    INFORMASI EO
                ================================= */}
                <div className="info-card">

                  <h3 className="card-section-title">
                    Informasi Event Organizer
                  </h3>

                  <div className="info-grid-2">

                    <div>
                      <p className="info-label">
                        NAMA AKUN EO
                      </p>

                      <p className="info-value">
                        {application.nameOrganizer ||
                          "-"}
                      </p>
                    </div>

                    <div>
                      <p className="info-label">
                        NPWP
                      </p>

                      <p className="info-value">
                        {application.npwpNumber ||
                          "-"}
                      </p>
                    </div>

                    <div>
                      <p className="info-label">
                        NAMA BANK
                      </p>

                      <p className="info-value">
                        {application.bankName ||
                          "-"}
                      </p>
                    </div>

                    <div>
                      <p className="info-label">
                        NOMOR REKENING
                      </p>

                      <p className="info-value">
                        {application.bankAccountNumber ||
                          "-"}
                      </p>
                    </div>

                  </div>
                </div>

                {/* ================================
                    DOKUMEN
                ================================= */}
                <div className="info-card">

                  <h3 className="card-section-title">
                    Dokumen Pendukung
                  </h3>

                  <div className="document-list">

                    {/* PORTFOLIO */}
                    <div className="document-item">

                      <div className="document-info-group">

                        <span className="doc-icon">
                          📄
                        </span>

                        <div>

                          <p className="doc-name">
                            CV / Portofolio
                          </p>

                          <p className="doc-size">
                            Dokumen pendaftaran EO
                          </p>

                        </div>

                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          alert(
                            "Endpoint preview CV/Portofolio belum tersedia pada API admin."
                          )
                        }
                        className="btn-outline-doc"
                      >
                        Lihat Dokumen
                      </button>

                    </div>

                    {/* AKTA */}
                    <div className="document-item">

                      <div className="document-info-group">

                        <span className="doc-icon">
                          📄
                        </span>

                        <div>

                          <p className="doc-name">
                            Akta Perusahaan
                          </p>

                          <p className="doc-size">
                            Dokumen pendaftaran EO
                          </p>

                        </div>

                      </div>

                      <button
                        type="button"
                        onClick={handleViewDeed}
                        className="btn-outline-doc"
                      >
                        Lihat Dokumen
                      </button>

                    </div>

                  </div>
                </div>

              </div>

              {/* ==================================
                  RIGHT / ACTION
              ================================== */}
              <div className="review-right-column">

                <div className="action-card-sticky">

                  <h3 className="card-section-title">
                    🛡️ Aksi Superadmin
                  </h3>

                  <div className="action-button-group">

                    {/* TOLAK */}
                    <button
                      type="button"
                      className={`btn-action-reject ${
                        decision === "REJECTED"
                          ? "selected"
                          : ""
                      }`}
                      disabled={
                        actionLoading ||
                        status === "VERIFIED" ||
                        status === "REJECTED"
                      }
                      onClick={() =>
                        handleDecision("REJECTED")
                      }
                    >
                      Tolak
                    </button>

                    {/* SETUJUI */}
                    <button
                      type="button"
                      className={`btn-action-approve ${
                        decision === "VERIFIED"
                          ? "selected"
                          : ""
                      }`}
                      disabled={
                        actionLoading ||
                        status === "VERIFIED" ||
                        status === "REJECTED"
                      }
                      onClick={() =>
                        handleDecision("VERIFIED")
                      }
                    >
                      Setujui
                    </button>

                  </div>

                  {/* ==========================
                      NOTES
                  =========================== */}
                  <div className="notes-group">

                    <label
                      className="info-label"
                      style={{
                        display: "block",
                        marginBottom: "6px",
                      }}
                    >
                      CATATAN INTERNAL
                      {decision === "REJECTED"
                        ? " (WAJIB UNTUK PENOLAKAN)"
                        : " (OPSIONAL)"}
                    </label>

                    <textarea
                      rows="3"
                      placeholder={
                        decision === "REJECTED"
                          ? "Masukkan alasan penolakan..."
                          : "Tambahkan catatan..."
                      }
                      className="textarea-notes"
                      value={notes}
                      onChange={(e) =>
                        setNotes(e.target.value)
                      }
                      disabled={
                        actionLoading ||
                        status === "VERIFIED" ||
                        status === "REJECTED"
                      }
                    />

                  </div>

                  {/* ==========================
                      CONFIRM
                  =========================== */}
                  <button
                    type="button"
                    onClick={handleConfirmDecision}
                    className="btn-confirm-decision"
                    disabled={
                      actionLoading ||
                      !decision ||
                      status === "VERIFIED" ||
                      status === "REJECTED"
                    }
                  >
                    {actionLoading
                      ? "Memproses..."
                      : "Konfirmasi Keputusan →"}
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