import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Calendar, Clock, MapPin } from "lucide-react";

import { getAdminEvents } from "../../services/adminEventService";
import { getAdminRecentEvents } from "../../services/adminDashboardService";
import { resolveBannerUrl } from "../../utils/bannerUrl";

import Sidebar from "../shared/Sidebar";
import Navbar from "../shared/Navbar";

import "./EventManagement.css";

export default function EventManagement() {
  const navigate = useNavigate();
  // ==========================================
  // STATE
  // ==========================================
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedStatus, setSelectedStatus] =
    useState("Semua Status");

  const [selectedCategory, setSelectedCategory] =
    useState("Semua Kategori");

  // ==========================================
  // PAGINATION (server-side via ?page=&size=)
  // ==========================================
  const PAGE_SIZE = 12;
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // ==========================================
  // NORMALISASI ITEM BACKEND → SHAPE UI
  // BE AdminEventListResponse: {eventId,title,category,venueName,
  //   startDate,endDate,status,isFeatured,organizerName,bannerUrl}
  // ==========================================
  const normalizeEvent = (item = {}, index = 0) => {
    const rawStatus = String(item?.status || "PUBLISHED").toUpperCase();
    const statusLabel =
      rawStatus === "PUBLISHED"
        ? "Aktif"
        : rawStatus === "DRAFT"
          ? "Draft"
          : rawStatus === "PENDING_APPROVAL"
            ? "Menunggu"
            : rawStatus === "REJECTED"
              ? "Ditolak"
              : rawStatus === "CANCELLED"
                ? "Dibatalkan"
                : rawStatus === "DELETED"
                  ? "Dihapus"
                  : rawStatus === "COMPLETED"
                    ? "Selesai"
                    : item?.status || "Aktif";

    const statusClass =
      rawStatus === "DRAFT" || rawStatus === "PENDING_APPROVAL"
        ? "draft"
        : rawStatus === "COMPLETED" ||
            rawStatus === "CANCELLED" ||
            rawStatus === "REJECTED"
          ? "finished"
          : "active";

    // "MUSIC_FESTIVAL" → "Music Festival" untuk tampilan
    const categoryLabel = String(
      item?.categoryLabel || item?.category || "Umum"
    ).replace(/_/g, " ");

    let dateLabel = "Jadwal belum ditentukan";
    let timeLabel = "-";
    if (item?.startDate) {
      try {
        const d = new Date(item.startDate);
        dateLabel = d.toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });
        timeLabel = d.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        });
      } catch {
        dateLabel = item?.dateDisplay || item.startDate;
      }
    }

    return {
      ...item,
      id: item?.eventId || item?.id || item?._id || index,
      eventId: item?.eventId || item?.id || item?._id,
      title: item?.title || item?.name || "Tanpa Judul",
      category: categoryLabel,
      rawCategory: item?.category || "",
      date: item?.date || item?.dateDisplay || dateLabel,
      time: item?.time || timeLabel,
      location: item?.location || item?.venueName || "-",
      status: statusLabel,
      rawStatus,
      statusClass,
      tickets: item?.tickets || "0 / 0",
      imageClass: item?.imageClass || "event-purple",
      bannerUrl: item?.bannerUrl || item?.image || null,
      // Timestamp untuk sorting terbaru-dibuat → terlama-dibuat
      // (pakai createdAt; startDate hanya fallback bila createdAt tak ada)
      timestamp: (() => {
        for (const key of ["createdAt", "startDate", "date"]) {
          if (item?.[key]) {
            const t = new Date(item[key]).getTime();
            if (!Number.isNaN(t)) return t;
          }
        }
        return 0;
      })(),
    };
  };

  // ==========================================
  // AMBIL DATA EVENT DARI BACKEND
  // GET /api/admin/events?search=&page=&size=12
  // Fallback: /api/admin/dashboard/recent-events bila backend
  // belum punya AdminEventController (Phase 1 belum deploy →
  // 500 "No static resource").
  // ==========================================
  const fetchEvents = useCallback(async (search = "", pageNum = 0) => {
    try {
      setLoading(true);
      setError(null);

      let response;
      try {
        response = await getAdminEvents({
          search,
          page: pageNum,
          size: PAGE_SIZE,
        });
      } catch (phase1Err) {
        const m =
          phase1Err?.data?.msg || phase1Err?.message || "";
        if (/no static resource/i.test(m)) {
          console.warn(
            "Backend belum punya /api/admin/events (Phase 1 belum deploy), fallback ke recent-events."
          );
          response = await getAdminRecentEvents();
        } else {
          throw phase1Err;
        }
      }

      console.log("Response event:", response);

      // ApiResponse backend: {msg, status, data}
      // data bisa Page {content,page,totalPages,totalElements} atau array langsung
      const raw = response?.data;
      const list = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.content)
          ? raw.content
          : [];

      setEvents(list.map(normalizeEvent));
      setTotalPages(
        typeof raw?.totalPages === "number"
          ? raw.totalPages
          : list.length > 0 ? 1 : 0
      );
      setTotalElements(
        typeof raw?.totalElements === "number"
          ? raw.totalElements
          : list.length
      );
    } catch (err) {
      console.error("Gagal memuat data event:", err);

      const msg = err?.response?.data?.msg || err?.data?.msg || err?.message || "";
      if (err?.status === 401 || /unauthorized/i.test(msg)) {
        setError("Sesi habis. Silakan login ulang sebagai ADMIN.");
      } else if (err?.status === 403 || /forbidden/i.test(msg)) {
        setError("Akses ditolak. Halaman ini khusus ADMIN.");
      } else if (/no static resource/i.test(msg)) {
        setError(
          "Backend belum menyediakan /api/admin/events (AdminEventController Phase 1 belum jalan). Minta tim backend deploy controller tersebut, lalu refresh."
        );
      } else {
        setError(msg || "Gagal menyambungkan ke server backend.");
      }

      setEvents([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce kata kunci (400ms) → reset ke halaman 0
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setPage(0);
    }, 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // Fetch ulang saat kata kunci / halaman berubah
  useEffect(() => {
    fetchEvents(debouncedSearch, page);
  }, [debouncedSearch, page, fetchEvents]);

  // Nomor halaman yang ditampilkan (maks 5 tombol)
  const pageNumbers = (() => {
    if (totalPages <= 1) return [];
    const maxButtons = 5;
    let start = Math.max(0, page - Math.floor(maxButtons / 2));
    const end = Math.min(totalPages, start + maxButtons);
    start = Math.max(0, end - maxButtons);
    return Array.from({ length: end - start }, (_, i) => start + i);
  })();

  const rangeStart = totalElements === 0 ? 0 : page * PAGE_SIZE + 1;
  const rangeEnd = Math.min(totalElements, (page + 1) * PAGE_SIZE);

  // ==========================================
  // KLIK PANAH → DETAIL EVENT
  // ==========================================
  const handleEventClick = (event) => {
    const eventId =
      event?.eventId ||
      event?.id ||
      event?._id;

    if (!eventId) {
      console.error(
        "ID event tidak ditemukan:",
        event
      );

      return;
    }

    navigate(`/admin/event/${eventId}`);
  };

  // ==========================================
  // BUTTON TAMBAH EVENT
  // ==========================================
  const handleAddEvent = () => {
    navigate("/admin/tambah-event");
  };

  // ==========================================
  // FILTER, SORT & HIDE-DELETED
  // ==========================================
  // - Event yang dihapus (DELETED, soft delete) tidak pernah ditampilkan
  // - Status & kategori difilter client-side (search sudah di backend)
  // - Urutan selalu terbaru-dibuat → terlama-dibuat berdasarkan createdAt
  //   (backend belum punya param sort, API.md §17.11 — jadi client-side per halaman)
  const norm = (s) => String(s || "").replace(/_/g, " ").trim().toLowerCase();
  const sortedEvents = events
    .filter((event) => {
      if (String(event?.rawStatus || "").toUpperCase() === "DELETED") {
        return false;
      }
      const status = norm(event?.status || "Aktif");
      const category = norm(event?.category || "");

      const matchesStatus =
        selectedStatus === "Semua Status" ||
        status === norm(selectedStatus);

      const matchesCategory =
        selectedCategory === "Semua Kategori" ||
        category === norm(selectedCategory) ||
        norm(event?.rawCategory) === norm(selectedCategory);

      return matchesStatus && matchesCategory;
    })
    .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <div className="event-management-page">

      {/* ======================================
          SIDEBAR
      ====================================== */}
      <Sidebar />

      {/* ======================================
          MAIN AREA
      ====================================== */}
      <div
        className="dashboard-wrapper"
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >

        {/* ====================================
            NAVBAR
        ==================================== */}
        <Navbar />

        {/* ====================================
            MAIN
        ==================================== */}
        <main className="event-main">

          <div className="event-content">

            {/* ==================================
                PAGE HEADING
            ================================== */}
            <div className="page-heading">

              <div className="page-heading-text">

                <h2>
                  Event Management
                </h2>

                <p>
                  Kelola dan pantau seluruh event
                  yang tersedia
                </p>

              </div>

              <button
                type="button"
                className="add-event-button"
                onClick={handleAddEvent}
              >
                + Tambah Event
              </button>

            </div>

            {/* ==================================
                TOOLBAR
            ================================== */}
            <div className="event-toolbar">

              {/* SEARCH */}
              <div className="event-search">

                <span>
                  <Search size={15} strokeWidth={2} />
                </span>

                <input
                  type="text"
                  placeholder="Cari event..."
                  value={searchTerm}
                  onChange={(e) =>
                    setSearchTerm(
                      e.target.value
                    )
                  }
                />

              </div>

              {/* FILTER STATUS */}
              <select
                className="event-filter"
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setPage(0);
                }}
              >

                <option value="Semua Status">
                  Semua Status
                </option>

                <option value="Aktif">
                  Aktif
                </option>

                <option value="Draft">
                  Draft
                </option>

                <option value="Menunggu">
                  Menunggu
                </option>

                <option value="Ditolak">
                  Ditolak
                </option>

                <option value="Selesai">
                  Selesai
                </option>

              </select>

              {/* FILTER KATEGORI */}
              <select
                className="event-filter"
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setPage(0);
                }}
              >

                <option value="Semua Kategori">
                  Semua Kategori
                </option>

                <option value="Music Festival">
                  Music Festival
                </option>

                <option value="Conference">
                  Conference
                </option>

                <option value="Exhibition">
                  Exhibition
                </option>

                <option value="Culinary">
                  Culinary
                </option>

                <option value="Konser">
                  Konser
                </option>

                <option value="Seminar">
                  Seminar
                </option>

                <option value="Workshop">
                  Workshop
                </option>

                <option value="Technology">
                  Technology
                </option>

              </select>

            </div>

            {/* ==================================
                EVENT GRID
            ================================== */}
            <div className="event-grid">

              {/* LOADING */}
              {loading ? (

                <p
                  style={{
                    gridColumn: "1 / -1",
                    textAlign: "center",
                    color: "#8d889a",
                    padding: "30px",
                  }}
                >
                  Memuat data event dari server...
                </p>

              ) : error ? (

                /* ERROR */
                <p
                  style={{
                    gridColumn: "1 / -1",
                    textAlign: "center",
                    color: "#dc6868",
                    padding: "30px",
                  }}
                >
                  {error}
                </p>

              ) : sortedEvents.length > 0 ? (

                /* =================================
                   EVENT DATA
                ================================== */
                sortedEvents.map(
                  (event, index) => {

                    const eventId =
                      event?.eventId ||
                      event?.id ||
                      event?._id ||
                      index;

                    const title = event?.title || "Tanpa Judul";

                    const category = event?.category || "Umum";

                    const date = event?.date || "Jadwal belum ditentukan";

                    const time = event?.time || "-";

                    const location = event?.location || "-";

                    const status = event?.status || "Aktif";

                    const statusClass = event?.statusClass || "active";

                    const tickets = event?.tickets || "0 / 0";

                    const imageClass = event?.imageClass || "event-purple";

                    const bannerImage = resolveBannerUrl(event?.bannerUrl);

                    return (
                      <div
                        className="event-card"
                        key={eventId}
                      >

                        {/* EVENT COVER */}
                        <div
                          className={`event-cover ${imageClass}`}
                          style={
                            bannerImage
                              ? {
                                  backgroundImage: `url("${bannerImage}")`,
                                  backgroundSize: "cover",
                                  backgroundPosition: "center",
                                }
                              : undefined
                          }
                        >
                          <span>
                            {category}
                          </span>
                        </div>

                        {/* EVENT CONTENT */}
                        <div className="event-card-content">

                          {/* STATUS */}
                          <div className="event-card-top">

                            <span
                              className={`event-status ${statusClass}`}
                            >
                              {status}
                            </span>

                          </div>

                          {/* TITLE */}
                          <h3>
                            {title}
                          </h3>

                          {/* DATE */}
                          <div className="event-detail">

                            <span>
                              <Calendar size={13} strokeWidth={2} />
                            </span>

                            {date}

                          </div>

                          {/* TIME */}
                          <div className="event-detail">

                            <span>
                              <Clock size={13} strokeWidth={2} />
                            </span>

                            {time}

                          </div>

                          {/* LOCATION */}
                          <div className="event-detail">

                            <span>
                              <MapPin size={13} strokeWidth={2} />
                            </span>

                            {location}

                          </div>

                          {/* FOOTER */}
                          <div className="event-card-footer">

                            <span>
                              {tickets} tiket
                            </span>

                            {/* DETAIL EVENT */}
                            <button
                              type="button"
                              className="event-arrow"
                              onClick={() =>
                                handleEventClick(
                                  event
                                )
                              }
                              aria-label={`Lihat detail ${title}`}
                            >
                              →
                            </button>

                          </div>

                        </div>

                      </div>
                    );
                  }
                )

              ) : (

                /* =================================
                   DATA KOSONG
                ================================== */
                <p
                  style={{
                    gridColumn: "1 / -1",
                    textAlign: "center",
                    color: "#8d889a",
                    padding: "30px",
                  }}
                >
                  Tidak ada event yang sesuai
                  dengan pencarian.
                </p>

              )}

            </div>

            {/* ==================================
                PAGINATION
            ================================== */}
            {!loading && !error && totalPages > 1 && (
              <div className="event-pagination">

                <span className="event-pagination-info">
                  Showing {rangeStart}–{rangeEnd} of {totalElements} events
                </span>

                <div className="event-pagination-controls">

                  <button
                    type="button"
                    className="event-page-button"
                    disabled={page === 0}
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    aria-label="Halaman sebelumnya"
                  >
                    ‹
                  </button>

                  {pageNumbers.map((p) => (
                    <button
                      key={p}
                      type="button"
                      className={
                        p === page
                          ? "event-page-button active"
                          : "event-page-button"
                      }
                      onClick={() => setPage(p)}
                    >
                      {p + 1}
                    </button>
                  ))}

                  <button
                    type="button"
                    className="event-page-button"
                    disabled={page >= totalPages - 1}
                    onClick={() =>
                      setPage((p) => Math.min(totalPages - 1, p + 1))
                    }
                    aria-label="Halaman berikutnya"
                  >
                    ›
                  </button>

                </div>

              </div>
            )}

          </div>

        </main>

      </div>

    </div>
  );
}