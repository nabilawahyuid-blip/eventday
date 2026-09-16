// src/pages/PayoutEO.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Search,
  Wallet,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import SidebarEO from "../shared/SidebarEO";
import NavbarEO from "../shared/NavbarEO";

import "./PayoutEO.css";

function PayoutEO() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // =====================================================
  // DATA DUMMY PAYOUT
  // =====================================================

  const payoutData = [
    {
      id: "#PO-2023-0891",
      date: "Oct 24, 2023",
      time: "14:30 WIB",
      organizer: "Jakarta Music Fest",
      amount: 45500000,
      bank: "BCA",
      account: "4567",
      status: "Success",
    },
    {
      id: "#PO-2023-0892",
      date: "Oct 25, 2023",
      time: "09:15 WIB",
      organizer: "Tech Conference 24",
      amount: 12000000,
      bank: "MDR",
      account: "8891",
      status: "Pending",
    },
    {
      id: "#PO-2023-0885",
      date: "Oct 22, 2023",
      time: "16:45 WIB",
      organizer: "Local Art Expo",
      amount: 8750000,
      bank: "BNI",
      account: "3321",
      status: "Success",
    },
    {
      id: "#PO-2023-0870",
      date: "Oct 20, 2023",
      time: "10:00 WIB",
      organizer: "Indie Rock Night",
      amount: 22000000,
      bank: "BCA",
      account: "9900",
      status: "Rejected",
    },
  ];

  // =====================================================
  // SEARCH FILTER
  // =====================================================

  const filteredData = payoutData.filter((item) => {
    const keyword = search.toLowerCase();

    return (
      item.id.toLowerCase().includes(keyword) ||
      item.organizer.toLowerCase().includes(keyword) ||
      item.bank.toLowerCase().includes(keyword) ||
      item.status.toLowerCase().includes(keyword)
    );
  });

  // =====================================================
  // FORMAT RUPIAH
  // =====================================================

  const formatRupiah = (amount) => {
    return new Intl.NumberFormat("id-ID").format(amount);
  };

  // =====================================================
  // NAVIGATE KE HALAMAN PENGAJUAN PAYOUT
  // =====================================================

  const handleApplyPayout = () => {
    navigate("/eo/payout/pengajuan");
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="payout-eo-page">

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <SidebarEO />

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="payout-eo-main">

        {/* =================================================
            NAVBAR
        ================================================= */}

        <NavbarEO />

        <div className="payout-eo-content">

          {/* =================================================
              PAGE HEADER
          ================================================= */}

          <div className="payout-page-header">

            <h1>Payout</h1>

            <button
              type="button"
              className="apply-payout-btn"
              onClick={handleApplyPayout}
            >
              <span className="apply-plus">+</span>
              <span>Ajukan Payout</span>
            </button>

          </div>

          {/* =================================================
              LIST HEADER
          ================================================= */}

          <div className="payout-list-header">

            <h3>Daftar Riwayat Payout</h3>

            <div className="payout-search">

              <Search
                size={18}
                strokeWidth={2}
              />

              <input
                type="text"
                placeholder="Cari payout..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />

            </div>

          </div>

          {/* =================================================
              PAYOUT TABLE CARD
          ================================================= */}

          <section className="payout-table-card">

            {/* =================================================
                TABLE
            ================================================= */}

            <div className="payout-table-wrapper">

              <table className="payout-table">

                {/* =========================
                    TABLE HEADER
                ========================= */}

                <thead>

                  <tr>

                    <th>
                      REQUEST ID
                    </th>

                    <th>
                      DATE
                    </th>

                    <th>
                      ORGANIZER
                    </th>

                    <th>
                      AMOUNT (IDR)
                    </th>

                    <th>
                      BANK
                      <br />
                      ACCOUNT
                    </th>

                    <th>
                      STATUS
                    </th>

                  </tr>

                </thead>

                {/* =========================
                    TABLE BODY
                ========================= */}

                <tbody>

                  {filteredData.length > 0 ? (

                    filteredData.map((item) => (

                      <tr key={item.id}>

                        {/* =========================
                            REQUEST ID
                        ========================= */}

                        <td>

                          <div className="request-id">
                            {item.id}
                          </div>

                        </td>

                        {/* =========================
                            DATE
                        ========================= */}

                        <td>

                          <div className="date-wrapper">

                            <span>
                              {item.date}
                            </span>

                            <small>
                              {item.time}
                            </small>

                          </div>

                        </td>

                        {/* =========================
                            ORGANIZER
                        ========================= */}

                        <td>

                          <div className="organizer-name">
                            {item.organizer}
                          </div>

                        </td>

                        {/* =========================
                            AMOUNT
                        ========================= */}

                        <td>

                          <div className="amount-wrapper">

                            <span className="currency">
                              Rp
                            </span>

                            <span>
                              {formatRupiah(item.amount)}
                            </span>

                          </div>

                        </td>

                        {/* =========================
                            BANK
                        ========================= */}

                        <td>

                          <div className="bank-wrapper">

                            <div className="bank-logo">
                              {item.bank}
                            </div>

                            <div className="bank-account">

                              <span>
                                ****
                              </span>

                              <span>
                                {item.account}
                              </span>

                            </div>

                          </div>

                        </td>

                        {/* =========================
                            STATUS
                        ========================= */}

                        <td>

                          <span
                            className={`payout-status ${item.status.toLowerCase()}`}
                          >

                            <span className="status-dot"></span>

                            {item.status}

                          </span>

                        </td>

                      </tr>

                    ))

                  ) : (

                    /* =========================
                       EMPTY DATA
                    ========================= */

                    <tr>

                      <td
                        colSpan="6"
                        className="empty-payout"
                      >

                        <Wallet size={28} />

                        <span>
                          Data payout tidak ditemukan
                        </span>

                      </td>

                    </tr>

                  )}

                </tbody>

              </table>

            </div>

            {/* =================================================
                TABLE FOOTER
            ================================================= */}

            <div className="payout-table-footer">

              {/* =========================
                  ENTRY INFO
              ========================= */}

              <span className="entry-info">
                Showing 1 to {filteredData.length} of 48 entries
              </span>

              {/* =========================
                  PAGINATION
              ========================= */}

              <div className="pagination">

                {/* PREVIOUS */}

                <button
                  type="button"
                  className="pagination-arrow"
                  onClick={() =>
                    setCurrentPage(
                      Math.max(
                        1,
                        currentPage - 1
                      )
                    )
                  }
                  disabled={currentPage === 1}
                >

                  <ChevronLeft size={16} />

                </button>

                {/* PAGE 1 */}

                <button
                  type="button"
                  className={
                    currentPage === 1
                      ? "pagination-number active"
                      : "pagination-number"
                  }
                  onClick={() =>
                    setCurrentPage(1)
                  }
                >
                  1
                </button>

                {/* PAGE 2 */}

                <button
                  type="button"
                  className={
                    currentPage === 2
                      ? "pagination-number active"
                      : "pagination-number"
                  }
                  onClick={() =>
                    setCurrentPage(2)
                  }
                >
                  2
                </button>

                {/* PAGE 3 */}

                <button
                  type="button"
                  className={
                    currentPage === 3
                      ? "pagination-number active"
                      : "pagination-number"
                  }
                  onClick={() =>
                    setCurrentPage(3)
                  }
                >
                  3
                </button>

                {/* DOTS */}

                <span className="pagination-dots">
                  ...
                </span>

                {/* NEXT */}

                <button
                  type="button"
                  className="pagination-arrow"
                  onClick={() =>
                    setCurrentPage(
                      currentPage + 1
                    )
                  }
                >

                  <ChevronRight size={16} />

                </button>

              </div>

            </div>

          </section>

        </div>

      </main>

    </div>
  );
}

export default PayoutEO;