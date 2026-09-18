import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { getProfile, updateProfile, uploadAvatar } from "../../services/profileService";
import "./EditProfileCustomer.css";

function EditProfileCustomer() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    username: "",
    phone: "",
    nik: "",
  });

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await getProfile();
        const data = res?.data || {};
        if (cancelled) return;
        setFormData({
          name: data.name || "",
          email: data.email || "",
          username: data.username || "",
          phone: data.phone || "",
          nik: data.nik || "",
        });
        if (data.avatarUrl) {
          setAvatarPreview(data.avatarUrl);
        } else {
          const saved = localStorage.getItem("avatarUrl");
          if (saved) setAvatarPreview(saved);
        }
      } catch (err) {
        console.error("Gagal memuat profil:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowed.includes(file.type)) {
      Swal.fire({
        icon: "warning",
        title: "Format Tidak Didukung",
        text: "Hanya file JPG dan PNG yang diperbolehkan.",
        confirmButtonColor: "#5143e6",
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      Swal.fire({
        icon: "warning",
        title: "Ukuran Terlalu Besar",
        text: "Ukuran foto maksimal 2MB.",
        confirmButtonColor: "#5143e6",
      });
      return;
    }

    setUploadingAvatar(true);
    try {
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      setAvatarPreview(base64);
      localStorage.setItem("avatarUrl", base64);

      try {
        await uploadAvatar(file);
      } catch {
        // backend mock, abaikan error
      }

      await Swal.fire({
        icon: "success",
        title: "Foto Profil Diperbarui",
        confirmButtonColor: "#5143e6",
      });
    } catch (err) {
      console.error("Gagal upload avatar:", err);
      setAvatarPreview(null);
      Swal.fire({
        icon: "error",
        title: "Gagal Upload Foto",
        text: err?.message || "Terjadi kesalahan. Silakan coba lagi.",
        confirmButtonColor: "#5143e6",
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.phone.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Data Belum Lengkap",
        text: "Nama dan No WhatsApp wajib diisi.",
        confirmButtonColor: "#5143e6",
      });
      return;
    }

    setSaving(true);
    try {
      const res = await updateProfile({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        nik: formData.nik.trim(),
      });

      const updatedName = res?.data?.name || formData.name;
      localStorage.setItem("name", updatedName);

      await Swal.fire({
        icon: "success",
        title: "Berhasil Disimpan",
        text: "Data diri kamu berhasil diperbarui.",
        confirmButtonColor: "#5143e6",
      });
      navigate("/customer/profile");
    } catch (err) {
      console.error("Gagal update profil:", err);
      Swal.fire({
        icon: "error",
        title: "Gagal Menyimpan",
        text: err?.message || "Terjadi kesalahan. Silakan coba lagi.",
        confirmButtonColor: "#5143e6",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="edit-profile-page">
        <header className="edit-profile-header">
          <button type="button" className="edit-profile-back-button" onClick={() => navigate(-1)}>
            <svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
          <div className="edit-profile-logo">EVENT<span>DAY</span></div>
        </header>
        <main className="edit-profile-content">
          <p style={{ textAlign: "center", padding: "2rem" }}>Memuat profil...</p>
        </main>
      </div>
    );
  }

  const initials = formData.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="edit-profile-page">
      <header className="edit-profile-header">
        <button type="button" className="edit-profile-back-button" onClick={() => navigate(-1)} aria-label="Kembali">
          <svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" /></svg>
        </button>
        <div className="edit-profile-logo">EVENT<span>DAY</span></div>
      </header>

      <main className="edit-profile-content">
        <section className="edit-profile-user-card">
          <div className="edit-profile-photo-wrapper" onClick={handleAvatarClick}>
            {avatarPreview ? (
              <img src={avatarPreview} alt="Foto Profil" className="edit-profile-photo-img" />
            ) : (
              <div className="edit-profile-photo-initials">{initials}</div>
            )}
            <div className="edit-photo-overlay">
              {uploadingAvatar ? (
                <span className="edit-photo-spinner"></span>
              ) : (
                <svg viewBox="0 0 24 24">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png"
              onChange={handleAvatarChange}
              style={{ display: "none" }}
            />
          </div>
          <div className="edit-profile-user-info">
            <h1>{formData.name}</h1>
            <p>{formData.email}</p>
          </div>
        </section>

        <section className="edit-profile-form-card">
          <div className="edit-profile-form-title">
            <h2>Edit Data Diri</h2>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="edit-profile-form-body">
              <div className="edit-profile-input-group">
                <label htmlFor="username">Username</label>
                <input
                  id="username"
                  type="text"
                  value={formData.username}
                  disabled
                  style={{ opacity: 0.6, cursor: "not-allowed" }}
                />
                <small style={{ color: "#888", fontSize: "0.75rem" }}>Username tidak dapat diubah</small>
              </div>

              <div className="edit-profile-input-group">
                <label htmlFor="name">Nama Lengkap</label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Masukan Nama Lengkap"
                />
              </div>

              <div className="edit-profile-input-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  disabled
                  style={{ opacity: 0.6, cursor: "not-allowed" }}
                />
                <small style={{ color: "#888", fontSize: "0.75rem" }}>Email tidak dapat diubah</small>
              </div>

              <div className="edit-profile-input-group">
                <label htmlFor="phone">No WhatsApp</label>
                <input
                  id="phone"
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Masukan No WhatsApp"
                  inputMode="numeric"
                />
              </div>

              <div className="edit-profile-input-group">
                <label htmlFor="nik">NIK</label>
                <input
                  id="nik"
                  type="text"
                  value={formData.nik}
                  disabled
                  style={{ opacity: 0.6, cursor: "not-allowed" }}
                />
                <small style={{ color: "#888", fontSize: "0.75rem" }}>NIK tidak dapat diubah</small>
              </div>
            </div>

            <div className="edit-profile-form-footer">
              <button type="button" className="edit-profile-cancel-button" onClick={() => navigate(-1)}>
                Batal
              </button>
              <button type="submit" className="edit-profile-save-button" disabled={saving}>
                {saving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </form>
        </section>
      </main>

      <footer className="edit-profile-footer">
        &copy; 2027 EVENTDAY. Hak cipta dilindungi undang-undang.
      </footer>
    </div>
  );
}

export default EditProfileCustomer;
