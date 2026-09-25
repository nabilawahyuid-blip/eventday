import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../shared/Sidebar";
import Navbar from "../shared/Navbar";
import "./Tiket.css";
import {
  getAdminTickets,
  exportAdminTickets,
  generateAdminTickets,
  checkinAdminTicket,
  revokeAdminTicket,
  getAdminTicketInventory,
} from "../../services/adminTicketService";
import { getAdminTransactions } from "../../services/adminTransactionService";
import {
  showSuccess,
  showError,
  showWarning,
  showInfo,
  showConfirm,
  showInputDialog,
} from "../../utils/alert";

// Status tiket BE (UNREDEEMED/USED/EXPIRED/REFUNDED/REVOKED)
// → badge teks jelas dengan class kontras per status.
// Tiket yang sudah check-in (USED / CHECKED_IN) tampil hijau "CHECKED IN".
const STATUS_MAP = {
  UNREDEEMED: { label: "BELUM DIGUNAKAN", cls: "unredeemed" },
  USED: { label: "CHECKED IN", cls: "used" },
  CHECKED_IN: { label: "CHECKED IN", cls: "used" },
  CHECKIN: { label: "CHECKED IN", cls: "used" },
  EXPIRED: { label: "KEDALUWARSA", cls: "expired" },
  REFUNDED: { label: "DIREFUND", cls: "refunded" },
  REVOKED: { label: "DICABUT", cls: "revoked" },
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
  // Ringkasan stok per event dari BE (GET /tickets/inventory) — dipakai
  // untuk kartu statistik bila tersedia, fallback ke snapshot tiket.
  const [inventory, setInventory] = useState([]);

  const perPage = 8;

  const loadTickets = async () => {
    try {
      setLoading(true);
      const [res, invRes] = await Promise.all([
        getAdminTickets({ page: 0, size: 100 }),
        getAdminTicketInventory().catch(() => null),
      ]);
      const data = res?.data || res;
      setTickets(
        Array.isArray(data) ? data : data?.content || []
      );
      const invData = invRes?.data ?? invRes;
      if (Array.isArray(invData)) {
        setInventory(invData);
      } else if (invData && typeof invData === "object") {
        setInventory([invData]);
      } else {
        setInventory([]);
      }
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

  // BE mengirim status lewat `status` ATAU `checkInStatus` (halaman detail
  // memakai keduanya) — resolver tunggal agar list, badge, aksi konsisten.
  // Didefinisikan di sini (sebelum useMemo statistik) agar tidak crash TDZ.
  const getTicketStatus = (t) =>
    String(t?.checkInStatus || t?.status || "").toUpperCase();

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

  // Statistik: utamakan ringkasan inventory BE (kapasitas & terjual asli),
  // fallback ke snapshot tiket bila inventory kosong/gagal dimuat.
  const stats = useMemo(() => {
    const count = (pred) => tickets.filter(pred).length;
    const soldSnap = count(
      (t) => ["USED", "CHECKED_IN", "CHECKIN"].includes(getTicketStatus(t))
    );
    const availableSnap = count(
      (t) => getTicketStatus(t) === "UNREDEEMED"
    );
    const expired = count(
      (t) => getTicketStatus(t) === "EXPIRED"
    );
    const revenue = tickets.reduce((sum, t) => {
      const v = Number(t.price ?? t.tierPrice ?? t.amount ?? 0);
      return sum + (Number.isNaN(v) ? 0 : v);
    }, 0);
    const snapEvents = new Set(
      tickets
        .map((t) => t.eventId ?? t.event?.id)
        .filter(Boolean)
    ).size;

    let total = tickets.length;
    let sold = soldSnap;
    let available = availableSnap;
    let activeEvents = snapEvents;
    if (inventory.length > 0) {
      const num = (v) => {
        const n = Number(v ?? 0);
        return Number.isNaN(n) ? 0 : n;
      };
      const cap = inventory.reduce(
        (s, e) =>
          s + num(e.totalCapacity ?? e.capacity ??
            (e.tiers || []).reduce((ts, tr) => ts + num(tr.totalQuota ?? tr.quota), 0)),
        0
      );
      const soldInv = inventory.reduce(
        (s, e) =>
          s + num(e.totalSold ?? e.soldCount ??
            (e.tiers || []).reduce((ts, tr) => ts + num(tr.soldCount ?? tr.sold), 0)),
        0
      );
      if (cap > 0) {
        total = cap;
        sold = soldInv;
        available = Math.max(0, cap - soldInv);
        activeEvents = inventory.filter(
          (e) => num(e.totalCapacity ?? e.capacity ?? 1) > 0
        ).length || snapEvents;
      }
    }
    const base = total || 1;
    return {
      total,
      sold,
      available,
      expired,
      revenue,
      activeEvents,
      availabilityPct: Math.round((available / base) * 100),
    };
  }, [tickets, inventory]);

  const renderStatus = (raw) => {
    const st = String(raw || "").toUpperCase();
    return STATUS_MAP[st] || { label: String(raw || "-").toUpperCase(), cls: "unredeemed" };
  };

  const handleExport = async () => {
    try {
      await exportAdminTickets();
      showSuccess("Export tiket berhasil diunduh.");
    } catch (err) {
      showError(err?.message || "Gagal export tiket.");
    }
  };

  const handleGenerateTickets = async () => {
    // Ambil daftar order terbaru agar admin tinggal pilih (tanpa ketik UUID)
    let options = {};
    try {
      const res = await getAdminTransactions({ page: 0, size: 50 });
      const data = res?.data ?? res;
      const list = Array.isArray(data) ? data : data?.content || [];
      list.forEach((o) => {
        const oid = o?.id ?? o?.orderId;
        if (!oid) return;
        const buyer =
          o.customerName ||
          o.userName ||
          o.user?.name ||
          o.buyerName ||
          "Customer";
        const label =
          `${o.orderNumber || oid} — ${buyer} — ` +
          formatRupiah(o.totalAmount ?? o.amount ?? o.grandTotal ?? 0);
        options[String(oid)] = label;
      });
    } catch {
      options = {};
    }
    const hasOptions = Object.keys(options).length > 0;

    const result = await showInputDialog({
      title: "Generate Tiket dari Order",
      text: hasOptions
        ? "Pilih order yang tiketnya akan diterbitkan."
        : "Daftar order tidak tersedia — masukkan Order ID secara manual.",
      input: hasOptions ? "select" : "text",
      inputOptions: options,
      inputPlaceholder: hasOptions ? "Pilih order..." : "Contoh: 123e4567-e89b-12d3-a456-426614174000",
      confirmText: "Generate",
      requiredMessage: "Pilih order terlebih dahulu.",
    });

    if (!result.isConfirmed) {
      showInfo(
        "Generate dibatalkan",
        "Tidak ada order yang dipilih."
      );
      return;
    }

    const orderId = String(result.value ?? "").trim();
    if (!orderId) {
      showWarning(
        "Order belum dipilih",
        "Pilih order terlebih dahulu."
      );
      return;
    }

    try {
      await generateAdminTickets(orderId);
      showSuccess(
        "Generate tiket berhasil!",
        "Order ID: " + orderId
      );
      // Refresh daftar tiket agar tampil yang baru
      await loadTickets();
    } catch (err) {
      showError(
        "Gagal generate tiket",
        err?.data?.msg || err?.message || "Unknown error"
      );
    }
  };

  const handleDetail = (ticket) => {
    const detailId = ticket.id ?? ticket.ticketCode;
    if (detailId) {
      navigate(`/admin/tiket/${encodeURIComponent(detailId)}`);
    } else {
      showError(
        "ID Tiket tidak tersedia",
        "ID tiket tidak dapat ditentukan dari data."
      );
    }
  };

  // Aksi yang tersedia per status: hanya tiket aktif yang bisa diproses.
  // EXPIRED / REFUNDED / REVOKED adalah status akhir → tanpa aksi.
  const getTicketAction = (rawTicketOrStatus) => {
    const st = typeof rawTicketOrStatus === "string"
      ? String(rawTicketOrStatus || "").toUpperCase()
      : getTicketStatus(rawTicketOrStatus);
    if (st === "UNREDEEMED" || st === "") return "checkin";
    if (st === "USED" || st === "CHECKED_IN" || st === "CHECKIN") return "revoke";
    return null;
  };

  const handleTicketAction = async (ticket) => {
    const kind = getTicketAction(ticket);
    const code = ticket.ticketCode ?? ticket.id ?? ticket.code ?? "-";
    // BE tidak selalu mengirim `id` — pakai ticketCode/code sebagai
    // identifier bila `id` kosong (inilah sumber error "ID tiket wajib diisi").
    const ticketKey = ticket.id ?? ticket.ticketCode ?? ticket.code;
    if (!ticketKey) {
      showError(
        "ID Tiket tidak tersedia",
        "ID tiket tidak dapat ditentukan dari data."
      );
      return;
    }
    if (!kind) {
      showInfo(
        "Tidak ada aksi",
        `Tiket berstatus ${renderStatus(getTicketStatus(ticket)).label} tidak dapat diproses.`
      );
      return;
    }
    // Samakan baris yang sedang diproses agar update optimistis tepat sasaran
    const matchKey = (t) =>
      String(t?.id ?? t?.ticketCode ?? t?.code ?? "") === String(ticketKey);
    if (kind === "checkin") {
      const { isConfirmed } = await showConfirm(
        "Check-in tiket",
        `Tandai tiket ${code} sebagai sudah digunakan?`,
        "Ya, Check-in",
        "Batal"
      );
      if (!isConfirmed) return;
      try {
        await checkinAdminTicket(ticketKey);
        // Optimistis: tandai hijau seketika tanpa menunggu refresh BE
        // (list BE kadang mengembalikan snapshot lama / field berbeda).
        setTickets((prev) =>
          prev.map((t) =>
            matchKey(t) ? { ...t, status: "USED", checkInStatus: "USED" } : t
          )
        );
        showSuccess("Check-in berhasil", `Tiket ${code} ditandai CHECKED IN.`);
        await loadTickets();
      } catch (err) {
        showError("Gagal check-in", err?.data?.msg || err?.message || "Gagal memproses tiket.");
      }
      return;
    }
    const { isConfirmed } = await showConfirm(
      "Revoke tiket",
      `Tiket ${code} akan DICABUT dan tidak berlaku lagi. Lanjutkan?`,
      "Ya, Revoke",
      "Batal"
    );
    if (!isConfirmed) return;
    try {
      await revokeAdminTicket(ticketKey);
      setTickets((prev) =>
        prev.map((t) =>
          matchKey(t) ? { ...t, status: "REVOKED", checkInStatus: "REVOKED" } : t
        )
      );
      showSuccess("Tiket dicabut", `Tiket ${code} berstatus REVOKED.`);
      await loadTickets();
    } catch (err) {
      showError("Gagal revoke", err?.data?.msg || err?.message || "Gagal memproses tiket.");
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
                onClick={handleGenerateTickets}
              >
                <span>+</span>
                Generate Tiket dari Order
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

                  <div
                    className="availability-progress"
                    style={{ width: `${stats.availabilityPct}%` }}
                  ></div>

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
                  const st = renderStatus(getTicketStatus(ticket));
                  const isUsed = ["USED", "CHECKED_IN", "CHECKIN"].includes(
                    getTicketStatus(ticket)
                  );
                  const id = ticket.id ?? ticket.ticketCode ?? "-";
                  const name =
                    ticket.eventTitle ||
                    ticket.event?.title ||
                    ticket.ticketCode ||
                    ticket.id ||
                    "-";
                  const type =
                    ticket.tierName ||
                    ticket.ticketType ||
                    ticket.type ||
                    ticket.categoryName ||
                    "Tiket";
                  const actionKind = getTicketAction(ticket);
                  const price = formatRupiah(
                    ticket.price ?? ticket.tierPrice ?? ticket.amount
                  );
                  const qty = ticket.quantity ?? 1;
                  const iconClass =
                    ICON_CLASSES[idx % ICON_CLASSES.length];

                  return (
                    <div
                      className={`ticket-item ${isUsed ? "is-used" : "is-open"}`}
                      key={id}
                    >

                      {/* ICON */}
                      <div
                        className={`ticket-item-icon ${isUsed ? "checked" : iconClass}`}
                        title={isUsed ? "Sudah check-in" : "Belum digunakan"}
                      >
                        {isUsed ? "✓" : "▣"}
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
                        {isUsed ? "✓ " : ""}
                        {st.label}
                      </div>

                      {/* ACTION */}
                      {actionKind ? (
                        <button
                          type="button"
                          className={`ticket-action-button ${actionKind}`}
                          onClick={() => handleTicketAction(ticket)}
                          title={actionKind === "checkin" ? "Check-in tiket" : "Revoke tiket"}
                        >
                          {actionKind === "checkin" ? "Check-in" : "Revoke"}
                        </button>
                      ) : null}

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