// src/pages/TransaksiEO.jsx

import React, { useEffect, useState } from "react";
import { Search, Receipt } from "lucide-react";

import SidebarEO from "../shared/SidebarEO";
import NavbarEO from "../shared/NavbarEO";
import { getOrganizerRecentTransactions } from "../../services/organizerTransactionService";

import "./TransaksiEO.css";

function TransaksiEO() {
  const [search, setSearch] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
      String(item?.id ?? "")
        .toLowerCase()
        .includes(keyword) ||
      String(item?.customer ?? "")
        .toLowerCase()
        .includes(keyword) ||
      String(item?.ticket ?? "")
        .toLowerCase()
        .includes(keyword) ||
      String(item?.status ?? "")
        .toLowerCase()
        .includes(keyword)
    );
  });

  // =====================================================
  // DETAIL TRANSAKSI
  // =====================================================

  const handleDetailTransaction = (id) => {
    console.log("Detail transaksi:", id);

    // Nanti kalau endpoint detail sudah tersedia:
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
            {/* LOADING */}

            {loading ? (
              <div className="empty-transaksi">
                <span>Memuat data transaksi...</span>
              </div>
            ) : error ? (
              /* ERROR */

              <div className="empty-transaksi">
                <Receipt
                  size={30}
                  strokeWidth={1.8}
                />

                <span>{error}</span>
              </div>
            ) : filteredTransactions.length > 0 ? (
              /* DATA */

              filteredTransactions.map((item, index) => {
                const status = String(
                  item?.status ?? ""
                );

                let statusClass = "status-dibatalkan";

                if (
                  status.toLowerCase() === "lunas" ||
                  status.toLowerCase() === "paid" ||
                  status.toLowerCase() === "success" ||
                  status.toLowerCase() === "berhasil"
                ) {
                  statusClass = "status-lunas";
                } else if (
                  status.toLowerCase() === "menunggu" ||
                  status.toLowerCase() === "pending" ||
                  status.toLowerCase() === "waiting_payment"
                ) {
                  statusClass = "status-menunggu";
                }

                return (
                  <div
                    className="transaksi-card"
                    key={item?.id ?? index}
                  >
                    {/* =========================================
                        LEFT INFORMATION
                    ========================================= */}

                    <div className="transaksi-card-info">
                      <h3>
                        {item?.customer ||
                          "Nama Customer"}
                      </h3>

                      <p>
                        {item?.ticket ||
                          "Tiket Yang Dipesan"}
                      </p>

                      <strong>
                        ID TRANSAKSI:{" "}
                        {item?.id || "-"}
                      </strong>
                    </div>

                    {/* =========================================
                        RIGHT INFORMATION
                    ========================================= */}

                    <div className="transaksi-card-actions">
                      {/* STATUS */}

                      <span
                        className={`transaksi-status ${statusClass}`}
                      >
                        <span className="status-dot"></span>

                        {item?.status || "Tidak diketahui"}
                      </span>

                      {/* DETAIL BUTTON */}

                      <button
                        type="button"
                        className="detail-transaksi-button"
                        onClick={() =>
                          handleDetailTransaction(
                            item?.id
                          )
                        }
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
                <Receipt
                  size={30}
                  strokeWidth={1.8}
                />

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