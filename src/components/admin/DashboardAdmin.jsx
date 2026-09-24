import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  getAdminDashboardMetrics, 
  getAdminRecentEvents, 
  getAdminRecentTransactions 
} from '../../services/adminDashboardService';

import Sidebar from "../shared/Sidebar";
import Navbar from "../shared/Navbar";

import "./DashboardAdmin.css";

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
        const [metricsRes, eventsRes, transactionsRes] = await Promise.all([
          getAdminDashboardMetrics(),
          getAdminRecentEvents(),
          getAdminRecentTransactions()
        ]);

        const metricsData = metricsRes?.data || metricsRes;
        if (metricsData) setMetrics(metricsData);

        const eventsData = eventsRes?.data || eventsRes;
        setEvents(Array.isArray(eventsData) ? eventsData : (eventsData?.content || []));

        const trxData = transactionsRes?.data || transactionsRes;
        setTransactions(Array.isArray(trxData) ? trxData : (trxData?.content || []));

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
    alert(`Transaksi ${name} dipilih`);
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
                    events.map((event) => (
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
                        <div className={`item-status ${event.status === 'PUBLISHED' ? 'published' : 'draft'}`}>
                          {event.status}
                        </div>
                        <span className="item-more">⋮</span>
                      </button>
                    ))
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
                    currentTransactions.map((item, index) => (
                      <button
                        key={item.id || index}
                        type="button"
                        className="dashboard-list-item"
                        onClick={() => handleTransactionClick(item.customerName || "Customer")}
                      >
                        <div className="item-avatar">
                          <span>{item.initial || `N${indexOfFirstItem + index + 1}`}</span>
                        </div>
                        <div className="item-info">
                          <h4>{item.customerName || "Nama Customer"}</h4>
                          <div className="item-subtext-group">
                            <span className="sub-text">🎫 {item.description || "Tiket Yang Dipesan"}</span>
                            <span className="dot">•</span>
                            <span className="badge-code">{item.code || "TRX-0000"}</span>
                          </div>
                        </div>
                        <div className={`item-status ${
                          item.status === 'Lunas' || item.status === 'PAID' ? 'published' : 
                          item.status === 'EXPIRED' || item.status === 'Expired' ? 'expired' : 'draft'
                        }`}>
                          {item.status || "Menunggu"}
                        </div>
                        <span className="item-more">⋮</span>
                      </button>
                    ))
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
                      &lt;
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
                      &gt;
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