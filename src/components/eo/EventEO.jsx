import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import SidebarEO from "../shared/SidebarEO";
import NavbarEO from "../shared/NavbarEO";

import {
  getOrganizerEvents,
  getOrganizerDraftEvents,
  getOrganizerEventSalesSummary,
} from "../../services/organizerEventService";

import "./EventEO.css";

function EventEO() {
  const navigate = useNavigate();

  // =====================================================
  // TAB
  // =====================================================

  const [activeTab, setActiveTab] = useState("Semua");

  // =====================================================
  // DATA
  // =====================================================

  const [events, setEvents] = useState([]);
  const [draftEvents, setDraftEvents] = useState([]);

  // =====================================================
  // LOADING
  // =====================================================

  const [loading, setLoading] = useState(true);
  const [draftLoading, setDraftLoading] = useState(true);

  // =====================================================
  // ERROR
  // =====================================================

  const [error, setError] = useState("");
  const [draftError, setDraftError] = useState("");

  // =====================================================
  // SALES SUMMARY
  // =====================================================

  const [salesSummary, setSalesSummary] = useState({});

  // =====================================================
  // LOAD DATA
  // =====================================================

  useEffect(() => {
    loadEvents();
    loadDraftEvents();
  }, []);

  // =====================================================
  // LOAD EVENT
  // =====================================================

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getOrganizerEvents();

      console.log("ORGANIZER EVENTS RESPONSE:", response);

      const eventData = Array.isArray(response?.data)
        ? response.data
        : [];

      setEvents(eventData);

      // Ambil sales summary masing-masing event
      loadSalesSummary(eventData);
    } catch (error) {
      console.error(
        "Gagal mengambil event organizer:",
        error
      );

      setError(
        error?.message ||
          "Gagal mengambil data event"
      );

      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD DRAFT EVENT
  // =====================================================

  const loadDraftEvents = async () => {
    try {
      setDraftLoading(true);
      setDraftError("");

      const response = await getOrganizerDraftEvents();

      console.log("DRAFT EVENTS RESPONSE:", response);

      const draftData = Array.isArray(response?.data)
        ? response.data
        : [];

      setDraftEvents(draftData);
    } catch (error) {
      console.error(
        "Gagal mengambil draft event:",
        error
      );

      setDraftError(
        error?.message ||
          "Gagal mengambil draft event"
      );

      setDraftEvents([]);
    } finally {
      setDraftLoading(false);
    }
  };

  // =====================================================
  // LOAD SALES SUMMARY
  // =====================================================

  const loadSalesSummary = async (eventList) => {
    if (!Array.isArray(eventList)) {
      return;
    }

    const summaryResults = {};

    await Promise.all(
      eventList.map(async (event) => {
        if (!event?.event_id) {
          return;
        }

        try {
          const response =
            await getOrganizerEventSalesSummary(
              event.event_id
            );

          console.log(
            `SALES SUMMARY ${event.event_id}:`,
            response
          );

          if (response?.data) {
            summaryResults[event.event_id] =
              response.data;
          }
        } catch (error) {
          console.warn(
            `Gagal mengambil sales summary event ${event.event_id}:`,
            error
          );
        }
      })
    );

    setSalesSummary(summaryResults);
  };

  // =====================================================
  // REFRESH
  // =====================================================

  const handleRefresh = () => {
    loadEvents();
    loadDraftEvents();
  };

  // =====================================================
  // FILTER EVENT
  // =====================================================

  const filteredEvents =
    activeTab === "Semua"
      ? events
      : activeTab === "Aktif"
      ? events.filter(
          (event) =>
            String(event?.status).toUpperCase() ===
            "PUBLISHED"
        )
      : activeTab === "Berakhir"
      ? events.filter(
          (event) =>
            ["ENDED", "FINISHED"].includes(
              String(event?.status).toUpperCase()
            )
        )
      : [];

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (dateString) => {
    if (!dateString) {
      return "Belum ditentukan";
    }

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return dateString;
    }

    return date.toLocaleDateString(
      "id-ID",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    );
  };

  // =====================================================
  // FORMAT TIME
  // =====================================================

  const formatTime = (dateString) => {
    if (!dateString) {
      return "Belum ditentukan";
    }

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    return `${date.toLocaleTimeString(
      "id-ID",
      {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }
    )} WIB`;
  };

  // =====================================================
  // FORMAT STATUS
  // =====================================================

  const getStatusText = (status) => {
    const normalized =
      String(status || "").toUpperCase();

    if (normalized === "PUBLISHED") {
      return "Event Aktif";
    }

    if (normalized === "DRAFT") {
      return "Draft";
    }

    if (
      normalized === "ENDED" ||
      normalized === "FINISHED"
    ) {
      return "Event Berakhir";
    }

    return status || "-";
  };

  // =====================================================
  // STATUS CLASS
  // =====================================================

  const getStatusClass = (status) => {
    const normalized =
      String(status || "").toUpperCase();

    if (normalized === "PUBLISHED") {
      return "active";
    }

    if (normalized === "DRAFT") {
      return "draft";
    }

    if (
      normalized === "ENDED" ||
      normalized === "FINISHED"
    ) {
      return "finished";
    }

    return "draft";
  };

  // =====================================================
  // GET SOLD TICKETS
  // =====================================================

  const getSoldTickets = (event) => {
    const summary =
      salesSummary?.[event?.event_id];

    return Number(
      summary?.tickets_sold ?? 0
    );
  };

  // =====================================================
  // DETAIL
  // =====================================================

  const handleDetail = (event) => {
    if (!event?.event_id) {
      return;
    }

    navigate(
      `/eo/event/${event.event_id}`
    );
  };

  // =====================================================
  // EDIT
  // =====================================================

  const handleEdit = (event) => {
    if (!event?.event_id) {
      return;
    }

    navigate(
      `/eo/event/edit/${event.event_id}`
    );
  };

  // =====================================================
  // CREATE
  // =====================================================

  const handleCreateEvent = () => {
    navigate("/eo/event/create");
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="event-eo-page">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <SidebarEO />

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="event-eo-main">

        {/* =====================================================
            NAVBAR
        ===================================================== */}

        <NavbarEO />

        {/* =====================================================
            CONTENT
        ===================================================== */}

        <div className="event-eo-content">

          {/* =====================================================
              PAGE TOP
          ===================================================== */}

          <div className="event-eo-page-top">

            <div className="event-eo-page-title">

              <h1>Event Saya</h1>

              <h2>Kelola Event</h2>

            </div>

            <button
              type="button"
              className="event-eo-create-button"
              onClick={handleCreateEvent}
            >
              <span>+</span>
              Buat Event
            </button>

          </div>

          {/* =====================================================
              TABS
          ===================================================== */}

          <div className="event-eo-tabs">

            <button
              type="button"
              className={`event-eo-tab ${
                activeTab === "Semua"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setActiveTab("Semua")
              }
            >
              Semua
            </button>

            <button
              type="button"
              className={`event-eo-tab ${
                activeTab === "Aktif"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setActiveTab("Aktif")
              }
            >
              Aktif
            </button>

            <button
              type="button"
              className={`event-eo-tab ${
                activeTab === "Berakhir"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setActiveTab("Berakhir")
              }
            >
              Berakhir
            </button>

            <button
              type="button"
              className={`event-eo-tab ${
                activeTab === "Draft"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setActiveTab("Draft")
              }
            >
              Draft
            </button>

          </div>

          {/* =====================================================
              ERROR EVENT
          ===================================================== */}

          {error && (
            <div className="dashboard-error">
              {error}
            </div>
          )}

          {/* =====================================================
              DAFTAR EVENT
          ===================================================== */}

          {activeTab !== "Draft" && (

            <section className="event-eo-section">

              <div className="event-eo-section-header">

                <h2>Daftar Event</h2>

                <button
                  type="button"
                  className="event-eo-see-all"
                  onClick={() =>
                    setActiveTab("Semua")
                  }
                >
                  Lihat Semua
                </button>

              </div>

              {/* =================================================
                  LOADING
              ================================================= */}

              {loading ? (

                <div className="event-eo-empty">

                  <h3>
                    Memuat event...
                  </h3>

                  <p>
                    Sedang mengambil data
                    event Anda.
                  </p>

                </div>

              ) : (

                <div className="event-eo-list">

                  {filteredEvents.length > 0 ? (

                    filteredEvents.map(
                      (event) => {

                        const sold =
                          getSoldTickets(
                            event
                          );

                        const statusClass =
                          getStatusClass(
                            event?.status
                          );

                        return (

                          <div
                            className="event-eo-card"
                            key={
                              event.event_id
                            }
                          >

                            {/* =====================================
                                STATUS
                            ===================================== */}

                            <span
                              className={`event-eo-status ${statusClass}`}
                            >
                              {getStatusText(
                                event?.status
                              )}
                            </span>

                            {/* =====================================
                                EVENT TITLE
                            ===================================== */}

                            <div className="event-eo-card-header">

                              <h3>
                                {event?.title ||
                                  "Tanpa Judul Event"}
                              </h3>

                            </div>

                            {/* =====================================
                                EVENT META
                            ===================================== */}

                            <div className="event-eo-meta">

                              <span>

                                <span className="meta-icon">
                                  ◷
                                </span>

                                {formatDate(
                                  event?.start_date
                                )}

                              </span>

                              <span>

                                <span className="meta-icon">
                                  •
                                </span>

                                {formatTime(
                                  event?.start_date
                                )}

                              </span>

                              <span>

                                <span className="meta-icon">
                                  ◉
                                </span>

                                {event?.venue_name ||
                                  "Lokasi belum ditentukan"}

                              </span>

                            </div>

                            {/* =====================================
                                TICKET
                            ===================================== */}

                            <div className="event-eo-ticket">

                              <div className="event-eo-ticket-info">

                                <span>
                                  {sold} Tiket Terjual
                                </span>

                                <span>
                                  {event?.category ||
                                    "Event"}
                                </span>

                              </div>

                              <div className="event-eo-progress">

                                <div
                                  className={`event-eo-progress-bar ${
                                    statusClass ===
                                    "finished"
                                      ? "finished"
                                      : ""
                                  }`}
                                  style={{
                                    width:
                                      sold > 0
                                        ? "100%"
                                        : "0%",
                                  }}
                                />

                              </div>

                            </div>

                            {/* =====================================
                                DETAIL
                            ===================================== */}

                            <button
                              type="button"
                              className="event-eo-detail-button"
                              onClick={() =>
                                handleDetail(
                                  event
                                )
                              }
                            >
                              Detail Event
                            </button>

                          </div>

                        );
                      }
                    )

                  ) : (

                    <div className="event-eo-empty">

                      <h3>
                        Tidak ada event
                      </h3>

                      <p>
                        Belum ada event pada
                        kategori ini.
                      </p>

                    </div>

                  )}

                </div>

              )}

            </section>

          )}

          {/* =====================================================
              DRAFT
          ===================================================== */}

          {(activeTab === "Semua" ||
            activeTab === "Draft") && (

            <section className="event-eo-section event-eo-draft-section">

              <div className="event-eo-section-header">

                <h2>Draft Event</h2>

                <button
                  type="button"
                  className="event-eo-see-all"
                  onClick={() =>
                    setActiveTab("Draft")
                  }
                >
                  Lihat Semua Draft
                </button>

              </div>

              {/* =================================================
                  ERROR DRAFT
              ================================================= */}

              {draftError && (
                <div className="dashboard-error">
                  {draftError}
                </div>
              )}

              {/* =================================================
                  LOADING DRAFT
              ================================================= */}

              {draftLoading ? (

                <div className="event-eo-empty">

                  <h3>
                    Memuat draft...
                  </h3>

                  <p>
                    Sedang mengambil draft
                    event Anda.
                  </p>

                </div>

              ) : (

                <div className="event-eo-list">

                  {draftEvents.length > 0 ? (

                    draftEvents.map(
                      (event) => {

                        return (

                          <div
                            className="event-eo-card event-eo-draft-card"
                            key={
                              event.event_id
                            }
                          >

                            {/* =================================
                                STATUS
                            ================================= */}

                            <span className="event-eo-status draft">
                              Draft
                            </span>

                            {/* =================================
                                TITLE
                            ================================= */}

                            <div className="event-eo-card-header">

                              <h3>
                                {event?.title ||
                                  "Tanpa Judul Event"}
                              </h3>

                            </div>

                            {/* =================================
                                META
                            ================================= */}

                            <div className="event-eo-meta">

                              <span>

                                <span className="meta-icon">
                                  ◷
                                </span>

                                {formatDate(
                                  event?.start_date
                                )}

                              </span>

                              <span>

                                <span className="meta-icon">
                                  •
                                </span>

                                {event?.venue_name ||
                                  "Belum ditentukan"}

                              </span>

                            </div>

                            {/* =================================
                                TICKET
                            ================================= */}

                            <div className="event-eo-ticket">

                              <div className="event-eo-ticket-info">

                                <span>
                                  Draft Event
                                </span>

                                <span>
                                  Belum dipublikasikan
                                </span>

                              </div>

                              <div className="event-eo-progress">

                                <div
                                  className="event-eo-progress-bar draft"
                                  style={{
                                    width: "0%",
                                  }}
                                />

                              </div>

                            </div>

                            {/* =================================
                                EDIT
                            ================================= */}

                            <button
                              type="button"
                              className="event-eo-detail-button event-eo-edit-button"
                              onClick={() =>
                                handleEdit(
                                  event
                                )
                              }
                            >
                              Lanjutkan Edit
                            </button>

                          </div>

                        );

                      }
                    )

                  ) : (

                    <div className="event-eo-empty">

                      <h3>
                        Belum ada draft event
                      </h3>

                      <p>
                        Draft event yang kamu
                        simpan akan muncul di
                        sini.
                      </p>

                    </div>

                  )}

                </div>

              )}

            </section>

          )}

          {/* =====================================================
              REFRESH
          ===================================================== */}

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "20px",
            }}
          >

            <button
              type="button"
              className="event-eo-see-all"
              onClick={handleRefresh}
            >
              Refresh Data
            </button>

          </div>

        </div>

      </main>

    </div>
  );
}

export default EventEO;