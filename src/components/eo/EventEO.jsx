import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SidebarEO from "../shared/SidebarEO";
import NavbarEO from "../shared/NavbarEO";
import "./EventEO.css";

function EventEO() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("Semua");

  const events = [
    {
      id: "EVT-001",
      title: "Music Festival 2024",
      date: "15 Nov 2024",
      time: "18:00 WIB",
      location: "Stadion Utama",
      sold: 200,
      total: 400,
      status: "Event Aktif",
      statusClass: "active",
    },
    {
      id: "EVT-002",
      title: "Seminar Bisnis & Teknologi",
      date: "20 September 2024",
      time: "09:00 WIB",
      location: "Jakarta Convention Center",
      sold: 350,
      total: 400,
      status: "Event Aktif",
      statusClass: "active",
    },
    {
      id: "EVT-003",
      title: "Workshop Fotografi",
      date: "01 Okt 2024",
      time: "10:00 WIB",
      location: "Creative Space",
      sold: 300,
      total: 400,
      status: "Event Berakhir",
      statusClass: "finished",
    },
  ];

  const draftEvents = [
    {
      id: "DRAFT-001",
      title: "Judul Event Draft - Standup Comedy Night",
      date: "Belum Ditentukan",
      location: "Belum Ditentukan",
      sold: 0,
      total: 400,
      status: "Draft",
      statusClass: "draft",
    },
  ];

  const filteredEvents =
    activeTab === "Semua"
      ? events
      : activeTab === "Aktif"
      ? events.filter((event) => event.statusClass === "active")
      : activeTab === "Berakhir"
      ? events.filter((event) => event.statusClass === "finished")
      : [];

  const handleDetail = (event) => {
    navigate(`/eo/event/${event.id}`);
  };

  const handleEdit = (event) => {
    navigate(`/eo/event/edit/${event.id}`);
  };

  return (
    <div className="event-eo-page">

      {/* SIDEBAR */}
      <SidebarEO />

      {/* MAIN */}
      <main className="event-eo-main">

        {/* NAVBAR */}
        <NavbarEO />

        {/* CONTENT */}
        <div className="event-eo-content">

          {/* =========================
              PAGE TOP
          ========================= */}
          <div className="event-eo-page-top">

            <div className="event-eo-page-title">
              <h1>Event Saya</h1>

              <h2>Kelola Event</h2>
            </div>

            <button
              type="button"
              className="event-eo-create-button"
              onClick={() => navigate("/eo/event/create")}
            >
              <span>+</span>
              Buat Event
            </button>

          </div>


          {/* =========================
              TABS
          ========================= */}
          <div className="event-eo-tabs">

            <button
              type="button"
              className={`event-eo-tab ${
                activeTab === "Semua" ? "active" : ""
              }`}
              onClick={() => setActiveTab("Semua")}
            >
              Semua
            </button>

            <button
              type="button"
              className={`event-eo-tab ${
                activeTab === "Aktif" ? "active" : ""
              }`}
              onClick={() => setActiveTab("Aktif")}
            >
              Aktif
            </button>

            <button
              type="button"
              className={`event-eo-tab ${
                activeTab === "Berakhir" ? "active" : ""
              }`}
              onClick={() => setActiveTab("Berakhir")}
            >
              Berakhir
            </button>

            <button
              type="button"
              className={`event-eo-tab ${
                activeTab === "Draft" ? "active" : ""
              }`}
              onClick={() => setActiveTab("Draft")}
            >
              Draft
            </button>

          </div>


          {/* =========================
              DAFTAR EVENT
          ========================= */}
          {activeTab !== "Draft" && (
            <section className="event-eo-section">

              <div className="event-eo-section-header">

                <h2>Daftar Event</h2>

                <button
                  type="button"
                  className="event-eo-see-all"
                  onClick={() => setActiveTab("Semua")}
                >
                  Lihat Semua
                </button>

              </div>


              <div className="event-eo-list">

                {filteredEvents.length > 0 ? (
                  filteredEvents.map((event) => {

                    const percentage =
                      event.total > 0
                        ? Math.round(
                            (event.sold / event.total) * 100
                          )
                        : 0;

                    return (
                      <div
                        className="event-eo-card"
                        key={event.id}
                      >

                        {/* STATUS */}
                        <span
                          className={`event-eo-status ${event.statusClass}`}
                        >
                          {event.status}
                        </span>


                        {/* EVENT TITLE */}
                        <div className="event-eo-card-header">

                          <h3>
                            {event.title}
                          </h3>

                        </div>


                        {/* EVENT META */}
                        <div className="event-eo-meta">

                          <span>
                            <span className="meta-icon">
                              ◷
                            </span>

                            {event.date}
                          </span>

                          <span>
                            <span className="meta-icon">
                              •
                            </span>

                            {event.time}
                          </span>

                          <span>
                            <span className="meta-icon">
                              ◉
                            </span>

                            {event.location}
                          </span>

                        </div>


                        {/* TICKET */}
                        <div className="event-eo-ticket">

                          <div className="event-eo-ticket-info">

                            <span>
                              {event.sold}/{event.total} Tiket Terjual
                            </span>

                            <span>
                              {percentage}%
                            </span>

                          </div>


                          <div className="event-eo-progress">

                            <div
                              className={`event-eo-progress-bar ${
                                event.statusClass === "finished"
                                  ? "finished"
                                  : ""
                              }`}
                              style={{
                                width: `${percentage}%`,
                              }}
                            />

                          </div>

                        </div>


                        {/* DETAIL */}
                        <button
                          type="button"
                          className="event-eo-detail-button"
                          onClick={() => handleDetail(event)}
                        >
                          Detail Event
                        </button>

                      </div>
                    );
                  })
                ) : (
                  <div className="event-eo-empty">

                    <h3>
                      Tidak ada event
                    </h3>

                    <p>
                      Belum ada event pada kategori ini.
                    </p>

                  </div>
                )}

              </div>

            </section>
          )}


          {/* =========================
              DRAFT
          ========================= */}
          {(activeTab === "Semua" || activeTab === "Draft") && (
            <section className="event-eo-section event-eo-draft-section">

              <div className="event-eo-section-header">

                <h2>Draft Event</h2>

                <button
                  type="button"
                  className="event-eo-see-all"
                  onClick={() => setActiveTab("Draft")}
                >
                  Lihat Semua Draft
                </button>

              </div>


              <div className="event-eo-list">

                {draftEvents.map((event) => {

                  const percentage =
                    event.total > 0
                      ? Math.round(
                          (event.sold / event.total) * 100
                        )
                      : 0;

                  return (
                    <div
                      className="event-eo-card event-eo-draft-card"
                      key={event.id}
                    >

                      {/* STATUS */}
                      <span
                        className={`event-eo-status ${event.statusClass}`}
                      >
                        {event.status}
                      </span>


                      {/* TITLE */}
                      <div className="event-eo-card-header">

                        <h3>
                          {event.title}
                        </h3>

                      </div>


                      {/* META */}
                      <div className="event-eo-meta">

                        <span>
                          <span className="meta-icon">
                            ◷
                          </span>

                          {event.date}
                        </span>

                        <span>
                          <span className="meta-icon">
                            •
                          </span>

                          {event.location}
                        </span>

                      </div>


                      {/* TICKET */}
                      <div className="event-eo-ticket">

                        <div className="event-eo-ticket-info">

                          <span>
                            -/400 Tiket Tersedia
                          </span>

                          <span>
                            {percentage}%
                          </span>

                        </div>


                        <div className="event-eo-progress">

                          <div
                            className="event-eo-progress-bar draft"
                            style={{
                              width: `${percentage}%`,
                            }}
                          />

                        </div>

                      </div>


                      {/* EDIT */}
                      <button
                        type="button"
                        className="event-eo-detail-button event-eo-edit-button"
                        onClick={() => handleEdit(event)}
                      >
                        Lanjutkan Edit
                      </button>

                    </div>
                  );
                })}

              </div>

            </section>
          )}

        </div>

      </main>

    </div>
  );
}

export default EventEO;