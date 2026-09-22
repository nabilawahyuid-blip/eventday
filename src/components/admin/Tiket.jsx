import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../shared/Sidebar";
import Navbar from "../shared/Navbar";
import "./Tiket.css";
import {
  getAdminTickets,
  exportAdminTickets,
  checkinAdminTicket,
  revokeAdminTicket,
} from "../../services/adminTicketService";

// Status tiket BE (UNREDEEMED/USED/EXPIRED/REFUNDED/REVOKED)
// → label + class CSS yang tersedia (issued/pending).
const STATUS_MAP = {
  UNREDEEMED: { label: "Issued", cls: "issued" },
  USED: { label: "Used", cls: "issued" },
  EXPIRED: { label: "Expired", cls: "pending" },
  REFUNDED: { label: "Refunded", cls: "pending" },
  REVOKED: { label: "Revoked", cls: "pending" },
};

const ICON_CLASSES = ["purple", "blue", "orange", "green"];

const formatRupiah = (value) => {
  const num = Number(value);
  if (Number.isNaN(num)) return String(value ?? "-");
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(num);
};

function Tiket() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const perPage = 8;

  const loadTickets = async () => {
    try {
      setLoading(true);
      const res = await getAdminTickets({ page: 0, size: 100 });
      const data = res?.data || res;
      setTickets(
        Array.isArray(data) ? data : data?.content || []
      );
      setError("");
    } catch (err) {
      console.error("Gagal memuat tiket:", err);
      setError(
        err?.data?.msg || err?.message || "Gagal memuat tiket."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const filtered = useMemo(() => {
    const kw = search.trim().toLowerCase();
    return tickets.filter((t) => {
      const ctx = [
        t.id,
        t.ticketCode,
        t.eventTitle,
        t.event?.title,
        t.tierName,
        t.ticketType,
        t.type,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return !kw || ctx.includes(kw);
    });
  }, [tickets, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const safePage = Math.min(currentPage, totalPages);
  const pageItems = filtered.slice(
    (safePage - 1) * perPage,
    safePage * perPage
  );

  // Statistik turunan dari snapshot tiket yang dimuat
  const stats = useMemo(() => {
    const count = (pred) => tickets.filter(pred).length;
    const sold = count(
      (t) => String(t.status || "").toUpperCase() === "USED"
    );
    const available = count(
      (t) => String(t.status || "").toUpperCase() === "UNREDEEMED"
    );
    const expired = count(
      (t) => String(t.status || "").toUpperCase() === "EXPIRED"
    );
    const total = tickets.length || 1;
    const revenue = tickets.reduce((sum, t) => {
      const v = Number(t.price ?? t.tierPrice ?? t.amount ?? 0);
      return sum + (Number.isNaN(v) ? 0 : v);
    }, 0);
    const activeEvents = new Set(
      tickets
        .map((t) => t.eventId ?? t.event?.id)
        .filter(Boolean)
    ).size;
    return {
      total: tickets.length,
      sold,
      available,
      expired,
      revenue,
      activeEvents,
      availabilityPct: Math.round((available / total) * 100),
    };
  }, [tickets]);

  const renderStatus = (raw) => {
    const st = String(raw || "").toUpperCase();
    return STATUS_MAP[st] || { label: raw || "-", cls: "pending" };
  };

  const handleExport = async () => {
    try {
      await exportAdminTickets();
      alert("Export tiket berhasil diunduh.");
    } catch (err) {
      alert(err?.message || "Gagal export tiket.");
    }
  };

  const handleAddTicketType = () => {
    alert("Generate tiket membutuhkan orderId. Gunakan endpoint POST /api/admin/tickets (body: orderId).");
  };

  const handleDetail = (ticket) => {
    const detailId = ticket.id ?? ticket.ticketCode;
    if (detailId) {
      navigate(`/admin/tiket/${encodeURIComponent(detailId)}`);
    } else {
      alert("ID tiket tidak tersedia.");
    }
  };

  const handleTicketAction = async (ticket) => {
    const st = String(ticket.status || "").toUpperCase();
    const action = st === "UNREDEEMED" ? "checkin" : "revoke";
    const label = st === "UNREDEEMED" ? "check-in (gunakan)" : "revoke (cabut)";
    if (!window.confirm(`${action === "checkin" ? "Check-in" : "Revoke"} tiket ${ticket.id ?? ticket.ticketCode}?`)) return;
    try {
      if (action === "checkin") {
        await checkinAdminTicket(ticket.id);
      } else {
        await revokeAdminTicket(ticket.id);
      }
      alert(`Tiket berhasil di-${label}!`);
      await loadTickets();
    } catch (err) {
      alert(err?.data?.msg || err?.message || "Gagal memproses tiket.");
    }
  };

  return (
    <div className="ticket-page">

      {/* = SIDEBAR = */}
      <Sidebar />

      {/* = MAIN = */}
      <main className="ticket-main">

        {/* = NAVBAR = */}
        <Navbar />

        {/* = CONTENT = */}
        <section className="ticket-content">

          {/* = HEADER = */}
          <div className="ticket-header">

            <div className="ticket-heading">
              <h1>Ticket Overview</h1>

              <p>
                Global statistics and recent issuances across all events.
              </p>
            </div>

            <div className="ticket-header-actions">

              <button
                type="button"
                className="ticket-export-button"
                onClick={handleExport}
              >
                <span>↓</span>
                Export Report
              </button>

              <button
                type="button"
                className="add-ticket-button"
                onClick={handleAddTicketType}
              >
                <span>+</span>
                New Ticket Type
              </button>

            </div>

          </div>

          {/* = STATISTICS = */}
          <div className="ticket-statistics">

            {/* TOTAL TICKETS */}
            <div className="ticket-stat-card">

              <div className="ticket-stat-content">

                <span className="ticket-stat-label">
                  TOTAL TICKETS ISSUED
                </span>

                <div className="ticket-stat-number-row">

                  <h2>{stats.total}</h2>

                  <span className="ticket-growth">
                    ↗ {stats.available} tersedia
                  </span>

                </div>

                <div className="ticket-stat-footer">
                  Active Events: {stats.activeEvents}
                  <span>Expired: {stats.expired}</span>
                </div>

              </div>

              <div className="ticket-stat-icon purple-icon">
                ▣
              </div>

            </div>

            {/* AVAILABILITY */}
            <div className="ticket-stat-card">

              <div className="ticket-stat-content">

                <span className="ticket-stat-label">
                  GLOBAL AVAILABILITY
                </span>

                <div className="availability-row">

                  <h2>{stats.availabilityPct}%</h2>

                  <span>{stats.available} Belum digunakan</span>

                </div>

                <div className="availability-bar">

                  <div className="availability-progress"></div>

                </div>

                <div className="availability-footer">

                  <span>Digunakan: {stats.sold}</span>

                  <span>Tersedia: {stats.available}</span>

                </div>

              </div>

              <div className="availability-circle">
                <div className="circle-inner"></div>
              </div>

            </div>

            {/* REVENUE */}
            <div className="ticket-stat-card">

              <div className="ticket-stat-content">

                <span className="ticket-stat-label">
                  TOTAL TICKET REVENUE
                </span>

                <h2 className="revenue-number">
                  {formatRupiah(stats.revenue)}
                </h2>

                <div className="revenue-tags">

                  <span>
                    Digunakan: {stats.sold}
                  </span>

                  <span>
                    Tersedia: {stats.available}
                  </span>

                </div>

              </div>

              <div className="ticket-stat-icon revenue-icon">
                Rp
              </div>

            </div>

          </div>

          {/* = RECENT TICKETS = */}
          <div className="recent-ticket-panel">

            {/* PANEL HEADER */}
            <div className="recent-ticket-header">

              <h2>
                Recent Ticket Issuances
              </h2>

              <span className="view-all-button">
                {filtered.length} tiket
              </span>

            </div>

            {/* SEARCH */}
            <div className="ticket-search-wrapper">

              <div className="ticket-search">

                <span className="ticket-search-icon">
                  ⌕
                </span>

                <input
                  type="text"
                  placeholder="Search tickets..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                />

              </div>

            </div>

            {/* TICKET LIST */}
            <div className="ticket-list">

              {loading ? (
                <div className="ticket-empty">Memuat tiket...</div>
              ) : error ? (
                <div className="ticket-empty">{error}</div>
              ) : pageItems.length > 0 ? (

                pageItems.map((ticket, idx) => {
                  const st = renderStatus(ticket.status);
                  const id = ticket.id ?? ticket.ticketCode ?? "-";
                  const name =
                    ticket.eventTitle ||
                    ticket.event?.title ||
                    "-";
                  const type =
                    ticket.tierName ||
                    ticket.ticketType ||
                    ticket.type ||
                    "Tiket";
                  const price = formatRupiah(
                    ticket.price ?? ticket.tierPrice ?? ticket.amount
                  );
                  const qty = ticket.quantity ?? 1;
                  const iconClass =
                    ICON_CLASSES[idx % ICON_CLASSES.length];

                  return (
                    <div
                      className="ticket-item"
                      key={id}
                    >

                      {/* ICON */}
                      <div
                        className={`ticket-item-icon ${iconClass}`}
                      >
                        ▣
                      </div>

                      {/* INFORMATION */}
                      <div
                        className="ticket-item-info"
                        onClick={() => handleDetail(ticket)}
                        title={`Lihat detail ${name}`}
                      >

                        <h3>
                          {name}
                        </h3>

                        <div className="ticket-item-meta">

                          <span>
                            ID: {id}
                          </span>

                          <span className="meta-separator">
                            •
                          </span>

                          <span>
                            {type}
                          </span>

                        </div>

                      </div>

                      {/* PRICE */}
                      <div className="ticket-price">

                        <strong>
                          {price}
                        </strong>

                        <span>
                          Qty: {qty}
                        </span>

                      </div>

                      {/* STATUS */}
                      <div
                        className={`ticket-status ${st.cls}`}
                      >
                        <span>●</span>
                        {st.label}
                      </div>

                      {/* ACTION */}
                      <button
                        type="button"
                        className="ticket-more-button"
                        onClick={() => handleTicketAction(ticket)}
                        title="Check-in / Revoke"
                      >
                        ⋮
                      </button>

                    </div>
                  );
                })

              ) : (

                <div className="ticket-empty">
                  Tidak ada tiket ditemukan.
                </div>

              )}

            </div>

            {/* PANEL FOOTER */}
            <div className="ticket-panel-footer">

              <span>
                Showing {pageItems.length} of {filtered.length} tickets
              </span>

              <div className="ticket-pagination">

                <button
                  type="button"
                  className="ticket-page-arrow"
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
                        ? "ticket-page-button active"
                        : "ticket-page-button"
                    }
                    onClick={() => setCurrentPage(p)}
                  >
                    {p}
                  </button>
                ))}

                <button
                  type="button"
                  className="ticket-page-arrow"
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

export default Tiket;