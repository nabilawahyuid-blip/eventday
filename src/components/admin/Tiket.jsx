import React, { useState } from "react";
import Sidebar from "../shared/Sidebar";
import Navbar from "../shared/Navbar";
import "./Tiket.css";

function Tiket() {
  const [search, setSearch] = useState("");

  const tickets = [
    {
      id: "#TKT-8921",
      name: "Summer Music Fest 2024",
      type: "VIP Pass",
      price: "$150.00",
      quantity: 2,
      status: "Issued",
      icon: "▣",
      iconClass: "purple",
    },
    {
      id: "#TKT-8920",
      name: "Tech Conference Q3",
      type: "General Admission",
      price: "$45.00",
      quantity: 1,
      status: "Pending",
      icon: "▣",
      iconClass: "orange",
    },
    {
      id: "#TKT-8919",
      name: "Jakarta Tech Week",
      type: "Regular Pass",
      price: "$75.00",
      quantity: 3,
      status: "Issued",
      icon: "▣",
      iconClass: "blue",
    },
    {
      id: "#TKT-8918",
      name: "Annual Gala Dinner",
      type: "VIP Table",
      price: "$250.00",
      quantity: 2,
      status: "Pending",
      icon: "▣",
      iconClass: "green",
    },
  ];

  const filteredTickets = tickets.filter((ticket) => {
    const keyword = search.toLowerCase();

    return (
      ticket.id.toLowerCase().includes(keyword) ||
      ticket.name.toLowerCase().includes(keyword) ||
      ticket.type.toLowerCase().includes(keyword)
    );
  });

  const handleExport = () => {
    console.log("Export ticket report");
  };

  const handleAddTicketType = () => {
    console.log("Tambah tipe tiket");
  };

  const handleViewAll = () => {
    console.log("Lihat semua tiket");
  };

  return (
    <div className="ticket-page">

      {/* = SIDEBAR = */}
      <Sidebar />

      {/* = MAIN = */}
      <main className="ticket-main">

        {/* = NAVBAR = */}
        <Navbar />

        {/* = CONTENT = */}
        <section className="ticket-content">

          {/* = HEADER = */}
          <div className="ticket-header">

            <div className="ticket-heading">
              <h1>Ticket Overview</h1>

              <p>
                Global statistics and recent issuances across all events.
              </p>
            </div>

            <div className="ticket-header-actions">

              <button
                type="button"
                className="ticket-export-button"
                onClick={handleExport}
              >
                <span>↓</span>
                Export Report
              </button>

              <button
                type="button"
                className="add-ticket-button"
                onClick={handleAddTicketType}
              >
                <span>+</span>
                New Ticket Type
              </button>

            </div>

          </div>

          {/* = STATISTICS = */}
          <div className="ticket-statistics">

            {/* TOTAL TICKETS */}
            <div className="ticket-stat-card">

              <div className="ticket-stat-content">

                <span className="ticket-stat-label">
                  TOTAL TICKETS ISSUED
                </span>

                <div className="ticket-stat-number-row">

                  <h2>1.2M</h2>

                  <span className="ticket-growth">
                    ↗ +15%
                  </span>

                </div>

                <div className="ticket-stat-footer">
                  Active Events: 145
                  <span>Avg. Price: $45</span>
                </div>

              </div>

              <div className="ticket-stat-icon purple-icon">
                ▣
              </div>

            </div>

            {/* AVAILABILITY */}
            <div className="ticket-stat-card">

              <div className="ticket-stat-content">

                <span className="ticket-stat-label">
                  GLOBAL AVAILABILITY
                </span>

                <div className="availability-row">

                  <h2>68%</h2>

                  <span>Sold Out</span>

                </div>

                <div className="availability-bar">

                  <div className="availability-progress"></div>

                </div>

                <div className="availability-footer">

                  <span>Sold: 818K</span>

                  <span>Remaining: 384K</span>

                </div>

              </div>

              <div className="availability-circle">
                <div className="circle-inner"></div>
              </div>

            </div>

            {/* REVENUE */}
            <div className="ticket-stat-card">

              <div className="ticket-stat-content">

                <span className="ticket-stat-label">
                  TOTAL TICKET REVENUE
                </span>

                <h2 className="revenue-number">
                  $54M
                </h2>

                <div className="revenue-tags">

                  <span>
                    VIP: $10M
                  </span>

                  <span>
                    GA: $24M
                  </span>

                </div>

              </div>

              <div className="ticket-stat-icon revenue-icon">
                $
              </div>

            </div>

          </div>

          {/* = RECENT TICKETS = */}
          <div className="recent-ticket-panel">

            {/* PANEL HEADER */}
            <div className="recent-ticket-header">

              <h2>
                Recent Ticket Issuances
              </h2>

              <button
                type="button"
                className="view-all-button"
                onClick={handleViewAll}
              >
                View All
              </button>

            </div>

            {/* SEARCH */}
            <div className="ticket-search-wrapper">

              <div className="ticket-search">

                <span className="ticket-search-icon">
                  ⌕
                </span>

                <input
                  type="text"
                  placeholder="Search tickets..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />

              </div>

            </div>

            {/* TICKET LIST */}
            <div className="ticket-list">

              {filteredTickets.length > 0 ? (

                filteredTickets.map((ticket) => (

                  <div
                    className="ticket-item"
                    key={ticket.id}
                  >

                    {/* ICON */}
                    <div
                      className={`ticket-item-icon ${ticket.iconClass}`}
                    >
                      {ticket.icon}
                    </div>

                    {/* INFORMATION */}
                    <div className="ticket-item-info">

                      <h3>
                        {ticket.name}
                      </h3>

                      <div className="ticket-item-meta">

                        <span>
                          ID: {ticket.id}
                        </span>

                        <span className="meta-separator">
                          •
                        </span>

                        <span>
                          {ticket.type}
                        </span>

                      </div>

                    </div>

                    {/* PRICE */}
                    <div className="ticket-price">

                      <strong>
                        {ticket.price}
                      </strong>

                      <span>
                        Qty: {ticket.quantity}
                      </span>

                    </div>

                    {/* STATUS */}
                    <div
                      className={`ticket-status ${ticket.status.toLowerCase()}`}
                    >
                      <span>●</span>
                      {ticket.status}
                    </div>

                    {/* ACTION */}
                    <button
                      type="button"
                      className="ticket-more-button"
                      onClick={() =>
                        console.log(
                          "Ticket:",
                          ticket.id
                        )
                      }
                    >
                      ⋮
                    </button>

                  </div>

                ))

              ) : (

                <div className="ticket-empty">
                  Tidak ada tiket ditemukan.
                </div>

              )}

            </div>

            {/* PANEL FOOTER */}
            <div className="ticket-panel-footer">

              <span>
                Showing {filteredTickets.length} recent tickets
              </span>

              <div className="ticket-pagination">

                <button
                  type="button"
                  className="ticket-page-button active"
                >
                  1
                </button>

                <button
                  type="button"
                  className="ticket-page-button"
                >
                  2
                </button>

                <button
                  type="button"
                  className="ticket-page-button"
                >
                  3
                </button>

                <span>
                  ...
                </span>

                <button
                  type="button"
                  className="ticket-page-arrow"
                >
                  ›
                </button>

              </div>

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}

export default Tiket;