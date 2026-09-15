import React from "react";
import { useNavigate, useParams } from "react-router-dom";

import Sidebar from "../shared/Sidebar";
import Navbar from "../shared/Navbar";
import "./DetailEvent.css";

function DetailEvent() {
  const navigate = useNavigate();
  const { id } = useParams();

  // ==
  // DATA EVENT SEMENTARA
  // ==

  const events = {
    1: {
      title: "Synchronize Fest 2024",
      code: "EVT-9921",
      category: "Music Festival",
      date: "12 - 14 Oktober 2024",
      time: "15:00 - 23:30 WIB",
      location: "Gambir Expo Kemayoran, Jakarta",
      status: "EVENT AKTIF",
      organizer: "Synchronize Festival",
      description:
        "Synchronize Festival adalah festival musik multi-genre tahunan berskala nasional yang mengundang puluhan ribu audiens untuk merayakan keberagaman jenis musik hidup di depan panggung selama tiga hari.",
      ticketsSold: 200,
      totalTickets: 400,
    },

    2: {
      title: "Jakarta Tech Week 2024",
      code: "EVT-9920",
      category: "Technology",
      date: "20 - 22 Oktober 2024",
      time: "09:00 - 18:00 WIB",
      location: "Jakarta Convention Center",
      status: "EVENT AKTIF",
      organizer: "Tech Indonesia",
      description:
        "Jakarta Tech Week merupakan event teknologi yang mempertemukan berbagai pelaku industri, developer, startup, dan komunitas teknologi untuk berbagi pengetahuan dan membangun kolaborasi.",
      ticketsSold: 350,
      totalTickets: 500,
    },

    3: {
      title: "Annual Gala Dinner",
      code: "EVT-9919",
      category: "Entertainment",
      date: "05 November 2024",
      time: "18:00 - 22:00 WIB",
      location: "Grand Ballroom Jakarta",
      status: "DRAFT",
      organizer: "EventDay Organizer",
      description:
        "Annual Gala Dinner merupakan acara makan malam tahunan yang menghadirkan berbagai hiburan dan networking untuk para tamu undangan.",
      ticketsSold: 0,
      totalTickets: 300,
    },

    4: {
      title: "Creative Youth Festival",
      code: "EVT-9918",
      category: "Community",
      date: "18 November 2024",
      time: "10:00 - 21:00 WIB",
      location: "Senayan Park, Jakarta",
      status: "EVENT AKTIF",
      organizer: "Creative Youth",
      description:
        "Creative Youth Festival merupakan event komunitas yang menghadirkan berbagai kegiatan kreatif, pertunjukan, workshop, dan kolaborasi anak muda.",
      ticketsSold: 120,
      totalTickets: 250,
    },

    5: {
      title: "Indonesia Digital Expo",
      code: "EVT-9917",
      category: "Technology",
      date: "25 - 27 November 2024",
      time: "09:00 - 17:00 WIB",
      location: "ICE BSD City",
      status: "EVENT AKTIF",
      organizer: "Digital Indonesia",
      description:
        "Indonesia Digital Expo menghadirkan berbagai inovasi digital, teknologi terbaru, startup, dan perusahaan teknologi dari berbagai daerah.",
      ticketsSold: 480,
      totalTickets: 700,
    },

    6: {
      title: "Art & Culture Weekend",
      code: "EVT-9916",
      category: "Art & Culture",
      date: "01 Desember 2024",
      time: "10:00 - 20:00 WIB",
      location: "Taman Ismail Marzuki",
      status: "SELESAI",
      organizer: "Jakarta Art Community",
      description:
        "Art & Culture Weekend menghadirkan berbagai karya seni, pertunjukan budaya, pameran, serta kegiatan komunitas kreatif.",
      ticketsSold: 300,
      totalTickets: 300,
    },
  };

  const event = events[id] || events[1];

  const percentage =
    (event.ticketsSold / event.totalTickets) * 100;

  const isDraft = event.status === "DRAFT";

  // ==
  // RENDER
  // ==

  return (
    <div className="detail-event-page">

      {/* ======
          SIDEBAR
      ======= */}

      <Sidebar />


      {/* ======
          MAIN AREA
      ======= */}

      <main className="detail-main">

        {/* ======
            NAVBAR
        ======= */}

        <Navbar />


        {/* ======
            CONTENT
        ======= */}

        <section className="detail-content">

          {/* ======
              PAGE HEADER
          ======= */}

          <div className="detail-page-header">

            <div>
              <h2>
                Detail Event
              </h2>
            </div>

            <button
              type="button"
              className="back-button"
              onClick={() =>
                navigate("/event-management")
              }
            >
              ← KEMBALI
            </button>

          </div>


          {/* ======
              EVENT CARD
          ======= */}

          <article className="detail-card">

            {/* ====
                HERO EVENT
            ===== */}

            <div className="detail-hero">

              {/* STATUS */}

              <span
                className={`event-status ${
                  isDraft ? "draft" : ""
                }`}
              >
                ● {event.status}
              </span>


              {/* CATEGORY */}

              <span className="hero-category">
                {event.category}
              </span>


              {/* EVENT VISUAL */}

              <div className="hero-visual">

                <div className="hero-circle circle-one"></div>

                <div className="hero-circle circle-two"></div>

                <div className="hero-stage">

                  <div className="stage-light"></div>

                  <div className="stage-light"></div>

                  <div className="stage-screen">
                    EVENTDAY
                  </div>

                </div>

              </div>

            </div>


            {/* ====
                EVENT BODY
            ===== */}

            <div className="detail-body">

              {/* TITLE */}

              <div className="event-title-section">

                <h1>
                  {event.title}
                </h1>

              </div>


              {/* META */}

              <div className="event-meta">

                <div className="meta-item">

                  <span className="meta-icon">
                    ▣
                  </span>

                  <span>
                    {event.date}
                  </span>

                </div>


                <div className="meta-item">

                  <span className="meta-icon">
                    ◷
                  </span>

                  <span>
                    {event.time}
                  </span>

                </div>


                <div className="meta-item">

                  <span className="meta-icon">
                    ◉
                  </span>

                  <span>
                    {event.location}
                  </span>

                </div>

              </div>


              {/* DIVIDER */}

              <div className="detail-divider"></div>


              {/* ====
                  DESCRIPTION
              ===== */}

              <section className="description-section">

                <h3>
                  Deskripsi Event
                </h3>

                <p>
                  {event.description}
                </p>

              </section>


              {/* ====
                  TICKET SALES
              ===== */}

              <section className="ticket-section">

                <div className="ticket-header">

                  <div>

                    <h3>
                      Penjualan Tiket
                    </h3>

                    <p>
                      Total tiket terjual dari kuota tersedia
                    </p>

                  </div>


                  <div className="ticket-count">

                    <strong>
                      {event.ticketsSold}
                    </strong>

                    <span>
                      / {event.totalTickets}
                    </span>

                  </div>

                </div>


                {/* PROGRESS */}

                <div className="progress-wrapper">

                  <div className="progress-track">

                    <div
                      className="progress-fill"
                      style={{
                        width: `${percentage}%`,
                      }}
                    ></div>

                  </div>

                </div>


                <div className="progress-info">

                  <span>
                    {Math.round(percentage)}% Terjual
                  </span>

                </div>

              </section>


              {/* ====
                  EVENT INFORMATION
              ===== */}

              <div className="event-extra-info">

                <div className="extra-item">

                  <span>
                    Penyelenggara
                  </span>

                  <strong>
                    {event.organizer}
                  </strong>

                </div>


                <div className="extra-item">

                  <span>
                    Status Event
                  </span>

                  <strong>
                    {event.status}
                  </strong>

                </div>


                <div className="extra-item">

                  <span>
                    Event ID
                  </span>

                  <strong>
                    {event.code}
                  </strong>

                </div>

              </div>


              {/* ====
                  ACTION
              ===== */}

              <div className="detail-actions">

                <button
                  type="button"
                  className="edit-button"
                  onClick={() =>
                    navigate(`/admin/event/edit/${id}`)
                  }
                >
                  Edit Event
                </button>


                <button
                  type="button"
                  className="delete-button"
                  onClick={() =>
                    console.log("Hapus event")
                  }
                >
                  Hapus Event
                </button>

              </div>

            </div>

          </article>

        </section>

      </main>

    </div>
  );
}

export default DetailEvent;