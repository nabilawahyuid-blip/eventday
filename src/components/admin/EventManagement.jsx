import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../shared/Sidebar";
import Navbar from "../shared/Navbar";

import "./EventManagement.css";

function EventManagement() {
  const navigate = useNavigate();

  // State untuk Search dan Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("Semua Status");
  const [selectedCategory, setSelectedCategory] = useState("Semua Kategori");

  // DATA EVENT
  const events = [
    {
      id: 1,
      title: "Synchronize Fest 2024",
      category: "Music Festival",
      date: "12 - 14 Oktober 2024",
      time: "15:00 - 23:30 WIB",
      location: "Gambir Expo Kemayoran, Jakarta",
      status: "Aktif",
      statusClass: "active",
      tickets: "200 / 400",
      organizer: "Synchronize Festival",
      imageClass: "event-purple",
    },
    {
      id: 2,
      title: "Jakarta Tech Week 2024",
      category: "Technology",
      date: "20 - 22 Oktober 2024",
      time: "09:00 - 18:00 WIB",
      location: "Jakarta Convention Center",
      status: "Aktif",
      statusClass: "active",
      tickets: "350 / 500",
      organizer: "Tech Indonesia",
      imageClass: "event-blue",
    },
    {
      id: 3,
      title: "Annual Gala Dinner",
      category: "Entertainment",
      date: "05 November 2024",
      time: "18:00 - 22:00 WIB",
      location: "Grand Ballroom Jakarta",
      status: "Draft",
      statusClass: "draft",
      tickets: "0 / 300",
      organizer: "EventDay Organizer",
      imageClass: "event-orange",
    },
    {
      id: 4,
      title: "Creative Youth Festival",
      category: "Community",
      date: "18 November 2024",
      time: "10:00 - 21:00 WIB",
      location: "Senayan Park, Jakarta",
      status: "Aktif",
      statusClass: "active",
      tickets: "120 / 250",
      organizer: "Creative Youth",
      imageClass: "event-pink",
    },
    {
      id: 5,
      title: "Indonesia Digital Expo",
      category: "Technology",
      date: "25 - 27 November 2024",
      time: "09:00 - 17:00 WIB",
      location: "ICE BSD City",
      status: "Aktif",
      statusClass: "active",
      tickets: "480 / 700",
      organizer: "Digital Indonesia",
      imageClass: "event-green",
    },
    {
      id: 6,
      title: "Art & Culture Weekend",
      category: "Art & Culture",
      date: "01 Desember 2024",
      time: "10:00 - 20:00 WIB",
      location: "Taman Ismail Marzuki",
      status: "Selesai",
      statusClass: "finished",
      tickets: "300 / 300",
      organizer: "Jakarta Art Community",
      imageClass: "event-yellow",
    },
  ];

  // KLIK PANAH → DETAIL EVENT
  const handleEventClick = (event) => {
    navigate(`/admin/event/${event.id}`);
  };

  // BUTTON TAMBAH EVENT → ARAHKAN KE FORM TAMBAH EVENT
  const handleAddEvent = () => {
    navigate("/admin/tambah-event");
  };

  // LOGIKA FILTER DAN SEARCH
  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      selectedStatus === "Semua Status" || event.status === selectedStatus;
    const matchesCategory =
      selectedCategory === "Semua Kategori" ||
      event.category === selectedCategory;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <div className="event-management-page">
      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN AREA */}
      <main className="event-main">
        {/* NAVBAR */}
        <Navbar />

        {/* CONTENT */}
        <div className="event-content">
          {/* PAGE HEADING */}
          <div className="page-heading">
            <div className="page-heading-text">
              <h2>Event Management</h2>
              <p>Kelola dan pantau seluruh event yang tersedia</p>
            </div>

            <button
              type="button"
              className="add-event-button"
              onClick={handleAddEvent}
            >
              + Tambah Event
            </button>
          </div>

          {/* TOOLBAR */}
          <div className="event-toolbar">
            {/* SEARCH */}
            <div className="event-search">
              <span>⌕</span>
              <input
                type="text"
                placeholder="Cari event..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* FILTER STATUS */}
            <select
              className="event-filter"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="Semua Status">Semua Status</option>
              <option value="Aktif">Aktif</option>
              <option value="Draft">Draft</option>
              <option value="Selesai">Selesai</option>
            </select>

            {/* FILTER KATEGORI */}
            <select
              className="event-filter"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="Semua Kategori">Semua Kategori</option>
              <option value="Music Festival">Music Festival</option>
              <option value="Technology">Technology</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Community">Community</option>
              <option value="Art & Culture">Art & Culture</option>
            </select>
          </div>

          {/* EVENT GRID */}
          <div className="event-grid">
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event) => (
                <div className="event-card" key={event.id}>
                  {/* EVENT COVER */}
                  <div className={`event-cover ${event.imageClass}`}>
                    <span>{event.category}</span>
                  </div>

                  {/* EVENT CONTENT */}
                  <div className="event-card-content">
                    {/* STATUS */}
                    <div className="event-card-top">
                      <span className={`event-status ${event.statusClass}`}>
                        {event.status}
                      </span>
                    </div>

                    {/* TITLE */}
                    <h3>{event.title}</h3>

                    {/* DATE */}
                    <div className="event-detail">
                      <span>▣</span>
                      {event.date}
                    </div>

                    {/* TIME */}
                    <div className="event-detail">
                      <span>◷</span>
                      {event.time}
                    </div>

                    {/* LOCATION */}
                    <div className="event-detail">
                      <span>◉</span>
                      {event.location}
                    </div>

                    {/* FOOTER */}
                    <div className="event-card-footer">
                      <span>{event.tickets} tiket</span>

                      {/* PANAH → DETAIL EVENT */}
                      <button
                        type="button"
                        className="event-arrow"
                        onClick={() => handleEventClick(event)}
                        aria-label={`Lihat detail ${event.title}`}
                      >
                        →
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ gridColumn: "1 / -1", textAlign: "center", color: "#8d889a" }}>
                Tidak ada event yang sesuai dengan pencarian.
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default EventManagement;