import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

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
  // BANNER
  // =====================================================

  const [banner, setBanner] = useState(null);

  // URL asli dari backend
  const [existingBannerUrl, setExistingBannerUrl] = useState("");

  // URL yang hanya digunakan untuk preview gambar
  const [existingBannerPreview, setExistingBannerPreview] =
    useState("");

  // =====================================================
  // PERMISSION FILE
  // =====================================================

  const [permissionFile, setPermissionFile] = useState(null);

  // =====================================================
  // STATE
  // =====================================================

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // =====================================================
  // IMAGE URL
  // =====================================================

  const getImageUrl = (url) => resolveBannerUrl(url) || "";

  // =====================================================
  // GET EVENT DATA
  // =====================================================

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        setError("");

        if (!id) {
          throw new Error("ID event tidak ditemukan.");
        }

        console.log("GET EVENT ID:", id);

        const response = await getPublicEventDetail(id);

        console.log(
          "EDIT EVENT RESPONSE:",
          response
        );

        const event =
          response?.data ||
          response?.event ||
          response;

        if (!event) {
          throw new Error(
            "Data event tidak ditemukan."
          );
        }

        // =================================================
        // BASIC DATA
        // =================================================

        setEventName(
          event.title ||
            event.event_name ||
            event.name ||
            ""
        );

        setCategory(
          event.category || ""
        );

        setDescription(
          event.description || ""
        );

        setLocation(
          event.venue_name ||
            event.location ||
            ""
        );

        // =================================================
        // BANNER
        // =================================================

        const bannerUrl =
          event.banner_url ||
          event.bannerUrl ||
          "";

        // Simpan URL asli untuk dikirim kembali
        setExistingBannerUrl(bannerUrl);

        // Buat URL lengkap hanya untuk preview
        setExistingBannerPreview(
          getImageUrl(bannerUrl)
        );

        // =================================================
        // LINEUP
        // =================================================

        if (event.lineup) {
          if (Array.isArray(event.lineup)) {
            setLineups(
              event.lineup.length
                ? event.lineup
                : [""]
            );
          } else {
            setLineups(
              String(event.lineup)
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean)
            );
          }
        } else {
          setLineups([""]);
        }

        // =================================================
        // SCHEDULE
        // =================================================

        const startDate =
          event.start_date ||
          event.startDate ||
          "";

        const endDate =
          event.end_date ||
          event.endDate ||
          "";

        if (startDate) {
          const start = new Date(startDate);

          const end = endDate
            ? new Date(endDate)
            : start;

          const formatDate = (date) => {
            if (Number.isNaN(date.getTime())) {
              return "";
            }

            return date
              .toISOString()
              .split("T")[0];
          };

          const formatTime = (date) => {
            if (Number.isNaN(date.getTime())) {
              return "";
            }

            return date
              .toTimeString()
              .slice(0, 5);
          };

          setSchedules([
            {
              date: formatDate(start),
              startTime: formatTime(start),
              endTime: formatTime(end),
            },
          ]);
        }

        // =================================================
        // TICKETS
        // =================================================

        const eventTickets =
          event.tickets ||
          event.ticket_tiers ||
          event.ticketTiers ||
          [];

        if (
          Array.isArray(eventTickets) &&
          eventTickets.length > 0
        ) {
          setTickets(
            eventTickets.map((ticket) => ({
              id:
                ticket.tier_id ||
                ticket.tierId ||
                null,

              name:
                ticket.tier_name ||
                ticket.tierName ||
                ticket.name ||
                "",

              price:
                ticket.price !== undefined &&
                ticket.price !== null
                  ? String(ticket.price)
                  : "",

              quota:
                ticket.total_quota !== undefined &&
                ticket.total_quota !== null
                  ? String(ticket.total_quota)
                  : ticket.totalQuota !== undefined &&
                    ticket.totalQuota !== null
                  ? String(ticket.totalQuota)
                  : "",
            }))
          );
        } else {
          setTickets([
            {
              name: "",
              price: "",
              quota: "",
            },
          ]);
        }
      } catch (err) {
        console.error(
          "Gagal mengambil data event:",
          err
        );

        const message =
          err?.message ||
          "Gagal mengambil data event.";

        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  // =====================================================
  // SCHEDULE HANDLER
  // =====================================================

  const handleAddSchedule = () => {
    setSchedules([
      ...schedules,
      {
        date: "",
        startTime: "",
        endTime: "",
      },
    ]);
  };

  const handleScheduleChange = (
    index,
    field,
    value
  ) => {
    const updated = [...schedules];

    updated[index] = {
      ...updated[index],
      [field]: value,
    };

    setSchedules(updated);
  };

  const handleDeleteSchedule = (index) => {
    if (schedules.length === 1) {
      return;
    }

    setSchedules(
      schedules.filter(
        (_, i) => i !== index
      )
    );
  };

  // =====================================================
  // TICKET HANDLER
  // =====================================================

  const handleAddTicket = () => {
    setTickets([
      ...tickets,
      {
        name: "",
        price: "",
        quota: "",
      },
    ]);
  };

  const handleTicketChange = (
    index,
    field,
    value
  ) => {
    const updated = [...tickets];

    updated[index] = {
      ...updated[index],
      [field]: value,
    };

    setTickets(updated);
  };

  const handleDeleteTicket = (index) => {
    if (tickets.length === 1) {
      return;
    }

    setTickets(
      tickets.filter(
        (_, i) => i !== index
      )
    );
  };

  // =====================================================
  // LINEUP HANDLER
  // =====================================================

  const handleAddLineup = () => {
    setLineups([
      ...lineups,
      "",
    ]);
  };

  const handleLineupChange = (
    index,
    value
  ) => {
    const updated = [...lineups];

    updated[index] = value;

    setLineups(updated);
  };

  const handleDeleteLineup = (index) => {
    if (lineups.length === 1) {
      return;
    }

    setLineups(
      lineups.filter(
        (_, i) => i !== index
      )
    );
  };

  // =====================================================
  // BANNER HANDLER
  // =====================================================

  const handleBannerChange = (e) => {
    const file =
      e.target.files?.[0];

    if (!file) {
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert(
        "Ukuran banner maksimal 5MB."
      );

      e.target.value = "";

      return;
    }

    if (!file.type.startsWith("image/")) {
      alert(
        "File banner harus berupa gambar."
      );

      e.target.value = "";

      return;
    }

    setBanner(file);
  };

  // =====================================================
  // PERMISSION FILE HANDLER
  // =====================================================

  const handlePermissionChange = (e) => {
    const file =
      e.target.files?.[0];

    if (!file) {
      return;
    }

    if (
      file.size >
      10 * 1024 * 1024
    ) {
      alert(
        "Ukuran dokumen maksimal 10MB."
      );

      e.target.value = "";

      return;
    }

    const allowedTypes = [
      "application/pdf",
      "application/zip",
      "application/x-zip-compressed",
    ];

    const fileName =
      file.name.toLowerCase();

    const validExtension =
      fileName.endsWith(".pdf") ||
      fileName.endsWith(".zip");

    if (
      !allowedTypes.includes(
        file.type
      ) &&
      !validExtension
    ) {
      alert(
        "Dokumen harus berupa file PDF atau ZIP."
      );

      e.target.value = "";

      return;
    }

    setPermissionFile(file);
  };

  // =====================================================
  // VALIDATION
  // =====================================================

  const validateForm = () => {
    if (!eventName.trim()) {
      alert(
        "Nama event wajib diisi."
      );

      return false;
    }

    if (!category) {
      alert(
        "Kategori event wajib dipilih."
      );

      return false;
    }

    if (!description.trim()) {
      alert(
        "Deskripsi event wajib diisi."
      );

      return false;
    }

    if (!location.trim()) {
      alert(
        "Lokasi event wajib diisi."
      );

      return false;
    }

    if (!schedules.length) {
      alert(
        "Minimal harus ada satu jadwal event."
      );

      return false;
    }

    // ===================================================
    // VALIDATE SCHEDULE
    // ===================================================

    for (
      let i = 0;
      i < schedules.length;
      i++
    ) {
      const schedule =
        schedules[i];

      if (!schedule.date) {
        alert(
          `Tanggal jadwal ${
            i + 1
          } wajib diisi.`
        );

        return false;
      }

      if (!schedule.startTime) {
        alert(
          `Jam mulai jadwal ${
            i + 1
          } wajib diisi.`
        );

        return false;
      }

      if (!schedule.endTime) {
        alert(
          `Jam selesai jadwal ${
            i + 1
          } wajib diisi.`
        );

        return false;
      }

      if (
        schedule.endTime <=
        schedule.startTime
      ) {
        alert(
          `Jam selesai jadwal ${
            i + 1
          } harus lebih besar dari jam mulai.`
        );

        return false;
      }
    }

    // ===================================================
    // VALIDATE TICKETS
    // ===================================================

    for (
      let i = 0;
      i < tickets.length;
      i++
    ) {
      const ticket =
        tickets[i];

      if (!ticket.name.trim()) {
        alert(
          `Nama kategori tiket ${
            i + 1
          } wajib diisi.`
        );

        return false;
      }

      if (
        ticket.price === "" ||
        Number(ticket.price) < 0
      ) {
        alert(
          `Harga tiket ${
            i + 1
          } tidak valid.`
        );

        return false;
      }

      if (
        ticket.quota === "" ||
        Number(ticket.quota) <= 0
      ) {
        alert(
          `Kuota tiket ${
            i + 1
          } harus lebih dari 0.`
        );

        return false;
      }
    }

    return true;
  };

  // =====================================================
  // BUILD DATE TIME
  // =====================================================

  const buildDateTime = (
    date,
    time
  ) => {
    if (!date || !time) {
      return null;
    }

    return `${date}T${time}:00`;
  };

  // =====================================================
  // BUILD UPDATE PAYLOAD
  // =====================================================

  const buildEventPayload = (
    bannerUrl
  ) => {
    const firstSchedule =
      schedules[0];

    const startDate =
      buildDateTime(
        firstSchedule?.date,
        firstSchedule?.startTime
      );

    const endDate =
      buildDateTime(
        firstSchedule?.date,
        firstSchedule?.endTime
      );

    const lineupData =
      lineups
        .map((item) =>
          item.trim()
        )
        .filter(Boolean)
        .join(", ");

    const ticketData =
      tickets.map(
        (ticket) => ({
          tier_id:
            ticket.id || null,

          tier_name:
            ticket.name.trim(),

          price:
            Number(ticket.price),

          total_quota:
            Number(ticket.quota),
        })
      );

    return {
      event_id: id,

      title:
        eventName.trim(),

      description:
        description.trim(),

      category,

      venue_name:
        location.trim(),

      start_date:
        startDate,

      end_date:
        endDate,

      lineup:
        lineupData || null,

      banner_url:
        bannerUrl,

      tickets:
        ticketData,
    };
  };

  // =====================================================
  // UPDATE EVENT
  // =====================================================

  const handleUpdateEvent =
    async () => {
      try {
        setSubmitting(true);
        setError("");

        // ===============================================
        // VALIDATE
        // ===============================================

        if (!validateForm()) {
          return;
        }

        // ===============================================
        // BANNER
        // ===============================================

        // Gunakan URL asli dari backend
        // jika user tidak mengganti banner.
        let bannerUrl =
          existingBannerUrl || null;

        // Jika user memilih banner baru,
        // upload banner terlebih dahulu.
        if (banner) {
          console.log(
            "UPLOAD NEW BANNER:",
            banner.name
          );

          const bannerResponse =
            await uploadOrganizerEventBanner(
              banner
            );

          console.log(
            "NEW BANNER RESPONSE:",
            bannerResponse
          );

          bannerUrl =
            bannerResponse?.data
              ?.banner_url ||
            bannerResponse?.banner_url ||
            null;

          if (!bannerUrl) {
            throw new Error(
              "Banner berhasil diupload tetapi URL banner tidak ditemukan."
            );
          }
        }

        // ===============================================
        // BUILD PAYLOAD
        // ===============================================

        const payload =
          buildEventPayload(
            bannerUrl
          );

        console.log(
          "UPDATE EVENT PAYLOAD:",
          payload
        );

        // ===============================================
        // UPDATE
        // ===============================================

        const response =
          await updateOrganizerEvent(
            payload
          );

        console.log(
          "UPDATE EVENT RESPONSE:",
          response
        );

        // ===============================================
        // SUCCESS
        // ===============================================

        alert(
          "Event berhasil diperbarui."
        );

        navigate(
          `/eo/event/${id}`
        );
      } catch (err) {
        console.error(
          "Gagal memperbarui event:",
          err
        );

        const message =
          err?.message ||
          "Gagal memperbarui event.";

        setError(message);

        alert(message);
      } finally {
        setSubmitting(false);
      }
    };

  // =====================================================
  // TOTAL QUOTA
  // =====================================================

  const totalQuota =
    tickets.reduce(
      (total, ticket) => {
        return (
          total +
          (Number(
            ticket.quota
          ) || 0)
        );
      },
      0
    );

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="add-event-page">
        <SidebarEO />

        <main className="add-event-main">
          <NavbarEO />

          <div
            className="add-event-content"
            style={{
              textAlign: "center",
              paddingTop: "100px",
            }}
          >
            Memuat data event...
          </div>
        </main>
      </div>
    );
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="add-event-page">
      <SidebarEO />

      <main className="add-event-main">
        <NavbarEO />

        <div className="add-event-content">

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div
              className="dashboard-error"
              style={{
                marginBottom: "20px",
              }}
            >
              {error}
            </div>
          )}

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="add-event-header">

            <div className="add-event-title">

              <span className="add-event-small-title">
                Event
              </span>

              <h1>
                Edit Event
              </h1>

              <p>
                Perbarui detail event
                Anda di bawah ini.
              </p>

            </div>

            <div className="add-event-header-actions">

              <button
                type="button"
                className="draft-button"
                onClick={() =>
                  navigate(
                    `/eo/event/${id}`
                  )
                }
                disabled={
                  submitting
                }
              >
                Batal
              </button>

              <button
                type="button"
                className="create-event-button"
                onClick={
                  handleUpdateEvent
                }
                disabled={
                  submitting
                }
              >
                <span>✓</span>

                {submitting
                  ? "Menyimpan..."
                  : "Simpan Perubahan"}
              </button>

            </div>

          </div>

          {/* =================================================
              INFORMASI DASAR
          ================================================= */}

          <section className="form-card">

            <h2>
              Informasi Dasar
            </h2>

            <div className="form-grid">

              <div className="form-field">

                <label>
                  NAMA EVENT
                </label>

                <input
                  type="text"
                  value={
                    eventName
                  }
                  onChange={(e) =>
                    setEventName(
                      e.target.value
                    )
                  }
                  placeholder="Contoh: Sedih Fest 2024"
                />

              </div>

              <div className="form-field">

                <label>
                  KATEGORI EVENT
                </label>

                <select
                  value={
                    category
                  }
                  onChange={(e) =>
                    setCategory(
                      e.target.value
                    )
                  }
                >

                  <option value="">
                    Pilih Kategori...
                  </option>

                  <option value="Konser">
                    Konser
                  </option>

                  <option value="Seminar">
                    Seminar
                  </option>

                  <option value="Workshop">
                    Workshop
                  </option>

                  <option value="Festival">
                    Festival
                  </option>

                  <option value="Olahraga">
                    Olahraga
                  </option>

                  <option value="Komunitas">
                    Komunitas
                  </option>

                  <option value="Lainnya">
                    Lainnya
                  </option>

                </select>

                {category && (
                  <span className="category-tag">

                    {category}

                    <button
                      type="button"
                      onClick={() =>
                        setCategory("")
                      }
                    >
                      ×
                    </button>

                  </span>
                )}

              </div>

            </div>

            <div className="form-field description-field">

              <label>
                DESKRIPSI EVENT
              </label>

              <textarea
                value={
                  description
                }
                onChange={(e) =>
                  setDescription(
                    e.target.value
                  )
                }
                placeholder="Ceritakan detail menarik tentang event Anda..."
              />

            </div>

          </section>

          {/* =================================================
              LOKASI
          ================================================= */}

          <section className="form-card">

            <h2>
              Lokasi Event
            </h2>

            <div className="form-field">

              <label>
                DETAIL LOKASI / VENUE
              </label>

              <div className="input-with-icon">

                <span>
                  ⌕
                </span>

                <input
                  type="text"
                  value={
                    location
                  }
                  onChange={(e) =>
                    setLocation(
                      e.target.value
                    )
                  }
                  placeholder="Cari gedung, stadion, atau alamat lengkap..."
                />

              </div>

            </div>

          </section>

          {/* =================================================
              BANNER
          ================================================= */}

          <section className="form-card">

            <h2>
              Banner Event
            </h2>

            {/* BANNER LAMA */}

            {existingBannerPreview &&
              !banner && (
                <div
                  style={{
                    marginBottom:
                      "15px",
                    borderRadius:
                      "10px",
                    overflow:
                      "hidden",
                    border:
                      "1px solid #ededf4",
                  }}
                >
                  <img
                    src={
                      existingBannerPreview
                    }
                    alt="Banner event"
                    style={{
                      width: "100%",
                      maxHeight:
                        "300px",
                      objectFit:
                        "cover",
                      display:
                        "block",
                    }}
                    onError={(e) => {
                      console.error(
                        "Banner gagal dimuat:",
                        existingBannerPreview
                      );

                      e.currentTarget.style.display =
                        "none";
                    }}
                  />
                </div>
              )}

            <label
              className={`upload-box ${
                banner
                  ? "has-file"
                  : ""
              }`}
            >

              <input
                type="file"
                accept="image/*"
                onChange={
                  handleBannerChange
                }
              />

              <div className="upload-icon">
                ☁
              </div>

              {banner ? (
                <>
                  <strong>
                    {banner.name}
                  </strong>

                  <span>
                    Klik untuk mengganti banner
                  </span>
                </>
              ) : (
                <>
                  <strong>
                    Ganti Banner Event
                  </strong>

                  <span>
                    Klik untuk memilih
                    banner baru
                    (Max 5MB)
                  </span>
                </>
              )}

            </label>

          </section>

          {/* =================================================
              SCHEDULE
          ================================================= */}

          <section className="form-card">

            <div className="section-header">

              <h2>
                Jadwal Event
              </h2>

              <button
                type="button"
                className="add-small-button"
                onClick={
                  handleAddSchedule
                }
              >
                + Tambah Jadwal
              </button>

            </div>

            <div className="schedule-list">

              {schedules.map(
                (
                  schedule,
                  index
                ) => (

                  <div
                    className="schedule-row"
                    key={index}
                  >

                    <div className="schedule-field">

                      <label>
                        TANGGAL
                      </label>

                      <input
                        type="date"
                        value={
                          schedule.date
                        }
                        onChange={(e) =>
                          handleScheduleChange(
                            index,
                            "date",
                            e.target.value
                          )
                        }
                      />

                    </div>

                    <div className="schedule-field">

                      <label>
                        JAM MULAI
                      </label>

                      <input
                        type="time"
                        value={
                          schedule.startTime
                        }
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

                      <label>
                        JAM SELESAI
                      </label>

                      <input
                        type="time"
                        value={
                          schedule.endTime
                        }
                        onChange={(e) =>
                          handleScheduleChange(
                            index,
                            "endTime",
                            e.target.value
                          )
                        }
                      />

                    </div>

                    <button
                      type="button"
                      className="delete-row-button"
                      onClick={() =>
                        handleDeleteSchedule(
                          index
                        )
                      }
                    >
                      🗑
                    </button>

                  </div>

                )
              )}

            </div>

          </section>

          {/* =================================================
              TICKET
          ================================================= */}

          <section className="form-card">

            <div className="section-header">

              <h2>
                Kategori Tiket
              </h2>

              <button
                type="button"
                className="add-small-button"
                onClick={
                  handleAddTicket
                }
              >
                + Tambah Kategori
              </button>

            </div>

            <div className="ticket-table">

              <div className="ticket-header">

                <span>
                  NAMA KATEGORI
                </span>

                <span>
                  HARGA TIKET (RP)
                </span>

                <span>
                  KUOTA
                </span>

                <span></span>

              </div>

              {tickets.map(
                (
                  ticket,
                  index
                ) => (

                  <div
                    className="ticket-row"
                    key={
                      ticket.id ||
                      index
                    }
                  >

                    <input
                      type="text"
                      value={
                        ticket.name
                      }
                      placeholder="Nama kategori"
                      onChange={(e) =>
                        handleTicketChange(
                          index,
                          "name",
                          e.target.value
                        )
                      }
                    />

                    <input
                      type="number"
                      value={
                        ticket.price
                      }
                      placeholder="Harga"
                      min="0"
                      onChange={(e) =>
                        handleTicketChange(
                          index,
                          "price",
                          e.target.value
                        )
                      }
                    />

                    <input
                      type="number"
                      value={
                        ticket.quota
                      }
                      placeholder="Kuota"
                      min="1"
                      onChange={(e) =>
                        handleTicketChange(
                          index,
                          "quota",
                          e.target.value
                        )
                      }
                    />

                    <button
                      type="button"
                      className="delete-ticket-button"
                      onClick={() =>
                        handleDeleteTicket(
                          index
                        )
                      }
                    >
                      ×
                    </button>

                  </div>

                )
              )}

            </div>

            <div className="total-quota">

              <span>
                Total Kuota:
              </span>

              <strong>
                {totalQuota}
              </strong>

            </div>

          </section>

          {/* =================================================
              LINEUP
          ================================================= */}

          <section className="form-card">

            <div className="section-header">

              <h2>
                Line Up Event
              </h2>

              <button
                type="button"
                className="add-small-button"
                onClick={
                  handleAddLineup
                }
              >
                + Tambah LineUp
              </button>

            </div>

            <div className="lineup-list">

              {lineups.map(
                (
                  lineup,
                  index
                ) => (

                  <div
                    className="lineup-row"
                    key={index}
                  >

                    <input
                      type="text"
                      value={
                        lineup
                      }
                      placeholder="Nama artis / pengisi acara"
                      onChange={(e) =>
                        handleLineupChange(
                          index,
                          e.target.value
                        )
                      }
                    />

                    <button
                      type="button"
                      onClick={() =>
                        handleDeleteLineup(
                          index
                        )
                      }
                    >
                      ×
                    </button>

                  </div>

                )
              )}

            </div>

          </section>

          {/* =================================================
              PERIZINAN
          ================================================= */}

          <section className="form-card">

            <h2>
              Perizinan Event
            </h2>

            <label
              className={`upload-box permission-upload ${
                permissionFile
                  ? "has-file"
                  : ""
              }`}
            >

              <input
                type="file"
                accept=".pdf,.zip"
                onChange={
                  handlePermissionChange
                }
              />

              <div className="upload-icon">
                📄
              </div>

              {permissionFile ? (
                <>
                  <strong>
                    {permissionFile.name}
                  </strong>

                  <span>
                    Klik untuk mengganti dokumen
                  </span>
                </>
              ) : (
                <>
                  <strong>
                    Ganti Dokumen Perizinan
                  </strong>

                  <span>
                    Format .PDF atau .ZIP
                    (Max 10MB)
                  </span>
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