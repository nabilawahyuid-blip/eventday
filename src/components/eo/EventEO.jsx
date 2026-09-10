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
      id: 1,
      title: "Judul Event Music Festival 2024",
      date: "15 November 2024",
      time: "18:00 WIB",
      location: "Stadion Utama",
      sold: 200,
      total: 400,
      status: "Event Aktif",
      statusClass: "active",
    },
    {
      id: 2,
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
      id: 3,
      title: "Workshop Fotografi Pemula",
      date: "10 Mei 2024",
      time: "10:00 WIB",
      location: "Creative Hub Bandung",
      sold: 375,
      total: 400,
      status: "Event Berakhir",
      statusClass: "finished",
    },
  ];

  const draftEvents = [
    {
      id: 4,
      title: "Judul Event Draft - Standup Comedy Night",
      date: "Belum ditentukan",
      location: "Belum ditentukan",
      sold: 0,
      total: 400,
    },
  ];

  const handleDetailEvent = (id) => {
    navigate(`/eo/event/${id}`);
  };

  const handleTambahEvent = () => {
    console.log("Tambah Event");
  };

  const handleLanjutkanEdit = (id) => {
    console.log("Lanjutkan edit event:", id);
  };

  const filteredEvents =
    activeTab === "Semua"
      ? events
      : activeTab === "Aktif"
      ? events.filter((event) => event.statusClass === "active")
      : activeTab === "Berakhir"
      ? events.filter((event) => event.statusClass === "finished")
      : [];

  return (
    <div className="event-eo-page">

      {/* =====
          SIDEBAR
      ===== */}

      <SidebarEO />

      {/* =====
           NAVBAR
       ===== */}

      <NavbarEO />

      {/* =====
          MAIN CONTENT
      ===== */}

      <main className="event-eo-main">

        {/* ===
            PAGE HEADER
        === */}

        <section className="event-eo-header">

          <div className="event-eo-heading">

            <h1>Event</h1>

            <p>Kelola Event</p>

          </div>

          <button
            type="button"
            className="event-eo-add-button"
             onClick={() => navigate("/eo/event/create")}
          >
            <span>+</span>
            Tambah Event
          </button>

        </section>


        {/* ===
            TABS
        === */}

        <div className="event-eo-tabs">

          {[
            "Semua",
            "Aktif",
            "Menunggu Persetujuan",
            "Berakhir",
            "Draft",
          ].map((tab) => (
            <button
              key={tab}
              type="button"
              className={`event-eo-tab ${
                activeTab === tab ? "active" : ""
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}

        </div>


        {/* ===
            EVENT SECTION HEADER
        === */}

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


        {/* ===
            EVENT LIST
        === */}

        <section className="event-eo-list">

          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) => {

              const percentage = Math.round(
                (event.sold / event.total) * 100
              );

              return (
                <article
                  className="event-eo-card"
                  key={event.id}
                >

                  {/* Event Info */}

                  <div className="event-eo-card-main">

                    <div className="event-eo-card-title-row">

                      <h3>{event.title}</h3>

                      <span
                        className={`event-eo-status ${event.statusClass}`}
                      >
                        {event.status}
                      </span>

                    </div>


                    {/* Event Meta */}

                    <div className="event-eo-meta">

                      <span>
                        <span className="meta-icon">
                          ◷
                        </span>

                        {event.date}
                      </span>

                      <span>
                        <span className="meta-icon">
                          ◷
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


                    {/* Ticket Progress */}

                    <div className="event-eo-ticket">

                      <div className="event-eo-ticket-top">

                        <span>Tiket Terjual</span>

                        <span>
                          {event.sold}/{event.total}
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

                  </div>


                  {/* Detail Button */}

                  <button
                    type="button"
                    className="event-eo-detail-button"
                    onClick={() =>
                      handleDetailEvent(event.id)
                    }
                  >
                    Detail Event
                  </button>

                </article>
              );
            })
          ) : (
            <div className="event-eo-empty">
              <div className="event-eo-empty-icon">
                📅
              </div>

              <h3>Tidak ada event</h3>

              <p>
                Belum ada event pada kategori ini.
              </p>
            </div>
          )}

        </section>


        {/* ===
            DRAFT EVENT
        === */}

        {(activeTab === "Semua" ||
          activeTab === "Draft") && (

          <section className="event-eo-draft-section">

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


            <div className="event-eo-draft-list">

              {draftEvents.map((event) => (

                <article
                  className="event-eo-card draft-card"
                  key={event.id}
                >

                  <div className="event-eo-card-main">

                    <div className="event-eo-card-title-row">

                      <h3>{event.title}</h3>

                      <span className="event-eo-status draft">
                        DRAFT
                      </span>

                    </div>


                    <div className="event-eo-meta">

                      <span>
                        <span className="meta-icon">
                          ◷
                        </span>

                        {event.date}
                      </span>

                      <span>
                        <span className="meta-icon">
                          ◉
                        </span>

                        {event.location}
                      </span>

                    </div>


                    <div className="event-eo-draft-ticket">

                      <span>Tiket Tersedia</span>

                      <strong>
                        - / {event.total}
                      </strong>

                    </div>

                  </div>


                  <button
                    type="button"
                    className="event-eo-edit-button"
                    onClick={() =>
                      handleLanjutkanEdit(event.id)
                    }
                  >
                    Lanjutkan Edit
                  </button>

                </article>

              ))}

            </div>

          </section>
        )}

      </main>
    </div>
  );
}

export default EventEO;