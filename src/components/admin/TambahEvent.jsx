import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../shared/Sidebar";
import Navbar from "../shared/Navbar";

import "./TambahEvent.css";

function TambahEvent() {
  const navigate = useNavigate();

  // State Form Utama
  const [organizer, setOrganizer] = useState("");
  const [namaEvent, setNamaEvent] = useState("");
  const [kategoriEvent, setKategoriEvent] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [lokasi, setLokasi] = useState("");

  // State Preview File Upload
  const [bannerPreview, setBannerPreview] = useState(null);
  const [dokumenName, setDokumenName] = useState("");

  // Dynamic Fields State
  const [jadwalList, setJadwalList] = useState([
    { tanggal: "", jamMulai: "", jamSelesai: "" }
  ]);

  const [tiketList, setTiketList] = useState([
    { namaKategori: "VIP", harga: 400000, kuota: 200 },
    { namaKategori: "Reguler", harga: 200000, kuota: 400 }
  ]);

  const [lineUpList, setLineUpList] = useState(["For Revenge"]);

  // Handler Upload Banner Preview
  const handleBannerUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  // Handler Upload Dokumen Perizinan
  const handleDokumenUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDokumenName(file.name);
    }
  };

  // Handlers Dynamic Jadwal
  const handleAddJadwal = () => setJadwalList([...jadwalList, { tanggal: "", jamMulai: "", jamSelesai: "" }]);
  const handleRemoveJadwal = (index) => setJadwalList(jadwalList.filter((_, i) => i !== index));
  const handleJadwalChange = (index, field, value) => {
    const updated = [...jadwalList];
    updated[index][field] = value;
    setJadwalList(updated);
  };

  // Handlers Dynamic Tiket
  const handleAddTiket = () => setTiketList([...tiketList, { namaKategori: "", harga: 0, kuota: 0 }]);
  const handleRemoveTiket = (index) => setTiketList(tiketList.filter((_, i) => i !== index));
  const handleTiketChange = (index, field, value) => {
    const updated = [...tiketList];
    updated[index][field] = value;
    setTiketList(updated);
  };

  // Handlers Dynamic LineUp
  const handleAddLineUp = () => setLineUpList([...lineUpList, ""]);
  const handleRemoveLineUp = (index) => setLineUpList(lineUpList.filter((_, i) => i !== index));
  const handleLineUpChange = (index, value) => {
    const updated = [...lineUpList];
    updated[index] = value;
    setLineUpList(updated);
  };

  // Hitung Total Kuota Tiket
  const totalKuota = tiketList.reduce((acc, item) => acc + (Number(item.kuota) || 0), 0);

  // Submit & Simpan ke LocalStorage
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!namaEvent) {
      alert("Harap isi Nama Event terlebih dahulu!");
      return;
    }

    const newEvent = {
      id: Date.now(),
      title: namaEvent,
      category: kategoriEvent || "Music Festival",
      date: jadwalList[0]?.tanggal || "TBA",
      time: `${jadwalList[0]?.jamMulai || "00:00"} - ${jadwalList[0]?.jamSelesai || "00:00"} WIB`,
      location: lokasi || "Lokasi Belum Ditentukan",
      status: "Aktif",
      statusClass: "active",
      tickets: `0 / ${totalKuota}`,
      organizer: organizer || "EventDay Organizer",
      imageClass: "event-purple",
      bannerUrl: bannerPreview
    };

    const existingEvents = JSON.parse(localStorage.getItem("admin_events")) || [];
    localStorage.setItem("admin_events", JSON.stringify([newEvent, ...existingEvents]));

    alert("Event berhasil dibuat dan tersimpan!");
    navigate("/event-management");
  };

  return (
    <div className="admin-dashboard">
      <Sidebar />

      <div className="dashboard-wrapper" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Navbar />

        <main className="dashboard-main">
          <div className="dashboard-content">

            {/* HEADER FORM */}
            <div className="form-header">
              <div>
                <span className="breadcrumb-sub">Event</span>
                <h2 className="form-title">Buat Event baru</h2>
                <p className="form-subtitle">
                  Isi detail di bawah untuk mempublikasikan event Anda.
                </p>
              </div>

              <div className="form-header-actions">
                <button
                  type="button"
                  className="btn-simpan-draft"
                  onClick={() => alert("Draft disimpan")}
                >
                  Simpan Draft
                </button>
                <button
                  type="button"
                  className="btn-buat-event"
                  onClick={handleSubmit}
                >
                  + Buat Event
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="tambah-event-form">

              {/* 1. INFORMASI DASAR */}
              <div className="form-section-card">
                <h3>Informasi Dasar</h3>

                <div className="form-group full">
                  <label>EVENT ORGANIZER</label>
                  <select value={organizer} onChange={(e) => setOrganizer(e.target.value)}>
                    <option value="">Dropdown Pilihan Event Organizer</option>
                    <option value="PT Imut Entertainment">PT Imut Entertainment</option>
                    <option value="Maju Jaya Productions">Maju Jaya Productions</option>
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group flex-1">
                    <label>NAMA EVENT</label>
                    <input
                      type="text"
                      placeholder="Contoh: Sedih Fest 2024"
                      value={namaEvent}
                      onChange={(e) => setNamaEvent(e.target.value)}
                    />
                  </div>

                  <div className="form-group flex-1">
                    <label>KATEGORI EVENT</label>
                    <select value={kategoriEvent} onChange={(e) => setKategoriEvent(e.target.value)}>
                      <option value="">Pilih Kategori...</option>
                      <option value="Music Festival">Music Festival</option>
                      <option value="Technology">Technology</option>
                      <option value="Entertainment">Entertainment</option>
                      <option value="Community">Community</option>
                      <option value="Art & Culture">Art & Culture</option>
                    </select>
                  </div>
                </div>

                <div className="form-group full">
                  <label>DESKRIPSI EVENT</label>
                  <textarea
                    rows="4"
                    placeholder="Ceritakan detail menarik tentang event Anda..."
                    value={deskripsi}
                    onChange={(e) => setDeskripsi(e.target.value)}
                  />
                </div>
              </div>

              {/* 2. LOKASI EVENT */}
              <div className="form-section-card">
                <h3>Lokasi Event</h3>
                <div className="form-group full">
                  <label>DETAIL LOKASI / VENUE</label>
                  <div className="input-with-icon">
                    <span className="search-icon">🔍</span>
                    <input
                      type="text"
                      placeholder="Cari gedung, stadion, atau alamat lengkap..."
                      value={lokasi}
                      onChange={(e) => setLokasi(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* 3. BANNER EVENT */}
              <div className="form-section-card">
                <h3>Banner Event</h3>
                <div className="upload-dropzone">
                  {bannerPreview ? (
                    <div className="preview-container">
                      <img src={bannerPreview} alt="Banner Preview" className="banner-preview-img" />
                      <button
                        type="button"
                        className="btn-change-file"
                        onClick={() => setBannerPreview(null)}
                      >
                        Ganti Banner
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="upload-icon">☁️</div>
                      <p className="upload-title">Upload Banner Event (16:9)</p>
                      <span className="upload-subtitle">
                        Drag & drop atau klik untuk memilih file (Max 5MB)
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="file-input-hidden"
                        onChange={handleBannerUpload}
                      />
                    </>
                  )}
                </div>
              </div>

              {/* 4. JADWAL EVENT */}
              <div className="form-section-card">
                <div className="section-card-header">
                  <h3>Jadwal Event</h3>
                  <button type="button" className="btn-add-item" onClick={handleAddJadwal}>
                    + Tambah Jadwal
                  </button>
                </div>

                {jadwalList.map((item, index) => (
                  <div key={index} className="form-row dynamic-row">
                    <div className="form-group flex-2">
                      <label>TANGGAL</label>
                      <input
                        type="date"
                        value={item.tanggal}
                        onChange={(e) => handleJadwalChange(index, "tanggal", e.target.value)}
                      />
                    </div>

                    <div className="form-group flex-1">
                      <label>JAM MULAI</label>
                      <input
                        type="time"
                        value={item.jamMulai}
                        onChange={(e) => handleJadwalChange(index, "jamMulai", e.target.value)}
                      />
                    </div>

                    <div className="form-group flex-1">
                      <label>JAM SELESAI</label>
                      <input
                        type="time"
                        value={item.jamSelesai}
                        onChange={(e) => handleJadwalChange(index, "jamSelesai", e.target.value)}
                      />
                    </div>

                    {jadwalList.length > 1 && (
                      <button type="button" className="btn-delete-row" onClick={() => handleRemoveJadwal(index)}>
                        🗑️
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* 5. KATEGORI TIKET */}
              <div className="form-section-card">
                <div className="section-card-header">
                  <h3>Kategori Tiket</h3>
                  <button type="button" className="btn-add-item" onClick={handleAddTiket}>
                    + Tambah Kategori
                  </button>
                </div>

                {tiketList.map((item, index) => (
                  <div key={index} className="form-row dynamic-row">
                    <div className="form-group flex-2">
                      <label>NAMA KATEGORI</label>
                      <input
                        type="text"
                        value={item.namaKategori}
                        placeholder="Misal: VIP"
                        onChange={(e) => handleTiketChange(index, "namaKategori", e.target.value)}
                      />
                    </div>

                    <div className="form-group flex-2">
                      <label>HARGA TIKET (RP)</label>
                      <input
                        type="number"
                        value={item.harga}
                        onChange={(e) => handleTiketChange(index, "harga", e.target.value)}
                      />
                    </div>

                    <div className="form-group flex-1">
                      <label>KUOTA</label>
                      <input
                        type="number"
                        value={item.kuota}
                        onChange={(e) => handleTiketChange(index, "kuota", e.target.value)}
                      />
                    </div>

                    {tiketList.length > 1 && (
                      <button type="button" className="btn-delete-row" onClick={() => handleRemoveTiket(index)}>
                        ✕
                      </button>
                    )}
                  </div>
                ))}

                <div className="total-kuota-box">
                  <span>Total Kuota: <strong>{totalKuota}</strong></span>
                </div>
              </div>

              {/* 6. LINE UP EVENT */}
              <div className="form-section-card">
                <div className="section-card-header">
                  <h3>Line Up Event</h3>
                  <button type="button" className="btn-add-item" onClick={handleAddLineUp}>
                    + Tambah Lineup
                  </button>
                </div>

                {lineUpList.map((artist, index) => (
                  <div key={index} className="form-row dynamic-row">
                    <div className="form-group flex-1">
                      <input
                        type="text"
                        value={artist}
                        placeholder="Nama Artis / Performa"
                        onChange={(e) => handleLineUpChange(index, e.target.value)}
                      />
                    </div>

                    {lineUpList.length > 1 && (
                      <button type="button" className="btn-delete-row" onClick={() => handleRemoveLineUp(index)}>
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* 7. PERIZINAN EVENT */}
              <div className="form-section-card">
                <h3>Perizinan Event</h3>
                <div className="upload-dropzone small">
                  {dokumenName ? (
                    <div className="file-uploaded-info">
                      <span className="file-icon">📄</span>
                      <span className="file-name">{dokumenName}</span>
                      <button
                        type="button"
                        className="btn-remove-file"
                        onClick={() => setDokumenName("")}
                      >
                        Hapus
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="upload-icon">📄</div>
                      <p className="upload-title">Upload Dokumen Perizinan</p>
                      <span className="upload-subtitle">
                        Format: PDF atau ZIP (Max 10MB)
                      </span>
                      <input
                        type="file"
                        accept=".pdf,.zip"
                        className="file-input-hidden"
                        onChange={handleDokumenUpload}
                      />
                    </>
                  )}
                </div>
              </div>

            </form>

          </div>
        </main>
      </div>
    </div>
  );
}

export default TambahEvent;