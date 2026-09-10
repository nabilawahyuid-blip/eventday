import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../shared/Sidebar";
import Navbar from "../shared/Navbar";
import "./Transaksi.css";

function Transaksi() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [dateFilter, setDateFilter] = useState("Last 30 Days");

  const transactions = [
    {
      id: "#TRX-99821",
      customer: "John Doe",
      email: "john.doe@example.com",
      event: "Tech Conference 2024",
      amount: "Rp 1.500.000",
      status: "Paid",
      date: "24 Oct, 14:30",
      avatar: "JD",
    },
    {
      id: "#TRX-99820",
      customer: "Budi Santoso",
      email: "budi.s@example.com",
      event: "Music Festival: Sound of Nature",
      amount: "Rp 750.000",
      status: "Pending",
      date: "24 Oct, 13:15",
      avatar: "BS",
    },
    {
      id: "#TRX-99819",
      customer: "Siti Aminah",
      email: "siti.a@example.com",
      event: "Startup Pitching Workshop",
      amount: "Rp 250.000",
      status: "Failed",
      date: "24 Oct, 11:45",
      avatar: "SA",
    },
    {
      id: "#TRX-99818",
      customer: "Rina Melati",
      email: "rina.m@example.com",
      event: "Tech Conference 2024",
      amount: "Rp 3.000.000",
      status: "Paid",
      date: "24 Oct, 10:05",
      avatar: "RM",
    },
  ];

  const filteredTransactions = transactions.filter((transaction) => {
    const keyword = search.toLowerCase();

    const matchesSearch =
      transaction.id.toLowerCase().includes(keyword) ||
      transaction.customer.toLowerCase().includes(keyword) ||
      transaction.email.toLowerCase().includes(keyword) ||
      transaction.event.toLowerCase().includes(keyword);

    const matchesStatus =
      statusFilter === "All Status" ||
      transaction.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleExport = () => {
    console.log("Export transaksi");
  };

  return (
    <div className="transaction-page">

      {/* = SIDEBAR = */}
      <Sidebar />

      {/* = MAIN = */}
      <main className="transaction-main">

        {/* = NAVBAR = */}
        <Navbar />

        {/* = CONTENT = */}
        <section className="transaction-content">

          {/* PAGE HEADER */}
          <div className="transaction-header">

            <div>
              <h1>Transaksi</h1>

              <p>
                Kelola dan pantau semua transaksi platform.
              </p>
            </div>

            <div className="transaction-header-actions">

              <select
                className="date-filter"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              >
                <option>Last 30 Days</option>
                <option>Last 7 Days</option>
                <option>Today</option>
                <option>This Month</option>
              </select>

              <button
                type="button"
                className="export-button"
                onClick={handleExport}
              >
                <span>↓</span>
                Export
              </button>

            </div>

          </div>

          {/* = STATISTICS = */}
          <div className="transaction-statistics">

            {/* TOTAL REVENUE */}
            <div className="transaction-stat-card">

              <div className="stat-card-content">

                <span className="stat-title">
                  TOTAL REVENUE
                </span>

                <h2>
                  Rp 42.5M
                </h2>

                <p className="stat-positive">
                  ↗ +12.5% dari bulan lalu
                </p>

              </div>

              <div className="stat-icon revenue-icon">
                Rp
              </div>

            </div>

            {/* TRANSAKSI BERHASIL */}
            <div className="transaction-stat-card">

              <div className="stat-card-content">

                <span className="stat-title">
                  TRANSAKSI BERHASIL
                </span>

                <h2>
                  1,248
                </h2>

                <p className="stat-positive">
                  ↗ +5.2% dari bulan lalu
                </p>

              </div>

              <div className="stat-icon success-icon">
                ✓
              </div>

            </div>

            {/* PENDING / FAILED */}
            <div className="transaction-stat-card">

              <div className="stat-card-content">

                <span className="stat-title">
                  PENDING / FAILED
                </span>

                <h2>
                  42 / 12
                </h2>

                <p className="stat-negative">
                  ↘ -1.1% dari bulan lalu
                </p>

              </div>

              <div className="stat-icon warning-icon">
                !
              </div>

            </div>

          </div>

          {/* = TRANSACTION TABLE = */}
          <div className="transaction-panel">

            {/* TABLE TOOLBAR */}
            <div className="transaction-toolbar">

              <div className="transaction-search">

                <span className="search-icon">
                  ⌕
                </span>

                <input
                  type="text"
                  placeholder="Search by ID, Customer, or Event..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />

              </div>

              <div className="status-filters">

                <button
                  type="button"
                  className={
                    statusFilter === "All Status"
                      ? "status-filter active"
                      : "status-filter"
                  }
                  onClick={() => setStatusFilter("All Status")}
                >
                  All Status
                </button>

                <button
                  type="button"
                  className={
                    statusFilter === "Paid"
                      ? "status-filter active"
                      : "status-filter"
                  }
                  onClick={() => setStatusFilter("Paid")}
                >
                  Paid
                </button>

                <button
                  type="button"
                  className={
                    statusFilter === "Pending"
                      ? "status-filter active"
                      : "status-filter"
                  }
                  onClick={() => setStatusFilter("Pending")}
                >
                  Pending
                </button>

                <button
                  type="button"
                  className={
                    statusFilter === "Failed"
                      ? "status-filter active"
                      : "status-filter"
                  }
                  onClick={() => setStatusFilter("Failed")}
                >
                  Failed
                </button>

              </div>

            </div>

            {/* TABLE */}
            <div className="transaction-table-wrapper">

              <table className="transaction-table">

                <thead>
                  <tr>
                    <th>TRANSACTION ID</th>
                    <th>CUSTOMER</th>
                    <th>EVENT NAME</th>
                    <th>AMOUNT</th>
                    <th>STATUS / DATE</th>
                  </tr>
                </thead>

                <tbody>

                  {filteredTransactions.length > 0 ? (

                    filteredTransactions.map((transaction) => (

                      <tr key={transaction.id}>

                        {/* TRANSACTION ID */}
                        <td>
                          <button
                            type="button"
                            className="transaction-id"
                            onClick={() =>
                              console.log(
                                "Detail transaksi:",
                                transaction.id
                              )
                            }
                          >
                            {transaction.id}
                          </button>
                        </td>

                        {/* CUSTOMER */}
                        <td>

                          <div className="customer-info">

                            <div className="customer-avatar">
                              {transaction.avatar}
                            </div>

                            <div>
                              <strong>
                                {transaction.customer}
                              </strong>

                              <span>
                                {transaction.email}
                              </span>
                            </div>

                          </div>

                        </td>

                        {/* EVENT */}
                        <td>
                          <span className="event-name">
                            {transaction.event}
                          </span>
                        </td>

                        {/* AMOUNT */}
                        <td>
                          <span className="amount">
                            {transaction.amount}
                          </span>
                        </td>

                        {/* STATUS */}
                        <td>

                          <div className="status-date">

                            <span
                              className={`transaction-status ${transaction.status.toLowerCase()}`}
                            >
                              <span className="status-dot">
                                ●
                              </span>

                              {transaction.status}
                            </span>

                            <span className="transaction-date">
                              {transaction.date}
                            </span>

                          </div>

                        </td>

                      </tr>

                    ))

                  ) : (

                    <tr>

                      <td
                        colSpan="5"
                        className="empty-transaction"
                      >
                        Tidak ada transaksi ditemukan.
                      </td>

                    </tr>

                  )}

                </tbody>

              </table>

            </div>

            {/* = TABLE FOOTER = */}
            <div className="transaction-footer">

              <span>
                Showing 1 to {filteredTransactions.length} of 1,290 results
              </span>

              <div className="pagination">

                <button
                  type="button"
                  className="pagination-arrow"
                >
                  ‹
                </button>

                <button
                  type="button"
                  className="pagination-number active"
                >
                  1
                </button>

                <button
                  type="button"
                  className="pagination-number"
                >
                  2
                </button>

                <button
                  type="button"
                  className="pagination-number"
                >
                  3
                </button>

                <span className="pagination-dots">
                  ...
                </span>

                <button
                  type="button"
                  className="pagination-number"
                >
                  10
                </button>

                <button
                  type="button"
                  className="pagination-arrow"
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

export default Transaksi;