import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";

import SidebarEO from "../shared/SidebarEO";
import NavbarEO from "../shared/NavbarEO";

import {
  getPublicEventDetail,
  updateOrganizerEvent,
  uploadOrganizerEventBanner,
} from "../../services/organizerEventService";

import { resolveBannerUrl } from "../../utils/bannerUrl";

import "./AddEvent.css";

function EditEventEO() {
  const navigate = useNavigate();
  const { id } = useParams();

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
  const [tickets, setTickets] = useState([]);

  // =====================================================
  // LINEUP
  // =====================================================
  const [lineups, setLineups] = useState([""]);

  // =====================================================
  // BANNER & PREVIEW STATE
  // =====================================================
  const [banner, setBanner] = useState(null);
  const [existingBannerUrl, setExistingBannerUrl] = useState("");
  const [bannerPreview, setBannerPreview] = useState("");

  // =====================================================
  // PERMISSION FILE
  // =====================================================
  const [permissionFile, setPermissionFile] = useState(null);
  const [existingPermissionName, setExistingPermissionName] = useState("");

  // =====================================================
  // STATE LOADING & SUBMIT
  // =====================================================
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const getImageUrl = (url) => resolveBannerUrl(url) || "";

  // =====================================================
  // HELPER FORMAT TANGGAL & JAM (SAFETY PARSER)
  // =====================================================
  const parseDateAndFormat = (dateInput) => {
    if (!dateInput) return "";
    try {
      if (typeof dateInput === "string" && dateInput.includes("T")) {
        return dateInput.split("T")[0];
      }
      const d = new Date(dateInput);
      if (!Number.isNaN(d.getTime())) {
        return d.toISOString().split("T")[0];
      }
      return String(dateInput).slice(0, 10);
    } catch {
      return "";
    }
  };

  const parseTimeAndFormat = (timeInput, fullDateFallback) => {
    if (timeInput) {
      if (typeof timeInput === "string" && timeInput.includes(":")) {
        const parts = timeInput.split(":");
        return `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}`;
      }
    }
    if (fullDateFallback) {
      try {
        const d = new Date(fullDateFallback);
        if (!Number.isNaN(d.getTime())) {
          return d.toTimeString().slice(0, 5);
        }
      } catch {
        // do nothing
      }
    }
    return "";
  };

  // =====================================================
  // GET EVENT DATA DENGAN FALLBACK MAPPING
  // =====================================================
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        setError("");

        if (!id) throw new Error("ID event tidak ditemukan.");

        const response = await getPublicEventDetail(id);
        
        console.log("--> GET EVENT RESPONSE DETAIL:", response);

        const event = response?.data || response?.event || response;

        if (!event) throw new Error("Data event tidak ditemukan dari server.");

        // --- 1. BASIC DATA ---
        setEventName(
          event.title || event.event_name || event.name || event.eventName || ""
        );
        setCategory(event.category || event.event_category || "");
        setDescription(event.description || event.event_description || "");
        setLocation(
          event.venue_name || event.location || event.venue || event.address || ""
        );

        // --- 2. BANNER ---
        const rawBanner =
          event.banner_url ||
          event.bannerUrl ||
          event.image ||
          event.banner ||
          "";

        setExistingBannerUrl(rawBanner);
        if (rawBanner) {
          setBannerPreview(getImageUrl(rawBanner));
        }

        // --- 3. DOKUMEN PERIZINAN (FILE) ---
        const rawFile =
          event.permission_file ||
          event.permissionFile ||
          event.document ||
          event.proposal_url ||
          "";

        if (rawFile) {
          const fileName = String(rawFile).split("/").pop() || "Dokumen_Perizinan.pdf";
          setExistingPermissionName(fileName);
        }

        // --- 4. LINEUP ---
        const rawLineup = event.lineup || event.lineups || event.artists || event.performers;
        if (rawLineup) {
          if (Array.isArray(rawLineup)) {
            const formattedLineup = rawLineup.map((item) =>
              typeof item === "object" ? item.name || item.artist_name || "" : String(item)
            );
            setLineups(formattedLineup.length ? formattedLineup : [""]);
          } else if (typeof rawLineup === "string") {
            const parsedArray = rawLineup
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean);
            setLineups(parsedArray.length ? parsedArray : [""]);
          }
        } else {
          setLineups([""]);
        }

        // --- 5. JADWAL (SCHEDULE) ---
        const rawSchedules = event.schedules || event.schedule_list || event.schedules_data;

        if (Array.isArray(rawSchedules) && rawSchedules.length > 0) {
          const parsedSchedules = rawSchedules.map((sch) => ({
            date: parseDateAndFormat(sch.date || sch.event_date || sch.start_date),
            startTime: parseTimeAndFormat(sch.start_time || sch.startTime, sch.start_date),
            endTime: parseTimeAndFormat(sch.end_time || sch.endTime, sch.end_date),
          }));
          setSchedules(parsedSchedules);
        } else {
          const startDateRaw = event.start_date || event.startDate || event.date;
          const endDateRaw = event.end_date || event.endDate || startDateRaw;

          const parsedDate = parseDateAndFormat(startDateRaw);
          const parsedStart = parseTimeAndFormat(event.start_time, startDateRaw);
          const parsedEnd = parseTimeAndFormat(event.end_time, endDateRaw);

          setSchedules([
            {
              date: parsedDate,
              startTime: parsedStart,
              endTime: parsedEnd,
            },
          ]);
        }

        // --- 6. TIKET & KUOTA ---
        const rawTickets =
          event.tickets ||
          event.ticket_tiers ||
          event.ticketTiers ||
          event.tiers ||
          [];

        if (Array.isArray(rawTickets) && rawTickets.length > 0) {
          setTickets(
            rawTickets.map((ticket) => {
              const quotaVal =
                ticket.total_quota ??
                ticket.quota ??
                ticket.totalQuota ??
                ticket.quantity ??
                "";

              const priceVal =
                ticket.price ??
                ticket.ticket_price ??
                "";

              return {
                id: ticket.tier_id || ticket.tierId || ticket.id || null,
                name: ticket.tier_name || ticket.tierName || ticket.name || ticket.title || "",
                price: priceVal !== "" && priceVal !== null ? String(priceVal) : "",
                quota: quotaVal !== "" && quotaVal !== null ? String(quotaVal) : "",
              };
            })
          );
        } else {
          setTickets([{ name: "", price: "", quota: "" }]);
        }

      } catch (err) {
        console.error("Gagal mengambil detail event:", err);
        const message = err?.message || "Gagal mengambil data event.";
        setError(message);
        Swal.fire({
          icon: "error",
          title: "Gagal Memuat Data",
          text: message,
          confirmColor: "#6256e8",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  // =====================================================
  // HANDLERS JADWAL, TIKET, & LINEUP
  // =====================================================
  const handleAddSchedule = () => {
    setSchedules([...schedules, { date: "", startTime: "", endTime: "" }]);
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
  // BANNER & PERMISSION FILE HANDLERS
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

  const handleRemoveBanner = () => {
    setBanner(null);
    if (existingBannerUrl) {
      setBannerPreview(getImageUrl(existingBannerUrl));
    } else {
      setBannerPreview("");
    }
  };

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
  // VALIDASI FORM
  // =====================================================
  const validateForm = () => {
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

    for (let i = 0; i < schedules.length; i++) {
      const schedule = schedules[i];
      if (!schedule.date) {
        Swal.fire({
          icon: "warning",
          title: "Jadwal Belum Lengkap",
          text: `Tanggal jadwal ke-${i + 1} wajib diisi.`,
          confirmColor: "#6256e8",
        });
        return false;
      }
      if (!schedule.startTime) {
        Swal.fire({
          icon: "warning",
          title: "Jadwal Belum Lengkap",
          text: `Jam mulai jadwal ke-${i + 1} wajib diisi.`,
          confirmColor: "#6256e8",
        });
        return false;
      }
      if (!schedule.endTime) {
        Swal.fire({
          icon: "warning",
          title: "Jadwal Belum Lengkap",
          text: `Jam selesai jadwal ke-${i + 1} wajib diisi.`,
          confirmColor: "#6256e8",
        });
        return false;
      }
      if (schedule.endTime <= schedule.startTime) {
        Swal.fire({
          icon: "error",
          title: "Waktu Tidak Valid",
          text: `Jam selesai jadwal ke-${i + 1} harus lebih besar dari jam mulai.`,
          confirmColor: "#6256e8",
        });
        return false;
      }
    }

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

    return true;
  };

  // =====================================================
  // BUILD PAYLOAD
  // =====================================================
  const buildDateTime = (date, time) => {
    if (!date || !time) return null;
    return `${date}T${time}:00`;
  };

  const buildEventPayload = (bannerUrl) => {
    const firstSchedule = schedules[0];
    const startDate = buildDateTime(firstSchedule?.date, firstSchedule?.startTime);
    const endDate = buildDateTime(firstSchedule?.date, firstSchedule?.endTime);

    const lineupData = lineups
      .map((item) => item.trim())
      .filter(Boolean)
      .join(", ");

    const ticketData = tickets.map((ticket) => ({
      ...(ticket.id ? { tier_id: Number(ticket.id) || ticket.id } : {}),
      tier_name: ticket.name.trim(),
      price: Number(ticket.price) || 0,
      total_quota: Number(ticket.quota) || 0,
    }));

    return {
      eventId: id,
      event_id: id,
      title: eventName.trim(),
      description: description.trim(),
      category,
      venue_name: location.trim(),
      start_date: startDate,
      end_date: endDate,
      lineup: lineupData || null,
      banner_url: bannerUrl,
      tickets: ticketData,
      ticket_tiers: ticketData,
    };
  };

  // =====================================================
  // UPDATE EVENT ACTION
  // =====================================================
  const handleUpdateEvent = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      setError("");

      let bannerUrl = existingBannerUrl || null;

      if (banner) {
        const bannerResponse = await uploadOrganizerEventBanner(banner);
        bannerUrl =
          bannerResponse?.data?.banner_url ||
          bannerResponse?.banner_url ||
          bannerUrl;
      }

      const payload = buildEventPayload(bannerUrl);
      console.log("--> SUBMITTING PAYLOAD TO SERVER FOR EVENT ID:", id, payload);

      // PANGGILAN DENGAN ID DAN PAYLOAD TERPISAH (Sesuai Service)
      const response = await updateOrganizerEvent(id, payload);
      console.log("--> SERVER UPDATE RESPONSE:", response);

      Swal.fire({
        icon: "success",
        title: "Perubahan Tersimpan!",
        text: "Detail event Anda berhasil diperbarui.",
        confirmColor: "#6256e8",
      }).then(() => {
        navigate(`/eo/event/${id}`, { replace: true, state: { updated: Date.now() } });
      });
    } catch (err) {
      console.error("Gagal memperbarui event:", err);
      const message = err?.response?.data?.message || err?.message || "Gagal memperbarui event.";
      setError(message);
      Swal.fire({
        icon: "error",
        title: "Gagal Memperbarui",
        text: message,
        confirmColor: "#6256e8",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // =====================================================
  // TOTAL KUOTA
  // =====================================================
  const totalQuota = tickets.reduce((total, ticket) => {
    return total + (Number(ticket.quota) || 0);
  }, 0);

  if (loading) {
    return (
      <div className="add-event-page">
        <SidebarEO />
        <main className="add-event-main">
          <NavbarEO />
          <div
            className="add-event-content"
            style={{ textAlign: "center", paddingTop: "100px", color: "#777" }}
          >
            Memuat data event...
          </div>
        </main>
      </div>
    );
  }

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
              <h1>Edit Event</h1>
              <p>Perbarui detail event Anda di bawah ini.</p>
            </div>

            <div className="add-event-header-actions">
              <button
                type="button"
                className="draft-button"
                onClick={() => navigate(`/eo/event/${id}`)}
                disabled={submitting}
              >
                Batal
              </button>

              <button
                type="button"
                className="create-event-button"
                onClick={handleUpdateEvent}
                disabled={submitting}
              >
                <span>✓</span>
                {submitting ? "Menyimpan..." : "Simpan Perubahan"}
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
                  alt="Banner Event"
                  className="banner-preview-img"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
                <div className="banner-preview-overlay">
                  <span className="banner-filename">
                    {banner ? banner.name : "Banner Aktif Saat Ini"}
                  </span>
                  <div className="banner-action-buttons">
                    <label className="change-banner-btn">
                      Ganti Gambar
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleBannerChange}
                      />
                    </label>
                    {banner && (
                      <button
                        type="button"
                        className="remove-banner-btn"
                        onClick={handleRemoveBanner}
                      >
                        Batal
                      </button>
                    )}
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
                <strong>Upload / Ganti Banner Event (16:9)</strong>
                <span>Klik untuk memilih banner (Max 5MB)</span>
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
                        handleScheduleChange(
                          index,
                          "startTime",
                          e.target.value
                        )
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

          {/* KATEGORI TIKET & KUOTA */}
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
                <div className="ticket-row" key={ticket.id || index}>
                  <input
                    type="text"
                    value={ticket.name}
                    placeholder="Nama kategori"
                    onChange={(e) =>
                      handleTicketChange(index, "name", e.target.value)
                    }
                  />

                  <input
                    type="number"
                    value={ticket.price}
                    placeholder="Harga"
                    min="0"
                    onChange={(e) =>
                      handleTicketChange(index, "price", e.target.value)
                    }
                  />

                  <input
                    type="number"
                    value={ticket.quota}
                    placeholder="Kuota"
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

          {/* LINEUP EVENT */}
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
                    placeholder="Nama artis / pengisi acara"
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
                permissionFile || existingPermissionName ? "has-file" : ""
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
              ) : existingPermissionName ? (
                <>
                  <strong>{existingPermissionName} (Tersimpan)</strong>
                  <span>Klik jika ingin mengganti dokumen perizinan</span>
                </>
              ) : (
                <>
                  <strong>Ganti Dokumen Perizinan (Opsional)</strong>
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

export default EditEventEO;