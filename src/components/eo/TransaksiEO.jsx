// src/pages/TransaksiEO.jsx

import React, { useState } from "react";
import { Search, Receipt } from "lucide-react";

import SidebarEO from "../shared/SidebarEO";
import NavbarEO from "../shared/NavbarEO";

import "./TransaksiEO.css";

function TransaksiEO() {
  const [search, setSearch] = useState("");

  // =====================================================
  // DATA TRANSAKSI
  // =====================================================

  const transactionData = [
    {
      id: "TRX-9921",
      customer: "Nama Customer",
      ticket: "Tiket Yang Dipesan",
      status: "Lunas",
    },
    {
      id: "TRX-9922",
      customer: "Nama Customer",
      ticket: "Tiket Yang Dipesan",
      status: "Lunas",
    },
    {
      id: "TRX-9923",
      customer: "Nama Customer 2",
      ticket: "Tiket Yang Dipesan",
      status: "Menunggu",
    },
    {
      id: "TRX-9924",
      customer: "Nama Customer 3",
      ticket: "Tiket Yang Dipesan",
      status: "Dibatalkan",
    },
    {
      id: "TRX-9925",
      customer: "Nama Customer 3",
      ticket: "Tiket Yang Dipesan",
      status: "Dibatalkan",
    },
  ];

  // =====================================================
  // FILTER SEARCH
  // =====================================================

  const filteredTransactions = transactionData.filter((item) => {
    const keyword = search.toLowerCase();

    return (
      item.id.toLowerCase().includes(keyword) ||
      item.customer.toLowerCase().includes(keyword) ||
      item.ticket.toLowerCase().includes(keyword) ||
      item.status.toLowerCase().includes(keyword)
    );
  });

  // =====================================================
  // DETAIL TRANSAKSI
  // =====================================================

  const handleDetailTransaction = (id) => {
    console.log("Detail transaksi:", id);

    // Nanti bisa diarahkan ke:
    // navigate(`/eo/transaksi/${id}`);
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="transaksi-eo-page">

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <SidebarEO />


      {/* =================================================
          MAIN
      ================================================= */}

      <main className="transaksi-eo-main">

        {/* =================================================
            NAVBAR
        ================================================= */}

        <NavbarEO />


        {/* =================================================
            CONTENT
        ================================================= */}

        <div className="transaksi-eo-content">

          {/* =================================================
              PAGE HEADER
          ================================================= */}

          <div className="transaksi-page-header">

            <h1>Transaksi</h1>

          </div>


          {/* =================================================
              LIST HEADER
          ================================================= */}

          <div className="transaksi-list-header">

            <h2>Daftar Transaksi</h2>

            <div className="transaksi-search">

              <Search
                size={18}
                strokeWidth={2}
              />

              <input
                type="text"
                placeholder="Cari transaksi..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                }}
              />

            </div>

          </div>


          {/* =================================================
              TRANSACTION LIST
          ================================================= */}

          <section className="transaksi-list">

            {filteredTransactions.length > 0 ? (

              filteredTransactions.map((item) => (

                <div
                  className="transaksi-card"
                  key={item.id}
                >

                  {/* =========================================
                      LEFT INFORMATION
                  ========================================= */}

                  <div className="transaksi-card-info">

                    <h3>
                      {item.customer}
                    </h3>

                    <p>
                      {item.ticket}
                    </p>

                    <strong>
                      ID TRANSAKSI: {item.id}
                    </strong>

                  </div>


                  {/* =========================================
                      RIGHT INFORMATION
                  ========================================= */}

                  <div className="transaksi-card-actions">

                    {/* STATUS */}

                    <span
                      className={`transaksi-status ${
                        item.status === "Lunas"
                          ? "status-lunas"
                          : item.status === "Menunggu"
                          ? "status-menunggu"
                          : "status-dibatalkan"
                      }`}
                    >

                      <span className="status-dot"></span>

                      {item.status}

                    </span>


                    {/* DETAIL BUTTON */}

                    <button
                      type="button"
                      className="detail-transaksi-button"
                      onClick={() =>
                        handleDetailTransaction(item.id)
                      }
                    >
                      Detail Transaksi
                    </button>

                  </div>

                </div>

              ))

            ) : (

              /* =========================================
                  EMPTY STATE
              ========================================= */

              <div className="empty-transaksi">

                <Receipt
                  size={30}
                  strokeWidth={1.8}
                />

                <span>
                  Data transaksi tidak ditemukan
                </span>

              </div>

            )}

          </section>

        </div>

      </main>

    </div>
  );
}

export default TransaksiEO;