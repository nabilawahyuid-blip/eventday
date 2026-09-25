import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  getAdminDashboardMetrics, 
  getAdminRecentEvents, 
  getAdminRecentTransactions 
} from '../../services/adminDashboardService';
import { getAdminTransactions } from '../../services/adminTransactionService';

import Sidebar from "../shared/Sidebar";
import Navbar from "../shared/Navbar";

import "./DashboardAdmin.css";

import { showInfo } from "../../utils/alert";

export default function DashboardAdmin() {
  const navigate = useNavigate();

  const [metrics, setMetrics] = useState({
    activeEvents: 0,
    totalUsers: 0,
    totalRevenue: 0
  });
  const [events, setEvents] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        const [metricsRes, eventsRes, transactionsRes, trxListRes] = await Promise.all([
          getAdminDashboardMetrics(),
          getAdminRecentEvents(),
          getAdminRecentTransactions(),
          // Daftar transaksi dipakai untuk MENGISI nama customer:
          // endpoint /recent-transactions TIDAK mengirim nama customer,
          // jadi kita samakan lewat orderNumber orderId → customerName.
          getAdminTransactions({ page: 0, size: 100 }).catch(() => null)
        ]);

        const metricsData = metricsRes?.data || metricsRes;
        if (metricsData) setMetrics(metricsData);

        const eventsData = eventsRes?.data || eventsRes;
        setEvents(Array.isArray(eventsData) ? eventsData : (eventsData?.content || []));

        const trxData = transactionsRes?.data || transactionsRes;
        const rawTrx = Array.isArray(trxData) ? trxData : (trxData?.content || []);

        // Bangun lookup nama customer dari daftar transaksi admin
        const trxListData = trxListRes?.data || trxListRes;
        const trxList = Array.isArray(trxListData) ? trxListData : (trxListData?.content || []);
        const customerLookup = {};
        trxList.forEach((t) => {
          const name =
            t.customerName ||
            t.userName ||
            t.user?.name ||
            t.buyerName ||
            t.customer?.name ||
            "";
          const keys = [t.id, t.orderId, t.orderNumber].filter(Boolean);
          keys.forEach((k) => { if (k && name) customerLookup[k.toUpperCase()] = name; });
        });

        // Suntikkan nama customer ke data aktivitas terbaru
        const enriched = rawTrx.map((t) => {
          const found =
            customerLookup[String(t.orderId || "").toUpperCase()] ||
            customerLookup[String(t.orderNumber || "").toUpperCase()] ||
            customerLookup[String(t.id || "").toUpperCase()] ||
            "";
          if (found) return { ...t, customerName: found };
          return t;
        });

        // DEBUG: lihat struktur field yang dikirim backend
        console.log("[DashboardAdmin] Recent transactions raw:", rawTrx);
        console.log("[DashboardAdmin] Customer lookup sample:", customerLookup);

        // Batasi aktivitas terbaru agar kartu kecil tidak penuh:
        // urutkan terbaru dulu → ambil transaksi dalam 24 jam terakhir
        // → kalau kurang dari batas, fallback ambil N terbaru yang ada.
        const ACTIVITY_LIMIT = 6;
        const ACTIVITY_WINDOW_HOURS = 24;

        const sorted = [...enriched].sort((a, b) => {
          const ta = new Date(a.createdAt || a.paidAt || a.transactionDate || 0).getTime();
          const tb = new Date(b.createdAt || b.paidAt || b.transactionDate || 0).getTime();
          return tb - ta;
        });

        const cutoff = Date.now() - ACTIVITY_WINDOW_HOURS * 60 * 60 * 1000;
        const recentWindow = sorted.filter((t) => {
          const time = new Date(t.createdAt || t.paidAt || t.transactionDate || 0).getTime();
          return Number.isFinite(time) && time >= cutoff;
        });

        const activity = (recentWindow.length >= ACTIVITY_LIMIT ? recentWindow : sorted).slice(0, ACTIVITY_LIMIT);

        setTransactions(activity);

      } catch (error) {
        console.error("Gagal memuat data dashboard:", error.message);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const totalItems = transactions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTransactions = transactions.slice(indexOfFirstItem, indexOfLastItem);

  const handleViewAllEvents = () => {
    navigate("/event-management");
  };

  const handleViewAllTransactions = () => {
    navigate("/admin/users");
  };

  const handleEventClick = (eventId) => {
    navigate(`/admin/event/${eventId}`);
  };

  const handleTransactionClick = (name) => {
    showInfo("Transaksi dipilih", `Transaksi ${name} dipilih.`);
  };

  return (
    <div className="admin-dashboard">
      <Sidebar />
      
      <div className="dashboard-wrapper" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Navbar />

        <main className="dashboard-main">
          <div className="dashboard-content">

            {/* STATISTICS */}
            <section className="stats-grid">
              <div className="stat-card">
                <div className="stat-card-header">
                  <span>EVENT AKTIF</span>
                  <div className="stat-icon blue">📅</div>
                </div>
                <h2>{metrics.activeEvents || 0}</h2>
                <p className="stat-positive">Total event berjalan</p>
              </div>

              <div className="stat-card">
                <div className="stat-card-header">
                  <span>TOTAL USER</span>
                  <div className="stat-icon purple">👥</div>
                </div>
                <h2>{metrics.totalUsers || 0}</h2>
                <p className="stat-positive">Pengguna terdaftar</p>
              </div>

              <div className="stat-card">
                <div className="stat-card-header">
                  <span>TOTAL PENDAPATAN</span>
                  <div className="stat-icon orange">Rp</div>
                </div>
                <h2>
                  Rp {Number(metrics.totalPlatformRevenue ?? metrics.totalRevenue ?? 0).toLocaleString('id-ID')}
                </h2>
                <p className="stat-positive">
                  {metrics.totalTicketsSold
                    ? `${metrics.totalTicketsSold} tiket terjual`
                    : "Akumulasi penjualan"}
                </p>
              </div>
            </section>

            {/* LOWER CONTENT */}
            <section className="dashboard-grid">

              {/* EVENT TERBARU */}
              <div className="dashboard-card">
                <div className="card-header">
                  <h3>Event Terbaru</h3>
                  <button type="button" className="view-all" onClick={handleViewAllEvents}>
                    Lihat Semua
                  </button>
                </div>

                <div className="dashboard-list">
                  {loading ? (
                    <p className="list-loading">Memuat event...</p>
                  ) : events.length === 0 ? (
                    <p className="list-loading">Belum ada event tersedia.</p>
                  ) : (
                    events.map((event) => {
                      const rawEventStatus = String(event.status || "").toUpperCase();
                      const eventStatusClass = rawEventStatus === "PUBLISHED"
                        ? "published"
                        : rawEventStatus === "DELETED"
                        ? "deleted"
                        : rawEventStatus === "CANCELLED" || rawEventStatus === "REJECTED"
                        ? "rejected"
                        : "draft";
                      const eventStatusLabel = rawEventStatus === "PUBLISHED"
                        ? "Terbit"
                        : rawEventStatus === "DELETED"
                        ? "Dihapus"
                        : rawEventStatus === "CANCELLED"
                        ? "Dibatalkan"
                        : rawEventStatus === "REJECTED"
                        ? "Ditolak"
                        : rawEventStatus === "DRAFT"
                        ? "Draft"
                        : rawEventStatus;

                      return (
                        <button
                          key={event.id}
                          type="button"
                          className="dashboard-list-item"
                          onClick={() => handleEventClick(event.id)}
                        >
                          <div className="item-avatar">
                            <span>{event.title ? event.title.charAt(0).toUpperCase() : 'E'}</span>
                          </div>
                          <div className="item-info">
                            <h4>{event.title}</h4>
                            <div className="item-subtext-group">
                              <span className="sub-text">
                                📅 {event.startDate ? new Date(event.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Jadwal belum ditentukan'}
                              </span>
                              <span className="dot">•</span>
                              <span className="sub-text">📍 {event.venueName || 'Lokasi belum ditentukan'}</span>
                            </div>
                          </div>
                          <div className={`item-status ${eventStatusClass}`}>
                            {eventStatusLabel}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* AKTIVITAS TERBARU */}
              <div className="dashboard-card">
              <div className="card-header">
                <h3>Aktivitas Terbaru</h3>
                <button type="button" className="view-all" onClick={handleViewAllTransactions}>
                  Lihat Semua
                </button>
              </div>

                <div className="dashboard-list">
                  {loading ? (
                    <p className="list-loading">Memuat data aktivitas...</p>
                  ) : currentTransactions.length === 0 ? (
                    <p className="list-loading">Tidak ada transaksi ditemukan.</p>
                  ) : (
                    currentTransactions.map((item, index) => {
                      // Fallback chain untuk field dari backend (camelCase + snake_case)
                      const customerName =
                        item.customerName ||
                        item.customer_name ||
                        item.user?.name ||
                        item.customer?.name ||
                        item.userName ||
                        item.user_name ||
                        item.username ||
                        item.buyerName ||
                        item.buyer_name ||
                        item.name ||
                        "Nama Customer";

                      const ticketInfo =
                        item.description ||
                        item.event?.title ||
                        item.event_title ||
                        item.eventTitle ||
                        item.ticketName ||
                        item.ticket_name ||
                        item.ticketTierName ||
                        item.ticket_tier_name ||
                        item.tierName ||
                        item.tier_name ||
                        "Tiket";

                      const transactionCode =
                        item.code ||
                        item.transactionCode ||
                        item.transaction_code ||
                        item.orderNumber ||
                        item.order_number ||
                        item.id ||
                        `TRX-${indexOfFirstItem + index + 1}`;

                      const rawStatus = String(item.status || "PENDING").toUpperCase();
                      const statusLabel = rawStatus === "PAID" || rawStatus === "LUNAS"
                        ? "Lunas"
                        : rawStatus === "EXPIRED" || rawStatus === "EXPIRE"
                        ? "Kedaluwarsa"
                        : rawStatus === "PENDING" || rawStatus === "WAITING_PAYMENT"
                        ? "Menunggu"
                        : rawStatus === "CANCELLED" || rawStatus === "CANCELED"
                        ? "Dibatalkan"
                        : rawStatus === "REFUNDED" || rawStatus === "REFUND"
                        ? "Direfund"
                        : rawStatus;

                      const statusClass = rawStatus === "PAID" || rawStatus === "LUNAS"
                        ? "published"
                        : rawStatus === "EXPIRED" || rawStatus === "EXPIRE"
                        ? "expired"
                        : rawStatus === "CANCELLED" || rawStatus === "CANCELED" || rawStatus === "REFUNDED" || rawStatus === "REFUND"
                        ? "rejected"
                        : "draft";

                      const initial = item.initial ||
                        (customerName && customerName !== "Nama Customer" ? customerName.trim().charAt(0).toUpperCase() : `N${indexOfFirstItem + index + 1}`);

                      return (
                        <button
                          key={item.id || index}
                          type="button"
                          className="dashboard-list-item"
                          onClick={() => handleTransactionClick(customerName)}
                        >
                          <div className="item-avatar">
                            <span>{initial}</span>
                          </div>
                          <div className="item-info">
                            <h4>{customerName}</h4>
                            <div className="item-subtext-group">
                              <span className="sub-text">🎫 {ticketInfo}</span>
                              <span className="dot">•</span>
                              <span className="badge-code">{transactionCode}</span>
                            </div>
                          </div>
                          <div className={`item-status ${statusClass}`}>
                            {statusLabel}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>

                {/* FOOTER PAGINATION */}
                <div className="pagination-footer">
                  <span>
                    Showing {totalItems === 0 ? 0 : indexOfFirstItem + 1} to {Math.min(indexOfLastItem, totalItems)} of {totalItems} entries
                  </span>

                  <div className="pagination-buttons">
                    <button
                      type="button"
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="page-btn"
                    >
                      {'<'}
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                      <button
                        key={pageNumber}
                        type="button"
                        onClick={() => setCurrentPage(pageNumber)}
                        className={`page-btn ${currentPage === pageNumber ? 'active' : ''}`}
                      >
                        {pageNumber}
                      </button>
                    ))}

                    <button
                      type="button"
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="page-btn"
                    >
                      {'>'}
                    </button>
                  </div>
                </div>

              </div>

            </section>

          </div>
        </main>
      </div>
    </div>
  );
}