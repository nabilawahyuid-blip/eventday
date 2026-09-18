import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { changePassword } from "../../services/profileService";
import "./ChangePasswordCustomer.css";

function ChangePasswordCustomer() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.oldPassword || !formData.newPassword || !formData.confirmPassword) {
      Swal.fire({
        icon: "warning",
        title: "Data Belum Lengkap",
        text: "Semua field wajib diisi.",
        confirmButtonColor: "#5143e6",
      });
      return;
    }

    if (formData.newPassword.length < 6) {
      Swal.fire({
        icon: "warning",
        title: "Password Terlalu Pendek",
        text: "Password baru minimal 6 karakter.",
        confirmButtonColor: "#5143e6",
      });
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      Swal.fire({
        icon: "warning",
        title: "Password Tidak Cocok",
        text: "Konfirmasi password baru tidak cocok.",
        confirmButtonColor: "#5143e6",
      });
      return;
    }

    if (formData.oldPassword === formData.newPassword) {
      Swal.fire({
        icon: "warning",
        title: "Password Sama",
        text: "Password baru tidak boleh sama dengan password lama.",
        confirmButtonColor: "#5143e6",
      });
      return;
    }

    setSaving(true);
    try {
      await changePassword(formData.oldPassword, formData.newPassword);
      await Swal.fire({
        icon: "success",
        title: "Password Berhasil Diubah",
        text: "Silakan login kembali dengan password baru.",
        confirmButtonColor: "#5143e6",
      });
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.removeItem("name");
      localStorage.removeItem("username");
      localStorage.removeItem("email");
      localStorage.removeItem("role");
      navigate("/");
    } catch (err) {
      console.error("Gagal ubah password:", err);
      Swal.fire({
        icon: "error",
        title: "Gagal Mengubah Password",
        text: err?.message || "Terjadi kesalahan. Silakan coba lagi.",
        confirmButtonColor: "#5143e6",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="change-password-page">
      <header className="change-password-header">
        <button type="button" className="change-password-back-button" onClick={() => navigate(-1)} aria-label="Kembali">
          <svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" /></svg>
        </button>
        <div className="change-password-logo">EVENT<span>DAY</span></div>
      </header>

      <main className="change-password-content">
        <section className="change-password-card">
          <div className="change-password-icon">
            <svg viewBox="0 0 24 24">
              <rect x="5" y="10" width="14" height="11" rx="2" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" />
              <circle cx="12" cy="15" r="1" />
            </svg>
          </div>

          <h2>Ubah Password</h2>
          <p className="change-password-subtitle">Masukkan password lama dan password baru kamu.</p>

          <form onSubmit={handleSubmit}>
            <div className="change-password-form-body">
              <div className="change-password-input-group">
                <label htmlFor="oldPassword">Password Lama</label>
                <div className="change-password-input-wrapper">
                  <input
                    id="oldPassword"
                    type={showOld ? "text" : "password"}
                    name="oldPassword"
                    value={formData.oldPassword}
                    onChange={handleChange}
                    placeholder="Masukan password lama"
                  />
                  <button type="button" className="change-password-toggle" onClick={() => setShowOld(!showOld)}>
                    {showOld ? (
                      <svg viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M1 1l22 22" /></svg>
                    ) : (
                      <svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="change-password-input-group">
                <label htmlFor="newPassword">Password Baru</label>
                <div className="change-password-input-wrapper">
                  <input
                    id="newPassword"
                    type={showNew ? "text" : "password"}
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    placeholder="Masukan password baru (min. 6 karakter)"
                  />
                  <button type="button" className="change-password-toggle" onClick={() => setShowNew(!showNew)}>
                    {showNew ? (
                      <svg viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M1 1l22 22" /></svg>
                    ) : (
                      <svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="change-password-input-group">
                <label htmlFor="confirmPassword">Konfirmasi Password Baru</label>
                <input
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Ulangi password baru"
                />
              </div>
            </div>

            <div className="change-password-form-footer">
              <button type="button" className="change-password-cancel-button" onClick={() => navigate(-1)}>
                Batal
              </button>
              <button type="submit" className="change-password-save-button" disabled={saving}>
                {saving ? "Menyimpan..." : "Ubah Password"}
              </button>
            </div>
          </form>
        </section>
      </main>

      <footer className="change-password-footer">
        &copy; 2027 EVENTDAY. Hak cipta dilindungi undang-undang.
      </footer>
    </div>
  );
}

export default ChangePasswordCustomer;
