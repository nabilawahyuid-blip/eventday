import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../shared/Sidebar";
import Navbar from "../shared/Navbar";
import "./PengaturanPlatform.css";
import { FiUploadCloud, FiCheck } from "react-icons/fi";

function PengaturanPlatform() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("umum");

  const [formData, setFormData] = useState({
    namaSistem: "EventDay Platform",
    emailDukungan: "support@eventday.com",
    mataUang: "IDR - Indonesian Rupiah",
    zonaWaktu: "Asia/Jakarta (WIB)"
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = (e) => {
    e.preventDefault();
    console.log("Pengaturan disimpan:", formData);
    alert("Pengaturan platform berhasil disimpan!");
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
                  <label>EMAIL DUKUNGAN</label>
                  <input 
                    type="email" 
                    name="emailDukungan"
                    className="form-control" 
                    value={formData.emailDukungan} 
                    onChange={handleChange}
                  />
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
                
                <div className="upload-box">
                  <FiUploadCloud className="upload-icon" />
                  <p>Tarik dan lepas atau klik untuk unggah</p>
                  <span>SVG, PNG, JPG (Max 2MB)</span>
                </div>

                <div className="current-logo-preview">
                  <span className="logo-label">Logo Saat Ini</span>
                  <div className="logo-badge">
                    eventday_logo_light.svg
                  </div>
                </div>
              </div>
            </form>

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
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default PengaturanPlatform;