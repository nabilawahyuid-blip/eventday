import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { createAdminEvent, updateAdminEventStatus } from "../../services/adminEventService";
import { getVerifiedOrganizers } from "../../services/adminEoService";
import {
  showSuccess,
  showError,
  showWarning,
} from "../../utils/alert";
import EventBannerUpload from "./EventBannerUpload";

import Sidebar from "../shared/Sidebar";
import Navbar from "../shared/Navbar";

import "./TambahEvent.css";

// Kategori event: hanya 4 enum valid BE (Category.java strict valueOf).
// Nilai lain → 400 "No enum constant Category.X".
import { VALID_CATEGORIES, isValidCategory } from "../../constants/categories";

function TambahEvent() {
  const navigate = useNavigate();

  // State Form Utama
  const [organizer, setOrganizer] = useState("");
  const [organizers, setOrganizers] = useState([]);
  const [organizerLoading, setOrganizerLoading] = useState(true);
  const [organizerError, setOrganizerError] = useState("");
  const [namaEvent, setNamaEvent] = useState("");
  const [kategoriEvent, setKategoriEvent] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [lokasi, setLokasi] = useState("");

  // State Dokumen Perizinan (hanya nama file)
  const [dokumenName, setDokumenName] = useState("");

  // Dynamic Fields State
  const [jadwalList, setJadwalList] = useState([
    { tanggal: "", jamMulai: "", jamSelesai: "" }
  ]);

  const [tiketList, setTiketList] = useState([
    { namaKategori: "VIP", harga: 400000, kuota: 200 },
    { namaKategori: "Reguler", harga: 200000, kuota: 400 }
  ]);

  const [lineUpList, setLineUpList] = useState([
    { name: "For Revenge", image: "" },
  ]);

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

  // Handlers Dynamic LineUp ({name, image} — image opsional path/URL,
  // dikirim format EO "Nama|/uploads/xxx.jpg" agar foto tampil di detail)
  const handleAddLineUp = () =>
    setLineUpList([...lineUpList, { name: "", image: "" }]);
  const handleRemoveLineUp = (index) => setLineUpList(lineUpList.filter((_, i) => i !== index));
  const handleLineUpChange = (index, field, value) => {
    const updated = [...lineUpList];
    updated[index] = { ...updated[index], [field]: value };
    setLineUpList(updated);
  };

  // Hitung Total Kuota Tiket
  const totalKuota = tiketList.reduce((acc, item) => acc + (Number(item.kuota) || 0), 0);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  // Banner dari EventBannerUpload: {file: File|null, url: string, urlValid: bool}
  // file → part "file" multipart, url → field bannerUrl (dipakai bila tanpa file)
  const [banner, setBanner] = useState({ file: null, url: "", urlValid: true });

  // Ambil EO terverifikasi satu kali saat form dibuka. size besar diminta
  // eksplisit supaya dropdown tidak hanya memuat halaman pertama backend.
  useEffect(() => {
    let cancelled = false;

    const loadOrganizers = async () => {
      try {
        setOrganizerLoading(true);
        setOrganizerError("");

        const res = await getVerifiedOrganizers({ page: 0, size: 100 });
        console.log("Daftar EO dari API:", res?.data);

        const responseData = res?.data;
        const organizerList =
          responseData?.data?.content ||
          responseData?.content ||
          responseData?.data ||
          responseData ||
          [];
        const allOrganizers = Array.isArray(organizerList) ? organizerList : [];

        // Pengaman bila backend mengabaikan query status.
        const verifiedOrganizers = allOrganizers.filter((item) => {
          const status = String(item?.verificationStatus || item?.status || "").toUpperCase();
          return !status || status === "VERIFIED";
        });

        if (!cancelled) {
          setOrganizers(verifiedOrganizers);
        }
      } catch (err) {
        console.error("Gagal memuat daftar EO:", err);
        if (!cancelled) {
          setOrganizers([]);
          setOrganizerError(
            err?.data?.msg || err?.message || "Gagal memuat daftar EO."
          );
        }
      } finally {
        if (!cancelled) {
          setOrganizerLoading(false);
        }
      }
    };

    loadOrganizers();

    return () => {
      cancelled = true;
    };
  }, []);

  // Submit → POST /api/admin/events (CreateEventRequest, API.md §17.11)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    if (!namaEvent.trim()) {
      await showWarning(
        "Nama Event Belum Diisi",
        "Harap isi Nama Event terlebih dahulu!"
      );
      return;
    }

    // Guard kategori: cegah 400 "No enum constant Category.X".
    const normalizedCategory = String(kategoriEvent || "").trim() || "MUSIC_FESTIVAL";
    if (!isValidCategory(normalizedCategory)) {
      await showWarning(
        "Kategori Tidak Valid",
        `Kategori "${kategoriEvent}" ditolak backend. Pilih: ${VALID_CATEGORIES.join(", ")}.`
      );
      return;
    }

    // Tolak URL yang terbukti rusak (hanya bila tanpa file — file selalu menang)
    if (!banner.file && banner.url && !banner.urlValid) {
      await showWarning(
        "URL Banner Tidak Valid",
        "URL gambar tidak bisa dimuat (bukan file gambar langsung). " +
        "Pakai 'Copy image address' dari gambarnya, atau pilih file."
      );
      return;
    }

    const jadwal = jadwalList[0] || {};
    const tanggal = jadwal.tanggal || new Date().toISOString().slice(0, 10);
    const jam = jadwal.jamMulai || "10:00";
    // BE minta ISO datetime: "2026-12-01T10:00:00"
    const eventDate = `${tanggal}T${jam.length === 5 ? jam + ":00" : jam}`;

    // Jam selesai optional — dikirim best-effort (backend rev.14 baru
    // mendukung eventDate; endDate aman diabaikan bila DTO belum ada).
    const endDate = jadwal.jamSelesai
      ? `${tanggal}T${jadwal.jamSelesai.length === 5 ? jadwal.jamSelesai + ":00" : jadwal.jamSelesai}`
      : null;

    const payload = {
      title: namaEvent.trim(),
      description: deskripsi.trim() || namaEvent.trim(),
      category: normalizedCategory,
      location: lokasi.trim() || "Lokasi Belum Ditentukan",
      venueName: lokasi.trim() || "Lokasi Belum Ditentukan",
      eventDate,
      endDate,
      bannerUrl: banner.url || null,
      facilities: [],
      // Lineup format EO "Nama|/uploads/xxx.jpg, Nama2" agar foto
      // lineup bisa tampil di semua halaman detail (admin/EO/customer).
      // Upload file lineup menyusul di BE (endpoint admin khusus);
      // untuk sekarang isi kolom foto dengan path hasil upload / URL langsung.
      lineup:
        lineUpList
          .map((item) => {
            const name = String(item?.name || "").trim();
            const img = String(item?.image || "").trim();
            if (!name) return null;
            return img ? `${name}|${img}` : name;
          })
          .filter(Boolean)
          .join(", ") || null,
      ticketTiers: tiketList
        .filter((t) => t.namaKategori && Number(t.kuota) > 0)
        .map((t) => ({
          name: t.namaKategori,
          price: Number(t.harga) || 0,
          quota: Number(t.kuota) || 0,
        })),
    };

    try {
      setSubmitting(true);
      // Multipart bila ada file; otomatis fallback JSON tanpa file
      // bila backend belum mendukung multipart (flag _bannerSkipped).
      const res = await createAdminEvent(payload, banner.file);
      const newId = res?.data?.eventId || res?.data?.id;
      const createdStatus = String(res?.data?.status || "").toUpperCase();

      // Per rev.14, create admin langsung menghasilkan status PUBLISHED.
      // Auto-publish hanya bila backend lama membuat event sebagai DRAFT —
      // supaya tidak error "Transisi PUBLISHED → PUBLISHED tidak diizinkan".
      let published = createdStatus === "PUBLISHED";
      let publishWarning = null;

      if (newId && !published) {
        try {
          await updateAdminEventStatus(newId, "PUBLISHED");
          published = true;
        } catch (pubErr) {
          // Error transisi (mis. "Transisi PUBLISHED → PUBLISHED tidak
          // diizinkan") berarti backend SUDAH mem-publish event langsung
          // meski response tak menyertakan status → bukan error.
          // Error jenis lain (network/500/dll) berarti status akhir tak
          // bisa dipastikan → user perlu peringatan, bukan alert bohongan.
          const errMsg = String(pubErr?.data?.msg || pubErr?.message || "");
          if (/transisi.*tidak diizinkan|transition.*not allowed/i.test(errMsg)) {
            published = true;
          } else {
            publishWarning = errMsg || "gagal mengubah status event";
            console.warn("Auto-publish gagal:", pubErr);
          }
        }
      }

      let pesan = res?._bannerSkipped
        ? "Event berhasil dibuat, TAPI file banner tidak tersimpan " +
          "(backend belum mendukung upload file). Pakai tempel URL bila perlu banner."
        : "Event berhasil dibuat.";

      if (published) {
        pesan += "\nStatus event: PUBLISHED — sudah tampil di halaman customer.";
      } else {
        pesan +=
          `\n\nStatus event BELUM PUBLISHED sehingga belum tampil di halaman customer` +
          (publishWarning ? ` (${publishWarning})` : "") +
          ".\nBuka Detail Event lalu klik 'Setujui' untuk mempublish.";
      }

      await showSuccess("Event Berhasil Dibuat", pesan);
      navigate("/admin/event-management");
    } catch (err) {
      console.error("Gagal membuat event:", err);
      const msg = err?.data?.msg || err?.message || "Gagal membuat event.";
      setSubmitError(msg);
      await showError("Gagal Membuat Event", msg);
    } finally {
      setSubmitting(false);
    }
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
                  className="btn-buat-event"
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? "Menyimpan..." : "+ Buat Event"}
                </button>
              </div>
            </div>

            {submitError && (
              <p style={{ color: "#dc6868", marginBottom: 12 }}>{submitError}</p>
            )}

            <form onSubmit={handleSubmit} className="tambah-event-form">

              {/* 1. INFORMASI DASAR */}
              <div className="form-section-card">
                <h3>Informasi Dasar</h3>

                <div className="form-group full">
                  <label>EVENT ORGANIZER</label>
                  <select
                    value={organizer}
                    onChange={(e) => setOrganizer(e.target.value)}
                    disabled={organizerLoading}
                  >
                    <option value="">
                      {organizerLoading
                        ? "Memuat daftar Event Organizer..."
                        : "Dropdown Pilihan Event Organizer"}
                    </option>
                    {organizers.map((eo, index) => {
                      const id = eo?.id ?? eo?.organizerId ?? eo?.userId ?? "";
                      const name =
                        eo?.name ||
                        eo?.organizerName ||
                        eo?.nameOrganizer ||
                        eo?.companyName ||
                        `EO ${index + 1}`;
                      const key = id || `${name}-${index}`;

                      return (
                        <option key={key} value={id || name}>
                          {name}
                        </option>
                      );
                    })}
                  </select>
                  {organizerError ? (
                    <p className="upload-subtitle" style={{ color: "#dc6868", margin: "8px 0 0" }}>
                      {organizerError}
                    </p>
                  ) : (
                    !organizerLoading && (
                      <p className="upload-subtitle" style={{ margin: "8px 0 0" }}>
                        {organizers.length > 0
                          ? `${organizers.length} organizer terverifikasi dimuat.`
                          : "Belum ada organizer terverifikasi."}
                      </p>
                    )
                  )}
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
                      <option value="MUSIC_FESTIVAL">Music Festival</option>
                      <option value="CONFERENCE">Conference</option>
                      <option value="EXHIBITION">Exhibition</option>
                      <option value="CULINARY">Culinary</option>
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
                <div className="form-row">
                  <div className="form-group flex-1">
                    <label>NAMA VENUE / GEDUNG</label>
                    <input
                      type="text"
                      placeholder="Contoh: Stadion Manahan"
                      value={lokasi}
                      onChange={(e) => setLokasi(e.target.value)}
                    />
                  </div>
                </div>
                <p className="upload-subtitle" style={{ margin: 0 }}>
                  Nama venue ini tampil sebagai lokasi di daftar event &amp; tiket customer.
                </p>
              </div>

              {/* 3. BANNER EVENT */}
              <div className="form-section-card">
                <h3>Banner Event</h3>
                <EventBannerUpload
                  initialUrl=""
                  onChange={setBanner}
                />
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
                        value={artist?.name || ""}
                        placeholder="Nama Artis / Performa"
                        onChange={(e) => handleLineUpChange(index, "name", e.target.value)}
                      />
                    </div>

                    <div className="form-group flex-1">
                      <input
                        type="text"
                        value={artist?.image || ""}
                        placeholder="Foto: /uploads/xxx.jpg atau https://... (opsional)"
                        onChange={(e) => handleLineUpChange(index, "image", e.target.value)}
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