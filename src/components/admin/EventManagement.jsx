import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { getAdminRecentEvents } from "../../services/adminDashboardService";

import Sidebar from "../shared/Sidebar";
import Navbar from "../shared/Navbar";

import "./EventManagement.css";

export default function EventManagement() {
  const navigate = useNavigate();

  // ==========================================
  // STATE
  // ==========================================
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] =
    useState("Semua Status");

  const [selectedCategory, setSelectedCategory] =
    useState("Semua Kategori");

  // ==========================================
  // AMBIL DATA EVENT DARI BACKEND
  // ==========================================
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await getAdminRecentEvents();

        console.log("Response event:", response);

        // ApiResponse backend:
        //
        // {
        //   "msg": "...",
        //   "status": 200,
        //   "data": [...]
        // }

        const eventData = Array.isArray(response?.data)
          ? response.data
          : [];

        setEvents(eventData);
      } catch (err) {
        console.error(
          "Gagal memuat data event:",
          err
        );

        setError(
          "Gagal menyambungkan ke server backend."
        );

        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // ==========================================
  // KLIK PANAH → DETAIL EVENT
  // ==========================================
  const handleEventClick = (event) => {
    const eventId =
      event?.id ||
      event?._id;

    if (!eventId) {
      console.error(
        "ID event tidak ditemukan:",
        event
      );

      return;
    }

    navigate(`/admin/event/${eventId}`);
  };

  // ==========================================
  // BUTTON TAMBAH EVENT
  // ==========================================
  const handleAddEvent = () => {
    navigate("/admin/tambah-event");
  };

  // ==========================================
  // FILTER DAN SEARCH
  // ==========================================
  const filteredEvents = events.filter((event) => {
    const title =
      event?.title ||
      event?.name ||
      "";

    const status =
      event?.status ||
      "Aktif";

    const category =
      event?.category ||
      "";

    const matchesSearch =
      title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      selectedStatus === "Semua Status" ||
      status === selectedStatus;

    const matchesCategory =
      selectedCategory === "Semua Kategori" ||
      category === selectedCategory;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesCategory
    );
  });

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <div className="event-management-page">

      {/* ======================================
          SIDEBAR
      ====================================== */}
      <Sidebar />

      {/* ======================================
          MAIN AREA
      ====================================== */}
      <div
        className="dashboard-wrapper"
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >

        {/* ====================================
            NAVBAR
        ==================================== */}
        <Navbar />

        {/* ====================================
            MAIN
        ==================================== */}
        <main className="event-main">

          <div className="event-content">

            {/* ==================================
                PAGE HEADING
            ================================== */}
            <div className="page-heading">

              <div className="page-heading-text">

                <h2>
                  Event Management
                </h2>

                <p>
                  Kelola dan pantau seluruh event
                  yang tersedia
                </p>

              </div>

              <button
                type="button"
                className="add-event-button"
                onClick={handleAddEvent}
              >
                + Tambah Event
              </button>

            </div>

            {/* ==================================
                TOOLBAR
            ================================== */}
            <div className="event-toolbar">

              {/* SEARCH */}
              <div className="event-search">

                <span>
                  ⌕
                </span>

                <input
                  type="text"
                  placeholder="Cari event..."
                  value={searchTerm}
                  onChange={(e) =>
                    setSearchTerm(
                      e.target.value
                    )
                  }
                />

              </div>

              {/* FILTER STATUS */}
              <select
                className="event-filter"
                value={selectedStatus}
                onChange={(e) =>
                  setSelectedStatus(
                    e.target.value
                  )
                }
              >

                <option value="Semua Status">
                  Semua Status
                </option>

                <option value="Aktif">
                  Aktif
                </option>

                <option value="Draft">
                  Draft
                </option>

                <option value="Selesai">
                  Selesai
                </option>

              </select>

              {/* FILTER KATEGORI */}
              <select
                className="event-filter"
                value={selectedCategory}
                onChange={(e) =>
                  setSelectedCategory(
                    e.target.value
                  )
                }
              >

                <option value="Semua Kategori">
                  Semua Kategori
                </option>

                <option value="Music Festival">
                  Music Festival
                </option>

                <option value="Technology">
                  Technology
                </option>

                <option value="Entertainment">
                  Entertainment
                </option>

                <option value="Community">
                  Community
                </option>

                <option value="Art & Culture">
                  Art & Culture
                </option>

              </select>

            </div>

            {/* ==================================
                EVENT GRID
            ================================== */}
            <div className="event-grid">

              {/* LOADING */}
              {loading ? (

                <p
                  style={{
                    gridColumn: "1 / -1",
                    textAlign: "center",
                    color: "#8d889a",
                    padding: "30px",
                  }}
                >
                  Memuat data event dari server...
                </p>

              ) : error ? (

                /* ERROR */
                <p
                  style={{
                    gridColumn: "1 / -1",
                    textAlign: "center",
                    color: "#dc6868",
                    padding: "30px",
                  }}
                >
                  {error}
                </p>

              ) : filteredEvents.length > 0 ? (

                /* =================================
                   EVENT DATA
                ================================== */
                filteredEvents.map(
                  (event, index) => {

                    const eventId =
                      event?.id ||
                      event?._id ||
                      index;

                    const title =
                      event?.title ||
                      event?.name ||
                      "Tanpa Judul";

                    const category =
                      event?.category ||
                      "Umum";

                    const date =
                      event?.date ||
                      "Jadwal belum ditentukan";

                    const time =
                      event?.time ||
                      "-";

                    const location =
                      event?.location ||
                      event?.venueName ||
                      "-";

                    const status =
                      event?.status ||
                      "Aktif";

                    const statusClass =
                      event?.statusClass ||
                      (
                        status === "Draft"
                          ? "draft"
                          : status === "Selesai"
                          ? "finished"
                          : "active"
                      );

                    const tickets =
                      event?.tickets ||
                      "0 / 0";

                    const imageClass =
                      event?.imageClass ||
                      "event-purple";

                    return (
                      <div
                        className="event-card"
                        key={eventId}
                      >

                        {/* EVENT COVER */}
                        <div
                          className={`event-cover ${imageClass}`}
                        >
                          <span>
                            {category}
                          </span>
                        </div>

                        {/* EVENT CONTENT */}
                        <div className="event-card-content">

                          {/* STATUS */}
                          <div className="event-card-top">

                            <span
                              className={`event-status ${statusClass}`}
                            >
                              {status}
                            </span>

                          </div>

                          {/* TITLE */}
                          <h3>
                            {title}
                          </h3>

                          {/* DATE */}
                          <div className="event-detail">

                            <span>
                              ▣
                            </span>

                            {date}

                          </div>

                          {/* TIME */}
                          <div className="event-detail">

                            <span>
                              ◷
                            </span>

                            {time}

                          </div>

                          {/* LOCATION */}
                          <div className="event-detail">

                            <span>
                              ◉
                            </span>

                            {location}

                          </div>

                          {/* FOOTER */}
                          <div className="event-card-footer">

                            <span>
                              {tickets} tiket
                            </span>

                            {/* DETAIL EVENT */}
                            <button
                              type="button"
                              className="event-arrow"
                              onClick={() =>
                                handleEventClick(
                                  event
                                )
                              }
                              aria-label={`Lihat detail ${title}`}
                            >
                              →
                            </button>

                          </div>

                        </div>

                      </div>
                    );
                  }
                )

              ) : (

                /* =================================
                   DATA KOSONG
                ================================== */
                <p
                  style={{
                    gridColumn: "1 / -1",
                    textAlign: "center",
                    color: "#8d889a",
                    padding: "30px",
                  }}
                >
                  Tidak ada event yang sesuai
                  dengan pencarian.
                </p>

              )}

            </div>

          </div>

        </main>

      </div>

    </div>
  );
}