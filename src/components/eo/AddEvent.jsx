import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SidebarEO from "../shared/SidebarEO";
import NavbarEO from "../shared/NavbarEO";
import "./AddEvent.css";

function AddEvent() {
  const navigate = useNavigate();

  const [eventName, setEventName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");

  const [schedules, setSchedules] = useState([
    {
      date: "",
      startTime: "",
      endTime: "",
    },
  ]);

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

  const [lineups, setLineups] = useState(["For Revenge"]);

  const [banner, setBanner] = useState(null);
  const [permissionFile, setPermissionFile] = useState(null);

  // ======
  // SCHEDULE
  // ======

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

    updated[index][field] = value;

    setSchedules(updated);
  };

  const handleDeleteSchedule = (index) => {
    if (schedules.length === 1) return;

    setSchedules(schedules.filter((_, i) => i !== index));
  };

  // ======
  // TICKET
  // ======

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

    updated[index][field] = value;

    setTickets(updated);
  };

  const handleDeleteTicket = (index) => {
    if (tickets.length === 1) return;

    setTickets(tickets.filter((_, i) => i !== index));
  };

  // ======
  // LINE UP
  // ======

  const handleAddLineup = () => {
    setLineups([...lineups, ""]);
  };

  const handleLineupChange = (index, value) => {
    const updated = [...lineups];

    updated[index] = value;

    setLineups(updated);
  };

  const handleDeleteLineup = (index) => {
    if (lineups.length === 1) return;

    setLineups(lineups.filter((_, i) => i !== index));
  };

  // ======
  // FILE
  // ======

  const handleBannerChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      setBanner(file);
    }
  };

  const handlePermissionChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      setPermissionFile(file);
    }
  };

  // ======
  // SUBMIT
  // ======

  const handleSaveDraft = () => {
    console.log("Simpan sebagai draft", {
      eventName,
      category,
      description,
      location,
      schedules,
      tickets,
      lineups,
      banner,
      permissionFile,
    });

    alert("Event berhasil disimpan sebagai draft.");
  };

  const handleCreateEvent = () => {
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

    console.log("Data Event:", {
      eventName,
      category,
      description,
      location,
      schedules,
      tickets,
      lineups,
      banner,
      permissionFile,
    });

    alert("Event berhasil dibuat.");

    navigate("/eo/event");
  };

  // ======
  // TOTAL QUOTA
  // ======

  const totalQuota = tickets.reduce((total, ticket) => {
    return total + (Number(ticket.quota) || 0);
  }, 0);

  return (
    <div className="add-event-page">

      {/* =
           SIDEBAR
       = */}

      <SidebarEO />

      {/* =
           MAIN AREA
       = */}

      <main className="add-event-main">

        {/* NAVBAR */}

        <NavbarEO />

        {/* =
            CONTENT
        = */}

        <div className="add-event-content">

          {/* PAGE HEADER */}

          <div className="add-event-header">

            <div className="add-event-title">

              <span className="add-event-small-title">
                Event
              </span>

              <h1>
                Buat Event baru
              </h1>

              <p>
                Isi detail di bawah untuk mempublikasikan event Anda.
              </p>

            </div>

            <div className="add-event-header-actions">

              <button
                type="button"
                className="draft-button"
                onClick={handleSaveDraft}
              >
                Simpan Draft
              </button>

              <button
                type="button"
                className="create-event-button"
                onClick={handleCreateEvent}
              >
                <span>+</span>
                Buat Event
              </button>

            </div>

          </div>

          {/* =
              INFORMASI DASAR
          = */}

          <section className="form-card">

            <h2>Informasi Dasar</h2>

            <div className="form-grid">

              {/* NAMA EVENT */}

              <div className="form-field">

                <label>
                  NAMA EVENT
                </label>

                <input
                  type="text"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  placeholder="Contoh: Sedih Fest 2024"
                />

              </div>

              {/* KATEGORI */}

              <div className="form-field">

                <label>
                  KATEGORI EVENT
                </label>

                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
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
                      onClick={() => setCategory("")}
                    >
                      ×
                    </button>
                  </span>
                )}

              </div>

            </div>

            {/* DESKRIPSI */}

            <div className="form-field description-field">

              <label>
                DESKRIPSI EVENT
              </label>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ceritakan detail menarik tentang event Anda..."
              />

            </div>

          </section>

          {/* =
              LOKASI EVENT
          = */}

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
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Cari gedung, stadion, atau alamat lengkap..."
                />

              </div>

            </div>

          </section>

          {/* =
              BANNER EVENT
          = */}

          <section className="form-card">

            <h2>
              Banner Event
            </h2>

            <label
              className={`upload-box ${
                banner ? "has-file" : ""
              }`}
            >

              <input
                type="file"
                accept="image/*"
                onChange={handleBannerChange}
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
                    Drag & drop atau klik untuk memilih file (Max 5MB)
                  </span>
                </>
              )}

            </label>

          </section>

          {/* =
              JADWAL EVENT
          = */}

          <section className="form-card">

            <div className="section-header">

              <h2>
                Jadwal Event
              </h2>

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
                      value={schedule.date}
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

                    <label>
                      JAM SELESAI
                    </label>

                    <input
                      type="time"
                      value={schedule.endTime}
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
                      handleDeleteSchedule(index)
                    }
                  >
                    🗑
                  </button>

                </div>

              ))}

            </div>

          </section>

          {/* =
              KATEGORI TIKET
          = */}

          <section className="form-card">

            <div className="section-header">

              <h2>
                Kategori Tiket
              </h2>

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

              {tickets.map((ticket, index) => (

                <div
                  className="ticket-row"
                  key={index}
                >

                  <input
                    type="text"
                    value={ticket.name}
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
                    value={ticket.price}
                    placeholder="Harga"
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
                    value={ticket.quota}
                    placeholder="Kuota"
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
                      handleDeleteTicket(index)
                    }
                  >
                    ×
                  </button>

                </div>

              ))}

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

          {/* =
              LINE UP
          = */}

          <section className="form-card">

            <div className="section-header">

              <h2>
                Line Up Event
              </h2>

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
                      handleDeleteLineup(index)
                    }
                  >
                    ×
                  </button>

                </div>

              ))}

            </div>

          </section>

          {/* =
              PERIZINAN EVENT
          = */}

          <section className="form-card">

            <h2>
              Perizinan Event
            </h2>

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
                    Format .PDF atau .ZIP (Max 10MB)
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