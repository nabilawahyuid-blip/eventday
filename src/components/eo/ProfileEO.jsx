import React, { useEffect, useRef, useState } from "react";

import SidebarEO from "../shared/SidebarEO";
import NavbarEO from "../shared/NavbarEO";

import {
  getOrganizerProfile,
  updateOrganizerProfile,
  uploadOrganizerAvatar,
  uploadOrganizerPortfolio,
  uploadOrganizerDeed,
  getOrganizerProfileDocuments,
  changeOrganizerPassword,
} from "../../services/organizerProfileService";

import "./ProfileEO.css";

function ProfileEO() {
  // ==========================================
  // STATE PROFILE
  // ==========================================

  const [profile, setProfile] = useState({
    name: "",
    pic_name: "",
    email: "",
    phone: "",
    npwp: "",
    bank_name: "",
    bank_account_number: "",
    verification_status: "",
    avatar_url: "",
  });

  // ==========================================
  // STATE EDIT
  // ==========================================

  const [isEditing, setIsEditing] = useState(false);

  const [editForm, setEditForm] = useState({
    name: "",
    pic_name: "",
    phone: "",
    npwp: "",
    bank_name: "",
    bank_account_number: "",
  });

  // ==========================================
  // STATE PASSWORD
  // ==========================================

  const [showPassword, setShowPassword] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // ==========================================
  // STATE UI
  // ==========================================

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [passwordSaving, setPasswordSaving] = useState(false);

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  // ==========================================
  // STATE DOCUMENT
  // ==========================================

  const [documents, setDocuments] = useState({
    portfolio_name: "",
    deed_name: "",
    ktp_name: "",
  });

  // ==========================================
  // FILE INPUT REFS
  // ==========================================

  const avatarInputRef = useRef(null);

  const portfolioInputRef = useRef(null);

  const deedInputRef = useRef(null);

  // ==========================================
  // GET PROFILE
  // ==========================================

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getOrganizerProfile();

      console.log("PROFILE RESPONSE:", response);

      const data = response?.data || {};

      setProfile({
        name: data.name || "",
        pic_name: data.pic_name || "",
        email: data.email || "",
        phone: data.phone || "",
        npwp: data.npwp || "",
        bank_name: data.bank_name || "",
        bank_account_number:
          data.bank_account_number || "",
        verification_status:
          data.verification_status || "",
        avatar_url: data.avatar_url || "",
      });

      setEditForm({
        name: data.name || "",
        pic_name: data.pic_name || "",
        phone: data.phone || "",
        npwp: data.npwp || "",
        bank_name: data.bank_name || "",
        bank_account_number:
          data.bank_account_number || "",
      });
    } catch (err) {
      console.error(
        "Gagal mengambil profile:",
        err
      );

      setError(
        err?.message ||
          "Gagal mengambil data profil."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // GET DOCUMENTS
  // ==========================================

  const fetchDocuments = async () => {
    try {
      const response =
        await getOrganizerProfileDocuments();

      console.log(
        "PROFILE DOCUMENT RESPONSE:",
        response
      );

      setDocuments(response?.data || {});
    } catch (err) {
      console.error(
        "Gagal mengambil dokumen profile:",
        err
      );
    }
  };

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    fetchProfile();
    fetchDocuments();
  }, []);

  // ==========================================
  // EDIT FORM CHANGE
  // ==========================================

  const handleEditChange = (e) => {
    const { name, value } = e.target;

    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ==========================================
  // OPEN EDIT
  // ==========================================

  const handleEditProfile = () => {
    setMessage("");
    setError("");

    setEditForm({
      name: profile.name,
      pic_name: profile.pic_name,
      phone: profile.phone,
      npwp: profile.npwp,
      bank_name: profile.bank_name,
      bank_account_number:
        profile.bank_account_number,
    });

    setIsEditing(true);
  };

  // ==========================================
  // CANCEL EDIT
  // ==========================================

  const handleCancelEdit = () => {
    setIsEditing(false);

    setEditForm({
      name: profile.name,
      pic_name: profile.pic_name,
      phone: profile.phone,
      npwp: profile.npwp,
      bank_name: profile.bank_name,
      bank_account_number:
        profile.bank_account_number,
    });

    // Reset input file
    if (avatarInputRef.current) {
      avatarInputRef.current.value = "";
    }

    if (portfolioInputRef.current) {
      portfolioInputRef.current.value = "";
    }

    if (deedInputRef.current) {
      deedInputRef.current.value = "";
    }
  };

  // ==========================================
  // SAVE PROFILE
  // ==========================================

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      setMessage("");
      setError("");

      const response =
        await updateOrganizerProfile({
          name: editForm.name,
          pic_name: editForm.pic_name,
          phone: editForm.phone,
          npwp: editForm.npwp,
          bank_name: editForm.bank_name,
          bank_account_number:
            editForm.bank_account_number,
        });

      console.log(
        "UPDATE PROFILE RESPONSE:",
        response
      );

      setMessage(
        "Profil berhasil diperbarui."
      );

      setIsEditing(false);

      await fetchProfile();
      await fetchDocuments();
    } catch (err) {
      console.error(
        "Gagal update profile:",
        err
      );

      setError(
        err?.message ||
          "Gagal memperbarui profil."
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // AVATAR
  // ==========================================

  const handleAvatarClick = () => {
    if (!isEditing) return;

    avatarInputRef.current?.click();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    // Validasi gambar
    if (!file.type.startsWith("image/")) {
      setError(
        "File foto profil harus berupa gambar."
      );

      e.target.value = "";
      return;
    }

    try {
      setMessage("");
      setError("");

      const response =
        await uploadOrganizerAvatar(file);

      console.log(
        "UPLOAD AVATAR RESPONSE:",
        response
      );

      const avatarUrl =
        response?.data?.avatar_url;

      if (avatarUrl) {
        setProfile((prev) => ({
          ...prev,
          avatar_url: avatarUrl,
        }));
      }

      setMessage(
        "Foto profil berhasil diperbarui."
      );
    } catch (err) {
      console.error(
        "Gagal upload avatar:",
        err
      );

      setError(
        err?.message ||
          "Gagal mengunggah foto profil."
      );
    } finally {
      e.target.value = "";
    }
  };

  // ==========================================
  // PORTFOLIO
  // ==========================================

  const handlePortfolioClick = () => {
    if (!isEditing) return;

    portfolioInputRef.current?.click();
  };

  const handlePortfolioChange = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    // Validasi file
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError(
        "File portfolio harus berupa PDF, DOC, atau DOCX."
      );

      e.target.value = "";
      return;
    }

    try {
      setMessage("");
      setError("");

      const response =
        await uploadOrganizerPortfolio(file);

      console.log(
        "UPLOAD PORTFOLIO RESPONSE:",
        response
      );

      setDocuments((prev) => ({
        ...prev,
        portfolio_name:
          response?.data?.file_name ||
          file.name,
      }));

      setMessage(
        "Portfolio berhasil diunggah."
      );
    } catch (err) {
      console.error(
        "Gagal upload portfolio:",
        err
      );

      setError(
        err?.message ||
          "Gagal mengunggah portfolio."
      );
    } finally {
      e.target.value = "";
    }
  };

  // ==========================================
  // DEED / AKTA
  // ==========================================

  const handleDeedClick = () => {
    if (!isEditing) return;

    deedInputRef.current?.click();
  };

  const handleDeedChange = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    // Validasi file
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError(
        "File akta harus berupa PDF, DOC, atau DOCX."
      );

      e.target.value = "";
      return;
    }

    try {
      setMessage("");
      setError("");

      const response =
        await uploadOrganizerDeed(file);

      console.log(
        "UPLOAD DEED RESPONSE:",
        response
      );

      setDocuments((prev) => ({
        ...prev,
        deed_name:
          response?.data?.file_name ||
          file.name,
      }));

      setMessage(
        "Akta perusahaan berhasil diunggah."
      );
    } catch (err) {
      console.error(
        "Gagal upload akta:",
        err
      );

      setError(
        err?.message ||
          "Gagal mengunggah akta perusahaan."
      );
    } finally {
      e.target.value = "";
    }
  };

  // ==========================================
  // PASSWORD CHANGE
  // ==========================================

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;

    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSavePassword = async () => {
    setMessage("");
    setError("");

    if (
      !passwordForm.oldPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      setError(
        "Semua field password wajib diisi."
      );

      return;
    }

    if (
      passwordForm.newPassword !==
      passwordForm.confirmPassword
    ) {
      setError(
        "Konfirmasi password tidak cocok."
      );

      return;
    }

    if (
      passwordForm.newPassword.length < 6
    ) {
      setError(
        "Password baru minimal 6 karakter."
      );

      return;
    }

    try {
      setPasswordSaving(true);

      await changeOrganizerPassword({
        oldPassword:
          passwordForm.oldPassword,

        newPassword:
          passwordForm.newPassword,
      });

      setMessage(
        "Password berhasil diperbarui."
      );

      setPasswordForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setShowPassword(false);
    } catch (err) {
      console.error(
        "Gagal mengganti password:",
        err
      );

      setError(
        err?.message ||
          "Gagal mengganti password."
      );
    } finally {
      setPasswordSaving(false);
    }
  };

  // ==========================================
  // AVATAR INITIAL
  // ==========================================

  const getInitials = () => {
    const name =
      profile.name ||
      profile.pic_name ||
      "EO";

    const words =
      name.trim().split(/\s+/);

    if (words.length >= 2) {
      return (
        words[0][0] +
        words[1][0]
      ).toUpperCase();
    }

    return name
      .slice(0, 2)
      .toUpperCase();
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="profile-eo-page">

      {/* ==========================================
          SIDEBAR
      ========================================== */}

      <SidebarEO />

      {/* ==========================================
          MAIN
      ========================================== */}

      <main className="profile-eo-main">

        {/* ========================================
            NAVBAR
        ======================================== */}

        <NavbarEO />

        {/* ========================================
            CONTENT
        ======================================== */}

        <div className="profile-eo-content">

          {/* PAGE TITLE */}

          <div className="profile-page-header">
            <h1>Profil</h1>
          </div>

          {/* ========================================
              SUCCESS MESSAGE
          ======================================== */}

          {message && (
            <div
              style={{
                marginBottom: "15px",
                padding: "12px 15px",
                borderRadius: "8px",
                background: "#eaf8ef",
                color: "#218838",
                fontSize: "13px",
              }}
            >
              {message}
            </div>
          )}

          {/* ========================================
              ERROR MESSAGE
          ======================================== */}

          {error && (
            <div
              style={{
                marginBottom: "15px",
                padding: "12px 15px",
                borderRadius: "8px",
                background: "#fff0f0",
                color: "#c62828",
                fontSize: "13px",
              }}
            >
              {error}
            </div>
          )}

          {/* ========================================
              PROFILE HEADER CARD
          ======================================== */}

          <section className="profile-main-card">

            <div className="profile-company">

              {/* PROFILE IMAGE */}

              <div className="profile-image-wrapper">

                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="Foto profil"
                    className="profile-image"
                  />
                ) : (
                  <div className="profile-image">
                    {getInitials()}
                  </div>
                )}

                {/* TOMBOL EDIT FOTO
                    HANYA MUNCUL SAAT EDIT */}

                {isEditing && (
                  <>
                    <button
                      type="button"
                      className="profile-image-edit"
                      onClick={
                        handleAvatarClick
                      }
                    >
                      ✎
                    </button>

                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/*"
                      style={{
                        display: "none",
                      }}
                      onChange={
                        handleAvatarChange
                      }
                    />
                  </>
                )}

              </div>

              {/* COMPANY INFO */}

              <div className="profile-company-info">

                <h2>
                  {loading
                    ? "Memuat..."
                    : profile.name ||
                      "Nama Organizer"}
                </h2>

                <span>
                  Nama Event Organizer
                </span>

              </div>

            </div>

            {/* ACTION BUTTON */}

            <div className="profile-actions">

              {/* GANTI PASSWORD */}

              <button
                type="button"
                className="change-password-btn"
                onClick={() => {
                  setError("");
                  setMessage("");
                  setShowPassword(true);
                }}
              >
                Ganti Password
              </button>

              {/* =================================
                  MODE NORMAL
              ================================= */}

              {!isEditing ? (
                <button
                  type="button"
                  className="edit-profile-btn"
                  onClick={
                    handleEditProfile
                  }
                >
                  ✎ Edit Profil
                </button>
              ) : (
                <>
                  {/* BATAL */}

                  <button
                    type="button"
                    className="change-password-btn"
                    onClick={
                      handleCancelEdit
                    }
                  >
                    Batal
                  </button>

                  {/* SIMPAN */}

                  <button
                    type="button"
                    className="edit-profile-btn"
                    onClick={
                      handleSaveProfile
                    }
                    disabled={saving}
                  >
                    {saving
                      ? "Menyimpan..."
                      : "Simpan Profil"}
                  </button>
                </>
              )}

            </div>

          </section>

          {/* ========================================
              INFORMATION CARD
          ======================================== */}

          <section className="profile-information-card">

            {/* TITLE */}

            <div className="profile-section-title">

              <div className="profile-section-icon">
                ⓘ
              </div>

              <h2>
                Informasi Event Organizer
              </h2>

            </div>

            <div className="profile-divider"></div>

            {/* ======================================
                PROFILE INFO GRID
            ====================================== */}

            <div className="profile-info-grid">

              {/* NAMA PERUSAHAAN */}

              <div className="profile-field">

                <label>
                  NAMA PERUSAHAAN
                </label>

                <div className="profile-input-wrapper">

                  <input
                    type="text"
                    name="name"
                    value={
                      isEditing
                        ? editForm.name
                        : profile.name
                    }
                    onChange={
                      handleEditChange
                    }
                    readOnly={!isEditing}
                  />

                  {isEditing && (
                    <span className="field-icon">
                      ✎
                    </span>
                  )}

                </div>

              </div>

              {/* NPWP */}

              <div className="profile-field">

                <label>
                  NPWP
                </label>

                <div className="profile-input-wrapper">

                  <input
                    type="text"
                    name="npwp"
                    value={
                      isEditing
                        ? editForm.npwp
                        : profile.npwp || "-"
                    }
                    onChange={
                      handleEditChange
                    }
                    readOnly={!isEditing}
                  />

                  {isEditing && (
                    <span className="field-icon">
                      ✎
                    </span>
                  )}

                </div>

              </div>

              {/* EMAIL */}

              <div className="profile-field">

                <label>
                  EMAIL
                </label>

                <div className="profile-input-wrapper">

                  <input
                    type="email"
                    value={
                      profile.email || "-"
                    }
                    readOnly
                  />

                </div>

              </div>

              {/* PIC */}

              <div className="profile-field">

                <label>
                  NAMA PIC
                </label>

                <div className="profile-input-wrapper">

                  <input
                    type="text"
                    name="pic_name"
                    value={
                      isEditing
                        ? editForm.pic_name
                        : profile.pic_name
                    }
                    onChange={
                      handleEditChange
                    }
                    readOnly={!isEditing}
                  />

                  {isEditing && (
                    <span className="field-icon">
                      ✎
                    </span>
                  )}

                </div>

              </div>

              {/* PHONE */}

              <div className="profile-field">

                <label>
                  NOMOR TELEPON
                </label>

                <div className="profile-input-wrapper">

                  <input
                    type="text"
                    name="phone"
                    value={
                      isEditing
                        ? editForm.phone
                        : profile.phone
                    }
                    onChange={
                      handleEditChange
                    }
                    readOnly={!isEditing}
                  />

                  {isEditing && (
                    <span className="field-icon">
                      ✎
                    </span>
                  )}

                </div>

              </div>

              {/* BANK */}

              <div className="profile-field">

                <label>
                  BANK
                </label>

                <div className="profile-input-wrapper">

                  <input
                    type="text"
                    name="bank_name"
                    value={
                      isEditing
                        ? editForm.bank_name
                        : profile.bank_name
                    }
                    onChange={
                      handleEditChange
                    }
                    readOnly={!isEditing}
                  />

                  {isEditing && (
                    <span className="field-icon">
                      ✎
                    </span>
                  )}

                </div>

              </div>

              {/* NOMOR REKENING */}

              <div className="profile-field">

                <label>
                  NOMOR REKENING
                </label>

                <div className="profile-input-wrapper">

                  <input
                    type="text"
                    name="bank_account_number"
                    value={
                      isEditing
                        ? editForm.bank_account_number
                        : profile.bank_account_number ||
                          "-"
                    }
                    onChange={
                      handleEditChange
                    }
                    readOnly={!isEditing}
                  />

                  {isEditing && (
                    <span className="field-icon">
                      ✎
                    </span>
                  )}

                </div>

              </div>

            </div>

            {/* ======================================
                PORTFOLIO
            ====================================== */}

            <div className="profile-document">

              <label>
                PORTOFOLIO/CV
              </label>

              <div className="document-box">

                <div className="document-left">

                  <div className="document-icon">
                    📄
                  </div>

                  <span>
                    {documents.portfolio_name ||
                      "Belum ada portfolio"}
                  </span>

                </div>

                {/* UPLOAD BUTTON
                    HANYA MUNCUL SAAT EDIT */}

                {isEditing && (
                  <>
                    <button
                      type="button"
                      className="download-document"
                      onClick={
                        handlePortfolioClick
                      }
                    >
                      ↑
                    </button>

                    <input
                      ref={portfolioInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx"
                      style={{
                        display: "none",
                      }}
                      onChange={
                        handlePortfolioChange
                      }
                    />
                  </>
                )}

              </div>

            </div>

            {/* ======================================
                AKTA
            ====================================== */}

            <div className="profile-document">

              <label>
                AKTA PERUSAHAAN
              </label>

              <div className="document-box">

                <div className="document-left">

                  <div className="document-icon">
                    📄
                  </div>

                  <span>
                    {documents.deed_name ||
                      "Belum ada akta"}
                  </span>
                </div>

                {/* UPLOAD BUTTON
                    HANYA MUNCUL SAAT EDIT */}

                {isEditing && (
                  <>
                    <button
                      type="button"
                      className="download-document"
                      onClick={
                        handleDeedClick
                      }
                    >
                      ↑
                    </button>

                    <input
                      ref={deedInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx"
                      style={{
                        display: "none",
                      }}
                      onChange={
                        handleDeedChange
                      }
                    />
                  </>
                )}

              </div>

            </div>

          </section>

        </div>

      </main>

      {/* ==========================================
          PASSWORD MODAL
      ========================================== */}

      {showPassword && (
        <div className="password-overlay">

          <div className="password-modal">

            <div className="password-modal-header">

              <div>

                <h2>
                  Ganti Password
                </h2>

                <p>
                  Masukkan password baru Anda.
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  setShowPassword(false)
                }
              >
                ×
              </button>

            </div>

            <div className="password-form">

              {/* PASSWORD LAMA */}

              <label>
                PASSWORD LAMA
              </label>

              <input
                type="password"
                name="oldPassword"
                value={
                  passwordForm.oldPassword
                }
                onChange={
                  handlePasswordChange
                }
                placeholder="Masukkan password lama"
              />

              {/* PASSWORD BARU */}

              <label>
                PASSWORD BARU
              </label>

              <input
                type="password"
                name="newPassword"
                value={
                  passwordForm.newPassword
                }
                onChange={
                  handlePasswordChange
                }
                placeholder="Masukkan password baru"
              />

              {/* KONFIRMASI */}

              <label>
                KONFIRMASI PASSWORD
              </label>

              <input
                type="password"
                name="confirmPassword"
                value={
                  passwordForm.confirmPassword
                }
                onChange={
                  handlePasswordChange
                }
                placeholder="Konfirmasi password baru"
              />

              {/* SIMPAN PASSWORD */}

              <button
                type="button"
                className="save-password-btn"
                onClick={
                  handleSavePassword
                }
                disabled={
                  passwordSaving
                }
              >
                {passwordSaving
                  ? "Menyimpan..."
                  : "Simpan Password"}
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default ProfileEO;