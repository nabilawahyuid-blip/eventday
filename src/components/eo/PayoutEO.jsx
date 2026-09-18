import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Search,
  Wallet,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import SidebarEO from "../shared/SidebarEO";
import NavbarEO from "../shared/NavbarEO";

import { getOrganizerPayouts } from "../../services/organizerPayoutService";

import "./PayoutEO.css";

function PayoutEO() {
  const navigate = useNavigate();

  // =========================================
  // STATE
  // =========================================

  const [search, setSearch] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  const [payoutData, setPayoutData] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // Jumlah data per halaman
  const itemsPerPage = 4;

  // =========================================
  // FORMAT RUPIAH
  // =========================================

  const formatRupiah = (amount) => {
    return new Intl.NumberFormat("id-ID").format(
      Number(amount || 0)
    );
  };

  // =========================================
  // FORMAT TANGGAL
  // =========================================

  const formatDate = (date) => {
    if (!date) {
      return {
        date: "-",
        time: "-",
      };
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return {
        date: "-",
        time: "-",
      };
    }

    return {
      date: parsedDate.toLocaleDateString(
        "id-ID",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      ),

      time: parsedDate.toLocaleTimeString(
        "id-ID",
        {
          hour: "2-digit",
          minute: "2-digit",
        }
      ) + " WIB",
    };
  };

  // =========================================
  // STATUS LABEL
  // =========================================

  const getStatusLabel = (status) => {
    const normalizedStatus = String(
      status || ""
    ).toUpperCase();

    switch (normalizedStatus) {
      case "SUCCESS":
      case "COMPLETED":
      case "PAID":
        return "Success";

      case "PENDING":
      case "PENDING_APPROVAL":
      case "WAITING":
      case "PROCESSING":
        return "Pending";

      case "REJECTED":
      case "DENIED":
      case "FAILED":
        return "Rejected";

      default:
        return status || "-";
    }
  };

  // =========================================
  // STATUS CLASS
  // =========================================

  const getStatusClass = (status) => {
    const normalizedStatus = String(
      status || ""
    ).toUpperCase();

    switch (normalizedStatus) {
      case "SUCCESS":
      case "COMPLETED":
      case "PAID":
        return "success";

      case "REJECTED":
      case "DENIED":
      case "FAILED":
        return "rejected";

      default:
        return "pending";
    }
  };

  // =========================================
  // GET PAYOUT DATA
  // =========================================

  const fetchPayouts = async () => {
    try {
      setLoading(true);

      setError("");

      const response =
        await getOrganizerPayouts();

      console.log(
        "PAYOUT RESPONSE:",
        response
      );

      const data = response?.data || [];

      setPayoutData(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (err) {
      console.error(
        "Gagal mengambil riwayat payout:",
        err
      );

      setPayoutData([]);

      setError(
        err?.message ||
          "Gagal mengambil data payout."
      );

    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // LOAD SAAT PAGE DIBUKA
  // =========================================

  useEffect(() => {
    fetchPayouts();
  }, []);

  // =========================================
  // SEARCH
  // =========================================

  const filteredData = payoutData.filter(
    (item) => {
      const keyword =
        search.toLowerCase().trim();

      if (!keyword) {
        return true;
      }

      const payoutId = String(
        item.payout_id ||
          item.id ||
          ""
      ).toLowerCase();

      const bankName = String(
        item.bank_name ||
          ""
      ).toLowerCase();

      const status = String(
        getStatusLabel(
          item.status
        )
      ).toLowerCase();

      const amount = String(
        item.amount || ""
      ).toLowerCase();

      const accountNumber =
        String(
          item.account_number ||
            ""
        ).toLowerCase();

      return (
        payoutId.includes(keyword) ||
        bankName.includes(keyword) ||
        status.includes(keyword) ||
        amount.includes(keyword) ||
        accountNumber.includes(keyword)
      );
    }
  );

  // =========================================
  // PAGINATION
  // =========================================

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredData.length /
        itemsPerPage
    )
  );

  // Kalau search membuat page sekarang
  // lebih besar dari total page
  useEffect(() => {
    if (
      currentPage >
      totalPages
    ) {
      setCurrentPage(totalPages);
    }
  }, [
    currentPage,
    totalPages,
  ]);

  const startIndex =
    (currentPage - 1) *
    itemsPerPage;

  const endIndex =
    startIndex +
    itemsPerPage;

  const currentData =
    filteredData.slice(
      startIndex,
      endIndex
    );

  // =========================================
  // HANDLE SEARCH
  // =========================================

  const handleSearch = (e) => {
    setSearch(e.target.value);

    setCurrentPage(1);
  };

  // =========================================
  // PAGINATION NEXT
  // =========================================

  const handleNextPage = () => {
    if (
      currentPage <
      totalPages
    ) {
      setCurrentPage(
        currentPage + 1
      );
    }
  };

  // =========================================
  // PAGINATION PREVIOUS
  // =========================================

  const handlePreviousPage = () => {
    if (
      currentPage > 1
    ) {
      setCurrentPage(
        currentPage - 1
      );
    }
  };

  // =========================================
  // NAVIGATE PENGAJUAN PAYOUT
  // =========================================

  const handleApplyPayout = () => {
    navigate(
      "/eo/payout/pengajuan"
    );
  };

  // =========================================
  // RENDER
  // =========================================

  return (
    <div className="payout-eo-page">

      {/* =====================================
          SIDEBAR
      ===================================== */}

      <SidebarEO />

      {/* =====================================
          MAIN
      ===================================== */}

      <main className="payout-eo-main">

        {/* =====================================
            NAVBAR
        ===================================== */}

        <NavbarEO />

        <div className="payout-eo-content">

          {/* =====================================
              PAGE HEADER
          ===================================== */}

          <div className="payout-page-header">

            <h1>
              Payout
            </h1>

            <button
              type="button"
              className="apply-payout-btn"
              onClick={
                handleApplyPayout
              }
            >

              <span className="apply-plus">
                +
              </span>

              <span>
                Ajukan Payout
              </span>

            </button>

          </div>

          {/* =====================================
              LIST HEADER
          ===================================== */}

          <div className="payout-list-header">

            <h3>
              Daftar Riwayat Payout
            </h3>

            <div className="payout-search">

              <Search
                size={18}
                strokeWidth={2}
              />

              <input
                type="text"
                placeholder="Cari payout..."
                value={search}
                onChange={
                  handleSearch
                }
              />

            </div>

          </div>

          {/* =====================================
              ERROR
          ===================================== */}

          {error && (
            <div
              style={{
                marginBottom:
                  "15px",
                padding:
                  "12px 15px",
                borderRadius:
                  "8px",
                background:
                  "#fff0f0",
                color:
                  "#c62828",
                fontSize:
                  "12px",
              }}
            >
              {error}
            </div>
          )}

          {/* =====================================
              TABLE CARD
          ===================================== */}

          <section className="payout-table-card">

            <div className="payout-table-wrapper">

              <table className="payout-table">

                {/* =================================
                    TABLE HEADER
                ================================= */}

                <thead>

                  <tr>

                    <th>
                      REQUEST ID
                    </th>

                    <th>
                      DATE
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
                      PROCESSED
                    </th>

                    <th>
                      STATUS
                    </th>

                  </tr>

                </thead>

                {/* =================================
                    TABLE BODY
                ================================= */}

                <tbody>

                  {/* LOADING */}

                  {loading && (
                    <tr>

                      <td
                        colSpan="6"
                        className="empty-payout"
                      >
                        Memuat riwayat
                        payout...
                      </td>

                    </tr>
                  )}

                  {/* EMPTY */}

                  {!loading &&
                    currentData.length ===
                      0 && (
                      <tr>

                        <td
                          colSpan="6"
                          className="empty-payout"
                        >

                          <Wallet
                            size={28}
                          />

                          <span>
                            {search
                              ? "Data payout tidak ditemukan"
                              : "Belum ada riwayat payout"}
                          </span>

                        </td>

                      </tr>
                    )}

                  {/* DATA */}

                  {!loading &&
                    currentData.map(
                      (item) => {

                        const requestId =
                          item.payout_id ||
                          item.id ||
                          "-";

                        const requestedDate =
                          formatDate(
                            item.requested_at
                          );

                        const processedDate =
                          formatDate(
                            item.processed_at
                          );

                        const statusLabel =
                          getStatusLabel(
                            item.status
                          );

                        const statusClass =
                          getStatusClass(
                            item.status
                          );

                        return (
                          <tr
                            key={
                              requestId
                            }
                          >

                            {/* ==================
                                REQUEST ID
                            ================== */}

                            <td>

                              <div className="request-id">

                                {requestId}

                              </div>

                            </td>

                            {/* ==================
                                DATE
                            ================== */}

                            <td>

                              <div className="date-wrapper">

                                <span>
                                  {
                                    requestedDate.date
                                  }
                                </span>

                                <small>
                                  {
                                    requestedDate.time
                                  }
                                </small>

                              </div>

                            </td>

                            {/* ==================
                                AMOUNT
                            ================== */}

                            <td>

                              <div className="amount-wrapper">

                                <span className="currency">
                                  Rp
                                </span>

                                <span>
                                  {formatRupiah(
                                    item.amount
                                  )}
                                </span>

                              </div>

                            </td>

                            {/* ==================
                                BANK
                            ================== */}

                            <td>

                              <div className="bank-wrapper">

                                <div className="bank-logo">

                                  {item.bank_name ||
                                    "-"}

                                </div>

                                <div className="bank-account">

                                  <span>
                                    ****
                                  </span>

                                  <span>
                                    {item.account_number
                                      ? item.account_number.slice(
                                          -4
                                        )
                                      : "-"}
                                  </span>

                                </div>

                              </div>

                            </td>

                            {/* ==================
                                PROCESSED
                            ================== */}

                            <td>

                              <div className="date-wrapper">

                                <span>
                                  {
                                    processedDate.date
                                  }
                                </span>

                                <small>
                                  {
                                    processedDate.time
                                  }
                                </small>

                              </div>

                            </td>

                            {/* ==================
                                STATUS
                            ================== */}

                            <td>

                              <span
                                className={`payout-status ${statusClass}`}
                              >

                                <span className="status-dot"></span>

                                {
                                  statusLabel
                                }

                              </span>

                            </td>

                          </tr>
                        );
                      }
                    )}

                </tbody>

              </table>

            </div>

            {/* =====================================
                FOOTER
            ===================================== */}

            <div className="payout-table-footer">

              {/* ENTRY INFO */}

              <span className="entry-info">

                {filteredData.length ===
                0
                  ? "Showing 0 entries"
                  : `Showing ${
                      startIndex + 1
                    } to ${
                      Math.min(
                        endIndex,
                        filteredData.length
                      )
                    } of ${
                      filteredData.length
                    } entries`}

              </span>

              {/* PAGINATION */}

              <div className="pagination">

                {/* PREVIOUS */}

                <button
                  type="button"
                  className="pagination-arrow"
                  onClick={
                    handlePreviousPage
                  }
                  disabled={
                    currentPage ===
                    1
                  }
                >

                  <ChevronLeft
                    size={16}
                  />

                </button>

                {/* PAGE NUMBERS */}

                {Array.from(
                  {
                    length:
                      totalPages,
                  },
                  (_, index) => {
                    const page =
                      index + 1;

                    return (
                      <button
                        key={page}
                        type="button"
                        className={
                          currentPage ===
                          page
                            ? "pagination-number active"
                            : "pagination-number"
                        }
                        onClick={() =>
                          setCurrentPage(
                            page
                          )
                        }
                      >
                        {page}
                      </button>
                    );
                  }
                )}

                {/* NEXT */}

                <button
                  type="button"
                  className="pagination-arrow"
                  onClick={
                    handleNextPage
                  }
                  disabled={
                    currentPage ===
                    totalPages
                  }
                >

                  <ChevronRight
                    size={16}
                  />

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