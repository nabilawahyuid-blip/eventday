import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import SidebarEO from "../shared/SidebarEO";
import NavbarEO from "../shared/NavbarEO";

import {
  createOrganizerEvent,
  publishOrganizerEvent,
  uploadOrganizerEventBanner,
} from "../../services/organizerEventService";

import "./AddEvent.css";

function AddEvent() {
  const navigate = useNavigate();

  // =====================================================
  // BASIC EVENT DATA
  // =====================================================
  const [eventName, setEventName] = useState("");
  const [category, setCategory] = useState("");
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
  // LINEUP
  // =====================================================
  const [lineups, setLineups] = useState([""]);

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
        confirmColor: "#6256e8",
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
        confirmColor: "#6256e8",
      });
      return;
    }
    setTickets(tickets.filter((_, i) => i !== index));
  };

  // =====================================================
  // LINEUP HANDLERS
  // =====================================================
  const handleAddLineup = () => {
    setLineups([...lineups, ""]);
  };

  const handleLineupChange = (index, value) => {
    const updated = [...lineups];
    updated[index] = value;
    setLineups(updated);
  };

  const handleDeleteLineup = (index) => {
    if (lineups.length === 1) {
      Swal.fire({
        icon: "warning",
        title: "Perhatian",
        text: "Minimal harus ada satu pengisi acara (lineup).",
        confirmColor: "#6256e8",
      });
      return;
    }
    setLineups(lineups.filter((_, i) => i !== index));
  };

  // =====================================================
  // BANNER HANDLER (WITH PREVIEW)
  // =====================================================
  const handleBannerChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({
        icon: "error",
        title: "Ukuran File Terlalu Besar",
        text: "Ukuran banner maksimal 5MB.",
        confirmColor: "#6256e8",
      });
      e.target.value = "";
      return;
    }

    if (!file.type.startsWith("image/")) {
      Swal.fire({
        icon: "error",
        title: "Format Tidak Sesuai",
        text: "File banner harus berupa gambar (JPG, PNG, WebP).",
        confirmColor: "#6256e8",
      });
      e.target.value = "";
      return;
    }

    setBanner(file);
    const objectUrl = URL.createObjectURL(file);
    setBannerPreview(objectUrl);
  };

  const handleRemoveBanner = (e) => {
    e.stopPropagation();
    setBanner(null);
    if (bannerPreview) {
      URL.revokeObjectURL(bannerPreview);
      setBannerPreview(null);
    }
  };

  // =====================================================
  // PERMISSION FILE HANDLER
  // =====================================================
  const handlePermissionChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      Swal.fire({
        icon: "error",
        title: "Ukuran File Terlalu Besar",
        text: "Ukuran dokumen perizinan maksimal 10MB.",
        confirmColor: "#6256e8",
      });
      e.target.value = "";
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "application/zip",
      "application/x-zip-compressed",
    ];

    const fileName = file.name.toLowerCase();
    const validExtension = fileName.endsWith(".pdf") || fileName.endsWith(".zip");

    if (!allowedTypes.includes(file.type) && !validExtension) {
      Swal.fire({
        icon: "error",
        title: "Format Tidak Sesuai",
        text: "Dokumen perizinan harus berupa file PDF atau ZIP.",
        confirmColor: "#6256e8",
      });
      e.target.value = "";
      return;
    }

    setPermissionFile(file);
  };

  // =====================================================
  // VALIDATION FORM (STRICT)
  // =====================================================
  const validateForm = (isDraft = false) => {
    if (!eventName.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Form Belum Lengkap",
        text: "Nama event wajib diisi.",
        confirmColor: "#6256e8",
      });
      return false;
    }

    if (!category) {
      Swal.fire({
        icon: "warning",
        title: "Form Belum Lengkap",
        text: "Kategori event wajib dipilih.",
        confirmColor: "#6256e8",
      });
      return false;
    }

    if (!description.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Form Belum Lengkap",
        text: "Deskripsi event wajib diisi.",
        confirmColor: "#6256e8",
      });
      return false;
    }

    if (!location.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Form Belum Lengkap",
        text: "Lokasi / venue event wajib diisi.",
        confirmColor: "#6256e8",
      });
      return false;
    }

    if (!banner && !isDraft) {
      Swal.fire({
        icon: "warning",
        title: "Banner Belum Diunggah",
        text: "Silakan upload banner event terlebih dahulu.",
        confirmColor: "#6256e8",
      });
      return false;
    }

    // Validate Schedule
    for (let i = 0; i < schedules.length; i++) {
      const schedule = schedules[i];
      if (!schedule.date) {
        Swal.fire({
          icon: "warning",
          title: "Jadwal Belum Lengkap",
          text: `Tanggal pada jadwal ke-${i + 1} wajib diisi.`,
          confirmColor: "#6256e8",
        });
        return false;
      }
      if (!schedule.startTime) {
        Swal.fire({
          icon: "warning",
          title: "Jadwal Belum Lengkap",
          text: `Jam mulai pada jadwal ke-${i + 1} wajib diisi.`,
          confirmColor: "#6256e8",
        });
        return false;
      }
      if (!schedule.endTime) {
        Swal.fire({
          icon: "warning",
          title: "Jadwal Belum Lengkap",
          text: `Jam selesai pada jadwal ke-${i + 1} wajib diisi.`,
          confirmColor: "#6256e8",
        });
        return false;
      }
      if (schedule.endTime <= schedule.startTime) {
        Swal.fire({
          icon: "error",
          title: "Waktu Tidak Valid",
          text: `Jam selesai pada jadwal ke-${i + 1} harus lebih besar dari jam mulai.`,
          confirmColor: "#6256e8",
        });
        return false;
      }
    }

    // Validate Tickets
    for (let i = 0; i < tickets.length; i++) {
      const ticket = tickets[i];
      if (!ticket.name.trim()) {
        Swal.fire({
          icon: "warning",
          title: "Tiket Belum Lengkap",
          text: `Nama kategori tiket ke-${i + 1} wajib diisi.`,
          confirmColor: "#6256e8",
        });
        return false;
      }
      if (ticket.price === "" || Number(ticket.price) < 0) {
        Swal.fire({
          icon: "warning",
          title: "Tiket Belum Lengkap",
          text: `Harga tiket ke-${i + 1} tidak valid.`,
          confirmColor: "#6256e8",
        });
        return false;
      }
      if (ticket.quota === "" || Number(ticket.quota) <= 0) {
        Swal.fire({
          icon: "warning",
          title: "Tiket Belum Lengkap",
          text: `Kuota tiket ke-${i + 1} harus lebih dari 0.`,
          confirmColor: "#6256e8",
        });
        return false;
      }
    }

    // Validate Lineup
    for (let i = 0; i < lineups.length; i++) {
      if (!lineups[i].trim()) {
        Swal.fire({
          icon: "warning",
          title: "Lineup Belum Lengkap",
          text: `Nama pengisi acara (lineup) ke-${i + 1} wajib diisi.`,
          confirmColor: "#6256e8",
        });
        return false;
      }
    }

    // Validate Permission File
    if (!permissionFile && !isDraft) {
      Swal.fire({
        icon: "warning",
        title: "Dokumen Belum Diunggah",
        text: "Silakan upload dokumen perizinan event.",
        confirmColor: "#6256e8",
      });
      return false;
    }

    return true;
  };

  // =====================================================
  // HELPERS & PAYLOAD BUILDER
  // =====================================================
  const buildDateTime = (date, time) => {
    if (!date || !time) return null;
    return `${date}T${time}:00`;
  };

  const buildEventPayload = (bannerUrl = null) => {
    const firstSchedule = schedules[0];
    const startDate = buildDateTime(firstSchedule?.date, firstSchedule?.startTime);
    const endDate = buildDateTime(firstSchedule?.date, firstSchedule?.endTime);

    const lineupData = lineups
      .map((item) => item.trim())
      .filter(Boolean)
      .join(", ");

    const ticketData = tickets.map((ticket) => ({
      tier_name: ticket.name.trim(),
      price: Number(ticket.price),
      total_quota: Number(ticket.quota),
    }));

    return {
      title: eventName.trim(),
      description: description.trim(),
      category,
      venue_name: location.trim(),
      start_date: startDate,
      end_date: endDate,
      lineup: lineupData || null,
      banner_url: bannerUrl,
      tickets: ticketData,
    };
  };

  const createEvent = async () => {
    let bannerUrl = null;

    if (banner) {
      const bannerResponse = await uploadOrganizerEventBanner(banner);
      bannerUrl =
        bannerResponse?.data?.banner_url ||
        bannerResponse?.banner_url ||
        null;

      if (!bannerUrl) {
        throw new Error("Banner berhasil diupload tetapi URL banner tidak ditemukan.");
      }
    }

    const payload = buildEventPayload(bannerUrl);
    const response = await createOrganizerEvent(payload);
    return response;
  };

  // =====================================================
  // ACTIONS
  // =====================================================
  const handleSaveDraft = async () => {
    if (!validateForm(true)) return;

    try {
      setSubmitting(true);
      setError("");

      const response = await createEvent();
      const eventId =
        response?.data?.event_id ||
        response?.data?.id ||
        response?.event_id ||
        response?.id;

      if (!eventId) {
        throw new Error("Event berhasil dibuat tetapi ID event tidak ditemukan.");
      }

      Swal.fire({
        icon: "success",
        title: "Draft Tersimpan!",
        text: "Event berhasil disimpan sebagai draft.",
        confirmColor: "#6256e8",
      }).then(() => {
        navigate("/eo/event");
      });
    } catch (err) {
      const message = err?.message || "Gagal menyimpan draft event.";
      setError(message);
      Swal.fire({
        icon: "error",
        title: "Gagal Menyimpan",
        text: message,
        confirmColor: "#6256e8",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateEvent = async () => {
    if (!validateForm(false)) return;

    try {
      setSubmitting(true);
      setError("");

      const createResponse = await createEvent();
      const eventId =
        createResponse?.data?.event_id ||
        createResponse?.data?.id ||
        createResponse?.event_id ||
        createResponse?.id;

      if (!eventId) {
        throw new Error("Event berhasil dibuat tetapi ID event tidak ditemukan.");
      }

      await publishOrganizerEvent({ event_id: eventId });

      Swal.fire({
        icon: "success",
        title: "Berhasil Diajukan!",
        text: "Event Anda berhasil dibuat dan menunggu persetujuan admin.",
        confirmColor: "#6256e8",
      }).then(() => {
        navigate("/eo/event");
      });
    } catch (err) {
      const message = err?.message || "Gagal membuat event.";
      setError(message);
      Swal.fire({
        icon: "error",
        title: "Gagal Membuat Event",
        text: message,
        confirmColor: "#6256e8",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // =====================================================
  // TOTAL QUOTA
  // =====================================================
  const totalQuota = tickets.reduce((total, ticket) => {
    return total + (Number(ticket.quota) || 0);
  }, 0);

  return (
    <div className="add-event-page">
      <SidebarEO />

      <main className="add-event-main">
        <NavbarEO />

        <div className="add-event-content">
          {error && (
            <div className="dashboard-error" style={{ marginBottom: "20px" }}>
              {error}
            </div>
          )}

          {/* HEADER */}
          <div className="add-event-header">
            <div className="add-event-title">
              <span className="add-event-small-title">Event</span>
              <h1>Buat Event baru</h1>
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
                  placeholder="Contoh: Sedih Fest 2024"
                />
              </div>

              <div className="form-field">
                <label>KATEGORI EVENT</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">Pilih Kategori...</option>
                  <option value="Konser">Konser</option>
                  <option value="Musik">Musik</option>
                  <option value="Seminar">Seminar</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Festival">Festival</option>
                  <option value="Olahraga">Olahraga</option>
                  <option value="Komunitas">Komunitas</option>
                  <option value="Lainnya">Lainnya</option>
                </select>

                {category && (
                  <span className="category-tag">
                    {category}
                    <button type="button" onClick={() => setCategory("")}>
                      ×
                    </button>
                  </span>
                )}
              </div>
            </div>

            <div className="form-field description-field">
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
              <div className="input-with-icon">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Cari gedung, stadion, atau alamat lengkap..."
                />
              </div>
            </div>
          </section>

          {/* BANNER EVENT */}
          <section className="form-card">
            <h2>Banner Event</h2>

            {bannerPreview ? (
              <div className="banner-preview-wrapper">
                <img
                  src={bannerPreview}
                  alt="Banner Event Preview"
                  className="banner-preview-img"
                />
                <div className="banner-preview-overlay">
                  <span className="banner-filename">{banner?.name}</span>
                  <div className="banner-action-buttons">
                    <label className="change-banner-btn">
                      Ganti Gambar
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleBannerChange}
                      />
                    </label>
                    <button
                      type="button"
                      className="remove-banner-btn"
                      onClick={handleRemoveBanner}
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <label className="upload-box">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBannerChange}
                />
                <div className="upload-icon">☁</div>
                <strong>Upload Banner Event (16:9)</strong>
                <span>
                  Drag & drop atau klik untuk memilih file (Max 5MB)
                </span>
              </label>
            )}
          </section>

          {/* JADWAL EVENT */}
          <section className="form-card">
            <div className="section-header">
              <h2>Jadwal Event</h2>
              <button
                type="button"
                className="add-small-button"
                onClick={handleAddSchedule}
              >
                + Tambah Jadwal
              </button>
            </div>

            <div className="schedule-list">
              {schedules.map((schedule, index) => (
                <div className="schedule-row" key={index}>
                  <div className="schedule-field">
                    <label>TANGGAL</label>
                    <input
                      type="date"
                      value={schedule.date}
                      onChange={(e) =>
                        handleScheduleChange(index, "date", e.target.value)
                      }
                    />
                  </div>

                  <div className="schedule-field">
                    <label>JAM MULAI</label>
                    <input
                      type="time"
                      value={schedule.startTime}
                      onChange={(e) =>
                        handleScheduleChange(index, "startTime", e.target.value)
                      }
                    />
                  </div>

                  <div className="schedule-field">
                    <label>JAM SELESAI</label>
                    <input
                      type="time"
                      value={schedule.endTime}
                      onChange={(e) =>
                        handleScheduleChange(index, "endTime", e.target.value)
                      }
                    />
                  </div>

                  <button
                    type="button"
                    className="delete-row-button"
                    onClick={() => handleDeleteSchedule(index)}
                  >
                    🗑
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* KATEGORI TIKET */}
          <section className="form-card">
            <div className="section-header">
              <h2>Kategori Tiket</h2>
              <button
                type="button"
                className="add-small-button"
                onClick={handleAddTicket}
              >
                + Tambah Kategori
              </button>
            </div>

            <div className="ticket-table">
              <div className="ticket-header">
                <span>NAMA KATEGORI</span>
                <span>HARGA TIKET (RP)</span>
                <span>KUOTA</span>
                <span></span>
              </div>

              {tickets.map((ticket, index) => (
                <div className="ticket-row" key={index}>
                  <input
                    type="text"
                    value={ticket.name}
                    placeholder="Contoh: VIP / Regular"
                    onChange={(e) =>
                      handleTicketChange(index, "name", e.target.value)
                    }
                  />

                  <input
                    type="number"
                    value={ticket.price}
                    placeholder="0"
                    min="0"
                    onChange={(e) =>
                      handleTicketChange(index, "price", e.target.value)
                    }
                  />

                  <input
                    type="number"
                    value={ticket.quota}
                    placeholder="0"
                    min="1"
                    onChange={(e) =>
                      handleTicketChange(index, "quota", e.target.value)
                    }
                  />

                  <button
                    type="button"
                    className="delete-ticket-button"
                    onClick={() => handleDeleteTicket(index)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <div className="total-quota">
              <span>Total Kuota:</span>
              <strong>{totalQuota}</strong>
            </div>
          </section>

          {/* LINE UP */}
          <section className="form-card">
            <div className="section-header">
              <h2>Line Up Event</h2>
              <button
                type="button"
                className="add-small-button"
                onClick={handleAddLineup}
              >
                + Tambah LineUp
              </button>
            </div>

            <div className="lineup-list">
              {lineups.map((lineup, index) => (
                <div className="lineup-row" key={index}>
                  <input
                    type="text"
                    value={lineup}
                    placeholder="Contoh: Nama artis / pengisi acara"
                    onChange={(e) =>
                      handleLineupChange(index, e.target.value)
                    }
                  />

                  <button
                    type="button"
                    onClick={() => handleDeleteLineup(index)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* PERIZINAN */}
          <section className="form-card">
            <h2>Perizinan Event</h2>

            <label
              className={`upload-box permission-upload ${
                permissionFile ? "has-file" : ""
              }`}
            >
              <input
                type="file"
                accept=".pdf,.zip"
                onChange={handlePermissionChange}
              />

              <div className="upload-icon">📄</div>

              {permissionFile ? (
                <>
                  <strong>{permissionFile.name}</strong>
                  <span>Klik untuk mengganti dokumen</span>
                </>
              ) : (
                <>
                  <strong>Upload Dokumen Perizinan</strong>
                  <span>Format .PDF atau .ZIP (Max 10MB)</span>
                </>
              )}
            </label>
          </section>
        </div>
      </main>
    </div>
  );
}

export default AddEvent;