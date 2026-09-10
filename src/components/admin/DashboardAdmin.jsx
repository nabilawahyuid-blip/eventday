import React from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../shared/Sidebar";
import Navbar from "../shared/Navbar";

import "./DashboardAdmin.css";

function DashboardAdmin() {
  const navigate = useNavigate();

  // ======
  // VIEW ALL EVENT
  // ======

  const handleViewAll = () => {
    navigate("/event-management");
  };


  // ======
  // EVENT CLICK
  // ======

  const handleEventClick = (eventId) => {
    navigate(`/admin/event/${eventId}`);
  };


  // ======
  // TRANSACTION CLICK
  // ======

  const handleTransactionClick = (name) => {
    alert(`Transaksi ${name} dipilih`);
  };


  return (
    <div className="admin-dashboard">

      {/* =
          MAIN CONTENT
      = */}

      <main className="dashboard-main">

        <div className="dashboard-content">


          {/* =
              STATISTICS
          = */}

          <section className="stats-grid">


            {/* ======
                TOTAL ACTIVE EVENTS
            ====== */}

            <div className="stat-card">

              <div className="stat-card-header">

                <span>
                  TOTAL ACTIVE EVENTS
                </span>

                <div className="stat-icon purple">
                  ▣
                </div>

              </div>

              <h2>
                1,248
              </h2>

              <p className="stat-positive">
                ↗ +12.5% this month
              </p>

            </div>


            {/* ======
                TOTAL USERS
            ====== */}

            <div className="stat-card">

              <div className="stat-card-header">

                <span>
                  TOTAL USERS
                </span>

                <div className="stat-icon orange">
                  ♙
                </div>

              </div>

              <h2>
                45.2k
              </h2>

              <p className="stat-positive">
                ↗ +5.2% this week
              </p>

            </div>


            {/* ======
                TOTAL REVENUE
            ====== */}

            <div className="stat-card">

              <div className="stat-card-header">

                <span>
                  TOTAL REVENUE
                </span>

                <div className="stat-icon green">
                  Rp
                </div>

              </div>

              <h2>
                Rp 2.4B
              </h2>

              <p className="stat-negative">
                ↘ -1.1% today
              </p>

            </div>

          </section>



          {/* =
              LOWER CONTENT
          = */}

          <section className="dashboard-grid">


            {/* =
                EVENT TERBARU
            = */}

            <div className="dashboard-card events-card">

              <div className="card-header">

                <h3>
                  Event Terbaru
                </h3>

                <button
                  type="button"
                  className="view-all"
                  onClick={handleViewAll}
                >
                  View All
                </button>

              </div>


              <div className="event-list">


                {/* ======
                    EVENT 1
                ====== */}

                <button
                  type="button"
                  className="event-item"
                  onClick={() => handleEventClick(2)}
                >

                  <div className="event-image">

                    <span>
                      J
                    </span>

                  </div>


                  <div className="event-info">

                    <h4>
                      Jakarta Tech Week 2024
                    </h4>

                    <p>
                      EVT-9921 • Oct 12–14, 2024
                    </p>

                  </div>


                  <div className="event-status published">
                    Published
                  </div>


                  <span className="event-more">
                    ⋮
                  </span>

                </button>



                {/* ======
                    EVENT 2
                ====== */}

                <button
                  type="button"
                  className="event-item"
                  onClick={() => handleEventClick(3)}
                >

                  <div className="event-image event-image-light">

                    <span>
                      A
                    </span>

                  </div>


                  <div className="event-info">

                    <h4>
                      Annual Gala Dinner
                    </h4>

                    <p>
                      EVT-9920 • Nov 05, 2024
                    </p>

                  </div>


                  <div className="event-status draft">
                    Draft
                  </div>


                  <span className="event-more">
                    ⋮
                  </span>

                </button>

              </div>

            </div>



            {/* =
                AKTIVITAS TRANSAKSI
            = */}

            <div className="dashboard-card transactions-card">

              <div className="card-header">

                <h3>
                  Aktivitas Transaksi
                </h3>

              </div>


              <div className="transaction-list">


                {/* ======
                    TRANSACTION 1
                ====== */}

                <button
                  type="button"
                  className="transaction-item"
                  onClick={() =>
                    handleTransactionClick("Budi Santoso")
                  }
                >

                  <div className="transaction-avatar">
                    AJ
                  </div>


                  <div className="transaction-info">

                    <p>

                      <strong>
                        Budi Santoso
                      </strong>

                      <br />

                      bought 2 tickets for

                      <br />

                      Tech Week

                    </p>


                    <span>
                      2 mins ago
                    </span>

                  </div>


                  <strong className="transaction-price">
                    Rp 500k
                  </strong>

                </button>



                {/* ======
                    TRANSACTION 2
                ====== */}

                <button
                  type="button"
                  className="transaction-item"
                  onClick={() =>
                    handleTransactionClick("Siti Aminah")
                  }
                >

                  <div className="transaction-avatar">
                    SM
                  </div>


                  <div className="transaction-info">

                    <p>

                      <strong>
                        Siti Aminah
                      </strong>

                      bought

                      <br />

                      ticket for Gala

                      <br />

                      Dinner

                    </p>


                    <span>
                      15 mins ago
                    </span>

                  </div>


                  <strong className="transaction-price">
                    Rp 1.5M
                  </strong>

                </button>

              </div>

            </div>

          </section>

        </div>

      </main>

    </div>
  );
}

export default DashboardAdmin;