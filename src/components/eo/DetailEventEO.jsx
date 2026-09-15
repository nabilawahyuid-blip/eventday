import React from "react";
import { useNavigate, useParams } from "react-router-dom";

import SidebarEO from "../shared/SidebarEO";
import NavbarEO from "../shared/NavbarEO";

import "./DetailEventEO.css";


function DetailEventEO() {
  const navigate = useNavigate();
  const { id } = useParams();

  /*
    Data event sementara.
    Nanti bagian ini bisa diganti dengan data dari API.
  */

  const event = {
    id: id || "EVT-2024-001",

    title: "Music Festival 2024",

    status: "Event Aktif",

    category: "Kategori Event",

    date: "02 Februari 2027",

    time: "19:00",

    location: "Lokasi/Venue Event",

    description: [
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",

      "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    ],

    facilities:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",

    banner:
      "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1600&q=85",

    ticketSold: 200,

    ticketTotal: 400,

    categories: [
      {
        name: "VIP",
        price: "Rp 1.500.000",
        sold: "50 / 100",
      },
      {
        name: "Festival",
        price: "Rp 750.000",
        sold: "150 / 300",
      },
    ],

    lineup: [
      {
        name: "Bintang Tamu",
      },
      {
        name: "Bintang Tamu",
      },
      {
        name: "Bintang Tamu",
      },
    ],
  };


  const percentage = Math.round(
    (event.ticketSold / event.ticketTotal) * 100
  );


  const handleBack = () => {
    navigate("/eo/event");
  };


  const handleEdit = () => {
    navigate(`/eo/event/${event.id}/edit`);
  };


  return (
    <div className="detail-event-eo-page">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <SidebarEO />


      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="detail-event-eo-main">

        {/* ===================================================
            NAVBAR
        =================================================== */}

        <NavbarEO />


        {/* ===================================================
            CONTENT
        =================================================== */}

        <div className="detail-event-eo-content">


          {/* =================================================
              PAGE TITLE
          ================================================= */}

          <div className="detail-event-page-title">
            <h1>Detail Event</h1>
          </div>


          {/* =================================================
              BACK BUTTON
          ================================================= */}

          <div className="detail-event-eo-top-nav">

            <button
              type="button"
              className="back-button"
              onClick={handleBack}
            >
              <span className="back-arrow">←</span>

              Kembali ke Kelola Event
            </button>

          </div>


          {/* =================================================
              HERO CARD
          ================================================= */}

          <section className="detail-event-eo-hero-card">

            {/* BANNER */}

            <div className="banner-wrapper">

              <img
                src={event.banner}
                alt={event.title}
                className="event-banner"
              />


              {/* STATUS */}

              <span className="status-badge active">
                {event.status}
              </span>

            </div>


            {/* HERO INFO */}

            <div className="hero-info">

              <h2>
                {event.title}
              </h2>

              <p className="event-id">

                <span className="event-id-icon">
                  ▣
                </span>

                ID Event: {event.id}

              </p>

            </div>

          </section>


          {/* =================================================
              TWO COLUMN
          ================================================= */}

          <div className="detail-event-eo-content-grid">


            {/* =================================================
                LEFT COLUMN
            ================================================= */}

            <div className="detail-event-left-column">


              {/* =============================================
                  EVENT INFORMATION
              ============================================= */}

              <section className="detail-card meta-card">

                <h3>
                  {event.title}
                </h3>


                <div className="meta-list">

                  <span>
                    <span className="meta-icon tag-icon">
                      ◇
                    </span>

                    {event.category}
                  </span>


                  <span>
                    <span className="meta-icon">
                      ▣
                    </span>

                    {event.date} {event.time}
                  </span>


                  <span>
                    <span className="meta-icon location-icon">
                      ♧
                    </span>

                    {event.location}
                  </span>

                </div>

              </section>


              {/* =============================================
                  DESCRIPTION
              ============================================= */}

              <section className="detail-card">

                <h2>
                  Deskripsi Event
                </h2>


                <div className="description-text">

                  {event.description.map(
                    (paragraph, index) => (
                      <p key={index}>
                        {paragraph}
                      </p>
                    )
                  )}

                </div>

              </section>


              {/* =============================================
                  FACILITIES
              ============================================= */}

              <section className="detail-card">

                <h2>
                  Fasilitas
                </h2>


                <div className="facilities-text">

                  <p>
                    {event.facilities}
                  </p>

                </div>

              </section>


              {/* =============================================
                  LINEUP
              ============================================= */}

              <section className="detail-card lineup-card">

                <h2>
                  LineUp
                </h2>


                <div className="lineup-grid">

                  {event.lineup.map(
                    (person, index) => (

                      <div
                        className="lineup-item"
                        key={index}
                      >

                        <div className="lineup-avatar">

                          <span>
                            ♙
                          </span>

                        </div>


                        <span>
                          {person.name}
                        </span>

                      </div>

                    )
                  )}

                </div>

              </section>

            </div>


            {/* =================================================
                RIGHT COLUMN
            ================================================= */}

            <aside className="detail-event-right-column">


              {/* =============================================
                  EDIT BUTTON
              ============================================= */}

              <button
                type="button"
                className="edit-event-btn"
                onClick={handleEdit}
              >
                Edit Event
              </button>


              {/* =============================================
                  SALES STATISTICS
              ============================================= */}

              <section className="detail-card stats-card">

                <h2>
                  Statistik Penjualan
                </h2>


                <div className="stats-divider-top"></div>


                {/* SALES TEXT */}

                <div className="sales-text-row">

                  <span>
                    {event.ticketSold}/{event.ticketTotal} Tiket Terjual
                  </span>

                  <span>
                    {percentage}%
                  </span>

                </div>


                {/* PROGRESS */}

                <div className="progress-bar-bg">

                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${percentage}%`,
                    }}
                  ></div>

                </div>


                {/* DIVIDER */}

                <hr className="stats-divider" />


                {/* CATEGORY */}

                <div className="category-breakdown">

                  <h4>
                    RINCIAN PER KATEGORI
                  </h4>


                  {event.categories.map(
                    (category, index) => (

                      <div
                        className="category-row"
                        key={index}
                      >

                        <div className="cat-info">

                          <span className="cat-name">
                            {category.name}
                          </span>

                          <span className="cat-price">
                            {category.price}
                          </span>

                        </div>


                        <span className="cat-count">
                          {category.sold}
                        </span>

                      </div>

                    )
                  )}

                </div>

              </section>

            </aside>

          </div>

        </div>

      </main>

    </div>
  );
}


export default DetailEventEO;