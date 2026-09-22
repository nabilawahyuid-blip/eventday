import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../shared/Sidebar";
import Navbar from "../shared/Navbar";
import "./Transaksi.css";
import {
  getAdminTransactions,
  updateAdminTransactionStatus,
  exportAdminTransactions,
} from "../../services/adminTransactionService";

// Map status BE (PENDING/WAITING_PAYMENT/PAID/EXPIRED/CANCELLED/REFUNDED)
// ke label + class CSS yang tersedia (paid/pending/failed).
const STATUS_MAP = {
  PAID: { label: "Paid", cls: "paid" },
  PENDING: { label: "Pending", cls: "pending" },
  WAITING_PAYMENT: { label: "Waiting Payment", cls: "pending" },
  CANCELLED: { label: "Cancelled", cls: "failed" },
  EXPIRED: { label: "Expired", cls: "failed" },
  REFUNDED: { label: "Refunded", cls: "failed" },
};

// Status filter toolbar → set status BE mentah
const FILTER_MAP = {
  "All Status": null,
  Paid: ["PAID"],
  Pending: ["PENDING", "WAITING_PAYMENT"],
  Failed: ["CANCELLED", "EXPIRED", "REFUNDED"],
};

const formatRupiah = (value) => {
  const num = Number(value);
  if (Number.isNaN(num)) return String(value ?? "-");
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(num);
};

const formatDate = (iso) => {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const initials = (name = "") =>
  String(name)
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("") || "?";

function Transaksi() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [dateFilter, setDateFilter] = useState("Last 30 Days");

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [updatingId, setUpdatingId] = useState(null);

  const perPage = 10;

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const res = await getAdminTransactions({ page: 0, size: 100 });
      const data = res?.data || res;
      setTransactions(
        Array.isArray(data) ? data : data?.content || []
      );
      setError("");
    } catch (err) {
      console.error("Gagal memuat transaksi:", err);
      setError(
        err?.data?.msg || err?.message || "Gagal memuat transaksi."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const filtered = useMemo(() => {
    const kw = search.trim().toLowerCase();
    return transactions.filter((t) => {
      const st = String(t.status || "").toUpperCase();
      const ctx = [
        t.id,
        t.customerName,
        t.userName,
        t.user?.name,
        t.userEmail,
        t.user?.email,
        t.eventTitle,
        t.event?.title,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchSearch = !kw || ctx.includes(kw);

      const keys = FILTER_MAP[statusFilter];
      const matchStatus =
        !keys || keys.includes(st);

      return matchSearch && matchStatus;
    });
  }, [transactions, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const safePage = Math.min(currentPage, totalPages);
  const pageItems = filtered.slice(
    (safePage - 1) * perPage,
    safePage * perPage
  );

  // Statistik dihitung dari snapshot data yang dimuat
  const stats = useMemo(() => {
    const paid = transactions.filter(
      (t) => String(t.status || "").toUpperCase() === "PAID"
    );
    const pending = transactions.filter((t) =>
      ["PENDING", "WAITING_PAYMENT"].includes(
        String(t.status || "").toUpperCase()
      )
    );
    const failed = transactions.filter((t) =>
      ["CANCELLED", "EXPIRED", "REFUNDED"].includes(
        String(t.status || "").toUpperCase()
      )
    );
    const revenue = paid.reduce((sum, t) => {
      const v = Number(t.totalAmount ?? t.amount ?? 0);
      return sum + (Number.isNaN(v) ? 0 : v);
    }, 0);
    return { revenue, paid: paid.length, pending: pending.length, failed: failed.length };
  }, [transactions]);

  const handleExport = async () => {
    try {
      await exportAdminTransactions();
      alert("Export transaksi berhasil diunduh.");
    } catch (err) {
      alert(err?.message || "Gagal export transaksi.");
    }
  };

  const handleStatusChange = async (id, status) => {
    if (!id || !status) return;
    if (!window.confirm(`Ubah status transaksi ${id} menjadi ${status}?`)) return;
    try {
      setUpdatingId(id);
      await updateAdminTransactionStatus(id, status);
      alert("Status transaksi berhasil diubah.");
      await loadTransactions();
    } catch (err) {
      alert(err?.data?.msg || err?.message || "Gagal mengubah status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDetail = (transaction) => {
    if (transaction.id) {
      navigate(`/admin/transaksi/${encodeURIComponent(transaction.id)}`);
    } else {
      alert("ID transaksi tidak tersedia.");
    }
  };

  const renderStatus = (raw) => {
    const st = String(raw || "").toUpperCase();
    const map = STATUS_MAP[st] || { label: raw || "-", cls: "failed" };
    return map;
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
                  {formatRupiah(stats.revenue)}
                </h2>

                <p className="stat-positive">
                  ↗ Dari transaksi berstatus PAID
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
                  {stats.paid}
                </h2>

                <p className="stat-positive">
                  ↗ Berstatus PAID
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
                  PENDING / GAGAL
                </span>

                <h2>
                  {stats.pending} / {stats.failed}
                </h2>

                <p className="stat-negative">
                  ↘ Belum / tidak berhasil dibayar
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
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                />

              </div>

              <div className="status-filters">

                {["All Status", "Paid", "Pending", "Failed"].map((f) => (
                  <button
                    key={f}
                    type="button"
                    className={
                      statusFilter === f
                        ? "status-filter active"
                        : "status-filter"
                    }
                    onClick={() => {
                      setStatusFilter(f);
                      setCurrentPage(1);
                    }}
                  >
                    {f}
                  </button>
                ))}

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

                  {loading ? (
                    <tr>
                      <td colSpan="5" className="empty-transaction">
                        Memuat transaksi...
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan="5" className="empty-transaction">
                        {error}
                      </td>
                    </tr>
                  ) : pageItems.length > 0 ? (

                    pageItems.map((transaction) => {
                      const st = renderStatus(transaction.status);
                      const customerName =
                        transaction.customerName ||
                        transaction.userName ||
                        transaction.user?.name ||
                        "-";
                      const email =
                        transaction.userEmail ||
                        transaction.user?.email ||
                        "-";
                      const eventName =
                        transaction.eventTitle ||
                        transaction.event?.title ||
                        "-";
                      const amount =
                        transaction.totalAmount ?? transaction.amount;
                      const date = formatDate(
                        transaction.createdAt ||
                          transaction.paidAt ||
                          transaction.transactionDate
                      );

                      return (
                        <tr key={transaction.id}>

                          {/* TRANSACTION ID */}
                          <td>
                            <button
                              type="button"
                              className="transaction-id"
                              onClick={() => handleDetail(transaction)}
                            >
                              {transaction.id}
                            </button>
                          </td>

                          {/* CUSTOMER */}
                          <td>

                            <div className="customer-info">

                              <div className="customer-avatar">
                                {initials(customerName)}
                              </div>

                              <div>
                                <strong>
                                  {customerName}
                                </strong>

                                <span>
                                  {email}
                                </span>
                              </div>

                            </div>

                          </td>

                          {/* EVENT */}
                          <td>
                            <span className="event-name">
                              {eventName}
                            </span>
                          </td>

                          {/* AMOUNT + STATUS ACTION */}
                          <td>
                            <span className="amount">
                              {formatRupiah(amount)}
                            </span>
                            <br />
                            {["PENDING", "WAITING_PAYMENT"].includes(
                              String(transaction.status || "").toUpperCase()
                            ) && (
                              <button
                                type="button"
                                className="transaction-id"
                                disabled={updatingId === transaction.id}
                                onClick={() =>
                                  handleStatusChange(
                                    transaction.id,
                                    "CANCELLED"
                                  )
                                }
                              >
                                {updatingId === transaction.id
                                  ? "Mengubah..."
                                  : "Batalkan"}
                              </button>
                            )}
                          </td>

                          {/* STATUS */}
                          <td>

                            <div className="status-date">

                              <span
                                className={`transaction-status ${st.cls}`}
                              >
                                <span className="status-dot">
                                  ●
                                </span>

                                {st.label}
                              </span>

                              <span className="transaction-date">
                                {date}
                              </span>

                            </div>

                          </td>

                        </tr>
                      );
                    })

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
                {filtered.length === 0
                  ? "Tidak ada hasil"
                  : `Showing ${(safePage - 1) * perPage + 1} to ${Math.min(
                      safePage * perPage,
                      filtered.length
                    )} of ${filtered.length} results`}
              </span>

              <div className="pagination">

                <button
                  type="button"
                  className="pagination-arrow"
                  disabled={safePage === 1}
                  onClick={() => setCurrentPage(safePage - 1)}
                >
                  ‹
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    type="button"
                    className={
                      p === safePage
                        ? "pagination-number active"
                        : "pagination-number"
                    }
                    onClick={() => setCurrentPage(p)}
                  >
                    {p}
                  </button>
                ))}

                <button
                  type="button"
                  className="pagination-arrow"
                  disabled={safePage === totalPages}
                  onClick={() => setCurrentPage(safePage + 1)}
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