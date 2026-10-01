import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getAdminEventDetail,
  updateAdminEvent,
} from "../../services/adminEventService";

import {
  showSuccess,
  showError,
  showWarning,
} from "../../utils/alert";
import {
  uploadOrganizerLineupImage,
  extractUploadedImageUrl,
} from "../../services/organizerEventService";

import Sidebar from "../shared/Sidebar";
import Navbar from "../shared/Navbar";
import EventBannerUpload from "./EventBannerUpload";
import "./EditEvent.css";

import {
  FiSearch, FiUploadCloud, FiTrash2, FiPlus, FiX
} from "react-icons/fi";

// Kategori event: hanya 4 enum valid BE (Category.java strict valueOf).
// Nilai lain → 400 "No enum constant Category.X".
import { isValidCategory, normalizeCategoryForBackend } from "../../constants/categories";

function EditEvent() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [namaEvent, setNamaEvent] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [lokasi, setLokasi] = useState("");
  const [kategori, setKategori] = useState("MUSIC_FESTIVAL");
  const [tanggal, setTanggal] = useState("");
  const [jamMulai, setJamMulai] = useState("10:00");
  const [jamSelesai, setJamSelesai] = useState("");

  const [tickets, setTickets] = useState([]);
  const [lineups, setLineups] = useState([]);
  const [newLineupName, setNewLineupName] = useState("");
  const [newLineupImage, setNewLineupImage] = useState("");
  const [uploadingLineup, setUploadingLineup] = useState(false);
  // Banner dari EventBannerUpload: {file, url, urlValid}.
  // file → part "file" multipart, url → field bannerUrl.
  const [banner, setBanner] = useState({ file: null, url: "", urlValid: true });

  const parseLineupItem = (l) => {
    if (typeof l === "string") {
      const [namePart, imagePart] = l.split("|");
      const name = (namePart || "").trim();
      if (!name) return null;
      return { name, image: (imagePart || "").trim(), file: null, preview: null };
    }
    if (l && typeof l === "object") {
      const name = String(l.name || l.artist || l.title || "").trim();
      if (!name) return null;
      return {
        name,
        image: String(l.image || l.photo || l.avatar || "").trim(),
        file: null,
        preview: null,
      };
    }
    return null;
  };

  const fetchDetail = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAdminEventDetail(id);
      const ev = res?.data ?? {};
      setNamaEvent(ev.title || "");
      setDeskripsi(ev.description || "");
      setLokasi(ev.venueName || "");
      // Normalisasi kategori lama busuk ("Musik"/"Konser"/...) ke enum valid
      // agar dropdown selalu berisi nilai yang bisa disimpan kembali.
      setKategori(normalizeCategoryForBackend(ev.category) || "MUSIC_FESTIVAL");
      setBanner({
        file: null,
        url: ev.bannerUrl || ev.banner_url || ev.banner || ev.image || "",
        urlValid: true,
      });
      if (ev.startDate) {
        const d = new Date(ev.startDate);
        setTanggal(d.toISOString().slice(0, 10));
        setJamMulai(d.toISOString().slice(11, 16));
      }
      const endDateRaw = ev.endDate || ev.end_date;
      if (endDateRaw) {
        const ed = new Date(endDateRaw);
        if (!Number.isNaN(ed.getTime())) {
          setJamSelesai(ed.toISOString().slice(11, 16));
        } else {
          setJamSelesai("");
        }
      } else {
        setJamSelesai("");
      }
      setTickets(
        (ev.ticketTiers || []).map((t, i) => ({
          id: t.tierId || i,
          name: t.tierName || "",
          price: String(t.price ?? ""),
          quota: String(t.totalQuota ?? ""),
        }))
      );
      // Pertahankan foto lineup ("Nama|path" / objek {name,image}),
      // jangan strip ke nama saja agar gambar tidak hilang saat save.
      const rawLineup = ev.lineup ?? ev.lineups ?? [];
      if (Array.isArray(rawLineup)) {
        setLineups(rawLineup.map(parseLineupItem).filter(Boolean));
      } else if (typeof rawLineup === "string" && rawLineup.trim()) {
        setLineups(
          rawLineup
            .split(/[,;\n]+/)
            .map(parseLineupItem)
            .filter(Boolean)
        );
      } else {
        setLineups([]);
      }
    } catch (err) {
      console.error("Gagal memuat event:", err);
      setError(err?.data?.msg || err?.message || "Gagal memuat event.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const addTicketRow = () => {
    setTickets([...tickets, { id: Date.now(), name: "", price: "", quota: "" }]);
  };

  const removeTicketRow = (ticketId) => {
    setTickets(tickets.filter(t => t.id !== ticketId));
  };

  const updateTicketRow = (ticketId, field, value) => {
    setTickets(tickets.map(t => (t.id === ticketId ? { ...t, [field]: value } : t)));
  };

  const addLineupItem = () => {
    const name = newLineupName.trim();
    if (name) {
      setLineups([
        ...lineups,
        { name, image: newLineupImage.trim(), file: null, preview: null },
      ]);
      setNewLineupName("");
      setNewLineupImage("");
    }
  };

  const updateLineupRow = (index, field, value) => {
    setLineups(
      lineups.map((item, i) =>
        // Pilih file baru membuang URL manual (satu sumber gambar saja)
        i === index
          ? field === "image"
            ? { ...item, image: value, file: null, preview: null }
            : { ...item, [field]: value }
          : item
      )
    );
  };

  // Tombol "Pilih Foto" per artis — validasi sama seperti banner (gambar ≤5MB).
  // File disimpan di state dan diupload saat Save (lihat handleSave).
  const handleLineupFileChange = (index, file) => {
    if (!file) return;
    if (!file.type || !file.type.startsWith("image/")) {
      showWarning("File Tidak Valid", "Foto lineup harus berupa gambar (PNG/JPG/JPEG).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showWarning("File Terlalu Besar", "Ukuran foto lineup maksimal 5MB.");
      return;
    }
    setLineups((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              file,
              preview: URL.createObjectURL(file),
              image: "",
            }
          : item
      )
    );
  };

  const handleRemoveLineupFile = (index) => {
    setLineups((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        if (item.preview) URL.revokeObjectURL(item.preview);
        return { ...item, file: null, preview: null };
      })
    );
  };

  const removeLineupItem = (index) => {
    setLineups(lineups.filter((_, i) => i !== index));
  };

  const totalQuota = tickets.reduce((acc, curr) => acc + (parseInt(curr.quota) || 0), 0);

  const handleSave = async (e) => {
    e.preventDefault();
    // Guard kategori: cegah 400 "No enum constant Category.X".
    const normalizedKategori = String(kategori || "").trim() || "MUSIC_FESTIVAL";
    if (!isValidCategory(normalizedKategori)) {
      await showError(
        "Kategori Tidak Valid",
        `Kategori "${kategori}" ditolak backend. Pilih: MUSIC_FESTIVAL, CONFERENCE, EXHIBITION, CULINARY.`
      );
      return;
    }
    try {
      setSaving(true);
      const eventDate = `${tanggal || new Date().toISOString().slice(0, 10)}T${(jamMulai || "10:00").length === 5 ? jamMulai + ":00" : jamMulai}`;

      // Jam selesai opsional — dikirim best-effort. Backend admin rev.14
      // (CreateEventRequest) baru mendukung eventDate; field endDate aman
      // diabaikan bila DTO backend belum memilikinya.
      const endDate = jamSelesai
        ? `${tanggal || new Date().toISOString().slice(0, 10)}T${jamSelesai.length === 5 ? jamSelesai + ":00" : jamSelesai}`
        : null;

      // Upload foto lineup yang dipilih via tombol "Pilih Foto".
      // Hasilnya path /uploads/... yang tidak dibuang backend
      // (URL eksternal mentah bisa dikosongkan BE seperti di EO).
      let resolvedLineups = lineups;
      const withFile = lineups
        .map((item, index) => ({ item, index }))
        .filter(({ item }) => item.file);
      if (withFile.length > 0) {
        setUploadingLineup(true);
        try {
          resolvedLineups = [...lineups];
          for (const { item, index } of withFile) {
            try {
              const res = await uploadOrganizerLineupImage(item.file);
              const url = extractUploadedImageUrl(res);
              if (url) {
                if (item.preview) URL.revokeObjectURL(item.preview);
                resolvedLineups[index] = {
                  ...item,
                  image: url,
                  file: null,
                  preview: null,
                };
              }
            } catch (uploadErr) {
              console.warn("Gagal mengupload foto lineup:", uploadErr);
              await showWarning(
                "Upload Foto Gagal",
                `Foto ${item.name || "artis"} gagal diupload (${uploadErr?.data?.msg || uploadErr?.message || "server menolak"}). Baris ini disimpan tanpa foto — atau isi kolom URL manual.`
              );
              resolvedLineups[index] = {
                ...item,
                file: null,
                preview: null,
              };
            }
          }
          setLineups(resolvedLineups);
        } finally {
          setUploadingLineup(false);
        }
      }

      const payload = {
        title: namaEvent.trim(),
        description: deskripsi.trim() || namaEvent.trim(),
        category: normalizedKategori,
        location: lokasi.trim(),
        venueName: lokasi.trim(),
        eventDate,
        endDate,
        bannerUrl: (banner.url || "").trim() || null,
        // Lineup format EO "Nama|path, Nama2" agar foto tampil di detail.
        lineup:
          resolvedLineups
            .map((item) => {
              const name = String(item?.name || "").trim();
              const img = String(item?.image || "").trim();
              if (!name) return null;
              return img ? `${name}|${img}` : name;
            })
            .filter(Boolean)
            .join(", ") || null,
        ticketTiers: tickets
          .filter((t) => t.name && Number(t.quota) > 0)
          .map((t) => ({ name: t.name, price: Number(t.price) || 0, quota: Number(t.quota) || 0 })),
      };
      await updateAdminEvent(id, payload, banner.file);
      await showSuccess(
        "Perubahan Event Disimpan",
        "Perubahan berhasil disimpan."
      );
      navigate(`/admin/event/${id}`);
    } catch (err) {
      console.error("Gagal menyimpan:", err);
      await showError(
        "Gagal Menyimpan Perubahan",
        err?.data?.msg || err?.message || "Gagal menyimpan perubahan."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="edit-event-page">
        <Sidebar />
        <main className="edit-main">
          <Navbar />
          <section className="edit-content">
            <p style={{ padding: 30, color: "#8d889a" }}>Memuat data event...</p>
          </section>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="edit-event-page">
        <Sidebar />
        <main className="edit-main">
          <Navbar />
          <section className="edit-content">
            <p style={{ padding: 30, color: "#dc6868" }}>{error}</p>
            <button type="button" className="btn-primary" onClick={() => navigate("/admin/event-management")}>
              Kembali
            </button>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="edit-event-page">
      <Sidebar />

      <main className="edit-main">
        <Navbar />

        <section className="edit-content">
          <div className="edit-page-header">
            <div>
              <span className="breadcrumb-event">Event</span>
              <h2>Edit Event</h2>
            </div>

            <button
              type="button"
              className="btn-primary"
              onClick={handleSave}
              disabled={saving || uploadingLineup}
            >
              <FiPlus /> {uploadingLineup ? "Mengupload foto..." : saving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>

          <form onSubmit={handleSave}>
            {/* INFORMASI DASAR */}
            <section className="form-card">
              <h3>Informasi Dasar</h3>

              <div className="form-row">
                <div className="form-group col">
                  <label>NAMA EVENT</label>
                  <input
                    type="text"
                    className="form-control"
                    value={namaEvent}
                    onChange={(e) => setNamaEvent(e.target.value)}
                  />
                </div>
                <div className="form-group col">
                  <label>KATEGORI EVENT</label>
                  <select
                    className="form-control"
                    value={kategori}
                    onChange={(e) => setKategori(e.target.value)}
                  >
                    <option value="MUSIC_FESTIVAL">Music Festival</option>
                    <option value="CONFERENCE">Conference</option>
                    <option value="EXHIBITION">Exhibition</option>
                    <option value="CULINARY">Culinary</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>DESKRIPSI EVENT</label>
                <textarea
                  className="form-control textarea"
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                />
              </div>
            </section>

            {/* LOKASI EVENT */}
            <section className="form-card">
              <h3>Lokasi Event</h3>
              <div className="form-group">
                <label>DETAIL LOKASI / VENUE</label>
                <div className="input-with-icon">
                  <FiSearch className="input-icon" />
                  <input
                    type="text"
                    className="form-control"
                    value={lokasi}
                    onChange={(e) => setLokasi(e.target.value)}
                  />
                </div>
              </div>
            </section>

            {/* BANNER EVENT */}
            <section className="form-card">
              <h3>Banner Event</h3>
              <EventBannerUpload
                initialUrl={banner.url}
                onChange={setBanner}
              />
            </section>

            {/* JADWAL EVENT */}
            <section className="form-card">
              <div className="card-header-flex">
                <h3>Jadwal Event</h3>
              </div>
              <div className="schedule-row">
                <div className="form-group">
                  <label>TANGGAL</label>
                  <input
                    type="date"
                    className="form-control"
                    value={tanggal}
                    onChange={(e) => setTanggal(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>JAM MULAI</label>
                  <input
                    type="time"
                    className="form-control"
                    value={jamMulai}
                    onChange={(e) => setJamMulai(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>JAM SELESAI</label>
                  <input
                    type="time"
                    className="form-control"
                    value={jamSelesai}
                    onChange={(e) => setJamSelesai(e.target.value)}
                  />
                </div>
              </div>
            </section>

            {/* KATEGORI TIKET */}
            <section className="form-card">
              <div className="card-header-flex">
                <h3>Kategori Tiket</h3>
                <button type="button" className="btn-text" onClick={addTicketRow}>+ Tambah Kategori</button>
              </div>

              <div className="ticket-table-header">
                <span>NAMA KATEGORI</span>
                <span>HARGA TIKET (RP)</span>
                <span>KUOTA</span>
                <span></span>
              </div>

              {tickets.map((t) => (
                <div className="ticket-row" key={t.id}>
                  <input
                    type="text"
                    className="form-control"
                    value={t.name}
                    onChange={(e) => updateTicketRow(t.id, "name", e.target.value)}
                  />
                  <input
                    type="text"
                    className="form-control"
                    value={t.price}
                    onChange={(e) => updateTicketRow(t.id, "price", e.target.value)}
                  />
                  <input
                    type="text"
                    className="form-control"
                    value={t.quota}
                    onChange={(e) => updateTicketRow(t.id, "quota", e.target.value)}
                  />
                  <button type="button" className="btn-delete-row" onClick={() => removeTicketRow(t.id)}><FiX /></button>
                </div>
              ))}

              <div className="total-quota-box">
                <span>Total Kuota</span>
                <strong>{totalQuota}</strong>
              </div>
            </section>

            {/* LINE UP EVENT */}
            <section className="form-card">
              <div className="card-header-flex">
                <h3>Line Up Event</h3>
              </div>
              <p className="upload-subtitle" style={{ margin: "0 0 12px" }}>
                Upload lewat <strong>Pilih Foto</strong> (maks 5MB, tersimpan ke server saat Save), atau tempel path/URL langsung di kolom foto.
              </p>
              <div className="lineup-table-header">
                <span>FOTO</span>
                <span>NAMA ARTIS</span>
                <span>URL / PATH FOTO</span>
                <span></span>
              </div>
              {/* Baris tambah */}
              <div className="lineup-edit-row lineup-add-row">
                <span className="lineup-photo-thumb lineup-photo-add">+</span>
                <input
                  type="text"
                  className="form-control inline-input"
                  placeholder="Nama Artist..."
                  value={newLineupName}
                  onChange={(e) => setNewLineupName(e.target.value)}
                />
                <input
                  type="text"
                  className="form-control inline-input"
                  placeholder="Foto: /uploads/xxx.jpg atau https://... (opsional)"
                  value={newLineupImage}
                  onChange={(e) => setNewLineupImage(e.target.value)}
                />
                <button type="button" className="btn-text" onClick={addLineupItem}>+ Tambah</button>
              </div>
              <div className="lineup-edit-list">
                {lineups.map((item, idx) => {
                  const thumb = item.preview || item.image;
                  return (
                    <div className="lineup-edit-row" key={idx}>
                      <span className="lineup-photo-thumb">
                        {thumb ? (
                          <img src={thumb} alt={item?.name || "Lineup"} />
                        ) : (
                          <span className="lineup-photo-empty">
                            {(item?.name || "?").charAt(0).toUpperCase()}
                          </span>
                        )}
                      </span>
                      <input
                        type="text"
                        className="form-control inline-input"
                        value={item?.name || ""}
                        placeholder="Nama Artis"
                        onChange={(e) => updateLineupRow(idx, "name", e.target.value)}
                      />
                      <div className="lineup-photo-cell">
                        <input
                          type="text"
                          className="form-control inline-input"
                          value={item?.image || ""}
                          placeholder="Foto: /uploads/... atau https://..."
                          onChange={(e) => updateLineupRow(idx, "image", e.target.value)}
                        />
                        <div className="lineup-photo-alt">
                          {item.file ? (
                            <>
                              <span className="lineup-file-name">{item.file.name}</span>
                              <button
                                type="button"
                                className="btn-photo-clear"
                                onClick={() => handleRemoveLineupFile(idx)}
                              >
                                Batal
                              </button>
                            </>
                          ) : (
                            <label className="btn-photo-pick">
                              Pilih Foto
                              <input
                                type="file"
                                accept="image/png,image/jpeg,image/jpg,image/webp"
                                hidden
                                onChange={(e) => {
                                  handleLineupFileChange(idx, e.target.files?.[0]);
                                  e.target.value = "";
                                }}
                              />
                            </label>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        className="btn-delete-row"
                        onClick={() => removeLineupItem(idx)}
                        aria-label="Hapus lineup"
                      >
                        <FiX />
                      </button>
                    </div>
                  );
                })}
                {lineups.length === 0 && (
                  <p className="upload-subtitle" style={{ margin: 0 }}>
                    Belum ada lineup. Tambahkan lewat baris di atas.
                  </p>
                )}
              </div>
            </section>
          </form>
        </section>
      </main>
    </div>
  );
}

export default EditEvent;
