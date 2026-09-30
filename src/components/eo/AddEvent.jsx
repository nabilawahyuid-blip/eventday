import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import SidebarEO from "../shared/SidebarEO";
import NavbarEO from "../shared/NavbarEO";

import {
  createOrganizerEvent,
  publishOrganizerEvent,
  uploadOrganizerEventBanner,
  uploadOrganizerLineupImage,
  extractUploadedImageUrl,
  getEventCategories,
} from "../../services/organizerEventService";

import "./AddEvent.css";

function AddEvent() {
  const navigate = useNavigate();

  // =====================================================
  // BASIC EVENT DATA & CATEGORIES STATE
  // =====================================================
  const [eventName, setEventName] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");

  // =====================================================
  // SCHEDULE
  // =====================================================
  const [schedules, setSchedules] = useState([
    {
      date: "",
      startTime: "",
      endTime: "",
    },
  ]);

  // =====================================================
  // TICKETS
  // =====================================================
  const [tickets, setTickets] = useState([
    {
      name: "",
      price: "",
      quota: "",
    },
  ]);

  // =====================================================
  // LINEUP (NAME + GAMBAR)
  // =====================================================
  // `file` = File lokal yang dipilih user, akan diupload ke
  // backend sebelum event disimpan. `image` = fallback kalau
  // user memilih menempelkan URL secara manual.
  const [lineups, setLineups] = useState([
    { name: "", image: "", file: null },
  ]);

  // =====================================================
  // FACILITIES
  // =====================================================
  const [facilities, setFacilities] = useState([""]);

  // =====================================================
  // FILE & PREVIEW STATE
  // =====================================================
  const [banner, setBanner] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [permissionFile, setPermissionFile] = useState(null);

  // =====================================================
  // SUBMIT STATE
  // =====================================================
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // =====================================================
  // FETCH CATEGORIES FROM BACKEND (ROBUST & SAFE)
  // =====================================================
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const res = await getEventCategories();

        // Ekstrak array dari berbagai kemungkinan format response backend
        let catData = [];
        if (Array.isArray(res)) {
          catData = res;
        } else if (Array.isArray(res?.data)) {
          catData = res.data;
        } else if (Array.isArray(res?.data?.data)) {
          catData = res.data.data;
        } else if (Array.isArray(res?.content)) {
          catData = res.content;
        }

        // Jika data dari API kosong/gagal, gunakan Enum Default
        if (catData.length === 0) {
          catData = [
            "MUSIC_FESTIVAL",
            "CONFERENCE",
            "EXHIBITION",
            "CULINARY",
            "TECHNOLOGY",
            "ENTERTAINMENT",
            "SEMINAR_WORKSHOP",
            "COMMUNITY",
          ];
        }

        setCategories(catData);
      } catch (err) {
        console.warn("Gagal mengambil kategori dari API, menggunakan daftar fallback:", err);
        setCategories([
          "MUSIC_FESTIVAL",
          "CONFERENCE",
          "EXHIBITION",
          "CULINARY",
          "TECHNOLOGY",
          "ENTERTAINMENT",
          "SEMINAR_WORKSHOP",
          "COMMUNITY",
        ]);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Helper untuk mendapatkan nilai value dan label kategori
  const getCategoryValue = (cat) => {
    if (!cat) return "";
    if (typeof cat === "object" && cat !== null) {
      return cat.code || cat.value || cat.id || cat.name || "";
    }
    return String(cat);
  };

  const formatCategoryLabel = (cat) => {
    if (!cat) return "";
    const raw = typeof cat === "object" && cat !== null ? (cat.name || cat.label || cat.code) : cat;
    return String(raw)
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  // =====================================================
  // SCHEDULE HANDLERS
  // =====================================================
  const handleAddSchedule = () => {
    setSchedules([
      ...schedules,
      { date: "", startTime: "", endTime: "" },
    ]);
  };

  const handleScheduleChange = (index, field, value) => {
    const updated = [...schedules];
    updated[index] = { ...updated[index], [field]: value };
    setSchedules(updated);
  };

  const handleDeleteSchedule = (index) => {
    if (schedules.length === 1) {
      Swal.fire({
        icon: "warning",
        title: "Perhatian",
        text: "Minimal harus ada satu jadwal event.",
        confirmButtonColor: "#6256e8",
      });
      return;
    }
    setSchedules(schedules.filter((_, i) => i !== index));
  };

  // =====================================================
  // TICKET HANDLERS
  // =====================================================
  const handleAddTicket = () => {
    setTickets([...tickets, { name: "", price: "", quota: "" }]);
  };

  const handleTicketChange = (index, field, value) => {
    const updated = [...tickets];
    updated[index] = { ...updated[index], [field]: value };
    setTickets(updated);
  };

  const handleDeleteTicket = (index) => {
    if (tickets.length === 1) {
      Swal.fire({
        icon: "warning",
        title: "Perhatian",
        text: "Minimal harus ada satu kategori tiket.",
        confirmButtonColor: "#6256e8",
      });
      return;
    }
    setTickets(tickets.filter((_, i) => i !== index));
  };

  // =====================================================
  // LINEUP HANDLERS
  // =====================================================
  const handleAddLineup = () => {
    setLineups([...lineups, { name: "", image: "", file: null }]);
  };

  const handleLineupChange = (index, field, value) => {
    const updated = [...lineups];
    // Kalau user mengetik URL manual, file yang sudah dipilih
    // dibuang supaya tidak ada dua sumber gambar yang bertabrakan.
    updated[index] =
      field === "image"
        ? { ...updated[index], image: value, file: null }
        : { ...updated[index], [field]: value };
    setLineups(updated);
  };

  const handleLineupFileChange = (index, file) => {
    if (!file) {
      const cleared = [...lineups];
      cleared[index] = { ...cleared[index], file: null };
      setLineups(cleared);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({
        icon: "error",
        title: "Ukuran File Terlalu Besar",
        text: `Ukuran foto ${lineups[index]?.name || "artis"} maksimal 5MB.`,
        confirmButtonColor: "#6256e8",
      });
      return;
    }

    const updated = [...lineups];
    updated[index] = { ...updated[index], file, image: "" };
    setLineups(updated);
  };

  const handleDeleteLineup = (index) => {
    if (lineups.length === 1) {
      Swal.fire({
        icon: "warning",
        title: "Perhatian",
        text: "Minimal harus ada satu pengisi acara (lineup).",
        confirmButtonColor: "#6256e8",
      });
      return;
    }
    setLineups(lineups.filter((_, i) => i !== index));
  };

  // Upload semua gambar lineup yang dipilih user. Backend
  // membuang nilai URL eksternal pada field lineup, jadi gambar
  // harus berupa hasil upload (dikembalikan sebagai path relatif
  // /uploads/... , bukan URL absolut).
  const uploadLineupImages = async () =>
    Promise.all(
      lineups.map(async (item) => {
        if (!item.file) {
          return String(item.image || "").trim() || null;
        }

        const response = await uploadOrganizerLineupImage(item.file);
        return extractUploadedImageUrl(response);
      }),
    );

  // =====================================================
  // FACILITY HANDLERS
  // =====================================================
  const handleAddFacility = () => {
    setFacilities([...facilities, ""]);
  };

  const handleFacilityChange = (index, value) => {
    const updated = [...facilities];
    updated[index] = value;
    setFacilities(updated);
  };

  const handleDeleteFacility = (index) => {
    if (facilities.length === 1) {
      Swal.fire({
        icon: "warning",
        title: "Perhatian",
        text: "Minimal harus ada satu fasilitas event.",
        confirmButtonColor: "#6256e8",
      });
      return;
    }
    setFacilities(facilities.filter((_, i) => i !== index));
  };

  // =====================================================
  // BANNER & PERMISSION FILE HANDLER
  // =====================================================
  const handleBannerChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({
        icon: "error",
        title: "Ukuran File Terlalu Besar",
        text: "Ukuran banner maksimal 5MB.",
        confirmButtonColor: "#6256e8",
      });
      e.target.value = "";
      return;
    }

    setBanner(file);
    setBannerPreview(URL.createObjectURL(file));
  };

  const handleRemoveBanner = (e) => {
    e.stopPropagation();
    setBanner(null);
    if (bannerPreview) {
      URL.revokeObjectURL(bannerPreview);
      setBannerPreview(null);
    }
  };

  const handlePermissionChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPermissionFile(file);
  };

  // =====================================================
  // FORM VALIDATION & SUBMIT
  // =====================================================
  const validateForm = (isDraft = false) => {
    if (!eventName.trim()) {
      Swal.fire({ icon: "warning", title: "Form Belum Lengkap", text: "Nama event wajib diisi.", confirmButtonColor: "#6256e8" });
      return false;
    }
    if (!category) {
      Swal.fire({ icon: "warning", title: "Form Belum Lengkap", text: "Kategori event wajib dipilih.", confirmButtonColor: "#6256e8" });
      return false;
    }
    if (!description.trim()) {
      Swal.fire({ icon: "warning", title: "Form Belum Lengkap", text: "Deskripsi event wajib diisi.", confirmButtonColor: "#6256e8" });
      return false;
    }
    if (!location.trim()) {
      Swal.fire({ icon: "warning", title: "Form Belum Lengkap", text: "Lokasi / venue event wajib diisi.", confirmButtonColor: "#6256e8" });
      return false;
    }
    return true;
  };

  const buildEventPayload = (bannerUrl = null, lineupImages = []) => {
    const firstSchedule = schedules[0];
    const startDate = `${firstSchedule?.date}T${firstSchedule?.startTime}:00`;
    const endDate = `${firstSchedule?.date}T${firstSchedule?.endTime}:00`;

    // Format LineUp hemat karakter: "Nama|PathGambar"
    const lineupString = lineups
      .map((item, index) => ({ item, image: lineupImages[index] }))
      .filter(({ item }) => item.name.trim() !== "")
      .map(({ item, image }) => {
        const name = item.name.trim();
        const img = String(image || "").trim();
        return img ? `${name}|${img}` : name;
      })
      .join(", ");

    const facilityArray = facilities.map((item) => item.trim()).filter(Boolean);

    return {
      title: eventName.trim(),
      description: description.trim(),
      category: category,
      location: location.trim(),
      venue_name: location.trim(),
      date: startDate,
      start_date: startDate,
      end_date: endDate,
      lineup: lineupString,
      facilities: facilityArray,
      image: bannerUrl,
      banner_url: bannerUrl,
      
      // FIX TIKET: Kirim name, label, dan tier_name sekaligus agar dibaca backend
      tickets: tickets.map((t) => ({
        name: t.name.trim(),
        label: t.name.trim(),
        tier_name: t.name.trim(),
        ticket_name: t.name.trim(),
        price: Number(t.price),
        quota: Number(t.quota),
      })),
    };
  };

  // Upload banner + gambar lineup, lalu susun payload event.
  // Dipakai oleh "Buat Event" maupun "Simpan Draft" supaya
  // keduanya konsisten.
  const prepareEventPayload = async () => {
    let bannerUrl = null;

    if (banner) {
      const bannerResponse = await uploadOrganizerEventBanner(banner);
      bannerUrl =
        bannerResponse?.data?.banner_url ||
        bannerResponse?.data?.image ||
        bannerResponse?.banner_url ||
        null;
    }

    const lineupImages = await uploadLineupImages();

    return buildEventPayload(bannerUrl, lineupImages);
  };

  const handleCreateEvent = async () => {
    if (!validateForm(false)) return;

    try {
      setSubmitting(true);
      setError("");

      const payload = await prepareEventPayload();
      const response = await createOrganizerEvent(payload);
      const eventId = response?.data?.id || response?.data?.event_id || response?.id;

      if (eventId) {
        await publishOrganizerEvent({ event_id: eventId });
      }

      Swal.fire({
        icon: "success",
        title: "Berhasil Diajukan!",
        text: "Event Anda berhasil dibuat.",
        confirmButtonColor: "#6256e8",
      }).then(() => navigate("/eo/event"));
    } catch (err) {
      console.error("ERROR CREATE EVENT:", err);
      const message = err?.data?.msg || err?.message || "Gagal membuat event.";
      setError(message);
      Swal.fire({ icon: "error", title: "Gagal Membuat Event", text: message, confirmButtonColor: "#6256e8" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!validateForm(true)) return;

    try {
      setSubmitting(true);
      setError("");

      const payload = await prepareEventPayload();
      await createOrganizerEvent(payload);

      Swal.fire({
        icon: "success",
        title: "Draft Tersimpan!",
        text: "Event berhasil disimpan sebagai draft.",
        confirmButtonColor: "#6256e8",
      }).then(() => navigate("/eo/event"));
    } catch (err) {
      const message = err?.data?.msg || err?.message || "Gagal menyimpan draft.";
      setError(message);
      Swal.fire({ icon: "error", title: "Gagal Menyimpan", text: message, confirmButtonColor: "#6256e8" });
    } finally {
      setSubmitting(false);
    }
  };

  const totalQuota = tickets.reduce((total, ticket) => total + (Number(ticket.quota) || 0), 0);

  return (
    <div className="add-event-page">
      <SidebarEO />

      <main className="add-event-main">
        <NavbarEO />

        <div className="add-event-content">
          {error && <div className="dashboard-error" style={{ marginBottom: "20px" }}>{error}</div>}

          {/* HEADER */}
          <div className="add-event-header">
            <div className="add-event-title">
              <span className="add-event-small-title">Event</span>
              <h1>Buat Event Baru</h1>
              <p>Isi detail di bawah untuk mempublikasikan event Anda.</p>
            </div>

            <div className="add-event-header-actions">
              <button
                type="button"
                className="draft-button"
                onClick={handleSaveDraft}
                disabled={submitting}
              >
                {submitting ? "Menyimpan..." : "Simpan Draft"}
              </button>

              <button
                type="button"
                className="create-event-button"
                onClick={handleCreateEvent}
                disabled={submitting}
              >
                <span>+</span>
                {submitting ? "Memproses..." : "Buat Event"}
              </button>
            </div>
          </div>

          {/* INFORMASI DASAR */}
          <section className="form-card">
            <h2>Informasi Dasar</h2>

            <div className="form-grid">
              <div className="form-field">
                <label>NAMA EVENT</label>
                <input
                  type="text"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  placeholder="Contoh: Sedih Fest 2026"
                />
              </div>

              {/* DROPDOWN KATEGORI FIX */}
              <div className="form-field">
                <label>KATEGORI EVENT</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={loadingCategories}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }}
                >
                  <option value="">
                    {loadingCategories ? "Memuat Kategori..." : "-- Pilih Kategori Event --"}
                  </option>
                  {categories.map((cat, index) => {
                    const val = getCategoryValue(cat);
                    const label = formatCategoryLabel(cat);
                    return (
                      <option key={index} value={val}>
                        {label}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            <div className="form-field description-field" style={{ marginTop: "16px" }}>
              <label>DESKRIPSI EVENT</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ceritakan detail menarik tentang event Anda..."
              />
            </div>
          </section>

          {/* LOKASI EVENT */}
          <section className="form-card">
            <h2>Lokasi Event</h2>
            <div className="form-field">
              <label>DETAIL LOKASI / VENUE</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Cari gedung, stadion, atau alamat lengkap..."
              />
            </div>
          </section>

          {/* BANNER EVENT */}
          <section className="form-card">
            <h2>Banner Event</h2>
            {bannerPreview ? (
              <div className="banner-preview-wrapper">
                <img src={bannerPreview} alt="Banner Preview" className="banner-preview-img" style={{ maxHeight: "200px", borderRadius: "8px" }} />
                <div style={{ marginTop: "10px" }}>
                  <button type="button" className="remove-banner-btn" onClick={handleRemoveBanner}>
                    Hapus / Ganti Gambar
                  </button>
                </div>
              </div>
            ) : (
              <label className="upload-box">
                <input type="file" accept="image/*" onChange={handleBannerChange} />
                <div className="upload-icon">☁</div>
                <strong>Upload Banner Event (16:9)</strong>
                <span>Klik untuk memilih file (Max 5MB)</span>
              </label>
            )}
          </section>

          {/* JADWAL EVENT */}
          <section className="form-card">
            <div className="section-header">
              <h2>Jadwal Event</h2>
              <button type="button" className="add-small-button" onClick={handleAddSchedule}>
                + Tambah Jadwal
              </button>
            </div>

            <div className="schedule-list">
              {schedules.map((schedule, index) => (
                <div className="schedule-row" key={index} style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                  <div className="schedule-field" style={{ flex: 1 }}>
                    <label>TANGGAL</label>
                    <input
                      type="date"
                      value={schedule.date}
                      onChange={(e) => handleScheduleChange(index, "date", e.target.value)}
                    />
                  </div>
                  <div className="schedule-field" style={{ flex: 1 }}>
                    <label>JAM MULAI</label>
                    <input
                      type="time"
                      value={schedule.startTime}
                      onChange={(e) => handleScheduleChange(index, "startTime", e.target.value)}
                    />
                  </div>
                  <div className="schedule-field" style={{ flex: 1 }}>
                    <label>JAM SELESAI</label>
                    <input
                      type="time"
                      value={schedule.endTime}
                      onChange={(e) => handleScheduleChange(index, "endTime", e.target.value)}
                    />
                  </div>
                  {schedules.length > 1 && (
                    <button type="button" onClick={() => handleDeleteSchedule(index)}>×</button>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* KATEGORI TIKET */}
          <section className="form-card">
            <div className="section-header">
              <h2>Kategori Tiket</h2>
              <button type="button" className="add-small-button" onClick={handleAddTicket}>
                + Tambah Kategori
              </button>
            </div>

            <div className="ticket-table">
              {tickets.map((ticket, index) => (
                <div className="ticket-row" key={index} style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                  <input
                    type="text"
                    value={ticket.name}
                    placeholder="Nama Kategori (VIP)"
                    onChange={(e) => handleTicketChange(index, "name", e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <input
                    type="number"
                    value={ticket.price}
                    placeholder="Harga (Rp)"
                    onChange={(e) => handleTicketChange(index, "price", e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <input
                    type="number"
                    value={ticket.quota}
                    placeholder="Kuota"
                    onChange={(e) => handleTicketChange(index, "quota", e.target.value)}
                    style={{ flex: 1 }}
                  />
                  {tickets.length > 1 && (
                    <button type="button" onClick={() => handleDeleteTicket(index)}>×</button>
                  )}
                </div>
              ))}
            </div>
            <div style={{ marginTop: "10px", fontWeight: "600" }}>Total Kuota: {totalQuota}</div>
          </section>

          {/* LINE UP (NAME + FOTO) */}
          <section className="form-card">
            <div className="section-header">
              <h2>Line Up Event</h2>
              <button type="button" className="add-small-button" onClick={handleAddLineup}>
                + Tambah LineUp
              </button>
            </div>

            <div className="lineup-list">
              {lineups.map((lineup, index) => (
                <div className="lineup-row" key={index} style={{ display: "flex", gap: "10px", marginBottom: "10px", alignItems: "center" }}>
                  <input
                    type="text"
                    value={lineup.name}
                    placeholder="Nama Artis / Pengisi Acara"
                    onChange={(e) => handleLineupChange(index, "name", e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleLineupFileChange(index, e.target.files?.[0] || null)}
                    style={{ flex: 1.5 }}
                  />
                  <input
                    type="url"
                    value={lineup.image}
                    placeholder="atau tempel URL foto"
                    onChange={(e) => handleLineupChange(index, "image", e.target.value)}
                    style={{ flex: 1.5 }}
                  />
                  {lineups.length > 1 && (
                    <button type="button" onClick={() => handleDeleteLineup(index)}>×</button>
                  )}
                </div>
              ))}
            </div>

            <p style={{ fontSize: "12px", color: "#6f7482", margin: "4px 0 0" }}>
              Upload foto artis di sini. Backend mengosongkan kolom lineup yang berisi
              URL eksternal, jadi foto wajib berupa file yang diupload.
            </p>
          </section>

          {/* FASILITAS EVENT */}
          <section className="form-card">
            <div className="section-header">
              <h2>Fasilitas Event</h2>
              <button type="button" className="add-small-button" onClick={handleAddFacility}>
                + Tambah Fasilitas
              </button>
            </div>

            <div className="lineup-list">
              {facilities.map((facility, index) => (
                <div className="lineup-row" key={index} style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                  <input
                    type="text"
                    value={facility}
                    placeholder="Contoh: Free Parking, Food Court"
                    onChange={(e) => handleFacilityChange(index, e.target.value)}
                    style={{ flex: 1 }}
                  />
                  {facilities.length > 1 && (
                    <button type="button" onClick={() => handleDeleteFacility(index)}>×</button>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* PERIZINAN */}
          <section className="form-card">
            <h2>Perizinan Event</h2>
            <label className="upload-box">
              <input type="file" accept=".pdf,.zip" onChange={handlePermissionChange} />
              <div className="upload-icon">📄</div>
              <strong>{permissionFile ? permissionFile.name : "Upload Dokumen Perizinan (.PDF / .ZIP)"}</strong>
            </label>
          </section>
        </div>
      </main>
    </div>
  );
}

export default AddEvent;