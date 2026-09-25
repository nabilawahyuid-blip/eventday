import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Sidebar from "../shared/Sidebar";
import Navbar from "../shared/Navbar";

import {
  getAdminUserDetail,
  updateAdminUserStatus,
  suspendAdminUser,
} from "../../services/adminUserService";

import {
  showSuccess,
  showError,
  showConfirm,
} from "../../utils/alert";

import "./DetailUser.css";

function DetailUser() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // ==================================================
  // GET DETAIL USER
  // ==================================================
  const fetchUserDetail = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAdminUserDetail(id);

      console.log("DETAIL USER RESPONSE:", response);

      const userData = response?.data ?? response;

      if (!userData || typeof userData !== "object") {
        throw new Error("Data user tidak ditemukan.");
      }

      setUser(userData);
    } catch (err) {
      console.error("Gagal mengambil detail user:", err);

      setError(
        err?.message || "Gagal mengambil data user."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // LOAD DATA
  // ==================================================
  useEffect(() => {
    if (!id) {
      setError("ID user tidak ditemukan.");
      setLoading(false);
      return;
    }

    fetchUserDetail();
  }, [id]);

  // ==================================================
  // BACK
  // ==================================================
  const handleBack = () => {
    navigate("/admin/users");
  };

  // ==================================================
  // UPDATE STATUS
  // ==================================================
  const handleUpdateStatus = async (newStatus) => {
    if (!user?.userId || actionLoading) return;

    try {
      setActionLoading(true);

      console.log(
        "UPDATE USER STATUS:",
        user.userId,
        newStatus
      );

      await updateAdminUserStatus(
        user.userId,
        newStatus
      );

      await showSuccess(
        "Status User Diperbarui",
        `Status user berhasil diubah menjadi ${getStatusLabel(
          newStatus
        )}.`
      );

      await fetchUserDetail();
    } catch (err) {
      console.error(
        "Gagal update status user:",
        err
      );

      await showError(
        "Gagal Memperbarui Status User",
        err?.message ||
          "Gagal mengubah status user."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ==================================================
  // SUSPEND
  // ==================================================
  const handleSuspend = async () => {
    if (!user?.userId || actionLoading) return;

    const { isConfirmed } = await showConfirm(
      "Konfirmasi Tindakan",
      `Yakin ingin suspend user "${user.name || "ini"}"?`,
      "Ya, Lanjutkan",
      "Batal"
    );
    if (!isConfirmed) return;

    try {
      setActionLoading(true);

      console.log(
        "SUSPEND USER:",
        user.userId
      );

      await suspendAdminUser(user.userId);

      await showSuccess(
        "User Berhasil Disuspend",
        "User berhasil di-suspend."
      );

      await fetchUserDetail();
    } catch (err) {
      console.error(
        "Gagal suspend user:",
        err
      );

      await showError(
        "Gagal Menonaktifkan User",
        err?.message ||
          "Gagal suspend user."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ==================================================
  // COPY
  // ==================================================
  const handleCopy = async (text) => {
    if (!text) return;

    try {
      await navigator.clipboard.writeText(
        String(text)
      );

      await showSuccess(
        "Data Berhasil Disalin",
        "Berhasil disalin."
      );
    } catch (err) {
      console.error("Gagal copy:", err);

      await showError(
        "Gagal Menyalin Data",
        "Gagal menyalin data."
      );
    }
  };

  // ==================================================
  // ROLE
  // ==================================================
  const getRoleLabel = (role) => {
    switch (role) {
      case "ORGANIZER":
        return "Event Organizer";

      case "CUSTOMER":
        return "Regular User";

      case "ADMIN":
        return "Administrator";

      default:
        return role || "-";
    }
  };

  // ==================================================
  // STATUS
  // ==================================================
  const getStatusLabel = (status) => {
    switch (status) {
      case "ACTIVE":
        return "Active";

      case "INACTIVE":
        return "Inactive";

      case "SUSPENDED":
        return "Suspended";

      default:
        return status || "-";
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "ACTIVE":
        return "status-active";

      case "INACTIVE":
        return "status-inactive";

      case "SUSPENDED":
        return "status-suspended";

      default:
        return "";
    }
  };

  // ==================================================
  // DATE
  // ==================================================
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

  // ==================================================
  // AVATAR
  // ==================================================
  const getInitials = (name) => {
    if (!name) return "U";

    return name
      .split(" ")
      .filter(Boolean)
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  // ==================================================
  // LOADING
  // ==================================================
  if (loading) {
    return (
      <div className="detail-user-page">
        <Sidebar />

        <main className="detail-user-main">
          <Navbar />

          <div className="detail-user-content">
            <div className="detail-user-heading">
              <button
                type="button"
                className="back-button"
                onClick={handleBack}
              >
                ←
              </button>

              <h1>User Management</h1>
            </div>

            <div
              className="information-card"
              style={{
                padding: "40px",
                textAlign: "center",
              }}
            >
              Memuat data user...
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ==================================================
  // ERROR
  // ==================================================
  if (error || !user) {
    return (
      <div className="detail-user-page">
        <Sidebar />

        <main className="detail-user-main">
          <Navbar />

          <div className="detail-user-content">
            <div className="detail-user-heading">
              <button
                type="button"
                className="back-button"
                onClick={handleBack}
              >
                ←
              </button>

              <h1>User Management</h1>
            </div>

            <div
              className="information-card"
              style={{
                padding: "40px",
                textAlign: "center",
              }}
            >
              <h3>
                Gagal mengambil data user
              </h3>

              <p>
                {error ||
                  "User tidak ditemukan."}
              </p>

              <button
                type="button"
                onClick={fetchUserDetail}
              >
                Coba Lagi
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ==================================================
  // IMPORTANT
  // ==================================================
  const status = user.authStatus;

  return (
    <div className="detail-user-page">
      <Sidebar />

      <main className="detail-user-main">
        <Navbar />

        <div className="detail-user-content">

          {/* =========================
              TITLE
          ========================= */}
          <div className="detail-user-heading">
            <button
              type="button"
              className="back-button"
              onClick={handleBack}
            >
              ←
            </button>

            <h1>User Management</h1>
          </div>

          {/* =========================
              PROFILE
          ========================= */}
          <section className="user-profile-card">

            <div className="user-profile-left">

              <div className="user-avatar">
                {getInitials(user.name)}
              </div>

              <div className="user-profile-info">

                <h2>
                  {user.name || "-"}
                </h2>

                <div className="user-role">
                  {getRoleLabel(user.role)}

                  <span>•</span>

                  Joined{" "}
                  {formatDate(user.createdAt)}
                </div>

                <div className="user-badges">

                  {user.role === "ORGANIZER" && (
                    <span className="user-badge verified-badge">
                      Event Organizer
                    </span>
                  )}

                  <span
                    className={`user-badge event-badge ${getStatusClass(
                      status
                    )}`}
                  >
                    {getStatusLabel(status)}
                  </span>

                </div>
              </div>
            </div>

            {/* =========================
                ACTION BUTTON
            ========================= */}
            <div className="user-profile-actions">

              {status !== "SUSPENDED" && (
                <button
                  type="button"
                  className="suspend-button"
                  disabled={actionLoading}
                  onClick={handleSuspend}
                >
                  {actionLoading
                    ? "Processing..."
                    : "Suspend"}
                </button>
              )}

              {status === "SUSPENDED" && (
                <button
                  type="button"
                  className="edit-profile-button"
                  disabled={actionLoading}
                  onClick={() =>
                    handleUpdateStatus("ACTIVE")
                  }
                >
                  {actionLoading
                    ? "Processing..."
                    : "Aktifkan User"}
                </button>
              )}

            </div>
          </section>

          {/* =========================
              INFORMATION GRID
          ========================= */}
          <div className="user-information-grid">

            {/* =========================
                CONTACT
            ========================= */}
            <section className="information-card">

              <div className="information-header">

                <div className="information-icon">
                  ☎
                </div>

                <h3>
                  Informasi Kontak
                </h3>

              </div>

              <div className="information-divider" />

              <div className="information-content">

                {/* USERNAME */}
                <div className="information-field">

                  <label>
                    Username
                  </label>

                  <div className="information-value">
                    {user.username || "-"}
                  </div>

                </div>

                {/* EMAIL */}
                <div className="information-field">

                  <label>
                    Email
                  </label>

                  <div className="information-value email-value">

                    <span>
                      {user.email || "-"}
                    </span>

                    {user.email && (
                      <button
                        type="button"
                        className="copy-button"
                        title="Salin email"
                        onClick={() =>
                          handleCopy(user.email)
                        }
                      >
                        ⧉
                      </button>
                    )}

                  </div>

                </div>

                {/* PHONE */}
                <div className="information-field">

                  <label>
                    Nomor Telepon
                  </label>

                  <div className="information-value phone-value">

                    <span>
                      {user.phone || "-"}
                    </span>

                    {user.phone && (
                      <button
                        type="button"
                        className="copy-button"
                        title="Salin nomor telepon"
                        onClick={() =>
                          handleCopy(user.phone)
                        }
                      >
                        ⧉
                      </button>
                    )}

                  </div>

                </div>

                {/* NIK */}
                <div className="information-field">

                  <label>
                    NIK
                  </label>

                  <div className="information-value">
                    {user.nik || "-"}
                  </div>

                </div>

              </div>
            </section>

            {/* =========================
                ACCOUNT
            ========================= */}
            <section className="information-card">

              <div className="information-header">

                <div className="information-icon">
                  ◉
                </div>

                <h3>
                  Informasi Akun
                </h3>

              </div>

              <div className="information-divider" />

              <div className="information-content">

                {/* ROLE */}
                <div className="information-field">

                  <label>
                    Role
                  </label>

                  <div className="information-value">
                    {getRoleLabel(user.role)}
                  </div>

                </div>

                {/* STATUS */}
                <div className="information-field">

                  <label>
                    Status Akun
                  </label>

                  <div className="verification-row">

                    <span
                      className={`verified-status ${getStatusClass(
                        status
                      )}`}
                    >
                      {getStatusLabel(status)}
                    </span>

                  </div>

                </div>

                {/* JOINED */}
                <div className="information-field">

                  <label>
                    Bergabung Sejak
                  </label>

                  <div className="information-value">
                    {formatDate(user.createdAt)}
                  </div>

                </div>

                {/* USER ID */}
                <div className="information-field">

                  <label>
                    User ID
                  </label>

                  <div className="information-value">

                    <span>
                      {user.userId || id}
                    </span>

                    {user.userId && (
                      <button
                        type="button"
                        className="copy-button"
                        title="Salin User ID"
                        onClick={() =>
                          handleCopy(user.userId)
                        }
                      >
                        ⧉
                      </button>
                    )}

                  </div>

                </div>

              </div>
            </section>
          </div>

          {/* =========================
              DOCUMENT
          ========================= */}
          <section className="information-card">

            <div className="information-header">

              <div className="information-icon">
                ▣
              </div>

              <h3>
                Dokumen & Verifikasi
              </h3>

            </div>

            <div className="information-divider" />

            <div className="information-content">

              <p>
                Data dokumen/verifikasi
                perusahaan tidak tersedia
                pada endpoint detail user
                yang disediakan backend.
              </p>

              <p>
                Halaman hanya menampilkan
                data yang dikirim oleh API.
              </p>

            </div>
          </section>

          {/* =========================
              SUMMARY
          ========================= */}
          <section className="account-summary-card">

            <div className="account-summary-item">

              <span className="summary-label">
                Status Akun
              </span>

              <span
                className={`account-status ${getStatusClass(
                  status
                )}`}
              >
                {getStatusLabel(status)}
              </span>

            </div>

            <div className="account-summary-item">

              <span className="summary-label">
                Role
              </span>

              <strong>
                {getRoleLabel(user.role)}
              </strong>

            </div>

            <div className="account-summary-item">

              <span className="summary-label">
                Username
              </span>

              <strong>
                {user.username || "-"}
              </strong>

            </div>

            <div className="account-summary-item">

              <span className="summary-label">
                User ID
              </span>

              <strong>
                {user.userId || id}
              </strong>

            </div>

          </section>

        </div>
      </main>
    </div>
  );
}

export default DetailUser;