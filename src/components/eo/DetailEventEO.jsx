import React from "react";
import { useNavigate, useParams } from "react-router-dom";

import SidebarEO from "../shared/SidebarEO";
import NavbarEO from "../shared/NavbarEO";

import "./DetailEventEO.css";

function DetailEventEO() {
  const navigate = useNavigate();
  const { id } = useParams();

  // Mock data detail event (disesuaikan dengan kebutuhan API nanti)
  const eventDetail = {
    id: id || "1",
    eventId: "EVT-2024-001",
    title: "Music Festival 2024",
    category: "Kategori Event",
    date: "02 Februari 2027 19:00",
    location: "Lokasi/Venue Event",
    status: "Event Aktif",
    statusClass: "active",
    bannerUrl:
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1000&auto=format&fit=crop",
    description: `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`,
    facilities:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    lineup: [
      { id: 1, name: "Bintang Tamu" },
      { id: 2, name: "Bintang Tamu" },
      { id: 3, name: "Bintang Tamu" },
    ],
    stats: {
      sold: 200,
      total: 400,
      percentage: 50,
      categories: [
        { name: "VIP", price: "Rp 1.500.000", sold: 50, total: 100 },
        { name: "Festival", price: "Rp 750.000", sold: 150, total: 300 },
      ],
    },
  };

  return (
    <div className="detail-event-eo-page">
      <SidebarEO />
      <NavbarEO />

      <main className="detail-event-eo-main">
        {/* Navigation / Back Button */}
        <div className="detail-event-eo-top-nav">
          <button
            type="button"
            className="back-button"
            onClick={() => navigate(-1)}
          >
            ← Kembali ke Kelola Event
          </button>
        </div>

        {/* Hero Section (Banner & Title Card) */}
        <div className="detail-event-eo-hero-card">
          <div className="banner-wrapper">
            <img
              src={eventDetail.bannerUrl}
              alt={eventDetail.title}
              className="event-banner"
            />
            <span className={`status-badge ${eventDetail.statusClass}`}>
              {eventDetail.status}
            </span>
          </div>

          <div className="hero-info">
            <h1>{eventDetail.title}</h1>
            <p className="event-id">
              <span className="id-icon">📄</span> ID Event:{" "}
              {eventDetail.eventId}
            </p>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="detail-event-eo-content-grid">
          {/* Left Column - Details */}
          <div className="left-column">
            {/* Meta Info Box */}
            <div className="detail-card meta-card">
              <h3>{eventDetail.title}</h3>
              <div className="meta-list">
                <span>
                  <i className="icon">🏷️</i> {eventDetail.category}
                </span>
                <span>
                  <i className="icon">📅</i> {eventDetail.date}
                </span>
                <span>
                  <i className="icon">📍</i> {eventDetail.location}
                </span>
              </div>
            </div>

            {/* Description Box */}
            <div className="detail-card">
              <h2>Deskripsi Event</h2>
              <div className="description-text">
                {eventDetail.description.split("\n\n").map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>
            </div>

            {/* Facilities Box */}
            <div className="detail-card">
              <h2>Fasilitas</h2>
              <p className="facilities-text">{eventDetail.facilities}</p>
            </div>

            {/* LineUp Box */}
            <div className="detail-card">
              <h2>LineUp</h2>
              <div className="lineup-grid">
                {eventDetail.lineup.map((item) => (
                  <div className="lineup-item" key={item.id}>
                    <div className="lineup-avatar">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#8a859b"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                    </div>
                    <span>{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Stats & Action */}
          <div className="right-column">
            <button
              type="button"
              className="edit-event-btn"
              onClick={() => navigate(`/eo/event/edit/${eventDetail.id}`)}
            >
              Edit Event
            </button>

            {/* Sales Stats Box */}
            <div className="detail-card stats-card">
              <h2>Statistik Penjualan</h2>

              <div className="sales-progress-container">
                <div className="sales-text-row">
                  <span>
                    {eventDetail.stats.sold}/{eventDetail.stats.total} Tiket
                    Terjual
                  </span>
                  <span>{eventDetail.stats.percentage}%</span>
                </div>
                <div className="progress-bar-bg">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${eventDetail.stats.percentage}%` }}
                  />
                </div>
              </div>

              <hr className="stats-divider" />

              <div className="category-breakdown">
                <h4>RINCIAN PER KATEGORI</h4>
                {eventDetail.stats.categories.map((cat, idx) => (
                  <div className="category-row" key={idx}>
                    <div className="cat-info">
                      <span className="cat-name">{cat.name}</span>
                      <span className="cat-price">{cat.price}</span>
                    </div>
                    <span className="cat-count">
                      {cat.sold} / {cat.total}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default DetailEventEO;
