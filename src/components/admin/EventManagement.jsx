import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Calendar, Clock, MapPin } from "lucide-react";

import { getAdminEventsTolerant } from "../../services/adminEventService";
import { getAdminRecentEvents } from "../../services/adminDashboardService";
import { resolveBannerUrl } from "../../utils/bannerUrl";

import Sidebar from "../shared/Sidebar";
import Navbar from "../shared/Navbar";

import "./EventManagement.css";

// Label dropdown UI → nilai yang dimengerti backend.
const BACKEND_STATUS_BY_LABEL = {
  "Semua Status": "",
  Aktif: "PUBLISHED",
  Draft: "DRAFT",
  Menunggu: "PENDING_APPROVAL",
  Ditolak: "REJECTED",
  Selesai: "COMPLETED",
  Dibatalkan: "CANCELLED",
};

const BACKEND_CATEGORY_BY_LABEL = {
  "Semua Kategori": "",
  "Music Festival": "MUSIC_FESTIVAL",
  Conference: "CONFERENCE",
  Exhibition: "EXHIBITION",
  Culinary: "CULINARY",
};

const toBackendStatus = (label) => BACKEND_STATUS_BY_LABEL[label] ?? "";
const toBackendCategory = (label) => BACKEND_CATEGORY_BY_LABEL[label] ?? "";

export default function EventManagement() {
  const navigate = useNavigate();
  // ==========================================
  // STATE
  // ==========================================
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0); // Dimulai dari 0 (standar Spring Pageable)
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dataWarning, setDataWarning] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedStatus, setSelectedStatus] =
    useState("Semua Status");

  const [selectedCategory, setSelectedCategory] =
    useState("Semua Kategori");

  // ==========================================
  // PAGINATION (server-side, standar Spring Pageable)
  // ==========================================
  // Backend menentukan isi tiap halaman melalui page/size, lalu FE memakai
  // metadata totalPages/totalElements dari respons. Filter status, kategori,
  // dan pencarian juga dikirim ke backend supaya halaman yang diterima sudah
  // final dan tidak dipotong lagi di client.

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
      bannerUrl:
        item?.bannerUrl ||
        item?.banner_url ||
        item?.banner ||
        item?.image ||
        null,
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
  // GET /api/admin/events?search=&status=&category=&page=0&size=10
  // Halaman aktif, ukuran halaman, dan semua filter dikirim ke backend.
  // Metadata totalPages/totalElements dari respons dipakai langsung tanpa
  // dihitung ulang dari hasil filter client.
  // Fallback: /api/admin/dashboard/recent-events bila backend
  // belum punya AdminEventController (Phase 1 belum deploy →
  // 500 "No static resource").
  // ==========================================
  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setDataWarning("");

      let response;
      try {
        response = await getAdminEventsTolerant({
          search: debouncedSearch,
          status: toBackendStatus(selectedStatus),
          category: toBackendCategory(selectedCategory),
          page,
          size: pageSize,
        });
        if (response?._partial) {
          setDataWarning(
            "Data sebagian: ada event berkategori tidak valid di DB (mis. \"Musik\"/\"ENTERTAINMENT\") yang dilewati. Minta BE rapikan ke MUSIC_FESTIVAL/CONFERENCE/EXHIBITION/CULINARY."
          );
        }
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
      // data normal = Page {content,page,totalPages,totalElements}.
      const pageData = response?.data ?? {};
      const content = Array.isArray(pageData)
        ? pageData
        : Array.isArray(pageData?.content)
          ? pageData.content
          : [];
      const parsedTotalPages = Number(
        pageData?.totalPages ?? (content.length > 0 ? 1 : 0)
      );
      const parsedTotalElements = Number(
        pageData?.totalElements ?? content.length
      );

      setItems(content.map(normalizeEvent));
      setTotalPages(Number.isFinite(parsedTotalPages) ? Math.max(0, parsedTotalPages) : 0);
      setTotalElements(
        Number.isFinite(parsedTotalElements) ? Math.max(0, parsedTotalElements) : 0
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

      setItems([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, selectedStatus, selectedCategory, page]);

  // Debounce kata kunci (400ms) → reset ke halaman 0
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setPage(0);
    }, 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // Fetch ulang saat kata kunci, filter, atau halaman berubah.
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

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
  // HIDE-DELETED & SORT HALAMAN AKTIF
  // ==========================================
  // Status/kategori/search sudah difilter oleh backend. Satu-satunya
  // penyaringan client yang tersisa adalah menyembunyikan DELETED saat
  // filter status "Semua Status". Urutan halaman aktif dirapikan
  // terbaru-dibuat → terlama-dibuat karena backend belum punya param sort.
  const visibleItems = items
    .filter((event) => {
      if (selectedStatus !== "Semua Status") return true;
      return String(event?.rawStatus || "").toUpperCase() !== "DELETED";
    })
    .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  // Jumlah DELETED yang disembunyikan dari halaman aktif — ditampilkan sebagai
  // catatan supaya angka "Showing X–Y" tidak terlihat salah.
  const hiddenDeletedCount = items.length - visibleItems.length;
  const emptyMessage =
    items.length > 0
      ? hiddenDeletedCount > 0
        ? "Halaman ini hanya berisi event yang sudah dihapus."
        : "Tidak ada event yang sesuai dengan pencarian."
      : "Tidak ada event yang sesuai dengan pencarian.";

  // ==========================================
  // PAGINATION (server-side)
  // ==========================================
  // totalPages/totalElements berasal dari backend dan tidak dihitung ulang.
  const safePage =
    totalPages > 0 ? Math.min(Math.max(0, page), totalPages - 1) : 0;
  // Reset ke halaman pertama bila hasil filter menyusut
  useEffect(() => {
    if (page !== safePage) setPage(safePage);
  }, [safePage, page]);

  // Nomor halaman yang ditampilkan (maks 5 tombol)
  const pageNumbers = (() => {
    if (totalPages <= 1) return [];
    const maxButtons = 5;
    let start = Math.max(0, safePage - Math.floor(maxButtons / 2));
    const end = Math.min(totalPages, start + maxButtons);
    start = Math.max(0, end - maxButtons);
    return Array.from({ length: end - start }, (_, i) => start + i);
  })();

  const rangeStart = totalElements === 0 ? 0 : safePage * pageSize + 1;
  const rangeEnd = Math.min(totalElements, (safePage + 1) * pageSize);

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

              </select>

            </div>

            {dataWarning && !loading && (
              <p style={{ background: "#fff8e1", border: "1px solid #ffe082", color: "#795548", borderRadius: 8, padding: "10px 14px", margin: "0 0 16px", fontSize: 13 }}>
                {dataWarning}
              </p>
            )}

            {hiddenDeletedCount > 0 && !loading && !error && (
              <p style={{ background: "#f3f4f6", border: "1px solid #e5e7eb", color: "#6b7280", borderRadius: 8, padding: "10px 14px", margin: "0 0 16px", fontSize: 13 }}>
                {hiddenDeletedCount} event yang sudah dihapus disembunyikan dari halaman ini.
              </p>
            )}

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

              ) : visibleItems.length > 0 ? (

                /* =================================
                   EVENT DATA
                ================================== */
                visibleItems.map(
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
                        <EventCover
                          imageClass={imageClass}
                          bannerImage={bannerImage}
                          category={category}
                          title={title}
                        />

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
                  {emptyMessage}
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
                    disabled={safePage === 0}
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
                        p === safePage
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
                    disabled={safePage >= totalPages - 1}
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

// Cover event dengan fallback gradient.
// Pakai <img> (bukan background-image) agar URL rusak terdeteksi via
// onError dan otomatis kembali ke gradient, bukan kotak hitam/putih.
function EventCover({ imageClass, bannerImage, category, title }) {
  const [broken, setBroken] = useState(false);
  const showImage = Boolean(bannerImage) && !broken;

  return (
    <div className={`event-cover ${imageClass}`} style={{ position: "relative" }}>
      {showImage && (
        <img
          src={bannerImage}
          alt={title}
          onError={() => setBroken(true)}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      )}
      <span>
        {category}
      </span>
    </div>
  );
}