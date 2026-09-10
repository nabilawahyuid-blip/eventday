import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SidebarEO from "../shared/SidebarEO";
import NavbarEO from "../shared/NavbarEO";
import "./TransaksiEO.css";

function TransaksiEO() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua");

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

  // ======
  // FILTER
  // ======

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

  // ======
  // DETAIL TRANSAKSI
  // ======

  const handleDetail = (transaction) => {
    navigate(`/eo/transaksi/${transaction.id}`);
  };

  return (
    <div className="transaksi-eo-page">

      {/* =
           SIDEBAR
       = */}

      <SidebarEO />

      {/* =
           MAIN CONTENT
       = */}

      <main className="transaksi-eo-main">

        {/* NAVBAR */}

        <NavbarEO />

        {/* =
            PAGE CONTENT
        = */}

        <div className="transaksi-eo-content">

          {/* PAGE HEADER */}

          <div className="transaksi-eo-header">

            <div>
              <h1>
                Transaksi
              </h1>

              <p>
                Kelola dan pantau seluruh transaksi event Anda.
              </p>
            </div>

          </div>

          {/* =
              TRANSACTION LIST
          = */}

          <section className="transaction-card">

            <div className="transaction-card-header">

              <div>
                <h2>
                  Daftar Transaksi
                </h2>
              </div>

              <div className="transaction-tools">

                {/* SEARCH */}

                <div className="transaction-search">

                  <span>
                    ⌕
                  </span>

                  <input
                    type="text"
                    placeholder="Cari transaksi..."
                    value={search}
                    onChange={(e) =>
                      setSearch(e.target.value)
                    }
                  />

                </div>

                {/* FILTER */}

                <div className="transaction-filter-wrapper">

                  <select
                    value={filterStatus}
                    onChange={(e) =>
                      setFilterStatus(e.target.value)
                    }
                    className="transaction-filter"
                  >
                    <option value="Semua">
                      Semua
                    </option>

                    <option value="Lunas">
                      Lunas
                    </option>

                    <option value="Menunggu">
                      Menunggu
                    </option>

                    <option value="Dibatalkan">
                      Dibatalkan
                    </option>

                  </select>

                </div>

              </div>

            </div>

            {/* =
                TRANSACTION ITEMS
            = */}

            <div className="transaction-list">

              {filteredTransactions.length > 0 ? (

                filteredTransactions.map((transaction) => (

                  <div
                    className="transaction-item"
                    key={transaction.id}
                  >

                    {/* CUSTOMER */}

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

                    {/* EVENT */}

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

                    {/* STATUS */}

                    <div className="transaction-status">

                      <span
                        className={`status-badge ${transaction.statusClass}`}
                      >
                        {transaction.status}
                      </span>

                    </div>

                    {/* ACTION */}

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

                ))

              ) : (

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