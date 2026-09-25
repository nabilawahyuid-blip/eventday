import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../shared/Sidebar";
import Navbar from "../shared/Navbar";
import "./PengaturanPlatform.css";
import { FiUploadCloud, FiCheck } from "react-icons/fi";

import {
  getAdminGeneralSettings,
  updateAdminGeneralSettings,
  uploadAdminPlatformLogo,
} from "../../services/adminSettingsService";

import {
  showSuccess,
  showError,
  showWarning,
} from "../../utils/alert";

function PengaturanPlatform() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState("umum");

  const [formData, setFormData] = useState({
    namaSistem: "",
    emailDukungan: "",
    adminFee: "",
    orderExpiry: "",
    mataUang: "IDR - Indonesian Rupiah",
    zonaWaktu: "Asia/Jakarta (WIB)",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [logoName, setLogoName] = useState("");
  const [error, setError] = useState("");

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await getAdminGeneralSettings();
      const s = res?.data || res;

      setFormData((prev) => ({
        ...prev,
        namaSistem:
          s?.appName ||
          s?.applicationName ||
          s?.namaSistem ||
          prev.namaSistem,
        emailDukungan:
          s?.contactEmail ||
          s?.adminEmail ||
          s?.supportEmail ||
          s?.emailDukungan ||
          prev.emailDukungan,
        adminFee:
          s?.adminFee !== undefined && s?.adminFee !== null
            ? String(s.adminFee)
            : prev.adminFee,
        orderExpiry:
          s?.orderExpiryMinutes !== undefined &&
          s?.orderExpiryMinutes !== null
            ? String(s.orderExpiryMinutes)
            : prev.orderExpiry,
        mataUang:
          s?.currency ||
          s?.mataUang ||
          prev.mataUang,
        zonaWaktu:
          s?.timeZone ||
          s?.zonaWaktu ||
          prev.zonaWaktu,
      }));

      setLogoName(s?.logoFileName || s?.logoName || "");
      setError("");
    } catch (err) {
      console.error("Gagal memuat pengaturan:", err);
      setError(
        err?.data?.msg || err?.message || "Gagal memuat pengaturan."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      // Kontrak BE rev.14: AdminSettingsRequest {appName, contactEmail, adminFee, orderExpiryMinutes}
      await updateAdminGeneralSettings({
        appName: formData.namaSistem,
        contactEmail: formData.emailDukungan,
        adminFee: Number(formData.adminFee) || 0,
        orderExpiryMinutes: Number(formData.orderExpiry) || 15,
      });
      await showSuccess(
        "Pengaturan Platform Disimpan",
        "Pengaturan platform berhasil disimpan!"
      );
    } catch (err) {
      console.error("Gagal menyimpan pengaturan:", err);
      await showError(
        "Gagal Menyimpan Pengaturan",
        err?.data?.msg || err?.message || "Gagal menyimpan pengaturan."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleUploadLogo = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      await showWarning(
        "Logo Terlalu Besar",
        "Ukuran logo maksimal 5MB."
      );
      e.target.value = "";
      return;
    }

    try {
      setUploading(true);
      const res = await uploadAdminPlatformLogo(file);
      setLogoName(
        res?.data?.fileName ||
          res?.data?.logoName ||
          file.name
      );
      await showSuccess(
        "Logo Berhasil Diunggah",
        "Logo berhasil diunggah!"
      );
    } catch (err) {
      console.error("Gagal unggah logo:", err);
      await showError(
        "Gagal Mengunggah Logo",
        err?.data?.msg || err?.message || "Gagal unggah logo."
      );
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="platform-container">
      <Sidebar />

      <main className="platform-main">
        <Navbar />

        <div className="platform-content">
          <div className="platform-header">
            <div>
              <h2>Pengaturan Platform</h2>
              <p>Kelola konfigurasi sistem global, gerbang pembayaran, dan kebijakan keamanan.</p>
            </div>
          </div>

          <div className="settings-card">
            <div className="settings-tabs">
              <button 
                type="button" 
                className={`tab-item ${activeTab === "umum" ? "active" : ""}`}
                onClick={() => setActiveTab("umum")}
              >
                Pengaturan Umum
              </button>
            </div>

            {loading ? (
              <div className="settings-form-grid settings-loading">
                Memuat pengaturan...
              </div>
            ) : (
              <form onSubmit={handleSave} className="settings-form-grid">
                <div className="settings-left-column">
                  <div className="form-group">
                    <label>NAMA SISTEM</label>
                    <input 
                      type="text" 
                      name="namaSistem"
                      className="form-control" 
                      value={formData.namaSistem} 
                      onChange={handleChange}
                    />
                    <span className="form-hint">Nama ini muncul di email dan komunikasi essensial.</span>
                  </div>

                  <div className="form-group">
                    <label>EMAIL ADMIN / DUKUNGAN</label>
                    <input 
                      type="email" 
                      name="emailDukungan"
                      className="form-control" 
                      value={formData.emailDukungan} 
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>BIAYA ADMIN / PLATFORM FEE (%)</label>
                    <input 
                      type="number" 
                      name="adminFee"
                      min="0"
                      step="0.01"
                      className="form-control" 
                      value={formData.adminFee} 
                      onChange={handleChange}
                    />
                    <span className="form-hint">Potongan biaya layanan dari setiap transaksi.</span>
                  </div>

                  <div className="form-group">
                    <label>MASA BERLAKU ORDER (MENIT)</label>
                    <input 
                      type="number" 
                      name="orderExpiry"
                      min="1"
                      className="form-control" 
                      value={formData.orderExpiry} 
                      onChange={handleChange}
                    />
                    <span className="form-hint">Batas waktu pembayaran sebelum order dibatalkan.</span>
                  </div>

                  <div className="form-group">
                    <label>MATA UANG DEFAULT</label>
                    <select 
                      name="mataUang"
                      className="form-control" 
                      value={formData.mataUang} 
                      onChange={handleChange}
                    >
                      <option>IDR - Indonesian Rupiah</option>
                      <option>USD - US Dollar</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>ZONA WAKTU SISTEM</label>
                    <select 
                      name="zonaWaktu"
                      className="form-control" 
                      value={formData.zonaWaktu} 
                      onChange={handleChange}
                    >
                      <option>Asia/Jakarta (WIB)</option>
                      <option>Asia/Makassar (WITA)</option>
                      <option>Asia/Jayapura (WIT)</option>
                    </select>
                  </div>
                </div>

                <div className="settings-right-column">
                  <label>Branding Platform</label>
                  <span className="form-hint-title">LOGO UTAMA</span>
                  
                  <div 
                    className="upload-box"
                    onClick={() => fileInputRef.current?.click()}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click();
                    }}
                  >
                    <FiUploadCloud className="upload-icon" />
                    <p>{uploading ? "Mengunggah..." : "Tarik dan lepas atau klik untuk unggah"}</p>
                    <span>PNG, JPG, JPEG (Max 5MB)</span>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg"
                    style={{ display: "none" }}
                    onChange={handleUploadLogo}
                  />

                  <div className="current-logo-preview">
                    <span className="logo-label">Logo Saat Ini</span>
                    <div className="logo-badge">
                      {logoName || "Belum ada logo diunggah"}
                    </div>
                  </div>

                  {error && (
                    <p className="settings-error">{error}</p>
                  )}
                </div>
              </form>
            )}

            <div className="settings-actions">
              <button 
                type="button" 
                className="btn-cancel"
                onClick={() => navigate(-1)}
              >
                Batal
              </button>
              <button 
                type="submit" 
                className="btn-save"
                onClick={handleSave}
                disabled={loading || saving}
              >
                <FiCheck style={{ marginRight: 6 }} />
                {saving ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default PengaturanPlatform;