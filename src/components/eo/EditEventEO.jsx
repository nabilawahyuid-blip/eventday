import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";

import SidebarEO from "../shared/SidebarEO";
import NavbarEO from "../shared/NavbarEO";

import {
  getOrganizerEventDetail,
  updateOrganizerEvent,
  uploadOrganizerEventBanner,
  uploadOrganizerLineupImage,
  extractUploadedImageUrl,
  getEventCategories,
} from "../../services/organizerEventService";

import { resolveBannerUrl } from "../../utils/bannerUrl";
import "./AddEvent.css";

import { VALID_CATEGORIES, CATEGORY_LABELS, normalizeCategoryForBackend } from "../../constants/categories";

function EditEventEO() {
  const navigate = useNavigate();
  const { id } = useParams();

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
  // DYNAMIC LISTS (SCHEDULES, TICKETS, LINEUPS, FACILITIES)
  // =====================================================
  const [schedules, setSchedules] = useState([{ date: "", startTime: "", endTime: "" }]);
  const [tickets, setTickets] = useState([{ id: null, name: "", price: "", quota: "" }]);
  // `file` = File baru yang dipilih user (akan diupload saat submit).
  // `image` = path/URL yang sudah tersimpan di backend.
  const [lineups, setLineups] = useState([{ name: "", image: "", file: null }]);
  const [facilities, setFacilities] = useState([""]);

  // =====================================================
  // BANNER & FILE STATE
  // =====================================================
  const [banner, setBanner] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [existingBannerUrl, setExistingBannerUrl] = useState(null);

  // =====================================================
  // LOADING & ERROR STATE
  // =====================================================
  const [fetchingData, setFetchingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // =====================================================
  // FETCH CATEGORIES & AUTO-FILL EVENT DATA
  // =====================================================
  useEffect(() => {
    const initData = async () => {
      try {
        setFetchingData(true);
        setError("");

        if (!id || id === "undefined") {
          throw new Error("ID event tidak valid di URL.");
        }

        // 1. Fetch Categories
        try {
          const catRes = await getEventCategories();
          let catList = [];

          if (Array.isArray(catRes)) {
            catList = catRes;
          } else if (Array.isArray(catRes?.data)) {
            catList = catRes.data;
          } else if (Array.isArray(catRes?.data?.data)) {
            catList = catRes.data.data;
          }

          if (catList.length === 0) {
            catList = [
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
          setCategories(catList);
        } catch (cErr) {
          console.warn("Fallback Kategori digunakan:", cErr);
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

        // 2. Fetch Detail Event
        const eventRes = await getOrganizerEventDetail(id);
        const eventData = eventRes?.data?.data || eventRes?.data || eventRes;

        if (!eventData) {
          throw new Error("Data event tidak ditemukan dari server.");
        }

        // AUTO-FILL INFORMASI DASAR
        setEventName(eventData.title || "");
        setCategory(eventData.category || "");
        setDescription(eventData.description || "");
        setLocation(eventData.location || eventData.venue_name || "");

        // AUTO-FILL BANNER
        const bannerPath = eventData.image || eventData.banner_url || eventData.banner;
        if (bannerPath) {
          const fullUrl = resolveBannerUrl(bannerPath);
          setExistingBannerUrl(fullUrl);
          setBannerPreview(fullUrl);
        }

        // AUTO-FILL JADWAL
        if (eventData.date || eventData.start_date) {
          const rawStart = new Date(eventData.date || eventData.start_date);
          const rawEnd = eventData.end_date ? new Date(eventData.end_date) : rawStart;

          if (!isNaN(rawStart.getTime())) {
            const dateStr = rawStart.toISOString().split("T")[0];
            const startTimeStr = rawStart.toTimeString().substring(0, 5);
            const endTimeStr = !isNaN(rawEnd.getTime())
              ? rawEnd.toTimeString().substring(0, 5)
              : startTimeStr;

            setSchedules([{ date: dateStr, startTime: startTimeStr, endTime: endTimeStr }]);
          }
        }

        // AUTO-FILL TIKET (ROBUST MAPPING)
        const rawTickets =
          eventData.tickets ||
          eventData.ticket_categories ||
          eventData.ticketCategories ||
          [];

        if (Array.isArray(rawTickets) && rawTickets.length > 0) {
          const mappedTickets = rawTickets.map((t) => ({
            id: t.id || t.ticket_id || null,
            name: t.name || t.label || t.tier_name || t.ticket_name || "",
            price: t.price !== undefined && t.price !== null ? t.price : "",
            quota:
              t.quota !== undefined && t.quota !== null
                ? t.quota
                : t.total_quota !== undefined && t.total_quota !== null
                ? t.total_quota
                : "",
          }));

          setTickets(mappedTickets);
        } else {
          setTickets([{ id: null, name: "", price: "", quota: "" }]);
        }

        // AUTO-FILL LINEUP (Format "Nama|PathGambar" atau array object)
        const rawLineup = eventData.lineup || eventData.lineups;
        if (typeof rawLineup === "string" && rawLineup.trim() !== "") {
          const parsed = rawLineup.split(",").map((s) => {
            const parts = s.split("|");
            return {
              name: parts[0]?.trim() || "",
              image: parts[1]?.trim() || "",
              file: null,
            };
          });
          setLineups(parsed);
        } else if (Array.isArray(rawLineup) && rawLineup.length > 0) {
          setLineups(
            rawLineup.map((item) =>
              typeof item === "string"
                ? {
                    name: item.split("|")[0]?.trim() || "",
                    image: item.split("|")[1]?.trim() || "",
                    file: null,
                  }
                : {
                    name: item?.name || "",
                    image: item?.image || "",
                    file: null,
                  }
            )
          );
        }

        // AUTO-FILL FASILITAS
        const rawFacilities = eventData.facilities || eventData.facility;
        if (Array.isArray(rawFacilities) && rawFacilities.length > 0) {
          setFacilities(rawFacilities.map((f) => (typeof f === "string" ? f : f.name || "")));
        } else if (typeof rawFacilities === "string" && rawFacilities.trim() !== "") {
          setFacilities(rawFacilities.split(",").map((f) => f.trim()));
        }
      } catch (err) {
        console.error("Gagal memuat detail event:", err);
        setError(err?.message || "Gagal memuat data event.");
      } finally {
        setFetchingData(false);
      }
    };

    initData();
  }, [id]);

  // Helper Kategori
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
  // DYNAMIC LIST HANDLERS
  // =====================================================
  // SCHEDULES
  const handleAddSchedule = () => setSchedules([...schedules, { date: "", startTime: "", endTime: "" }]);
  const handleScheduleChange = (index, field, value) => {
    const updated = [...schedules];
    updated[index] = { ...updated[index], [field]: value };
    setSchedules(updated);
  };
  const handleDeleteSchedule = (index) => {
    if (schedules.length === 1) return;
    setSchedules(schedules.filter((_, i) => i !== index));
  };

  // TICKETS HANDLER
  const handleAddTicket = () => setTickets([...tickets, { id: null, name: "", price: "", quota: "" }]);
  const handleTicketChange = (index, field, value) => {
    const updated = [...tickets];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    setTickets(updated);
  };
  const handleDeleteTicket = (index) => {
    if (tickets.length === 1) return;
    setTickets(tickets.filter((_, i) => i !== index));
  };

  // LINEUPS HANDLER
  const handleAddLineup = () =>
    setLineups([...lineups, { name: "", image: "", file: null }]);
  const handleLineupChange = (index, field, value) => {
    const updated = [...lineups];
    // Mengetik URL manual membuang File yang sudah dipilih supaya
    // tidak ada dua sumber gambar yang bertabrakan.
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
      });
      return;
    }

    const updated = [...lineups];
    updated[index] = { ...updated[index], file, image: "" };
    setLineups(updated);
  };
  const handleDeleteLineup = (index) => {
    if (lineups.length === 1) return;
    setLineups(lineups.filter((_, i) => i !== index));
  };

  // Upload hanya foto yang BARU dipilih user; baris tanpa file baru
  // tetap memakai path yang sudah tersimpan di backend.
  const uploadLineupImages = async () =>
    Promise.all(
      lineups.map(async (item) => {
        if (!item.file) {
          return item.image || null;
        }

        const response = await uploadOrganizerLineupImage(item.file);
        return extractUploadedImageUrl(response);
      }),
    );

  // FACILITIES HANDLER
  const handleAddFacility = () => setFacilities([...facilities, ""]);
  const handleFacilityChange = (index, value) => {
    const updated = [...facilities];
    updated[index] = value;
    setFacilities(updated);
  };
  const handleDeleteFacility = (index) => {
    if (facilities.length === 1) return;
    setFacilities(facilities.filter((_, i) => i !== index));
  };

  // BANNER CHANGE
  const handleBannerChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBanner(file);
    setBannerPreview(URL.createObjectURL(file));
  };

  // =====================================================
  // SUBMIT UPDATE EVENT
  // =====================================================
  const handleUpdateEvent = async () => {
    if (!eventName.trim() || !category || !description.trim() || !location.trim()) {
      Swal.fire({ icon: "warning", title: "Form Belum Lengkap", text: "Mohon isi semua data yang wajib." });
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      let bannerUrl = existingBannerUrl;
      if (banner) {
        const bannerResponse = await uploadOrganizerEventBanner(banner);
        bannerUrl =
          bannerResponse?.data?.banner_url ||
          bannerResponse?.data?.image ||
          bannerResponse?.banner_url ||
          bannerResponse?.image ||
          bannerUrl;
      }

      const lineupImages = await uploadLineupImages();

      const firstSchedule = schedules[0];
      const startDate = `${firstSchedule?.date}T${firstSchedule?.startTime}:00`;
      const endDate = `${firstSchedule?.date}T${firstSchedule?.endTime}:00`;

      // Simpan Format LineUp: "Nama|PathGambar"
      const lineupString = lineups
        .map((item, index) => ({ item, image: lineupImages[index] }))
        .filter(({ item }) => item.name.trim() !== "")
        .map(({ item, image }) => {
          const name = item.name.trim();
          const img = String(image || "").trim();
          return img ? `${name}|${img}` : name;
        })
        .join(", ");

      const facilityArray = facilities.map((i) => i.trim()).filter(Boolean);

      // Payload Tiket Presisi dengan Menjaga ID
      const ticketPayload = tickets
        .filter((t) => String(t.name).trim() !== "")
        .map((t) => {
          const item = {
            name: String(t.name).trim(),
            label: String(t.name).trim(),
            tier_name: String(t.name).trim(),
            ticket_name: String(t.name).trim(),
            price: Number(t.price),
            quota: Number(t.quota),
          };

          if (t.id && t.id !== "null" && t.id !== "undefined") {
            item.id = t.id;
          }

          return item;
        });

      const payload = {
        title: eventName.trim(),
        description: description.trim(),
        category,
        location: location.trim(),
        venue_name: location.trim(),
        date: startDate,
        start_date: startDate,
        end_date: endDate,
        lineup: lineupString,
        facilities: facilityArray,
        image: bannerUrl,
        banner_url: bannerUrl,
        tickets: ticketPayload,
      };

      await updateOrganizerEvent(id, payload);

      Swal.fire({
        icon: "success",
        title: "Perubahan Disimpan!",
        text: "Event berhasil diperbarui.",
        confirmButtonColor: "#6256e8",
      }).then(() => navigate(`/eo/event/${id}`));
    } catch (err) {
      console.error("Gagal memperbarui event:", err);
      const msg = err?.data?.msg || err?.message || "Gagal memperbarui event.";
      setError(msg);
      Swal.fire({ icon: "error", title: "Gagal Update", text: msg });
    } finally {
      setSubmitting(false);
    }
  };

  if (fetchingData) {
    return (
      <div className="add-event-page">
        <SidebarEO />
        <main className="add-event-main">
          <NavbarEO />
          <div className="add-event-content">
            <p>Memuat data event untuk diedit...</p>
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
          {error && <div className="dashboard-error" style={{ marginBottom: "20px" }}>{error}</div>}

          {/* HEADER */}
          <div className="add-event-header">
            <div className="add-event-title">
              <span className="add-event-small-title">Event</span>
              <h1>Edit Event</h1>
              <p>Perbarui informasi event Anda di bawah ini.</p>
            </div>

            <div className="add-event-header-actions">
              <button
                type="button"
                className="draft-button"
                onClick={() => navigate(`/eo/event/${id}`)}
              >
                Batal
              </button>
              <button
                type="button"
                className="create-event-button"
                onClick={handleUpdateEvent}
                disabled={submitting}
              >
                {submitting ? "Memproses..." : "Simpan Perubahan"}
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
                />
              </div>

              <div className="form-field">
                <label>KATEGORI EVENT</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={loadingCategories}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid #ccc",
                    backgroundColor: "#ffffff",
                    cursor: "pointer",
                  }}
                >
                  <option value="">
                    {loadingCategories ? "Memuat Kategori..." : "-- Pilih Kategori Event --"}
                  </option>
                  {categories.map((cat, idx) => {
                    const val = getCategoryValue(cat);
                    const label = formatCategoryLabel(cat);
                    return (
                      <option key={idx} value={val}>
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
              />
            </div>
          </section>

          {/* BANNER EVENT */}
          <section className="form-card">
            <h2>Banner Event</h2>
            {bannerPreview ? (
              <div className="banner-preview-wrapper">
                <img src={bannerPreview} alt="Preview Banner" className="banner-preview-img" style={{ maxHeight: "200px", borderRadius: "8px" }} />
                <div className="banner-preview-overlay" style={{ marginTop: "10px" }}>
                  <label className="change-banner-btn">
                    Ganti Gambar
                    <input type="file" accept="image/*" onChange={handleBannerChange} />
                  </label>
                </div>
              </div>
            ) : (
              <label className="upload-box">
                <input type="file" accept="image/*" onChange={handleBannerChange} />
                <strong>Upload Banner Event</strong>
              </label>
            )}
          </section>

          {/* JADWAL EVENT */}
          <section className="form-card">
            <div className="section-header">
              <h2>Jadwal Event</h2>
            </div>
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
                <div className="ticket-row" key={ticket.id || index} style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                  <input
                    type="text"
                    placeholder="Nama Kategori (misal: VIP)"
                    value={ticket.name ?? ""}
                    onChange={(e) => handleTicketChange(index, "name", e.target.value)}
                    style={{ flex: 1, padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
                  />
                  <input
                    type="number"
                    placeholder="Harga (Rp)"
                    value={ticket.price ?? ""}
                    onChange={(e) => handleTicketChange(index, "price", e.target.value)}
                    style={{ flex: 1, padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
                  />
                  <input
                    type="number"
                    placeholder="Kuota"
                    value={ticket.quota ?? ""}
                    onChange={(e) => handleTicketChange(index, "quota", e.target.value)}
                    style={{ flex: 1, padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
                  />
                  {tickets.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleDeleteTicket(index)}
                      style={{
                        background: "#fee2e2",
                        color: "#ef4444",
                        border: "none",
                        borderRadius: "6px",
                        padding: "0 12px",
                        cursor: "pointer",
                      }}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* LINE UP EVENT */}
          <section className="form-card">
            <div className="section-header">
              <h2>Line Up Event</h2>
              <button type="button" className="add-small-button" onClick={handleAddLineup}>
                + Tambah LineUp
              </button>
            </div>
            {lineups.map((lineup, index) => (
              <div className="lineup-row" key={index} style={{ display: "flex", gap: "10px", marginBottom: "10px", alignItems: "center" }}>
                <input
                  type="text"
                  placeholder="Nama Artis"
                  value={lineup.name || ""}
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
                  placeholder={lineup.image ? lineup.image : "atau tempel URL foto"}
                  value={lineup.image || ""}
                  onChange={(e) => handleLineupChange(index, "image", e.target.value)}
                  style={{ flex: 1.5 }}
                />
                {lineups.length > 1 && (
                  <button type="button" onClick={() => handleDeleteLineup(index)}>×</button>
                )}
              </div>
            ))}

            <p style={{ fontSize: "12px", color: "#6f7482", margin: "4px 0 0" }}>
              Kosongkan kolom URL lalu pilih file untuk mengganti foto. Baris tanpa file
              baru akan memakai foto yang sudah tersimpan.
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
            {facilities.map((facility, index) => (
              <div className="lineup-row" key={index} style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                <input
                  type="text"
                  placeholder="Contoh: Free Parking, Food Court"
                  value={facility || ""}
                  onChange={(e) => handleFacilityChange(index, e.target.value)}
                  style={{ flex: 1 }}
                />
                {facilities.length > 1 && (
                  <button type="button" onClick={() => handleDeleteFacility(index)}>×</button>
                )}
              </div>
            ))}
          </section>
        </div>
      </main>
    </div>
  );
}

export default EditEventEO;