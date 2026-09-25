// src/pages/TransaksiEO.jsx

import React, { useEffect, useState } from "react";
import { Search, Receipt } from "lucide-react";
import { useNavigate } from "react-router-dom";

import SidebarEO from "../shared/SidebarEO";
import NavbarEO from "../shared/NavbarEO";

// Menggunakan service yang sama dengan DashboardEO
import { getOrganizerRecentTransactions } from "../../services/organizerDashboardService";

import "./TransaksiEO.css";

function TransaksiEO() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // FORMAT HELPER
  // =====================================================

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(Number(value) || 0);
  };

  const getTransactionStatusClass = (status) => {
    const normalized = String(status || "").toUpperCase();

    if (
      normalized === "SUCCESS" ||
      normalized === "PAID" ||
      normalized === "COMPLETED" ||
      normalized === "LUNAS"
    ) {
      return "status-lunas";
    }

    if (
      normalized === "PENDING" ||
      normalized === "WAITING_PAYMENT" ||
      normalized === "MENUNGGU"
    ) {
      return "status-menunggu";
    }

    if (
      normalized === "FAILED" ||
      normalized === "CANCELLED" ||
      normalized === "DIBATALKAN"
    ) {
      return "status-dibatalkan";
    }

    return "status-menunggu";
  };

  const getTransactionStatusLabel = (status) => {
    const normalized = String(status || "").toUpperCase();

    switch (normalized) {
      case "SUCCESS":
      case "PAID":
      case "COMPLETED":
      case "LUNAS":
        return "Lunas";

      case "PENDING":
      case "WAITING_PAYMENT":
      case "MENUNGGU":
        return "Menunggu";

      case "FAILED":
      case "CANCELLED":
      case "DIBATALKAN":
        return "Dibatalkan";

      default:
        return status || "-";
    }
  };

  // =====================================================
  // GET TRANSAKSI EO
  // =====================================================

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getOrganizerRecentTransactions();

        console.log("Response transaksi EO:", response);

        setTransactions(
          Array.isArray(response?.data) ? response.data : []
        );
      } catch (err) {
        console.error("Gagal mengambil transaksi EO:", err);
        setError(
          err?.message || "Gagal mengambil data transaksi."
        );
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  // =====================================================
  // FILTER SEARCH
  // =====================================================

  const filteredTransactions = transactions.filter((item) => {
    const keyword = search.toLowerCase();

    return (
      String(item?.order_id ?? "")
        .toLowerCase()
        .includes(keyword) ||
      String(item?.event_title ?? "")
        .toLowerCase()
        .includes(keyword) ||
      String(item?.status ?? "")
        .toLowerCase()
        .includes(keyword) ||
      String(item?.amount ?? "")
        .toLowerCase()
        .includes(keyword)
    );
  });

  // =====================================================
  // DETAIL TRANSAKSI
  // =====================================================

  const handleDetailTransaction = (orderId) => {
    if (!orderId) {
      return;
    }
    navigate(`/eo/transaksi/${orderId}`);
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
              LIST HEADER & SEARCH
          ================================================= */}
          <div className="transaksi-list-header">
            <h2>Daftar Transaksi</h2>

            <div className="transaksi-search">
              <Search size={18} strokeWidth={2} />
              <input
                type="text"
                placeholder="Cari transaksi..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* =================================================
              TRANSACTION LIST
          ================================================= */}
          <section className="transaksi-list">
            {/* LOADING */}
            {loading ? (
              <div className="empty-transaksi">
                <span>Memuat data transaksi...</span>
              </div>
            ) : error ? (
              /* ERROR */
              <div className="empty-transaksi">
                <Receipt size={30} strokeWidth={1.8} />
                <span>{error}</span>
              </div>
            ) : filteredTransactions.length > 0 ? (
              /* DATA LIST */
              filteredTransactions.map((item, index) => {
                const orderId = item?.order_id || item?.id;

                return (
                  <div
                    className="transaksi-card"
                    key={orderId || index}
                  >
                    {/* LEFT INFORMATION */}
                    <div className="transaksi-card-info">
                      <h3>
                        {item?.event_title ||
                          item?.customer ||
                          "Event"}
                      </h3>

                      <p>
                        {formatCurrency(item?.amount || 0)}
                      </p>

                      <strong>
                        ORDER ID: {orderId || "-"}
                      </strong>
                    </div>

                    {/* RIGHT INFORMATION & ACTIONS */}
                    <div className="transaksi-card-actions">
                      <span
                        className={`transaksi-status ${getTransactionStatusClass(
                          item?.status
                        )}`}
                      >
                        <span className="status-dot" />
                        {getTransactionStatusLabel(item?.status)}
                      </span>

                      <button
                        type="button"
                        className="detail-transaksi-button"
                        onClick={() => handleDetailTransaction(orderId)}
                      >
                        Detail Transaksi
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              /* EMPTY STATE */
              <div className="empty-transaksi">
                <Receipt size={30} strokeWidth={1.8} />
                <span>
                  {search
                    ? "Data transaksi tidak ditemukan"
                    : "Belum ada transaksi"}
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