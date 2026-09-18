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

  // State Data & Loading
  const [metrics, setMetrics] = useState({
    activeEvents: 0,
    totalUsers: 0,
    totalRevenue: 0
  });
  const [events, setEvents] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // State untuk Search & Pagination Aktivitas Terbaru
  const [searchTerm, setSearchTerm] = useState("");
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

        // 1. Tangkap metrik (bisa berupa metricsRes.data atau metricsRes langsung)
        const metricsData = metricsRes?.data || metricsRes;
        if (metricsData) setMetrics(metricsData);

        // 2. Tangkap event (pastikan selalu menjadi array)
        const eventsData = eventsRes?.data || eventsRes;
        setEvents(Array.isArray(eventsData) ? eventsData : (eventsData?.content || []));

        // 3. Tangkap transaksi (pastikan selalu menjadi array)
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

  // Filter transaksi berdasarkan pencarian (search)
  const filteredTransactions = transactions.filter((item) => {
    const customer = item.customerName || "";
    const code = item.code || "";
    const desc = item.description || "";
    const query = searchTerm.toLowerCase();
    return customer.toLowerCase().includes(query) || 
           code.toLowerCase().includes(query) || 
           desc.toLowerCase().includes(query);
  });

  // Logika Pagination
  const totalItems = filteredTransactions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTransactions = filteredTransactions.slice(indexOfFirstItem, indexOfLastItem);

  const handleViewAll = () => {
    navigate("/event-management");
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
                  Rp {Number(metrics.totalRevenue || 0).toLocaleString('id-ID')}
                </h2>
                <p className="stat-positive">Akumulasi penjualan</p>
              </div>
            </section>

            {/* LOWER CONTENT */}
            <section className="dashboard-grid">

              {/* EVENT TERBARU */}
              <div className="dashboard-card events-card">
                <div className="card-header">
                  <h3>Event Terbaru</h3>
                  <button type="button" className="view-all" onClick={handleViewAll}>
                    Lihat Semua
                  </button>
                </div>

                <div className="event-list">
                  {loading ? (
                    <p style={{ fontSize: '11px', padding: '10px', color: '#8d889a' }}>Memuat event...</p>
                  ) : events.length === 0 ? (
                    <p style={{ fontSize: '11px', padding: '10px', color: '#8d889a' }}>Belum ada event tersedia.</p>
                  ) : (
                    events.map((event) => (
                      <button
                        key={event.id}
                        type="button"
                        className="event-item"
                        onClick={() => handleEventClick(event.id)}
                      >
                        <div className="event-image">
                          <span>{event.title ? event.title.charAt(0).toUpperCase() : 'E'}</span>
                        </div>
                        <div className="event-info">
                          <h4>{event.title}</h4>
                          <p>
                            📅 {event.startDate ? new Date(event.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Jadwal belum ditentukan'} • 📍 {event.venueName || 'Lokasi belum ditentukan'}
                          </p>
                        </div>
                        <div className={`event-status ${event.status === 'PUBLISHED' ? 'published' : 'draft'}`}>
                          {event.status}
                        </div>
                        <span className="event-more">⋮</span>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* AKTIVITAS TRANSAKSI DENGAN SEARCH & PAGINATION */}
              <div className="dashboard-card transactions-card">
                <div className="card-header" style={{ marginBottom: '12px' }}>
                  <h3>Aktivitas Terbaru</h3>
                  {/* Input Search */}
                  <input
                    type="text"
                    placeholder="Cari transaksi..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1); // Reset ke halaman 1 saat mencari
                    }}
                    style={{
                      padding: '6px 12px',
                      fontSize: '11px',
                      border: '1px solid #d8d1ec',
                      borderRadius: '7px',
                      outline: 'none',
                      width: '150px'
                    }}
                  />
                </div>

                <div className="transaction-list">
                  {loading ? (
                    <p style={{ fontSize: '11px', padding: '10px', color: '#8d889a' }}>Memuat data aktivitas...</p>
                  ) : currentTransactions.length === 0 ? (
                    <p style={{ fontSize: '11px', padding: '10px', color: '#8d889a' }}>Tidak ada transaksi ditemukan.</p>
                  ) : (
                    currentTransactions.map((item, index) => (
                      <button
                        key={item.id || index}
                        type="button"
                        className="transaction-item"
                        onClick={() => handleTransactionClick(item.customerName || "Customer")}
                      >
                        <div className="transaction-left-group">
                          <div className="event-image">
                            <span>{item.initial || `N${indexOfFirstItem + index + 1}`}</span>
                          </div>
                          <div className="event-info">
                            <h4>{item.customerName || "Nama Customer"}</h4>
                            <div className="transaction-text-wrapper">
                              <p className="trx-desc">🎫 {item.description || "Tiket Yang Dipesan"}</p>
                              <p className="trx-code">{item.code || "TRX-0000"}</p>
                            </div>
                          </div>
                        </div>

                        <div className="transaction-right-group">
                          <div className={`event-status ${
                            item.status === 'Lunas' || item.status === 'PAID' ? 'published' : 
                            item.status === 'EXPIRED' || item.status === 'Expired' ? 'expired' : 'draft'
                          }`}>
                            {item.status || "Menunggu"}
                          </div>
                          <span className="event-more">⋮</span>
                        </div>
                      </button>
                    ))
                  )}
                </div>

                {/* FOOTER PAGINATION (MENYERUPAI GAMBAR REFERENSI) */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '12px',
                  paddingTop: '8px',
                  borderTop: '1px solid #f0edf8',
                  fontSize: '11px',
                  color: '#6e6882'
                }}>
                  <span>
                    Showing {totalItems === 0 ? 0 : indexOfFirstItem + 1} to {Math.min(indexOfLastItem, totalItems)} of {totalItems} entries
                  </span>

                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      type="button"
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      style={{
                        padding: '2px 8px',
                        border: '1px solid #d8d1ec',
                        background: '#fff',
                        borderRadius: '4px',
                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                        opacity: currentPage === 1 ? 0.5 : 1
                      }}
                    >
                      &lt;
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                      <button
                        key={pageNumber}
                        type="button"
                        onClick={() => setCurrentPage(pageNumber)}
                        style={{
                          padding: '2px 8px',
                          border: '1px solid #d8d1ec',
                          background: currentPage === pageNumber ? '#6253dc' : '#fff',
                          color: currentPage === pageNumber ? '#fff' : '#393445',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontWeight: '600'
                        }}
                      >
                        {pageNumber}
                      </button>
                    ))}

                    <button
                      type="button"
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      style={{
                        padding: '2px 8px',
                        border: '1px solid #d8d1ec',
                        background: '#fff',
                        borderRadius: '4px',
                        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                        opacity: currentPage === totalPages ? 0.5 : 1
                      }}
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