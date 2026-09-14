import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import SidebarEO from "../shared/SidebarEO";
import NavbarEO from "../shared/NavbarEO";
import "./TransaksiEO.css";

function TransaksiEO() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const filterRef = useRef(null);

  const transactions = [
    {
      id: "TRX-9921",
      customer: "Nama Customer",
      ticket: "VIP - Music Festival",
      event: "Music Festival 2024",
      date: "24 Oktober 2024",
      time: "14:30 WIB",
      status: "Lunas",
      statusClass: "paid",
    },
    {
      id: "TRX-9922",
      customer: "Nama Customer",
      ticket: "Regular - Music Festival",
      event: "Music Festival 2024",
      date: "24 Oktober 2024",
      time: "13:20 WIB",
      status: "Lunas",
      statusClass: "paid",
    },
    {
      id: "TRX-9923",
      customer: "Nama Customer 2",
      ticket: "Regular - Seminar Bisnis",
      event: "Seminar Bisnis & Teknologi",
      date: "23 Oktober 2024",
      time: "11:45 WIB",
      status: "Menunggu",
      statusClass: "pending",
    },
    {
      id: "TRX-9924",
      customer: "Nama Customer 3",
      ticket: "VIP - Workshop",
      event: "Workshop Fotografi",
      date: "22 Oktober 2024",
      time: "10:30 WIB",
      status: "Dibatalkan",
      statusClass: "cancelled",
    },
    {
      id: "TRX-9925",
      customer: "Nama Customer 3",
      ticket: "Regular - Workshop",
      event: "Workshop Fotografi",
      date: "21 Oktober 2024",
      time: "09:15 WIB",
      status: "Dibatalkan",
      statusClass: "cancelled",
    },
  ];

  /* =====================================================
     FILTER TRANSAKSI
  ===================================================== */

  const filteredTransactions = transactions.filter((transaction) => {
    const keyword = search.toLowerCase();

    const matchesSearch =
      transaction.customer.toLowerCase().includes(keyword) ||
      transaction.id.toLowerCase().includes(keyword) ||
      transaction.event.toLowerCase().includes(keyword) ||
      transaction.ticket.toLowerCase().includes(keyword);

    const matchesStatus =
      filterStatus === "Semua" ||
      transaction.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  /* =====================================================
     DETAIL TRANSAKSI
  ===================================================== */

  const handleDetail = (transaction) => {
    navigate(`/eo/transaksi/${transaction.id}`);
  };

  /* =====================================================
     GANTI FILTER
  ===================================================== */

  const handleFilterChange = (status) => {
    setFilterStatus(status);
    setIsFilterOpen(false);
  };

  /* =====================================================
     TUTUP DROPDOWN SAAT KLIK DI LUAR
  ===================================================== */

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target)
      ) {
        setIsFilterOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  /* =====================================================
     ICON STATUS
  ===================================================== */

  const getStatusIcon = (status) => {
    if (status === "Lunas") {
      return "✓";
    }

    if (status === "Menunggu") {
      return "◷";
    }

    if (status === "Dibatalkan") {
      return "×";
    }

    return "☷";
  };

  return (
    <div className="transaksi-eo-page">

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <SidebarEO />

      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <main className="transaksi-eo-main">

        {/* NAVBAR */}
        <NavbarEO />

        {/* PAGE CONTENT */}
        <div className="transaksi-eo-content">

          {/* =================================================
              PAGE HEADER
          ================================================= */}

          <div className="transaksi-eo-header">
            <div>
              <h1>Transaksi</h1>

              <p>
                Kelola dan pantau seluruh transaksi event Anda.
              </p>
            </div>
          </div>

          {/* =================================================
              TRANSACTION CARD
          ================================================= */}

          <section className="transaction-card">

            {/* =================================================
                CARD HEADER
            ================================================= */}

            <div className="transaction-card-header">

              <div>
                <h2>Daftar Transaksi</h2>
              </div>

              <div className="transaction-tools">

                {/* =================================================
                    SEARCH
                ================================================= */}

                <div className="transaction-search">

                  <span>⌕</span>

                  <input
                    type="text"
                    placeholder="Cari transaksi..."
                    value={search}
                    onChange={(e) =>
                      setSearch(e.target.value)
                    }
                  />

                </div>

                {/* =================================================
                    CUSTOM FILTER
                ================================================= */}

                <div
                  className="transaction-filter-wrapper"
                  ref={filterRef}
                >

                  {/* FILTER BUTTON */}

                  <button
                    type="button"
                    className={`transaction-filter ${
                      isFilterOpen ? "active" : ""
                    }`}
                    onClick={() =>
                      setIsFilterOpen(!isFilterOpen)
                    }
                  >

                    <span className="filter-current-icon">
                      {getStatusIcon(filterStatus)}
                    </span>

                    <span className="filter-current-text">
                      {filterStatus}
                    </span>

                    <span
                      className={`filter-arrow ${
                        isFilterOpen ? "rotate" : ""
                      }`}
                    >
                      ▾
                    </span>

                  </button>

                  {/* =================================================
                      FILTER POPUP
                  ================================================= */}

                  {isFilterOpen && (
                    <div className="transaction-filter-popup">

                      <div className="filter-popup-title">
                        Filter Status
                      </div>

                      <div className="filter-options">

                        {/* SEMUA */}

                        <button
                          type="button"
                          className={`filter-option ${
                            filterStatus === "Semua"
                              ? "selected"
                              : ""
                          }`}
                          onClick={() =>
                            handleFilterChange("Semua")
                          }
                        >

                          <span className="filter-option-icon all">
                            ☷
                          </span>

                          <span className="filter-option-content">
                            <strong>Semua</strong>

                            <small>
                              Tampilkan semua transaksi
                            </small>
                          </span>

                          {filterStatus === "Semua" && (
                            <span className="filter-check">
                              ✓
                            </span>
                          )}

                        </button>

                        {/* LUNAS */}

                        <button
                          type="button"
                          className={`filter-option ${
                            filterStatus === "Lunas"
                              ? "selected"
                              : ""
                          }`}
                          onClick={() =>
                            handleFilterChange("Lunas")
                          }
                        >

                          <span className="filter-option-icon paid">
                            ✓
                          </span>

                          <span className="filter-option-content">
                            <strong>Lunas</strong>

                            <small>
                              Transaksi sudah dibayar
                            </small>
                          </span>

                          {filterStatus === "Lunas" && (
                            <span className="filter-check">
                              ✓
                            </span>
                          )}

                        </button>

                        {/* MENUNGGU */}

                        <button
                          type="button"
                          className={`filter-option ${
                            filterStatus === "Menunggu"
                              ? "selected"
                              : ""
                          }`}
                          onClick={() =>
                            handleFilterChange("Menunggu")
                          }
                        >

                          <span className="filter-option-icon pending">
                            ◷
                          </span>

                          <span className="filter-option-content">
                            <strong>Menunggu</strong>

                            <small>
                              Menunggu pembayaran
                            </small>
                          </span>

                          {filterStatus === "Menunggu" && (
                            <span className="filter-check">
                              ✓
                            </span>
                          )}

                        </button>

                        {/* DIBATALKAN */}

                        <button
                          type="button"
                          className={`filter-option ${
                            filterStatus === "Dibatalkan"
                              ? "selected"
                              : ""
                          }`}
                          onClick={() =>
                            handleFilterChange("Dibatalkan")
                          }
                        >

                          <span className="filter-option-icon cancelled">
                            ×
                          </span>

                          <span className="filter-option-content">
                            <strong>Dibatalkan</strong>

                            <small>
                              Transaksi dibatalkan
                            </small>
                          </span>

                          {filterStatus === "Dibatalkan" && (
                            <span className="filter-check">
                              ✓
                            </span>
                          )}

                        </button>

                      </div>
                    </div>
                  )}

                </div>

              </div>
            </div>

            {/* =================================================
                TRANSACTION LIST
            ================================================= */}

            <div className="transaction-list">

              {filteredTransactions.length > 0 ? (

                filteredTransactions.map((transaction) => (

                  <div
                    className="transaction-item"
                    key={transaction.id}
                  >

                    {/* =================================================
                        CUSTOMER
                    ================================================= */}

                    <div className="transaction-info">

                      <h3>
                        {transaction.customer}
                      </h3>

                      <p>
                        {transaction.ticket}
                      </p>

                      <strong>
                        ID TRANSAKSI: {transaction.id}
                      </strong>

                    </div>

                    {/* =================================================
                        EVENT
                    ================================================= */}

                    <div className="transaction-event">

                      <span>
                        Event
                      </span>

                      <p>
                        {transaction.event}
                      </p>

                      <small>
                        {transaction.date} •{" "}
                        {transaction.time}
                      </small>

                    </div>

                    {/* =================================================
                        STATUS + DETAIL
                    ================================================= */}

                    <div className="transaction-action">

                      {/* STATUS SELALU TAMPIL */}

                      <div className="transaction-status">

                        <span
                          className={`status-badge ${transaction.statusClass}`}
                        >
                          {transaction.status}
                        </span>

                      </div>

                      {/* DETAIL BUTTON */}

                      <button
                        type="button"
                        className="detail-transaction-button"
                        onClick={() =>
                          handleDetail(transaction)
                        }
                      >
                        Detail Transaksi
                      </button>

                    </div>

                  </div>

                ))

              ) : (

                /* =================================================
                   EMPTY STATE
                ================================================= */

                <div className="empty-transaction">

                  <div className="empty-icon">
                    ⌕
                  </div>

                  <h3>
                    Transaksi tidak ditemukan
                  </h3>

                  <p>
                    Coba gunakan kata kunci pencarian
                    yang berbeda.
                  </p>

                </div>

              )}

            </div>

          </section>

        </div>

      </main>

    </div>
  );
}

export default TransaksiEO;