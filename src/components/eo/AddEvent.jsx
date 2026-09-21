import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

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
      name: "VIP",
      price: "400000",
      quota: "200",
    },
    {
      name: "Regular",
      price: "200000",
      quota: "400",
    },
  ]);

  // =====================================================
  // LINEUP
  // =====================================================

  const [lineups, setLineups] = useState(["For Revenge"]);

  // =====================================================
  // FILE
  // =====================================================

  const [banner, setBanner] = useState(null);
  const [permissionFile, setPermissionFile] = useState(null);

  // =====================================================
  // SUBMIT STATE
  // =====================================================

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

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

  const handleScheduleChange = (index, field, value) => {
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
      schedules.filter((_, i) => i !== index)
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

  const handleTicketChange = (index, field, value) => {
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
      tickets.filter((_, i) => i !== index)
    );
  };

  // =====================================================
  // LINEUP HANDLER
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
      return;
    }

    setLineups(
      lineups.filter((_, i) => i !== index)
    );
  };

  // =====================================================
  // BANNER HANDLER
  // =====================================================

  const handleBannerChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran banner maksimal 5MB.");
      e.target.value = "";
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("File banner harus berupa gambar.");
      e.target.value = "";
      return;
    }

    setBanner(file);
  };

  // =====================================================
  // PERMISSION FILE HANDLER
  // =====================================================

  const handlePermissionChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("Ukuran dokumen maksimal 10MB.");
      e.target.value = "";
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "application/zip",
      "application/x-zip-compressed",
    ];

    const fileName = file.name.toLowerCase();

    const validExtension =
      fileName.endsWith(".pdf") ||
      fileName.endsWith(".zip");

    if (
      !allowedTypes.includes(file.type) &&
      !validExtension
    ) {
      alert("Dokumen harus berupa file PDF atau ZIP.");
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
      alert("Nama event wajib diisi.");
      return false;
    }

    if (!category) {
      alert("Kategori event wajib dipilih.");
      return false;
    }

    if (!description.trim()) {
      alert("Deskripsi event wajib diisi.");
      return false;
    }

    if (!location.trim()) {
      alert("Lokasi event wajib diisi.");
      return false;
    }

    if (!schedules.length) {
      alert("Minimal harus ada satu jadwal event.");
      return false;
    }

    // ===================================================
    // VALIDATE SCHEDULE
    // ===================================================

    for (let i = 0; i < schedules.length; i++) {
      const schedule = schedules[i];

      if (!schedule.date) {
        alert(`Tanggal jadwal ${i + 1} wajib diisi.`);
        return false;
      }

      if (!schedule.startTime) {
        alert(`Jam mulai jadwal ${i + 1} wajib diisi.`);
        return false;
      }

      if (!schedule.endTime) {
        alert(`Jam selesai jadwal ${i + 1} wajib diisi.`);
        return false;
      }

      if (schedule.endTime <= schedule.startTime) {
        alert(
          `Jam selesai jadwal ${i + 1} harus lebih besar dari jam mulai.`
        );

        return false;
      }
    }

    // ===================================================
    // VALIDATE TICKETS
    // ===================================================

    for (let i = 0; i < tickets.length; i++) {
      const ticket = tickets[i];

      if (!ticket.name.trim()) {
        alert(
          `Nama kategori tiket ${i + 1} wajib diisi.`
        );

        return false;
      }

      if (
        ticket.price === "" ||
        Number(ticket.price) < 0
      ) {
        alert(
          `Harga tiket ${i + 1} tidak valid.`
        );

        return false;
      }

      if (
        ticket.quota === "" ||
        Number(ticket.quota) <= 0
      ) {
        alert(
          `Kuota tiket ${i + 1} harus lebih dari 0.`
        );

        return false;
      }
    }

    return true;
  };

  // =====================================================
  // BUILD DATE TIME
  // =====================================================

  const buildDateTime = (date, time) => {
    if (!date || !time) {
      return null;
    }

    return `${date}T${time}:00`;
  };

  // =====================================================
  // BUILD EVENT PAYLOAD
  // =====================================================

  const buildEventPayload = (bannerUrl = null) => {
    const firstSchedule = schedules[0];

    const startDate = buildDateTime(
      firstSchedule?.date,
      firstSchedule?.startTime
    );

    const endDate = buildDateTime(
      firstSchedule?.date,
      firstSchedule?.endTime
    );

    const lineupData = lineups
      .map((item) => item.trim())
      .filter(Boolean)
      .join(", ");

    // ===================================================
    // TICKET DATA
    // ===================================================
    // Data dari form frontend:
    // name  -> tier_name
    // price -> price
    // quota -> total_quota
    //
    // available_quota TIDAK dikirim dari frontend.
    // Backend yang mengatur nilai awalnya.
    // ===================================================

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

      // =================================================
      // TICKET TIERS
      // =================================================

      tickets: ticketData,
    };
  };

  // =====================================================
  // CREATE EVENT
  // =====================================================

  const createEvent = async () => {
    let bannerUrl = null;

    // ===================================================
    // UPLOAD BANNER TERLEBIH DAHULU
    // ===================================================

    if (banner) {
      console.log(
        "UPLOAD BANNER:",
        banner.name
      );

      const bannerResponse =
        await uploadOrganizerEventBanner(banner);

      console.log(
        "UPLOAD BANNER RESPONSE:",
        bannerResponse
      );

      bannerUrl =
        bannerResponse?.data?.banner_url ||
        bannerResponse?.banner_url ||
        null;

      if (!bannerUrl) {
        throw new Error(
          "Banner berhasil diupload tetapi URL banner tidak ditemukan."
        );
      }

      console.log(
        "BANNER URL:",
        bannerUrl
      );
    }

    // ===================================================
    // BUILD PAYLOAD
    // ===================================================

    const payload =
      buildEventPayload(bannerUrl);

    console.log(
      "CREATE EVENT PAYLOAD:",
      payload
    );

    // ===================================================
    // CREATE EVENT
    // ===================================================

    const response =
      await createOrganizerEvent(payload);

    console.log(
      "CREATE EVENT RESPONSE:",
      response
    );

    return response;
  };

  // =====================================================
  // SAVE DRAFT
  // =====================================================

  const handleSaveDraft = async () => {
    try {
      setSubmitting(true);
      setError("");

      if (!eventName.trim()) {
        alert("Nama event wajib diisi.");
        return;
      }

      if (!category) {
        alert("Kategori event wajib dipilih.");
        return;
      }

      if (!location.trim()) {
        alert("Lokasi event wajib diisi.");
        return;
      }

      const response =
        await createEvent();

      const eventId =
        response?.data?.event_id ||
        response?.data?.id ||
        response?.event_id ||
        response?.id;

      if (!eventId) {
        throw new Error(
          "Event berhasil dibuat tetapi ID event tidak ditemukan."
        );
      }

      console.log(
        "DRAFT EVENT ID:",
        eventId
      );

      alert(
        "Event berhasil disimpan sebagai draft."
      );

      navigate("/eo/event");
    } catch (error) {
      console.error(
        "Gagal menyimpan draft:",
        error
      );

      const message =
        error?.message ||
        "Gagal menyimpan draft event.";

      setError(message);

      alert(message);
    } finally {
      setSubmitting(false);
    }
  };

  // =====================================================
  // CREATE + PUBLISH EVENT
  // =====================================================

  const handleCreateEvent = async () => {
    try {
      setSubmitting(true);
      setError("");

      // =================================================
      // VALIDATE
      // =================================================

      if (!validateForm()) {
        return;
      }

      // =================================================
      // CREATE EVENT
      // =================================================

      const createResponse =
        await createEvent();

      console.log(
        "CREATE EVENT RESPONSE:",
        createResponse
      );

      // =================================================
      // GET EVENT ID
      // =================================================

      const eventId =
        createResponse?.data?.event_id ||
        createResponse?.data?.id ||
        createResponse?.event_id ||
        createResponse?.id;

      if (!eventId) {
        throw new Error(
          "Event berhasil dibuat tetapi event ID tidak ditemukan."
        );
      }

      console.log(
        "EVENT ID:",
        eventId
      );

      // =================================================
      // PUBLISH EVENT
      // =================================================

      const publishResponse =
        await publishOrganizerEvent({
          event_id: eventId,
        });

      console.log(
        "PUBLISH EVENT RESPONSE:",
        publishResponse
      );

      // =================================================
      // SUCCESS
      // =================================================

      alert(
        "Event berhasil diajukan dan menunggu persetujuan admin."
      );

      navigate("/eo/event");
    } catch (error) {
      console.error(
        "Gagal membuat event:",
        error
      );

      const message =
        error?.message ||
        "Gagal membuat event.";

      setError(message);

      alert(message);
    } finally {
      setSubmitting(false);
    }
  };

  // =====================================================
  // TOTAL QUOTA
  // =====================================================

  const totalQuota = tickets.reduce(
    (total, ticket) => {
      return (
        total +
        (Number(ticket.quota) || 0)
      );
    },
    0
  );

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="add-event-page">
      <SidebarEO />

      <main className="add-event-main">
        <NavbarEO />

        <div className="add-event-content">

          {/* ERROR */}
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
                Buat Event baru
              </h1>

              <p>
                Isi detail di bawah untuk
                mempublikasikan event Anda.
              </p>
            </div>

            <div className="add-event-header-actions">
              <button
                type="button"
                className="draft-button"
                onClick={handleSaveDraft}
                disabled={submitting}
              >
                {submitting
                  ? "Menyimpan..."
                  : "Simpan Draft"}
              </button>

              <button
                type="button"
                className="create-event-button"
                onClick={handleCreateEvent}
                disabled={submitting}
              >
                <span>+</span>

                {submitting
                  ? "Memproses..."
                  : "Buat Event"}
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
                  value={eventName}
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
                  value={category}
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
                value={description}
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
                  value={location}
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
                    Upload Banner Event (16:9)
                  </strong>

                  <span>
                    Drag & drop atau klik
                    untuk memilih file
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
                    key={index}
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
                      value={lineup}
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
                    Upload Dokumen Perizinan
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

export default AddEvent;