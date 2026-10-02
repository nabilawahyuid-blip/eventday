import React, { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";

import {
  getAdminAuditLogs,
  exportAdminAuditLogsCSV,
} from "../../services/adminAuditService";

import {
  Search,
  CalendarDays,
  ChevronDown,
  Download,
  Eye,
  ChevronLeft,
  ChevronRight,
  CalendarPlus,
  CircleCheck,
  UserRound,
  ShieldCheck,
  CreditCard,
  ClipboardList,
  UserCheck,
  Wallet,
  Settings,
  ScanLine,
} from "lucide-react";

import Sidebar from "../shared/Sidebar";
import Navbar from "../shared/Navbar";

import "./AuditLog.css";

/* =========================================================
   TAKSONOMI KATEGORI AUDIT
   Nilai `value` mengikuti enum backend persis dan dikirim apa adanya
   sebagai query `category`: ALL | AUTH | EVENT | TRANSACTION |
   PAYOUT | EO_APPROVAL | SYSTEM. "ALL" berarti tanpa filter
   (dinormalisasi menjadi tanpa param di adminAuditService).
   ========================================================= */

const AUDIT_CATEGORIES = [
  { value: "ALL", label: "Semua Kategori" },
  { value: "AUTH", label: "Autentikasi" },
  { value: "EVENT", label: "Event" },
  { value: "TRANSACTION", label: "Transaksi" },
  { value: "PAYOUT", label: "Payout" },
  { value: "EO_APPROVAL", label: "Persetujuan EO" },
  { value: "SYSTEM", label: "Sistem" },
];

/* Pencocokan EXACT action backend → kategori.
   Dipakai sebagai fallback client-side bila backend belum mendukung
   param `category` (Spring mengabaikan query param yang tidak dikenal).
   Jangan tambah pencocokan substring di sini — itu yang dulu membuat
   "REJECTED" lolos dari filter dan login sukses masuk kategori gagal. */
const ACTION_CATEGORY_MAP = {
  // AUTH
  REGISTER: "AUTH",
  LOGIN: "AUTH",
  LOGIN_GOOGLE: "AUTH",
  REGISTER_GOOGLE: "AUTH",
  LOGOUT: "AUTH",
  VERIFY_OTP: "AUTH",
  RESEND_OTP: "AUTH",
  RESET_PASSWORD: "AUTH",
  // EVENT
  CREATE_EVENT: "EVENT",
  UPDATE_EVENT: "EVENT",
  DELETE_EVENT: "EVENT",
  APPROVE_EVENT: "EVENT",
  REJECT_EVENT: "EVENT",
  CANCEL_EVENT: "EVENT",
  // TRANSACTION (pembayaran)
  PAYMENT_SUCCESS: "TRANSACTION",
  PAYMENT_FAILED: "TRANSACTION",
  PAYMENT_EXPIRED: "TRANSACTION",
  UPDATE_TRANSACTION_STATUS: "TRANSACTION",
  // ORDER (siklus order digabung ke TRANSACTION sesuai enum backend)
  CREATE_ORDER: "TRANSACTION",
  UPDATE_ORDER: "TRANSACTION",
  CANCEL_ORDER: "TRANSACTION",
  // EO_APPROVAL
  APPROVE_EO: "EO_APPROVAL",
  REJECT_EO: "EO_APPROVAL",
  VERIFY_EO: "EO_APPROVAL",
  VERIFIED: "EO_APPROVAL",
  REJECTED: "EO_APPROVAL",
  // PAYOUT
  REQUEST_PAYOUT: "PAYOUT",
  APPROVE_PAYOUT: "PAYOUT",
  REJECT_PAYOUT: "PAYOUT",
  UPDATE_PAYOUT_STATUS: "PAYOUT",
  // SYSTEM
  UPDATE_SETTINGS: "SYSTEM",
  CREATE_USER: "SYSTEM",
  UPDATE_USER: "SYSTEM",
  UPDATE_USER_STATUS: "SYSTEM",
  SUSPEND_USER: "SYSTEM",
  // GATE_SCAN — belum ada di enum backend, jadi aksi tiket hanya tampil
  // saat filter "ALL". Badge + ikonnya sudah disiapkan bila backend
  // menambahkannya nanti.
  SCAN_TICKET: "GATE_SCAN",
  CHECKIN_TICKET: "GATE_SCAN",
  REVOKE_TICKET: "GATE_SCAN",
  GENERATE_TICKET: "GATE_SCAN",
};

const categoryOfAction = (rawAction) => {
  if (!rawAction) return "OTHER";
  return (
    ACTION_CATEGORY_MAP[String(rawAction).toUpperCase()] || "OTHER"
  );
};

/* Escape untuk interpolasi ke template `html:` SweetAlert.
   React meng-escape otomatis di JSX, tapi `html:` SweetAlert adalah
   innerHTML mentah — tanpa ini, string dari backend = stored XSS. */
const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

/* Satu baris modal detail. `valueHtml` WAJIB sudah di-escape / berupa
   markup statis — jangan pernah teruskan string mentah dari backend. */
const auditDetailRow = (label, valueHtml) => `
  <div class="audit-popup-section">
    <span class="audit-popup-label">${escapeHtml(label)}</span>
    <span class="audit-popup-value">${valueHtml}</span>
  </div>`;

/* HTML modal detail audit log. Seluruh nilai backend lewat escapeHtml,
   sehingga payload JSON dan user-agent jahat tampil sebagai teks. */
const buildAuditDetailHtml = (item) => {
  const text = (value) => escapeHtml(value ?? "-");

  const categoryLabel =
    (AUDIT_CATEGORIES.find((c) => c.value === item.category) || {}).label ||
    item.category ||
    "-";

  const statusClass =
    item.statusType === "success" ? "success" : "failed";

  const formatJson = (value) => {
    if (value === null || value === undefined) return "-";
    if (typeof value === "string") return value;
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  };

  // Blok diff lama-vs-baru, bila backend mengirim pasangan perubahan.
  let diffHtml = "";
  // eslint-disable-next-line eqeqeq — null DAN undefined sama-sama "tidak ada".
  if (item.oldValue != null || item.newValue != null) {
    diffHtml =
      auditDetailRow(
        "NILAI LAMA",
        `<pre class="audit-popup-json">${escapeHtml(
          formatJson(item.oldValue)
        )}</pre>`
      ) +
      auditDetailRow(
        "NILAI BARU",
        `<pre class="audit-popup-json">${escapeHtml(
          formatJson(item.newValue)
        )}</pre>`
      );
  }

  // Payload mentah sebagai JSON rapi (di-escape, bukan dieksekusi).
  let payloadHtml = "";
  if (item.payload !== null && item.payload !== undefined) {
    payloadHtml = `
      <div class="audit-popup-section">
        <span class="audit-popup-label">PAYLOAD JSON</span>
        <span class="audit-popup-value"><pre class="audit-popup-json">${escapeHtml(
          formatJson(item.payload)
        )}</pre></span>
      </div>`;
  }

  return `
    <div class="audit-popup-container">
      ${auditDetailRow("LOG ID", text(item.id))}
      ${auditDetailRow("TIMESTAMP", text(item.timestamp))}
      ${auditDetailRow("WAKTU", `${text(item.date)} • ${text(item.time)}`)}
      ${auditDetailRow("KATEGORI", text(categoryLabel))}
      ${auditDetailRow("AKTOR", text(item.actor))}
      ${auditDetailRow("ID AKTOR", text(item.actorId))}
      ${auditDetailRow("TIPE AKTOR", text(item.actorType))}
      ${auditDetailRow("IP ADDRESS", text(item.ipAddress))}
      ${auditDetailRow("AKTIVITAS", text(item.activity))}
      <div class="audit-popup-section audit-popup-description-row">
        <span class="audit-popup-label">DETAIL / DESKRIPSI</span>
        <span class="audit-popup-value">${text(item.detail)}</span>
      </div>
      <div class="audit-popup-section">
        <span class="audit-popup-label">STATUS</span>
        <span class="audit-popup-status ${statusClass}">${text(item.status)}</span>
      </div>
      ${auditDetailRow("TARGET ID", text(item.targetId))}
      ${auditDetailRow("TARGET TYPE", text(item.targetType))}
      ${auditDetailRow("AMOUNT", text(item.amount))}
      ${auditDetailRow("CURRENCY", text(item.currency))}
      ${auditDetailRow("PAYMENT METHOD", text(item.paymentMethod))}
      <div class="audit-popup-section audit-popup-user-agent">
        <span class="audit-popup-label">USER AGENT</span>
        <span class="audit-popup-value">${text(item.userAgent)}</span>
      </div>
      ${diffHtml}
      ${payloadHtml}
    </div>`;
};

function AuditLog() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [category, setCategory] = useState("ALL");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(0); // 0-based, standar Spring Pageable
  const [auditData, setAuditData] = useState([]);
  const [totalEntries, setTotalEntries] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const itemsPerPage = 10;

  /* =========================================================
     NORMALISASI LOG BE → shape UI
  ========================================================= */

  const normalizeLog = (item) => {
    const ts =
      item.timestamp ||
      item.createdAt ||
      item.logDate;

    const d = ts ? new Date(ts) : null;

    const date =
      d && !Number.isNaN(d.getTime())
        ? d.toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : item.date || "-";

    const time =
      d && !Number.isNaN(d.getTime())
        ? `${d.toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          })} WIB`
        : item.time || "-";

    const rawAction = String(
      item.action ||
        item.activity ||
        item.event ||
        "Aktivitas"
    ).toUpperCase();

    // Kategori: hormati field backend bila ada, sonst petakan exact dari action.
    const category =
      item.category &&
      AUDIT_CATEGORIES.some((c) => c.value === item.category)
        ? item.category
        : categoryOfAction(
            item.action || item.activity || item.event
          );

    // activityType dipakai untuk badge + ikon tabel — disamakan dengan kategori.
    const activityType = category.toLowerCase();

    const rawStatus = String(
      item.status || "SUCCESS"
    ).toUpperCase();

    const isSuccess =
      rawStatus === "SUCCESS" ||
      rawStatus === "BERHASIL";

    const actorType =
      item.actorType ||
      item.role ||
      item.actorRole ||
      "User";

    const avatarUpper = String(actorType).toUpperCase();

    // Payload mentah untuk modal detail: dukung beberapa nama field backend
    // (payload / details / data / metadata), plus pasangan lama-vs-baru
    // (oldValue/newValue, old/new, before/after, previous/current).
    const payload =
      item.payload ??
      item.details ??
      item.data ??
      item.metadata ??
      null;

    const pickChangePair = (source) => {
      if (!source || typeof source !== "object") {
        return { oldValue: null, newValue: null };
      }
      const pairs = [
        ["oldValue", "newValue"],
        ["old", "new"],
        ["before", "after"],
        ["previous", "current"],
      ];
      for (const [oldKey, newKey] of pairs) {
        if (source[oldKey] !== undefined || source[newKey] !== undefined) {
          return {
            oldValue: source[oldKey] ?? null,
            newValue: source[newKey] ?? null,
          };
        }
      }
      return { oldValue: null, newValue: null };
    };

    const fromPayload = pickChangePair(payload);
    const fromItem = pickChangePair(item);

    return {
      id: item.id || item.logId || "-",
      timestamp: ts || "-",
      date,
      time,
      actor:
        item.actor ||
        item.actorName ||
        item.userName ||
        "-",
      actorId: item.actorId || item.userId || "-",
      actorType,
      avatar:
        avatarUpper === "EO"
          ? "EO"
          : avatarUpper === "UNKNOWN"
          ? "unknown"
          : "photo",
      ipAddress: item.ipAddress || "-",
      activity:
        item.action ||
        item.activity ||
        item.description ||
        "Aktivitas",
      activityType,
      category,
      rawAction,
      detail:
        item.description ||
        item.detail ||
        item.message ||
        "-",
      status: isSuccess ? "Berhasil" : "Gagal",
      statusType: isSuccess ? "success" : "failed",
      targetId: item.targetId || "-",
      targetType: item.targetType || "-",
      amount: item.amount ?? "-",
      currency: item.currency || "IDR",
      paymentMethod: item.paymentMethod || "-",
      userAgent: item.userAgent || "-",
      payload,
      oldValue: fromPayload.oldValue ?? fromItem.oldValue,
      newValue: fromPayload.newValue ?? fromItem.newValue,
    };
  };

  /* =========================================================
     LOAD DARI BACKEND — server-side pagination + filter.
     Search / kategori / status / rentang tanggal / halaman semuanya
     dikirim sebagai query param. TIDAK ada lagi fallback data tiruan:
     bila backend mati, tampilkan error + tabel kosong.
  ========================================================= */

  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      const res = await getAdminAuditLogs(page, itemsPerPage, {
        search: debouncedSearch,
        category,
        status,
        startDate,
        endDate,
      });
      const data = res?.data ?? res;
      const list = Array.isArray(data)
        ? data
        : data?.content || [];

      setAuditData(list);
      setTotalEntries(
        Number(data?.totalElements ?? list.length) || 0
      );
      setTotalPages(
        Number(data?.totalPages ?? (list.length > 0 ? 1 : 0)) || 0
      );
      setLoadError("");
    } catch (err) {
      console.error("Gagal memuat audit log:", err);
      setLoadError(
        err?.data?.msg ||
          err?.message ||
          "Gagal memuat audit log."
      );
      setAuditData([]);
      setTotalEntries(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuditLogs();
  }, [page, debouncedSearch, category, status, startDate, endDate]);

  // Debounce search 400ms — halaman kembali ke 0 setiap query berubah.
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(0);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Jepit halaman bila total halaman menyusut akibat filter.
  useEffect(() => {
    if (totalPages > 0 && page > totalPages - 1) {
      setPage(totalPages - 1);
    }
  }, [totalPages, page]);

  /* =========================================================
     ICON AKTIVITAS
  ========================================================= */

  const getActivityIcon = (type) => {
    switch (type) {
      case "auth":
        return <ShieldCheck size={12} strokeWidth={2} />;

      case "event":
        return <CalendarPlus size={12} strokeWidth={2} />;

      case "transaction":
        return <CreditCard size={12} strokeWidth={2} />;

      case "order":
        return <ClipboardList size={12} strokeWidth={2} />;

      case "eo_approval":
        return <UserCheck size={12} strokeWidth={2} />;

      case "payout":
        return <Wallet size={12} strokeWidth={2} />;

      case "system":
        return <Settings size={12} strokeWidth={2} />;

      case "gate_scan":
        return <ScanLine size={12} strokeWidth={2} />;

      default:
        return <CircleCheck size={12} strokeWidth={2} />;
    }
  };

  /* =========================================================
     NORMALISASI + FALLBACK FILTER CLIENT-SIDE
     Filter utama jalan di backend (lihat loadAuditLogs). Blok ini hanya
     jaring pengaman exact-match bila backend belum mendukung query
     search/category/status/startDate/endDate — Spring mengabaikan query
     param tak dikenal, jadi tanpa ini filter akan terlihat tidak bekerja.
  ========================================================= */

  const normalizedLogs = useMemo(
    () => auditData.map(normalizeLog),
    [auditData]
  );

  const displayedData = useMemo(() => {
    const searchValue = debouncedSearch.toLowerCase().trim();

    const startTs = startDate ? new Date(`${startDate}T00:00:00`).getTime() : null;
    const endTs = endDate ? new Date(`${endDate}T23:59:59`).getTime() : null;

    return normalizedLogs.filter((item) => {
      const matchesSearch =
        !searchValue ||
        item.actor.toLowerCase().includes(searchValue) ||
        item.activity.toLowerCase().includes(searchValue) ||
        item.detail.toLowerCase().includes(searchValue) ||
        item.actorId.toLowerCase().includes(searchValue);

      // EXACT match — bukan substring. "ALL" berarti tampil semua.
      const matchesCategory =
        !category || category === "ALL" || item.category === category;

      const matchesStatus =
        !status ||
        (status === "SUCCESS"
          ? item.statusType === "success"
          : item.statusType === "failed");

      let matchesDate = true;
      if (startTs !== null || endTs !== null) {
        const itemTs =
          item.timestamp && item.timestamp !== "-"
            ? new Date(item.timestamp).getTime()
            : Number.NaN;
        if (Number.isNaN(itemTs)) {
          matchesDate = false;
        } else {
          if (startTs !== null && itemTs < startTs) matchesDate = false;
          if (endTs !== null && itemTs > endTs) matchesDate = false;
        }
      }

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStatus &&
        matchesDate
      );
    });
  }, [normalizedLogs, debouncedSearch, category, status, startDate, endDate]);

  /* =========================================================
     PAGINATION (server-side — totalPages dari backend)
  ========================================================= */

  const safePage =
    totalPages > 0 ? Math.min(Math.max(0, page), totalPages - 1) : 0;

  const startIndex = safePage * itemsPerPage;

  // Jendela maksimal 5 nomor halaman di sekitar halaman aktif (0-based,
  // ditampilkan +1).
  const pageButtons = (() => {
    if (totalPages <= 1) return [];
    const maxButtons = 5;
    let start = Math.max(
      0,
      safePage - Math.floor(maxButtons / 2)
    );
    const end = Math.min(totalPages, start + maxButtons);
    start = Math.max(0, end - maxButtons);
    return Array.from(
      { length: end - start },
      (_, i) => start + i
    );
  })();

  /* =========================================================
     EXPORT CSV
  ========================================================= */

  const handleExportCSV = async () => {
    if (displayedData.length === 0) {
      Swal.fire({
        icon: "info",
        title: "Tidak ada data",
        text: "Tidak ada data audit log yang dapat diekspor.",
        confirmButtonColor: "#5546df",
      });

      return;
    }

    // Utamakan export dari backend (GET /api/admin/audit-logs/export/csv)
    // dengan filter yang sama seperti yang tampil di layar.
    try {
      await exportAdminAuditLogsCSV({
        search: debouncedSearch,
        category,
        status,
        startDate,
        endDate,
      });

      Swal.fire({
        icon: "success",
        title: "CSV berhasil diekspor",
        text: "Audit log diekspor dari server.",
        confirmButtonColor: "#5546df",
        timer: 1800,
        showConfirmButton: false,
      });

      return;
    } catch (err) {
      console.warn(
        "Export server gagal — fallback ke export client:",
        err
      );
    }

    const headers = [
      "Log ID",
      "Timestamp",
      "Tanggal",
      "Waktu",
      "Aktor",
      "ID Aktor",
      "Tipe Aktor",
      "IP Address",
      "Kategori",
      "Aktivitas",
      "Detail / Deskripsi",
      "Status",
      "Target ID",
      "Target Type",
      "Amount",
      "Currency",
      "Payment Method",
      "User Agent",
    ];

    const rows = displayedData.map((item) => [
      item.id,
      item.timestamp,
      item.date,
      item.time,
      item.actor,
      item.actorId,
      item.actorType,
      item.ipAddress,
      item.category,
      item.activity,
      item.detail,
      item.status,
      item.targetId,
      item.targetType,
      item.amount,
      item.currency,
      item.paymentMethod,
      item.userAgent,
    ]);

    const csvContent = [
      headers,
      ...rows,
    ]
      .map((row) =>
        row
          .map((value) => {
            const text = String(value ?? "");

            return `"${text.replace(
              /"/g,
              '""'
            )}"`;
          })
          .join(",")
      )
      .join("\n");

    const blob = new Blob(
      ["\ufeff" + csvContent],
      {
        type: "text/csv;charset=utf-8;",
      }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "audit-log.csv";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    Swal.fire({
      icon: "success",
      title: "CSV berhasil diekspor",
      text: `${displayedData.length} data audit log berhasil diekspor.`,
      confirmButtonColor: "#5546df",
      timer: 1800,
      showConfirmButton: false,
    });
  };

  /* =========================================================
     DETAIL POPUP
  ========================================================= */

  const handleViewDetail = (item) => {
    Swal.fire({
      title: "Detail Audit Log",

      html: buildAuditDetailHtml(item),

      width: 560,

      showCloseButton: true,
      showConfirmButton: false,

      customClass: {
        popup: "audit-swal-popup",
        title: "audit-swal-title",
        htmlContainer: "audit-swal-content",
        closeButton: "audit-swal-close",
      },

      buttonsStyling: false,
    });
  };

  /* =========================================================
     AVATAR
  ========================================================= */

  const renderAvatar = (item) => {
    if (item.avatar === "EO") {
      return (
        <div className="audit-avatar audit-avatar-eo">
          EO
        </div>
      );
    }

    if (item.avatar === "unknown") {
      return (
        <div className="audit-avatar audit-avatar-unknown">
          <UserRound
            size={16}
            strokeWidth={2}
          />
        </div>
      );
    }

    return (
      <div className="audit-avatar audit-avatar-photo">
        <UserRound
          size={16}
          strokeWidth={2}
        />
      </div>
    );
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="audit-log-page">

      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN */}
      <main className="audit-log-main">

        {/* NAVBAR */}
        <Navbar />

        <div className="audit-log-content">

          {/* HEADER */}
          <div className="audit-log-header">
            <h1>Audit Log</h1>

            <p>
              Pantau seluruh aktivitas sistem dan
              riwayat tindakan pengguna.
            </p>
          </div>

          {/* FILTER */}
          <div className="audit-filter-row">

            {/* SEARCH */}
            <div className="audit-search-box">
              <Search
                size={17}
                strokeWidth={2}
              />

              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(0);
                }}
                placeholder="Cari aktor atau aktivitas..."
              />
            </div>

            {/* DATE RANGE */}
            <div className="audit-date-box">
              <CalendarDays
                size={16}
                strokeWidth={1.9}
              />

              <input
                type="date"
                value={startDate}
                max={endDate || undefined}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPage(0);
                }}
                aria-label="Tanggal mulai"
                title="Tanggal mulai"
              />

              <span className="audit-date-separator">
                –
              </span>

              <input
                type="date"
                value={endDate}
                min={startDate || undefined}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPage(0);
                }}
                aria-label="Tanggal selesai"
                title="Tanggal selesai"
              />
            </div>

            {/* CATEGORY */}
            <div className="audit-category-box">
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setPage(0);
                }}
                aria-label="Kategori aktivitas"
              >
                {AUDIT_CATEGORIES.map((option) => (
                  <option
                    key={option.value || "all"}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={15}
                strokeWidth={2}
              />
            </div>

            {/* STATUS */}
            <div className="audit-category-box">
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(0);
                }}
                aria-label="Status aktivitas"
              >
                <option value="">
                  Semua Status
                </option>

                <option value="SUCCESS">
                  Berhasil
                </option>

                <option value="FAILED">
                  Gagal
                </option>
              </select>

              <ChevronDown
                size={15}
                strokeWidth={2}
              />
            </div>

            {/* EXPORT */}
            <button
              type="button"
              className="audit-export-button"
              onClick={handleExportCSV}
            >
              <Download
                size={15}
                strokeWidth={2}
              />

              <span>
                Ekspor CSV
              </span>
            </button>

          </div>

          {startDate && endDate && startDate > endDate && (
            <p className="audit-filter-warning">
              Tanggal mulai melebihi tanggal selesai — tidak ada data yang
              cocok dengan rentang ini.
            </p>
          )}

          {/* TABLE */}
          <section className="audit-table-card">

            <div className="audit-table-wrapper">

              <table className="audit-table">

                <thead>
                  <tr>
                    <th className="time-column">
                      WAKTU
                    </th>

                    <th className="actor-column">
                      AKTOR
                    </th>

                    <th className="activity-column">
                      AKTIVITAS
                    </th>

                    <th className="detail-column">
                      DETAIL / DESKRIPSI
                    </th>

                    <th className="status-column">
                      STATUS
                    </th>

                    <th className="action-column">
                      AKSI
                    </th>
                  </tr>
                </thead>

                <tbody>

                  {loading ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="audit-empty"
                      >
                        Memuat audit log...
                      </td>
                    </tr>
                  ) : loadError ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="audit-empty"
                      >
                        {loadError}
                      </td>
                    </tr>
                  ) : displayedData.length > 0 ? (

                    displayedData.map((item) => (

                      <tr key={item.id}>

                        {/* WAKTU */}
                        <td>
                          <div className="audit-time">

                            <strong>
                              {item.date}
                            </strong>

                            <span>
                              {item.time}
                            </span>

                          </div>
                        </td>

                        {/* AKTOR */}
                        <td>

                          <div className="audit-actor">

                            {renderAvatar(item)}

                            <div className="audit-actor-info">

                              <strong>
                                {item.actor}
                              </strong>

                              <span>
                                {item.actorType}

                                {item.actorId &&
                                  item.actorType !==
                                    "Unknown" &&
                                  ` (ID: ${item.actorId})`}
                              </span>

                            </div>

                          </div>

                        </td>

                        {/* AKTIVITAS */}
                        <td>

                          <div
                            className={`
                              audit-activity
                              audit-activity-${item.activityType}
                            `}
                          >

                            {getActivityIcon(
                              item.activityType
                            )}

                            <span>
                              {item.activity}
                            </span>

                          </div>

                        </td>

                        {/* DETAIL */}
                        <td>

                          <div className="audit-detail">
                            {item.detail}
                          </div>

                        </td>

                        {/* STATUS */}
                        <td>

                          <span
                            className={`
                              audit-status
                              audit-status-${item.statusType}
                            `}
                          >
                            {item.status}
                          </span>

                        </td>

                        {/* ACTION */}
                        <td>

                          <button
                            type="button"
                            className="audit-view-button"
                            onClick={() =>
                              handleViewDetail(item)
                            }
                            title="Lihat detail"
                          >
                            <Eye
                              size={17}
                              strokeWidth={1.9}
                            />
                          </button>

                        </td>

                      </tr>

                    ))

                  ) : (

                    <tr>

                      <td
                        colSpan="6"
                        className="audit-empty"
                      >
                        Tidak ada data audit log.
                      </td>

                    </tr>

                  )}

                </tbody>

              </table>

            </div>

            {/* FOOTER */}
            <div className="audit-table-footer">

              <span className="audit-result-info">

                Menampilkan{" "}

                {totalEntries === 0
                  ? 0
                  : startIndex + 1}

                -

                {Math.min(
                  startIndex + itemsPerPage,
                  totalEntries
                )}

                {" "}dari {totalEntries} entri

              </span>

              <div className="audit-pagination">

                {/* PREVIOUS */}
                <button
                  type="button"
                  disabled={
                    safePage === 0
                  }
                  onClick={() =>
                    setPage((prev) =>
                      Math.max(prev - 1, 0)
                    )
                  }
                >
                  <ChevronLeft
                    size={16}
                    strokeWidth={1.8}
                  />
                </button>

                {/* PAGE NUMBERS (DINAMIS) */}
                {pageButtons.map((p) => (
                  <button
                    key={p}
                    type="button"
                    className={
                      safePage === p
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      setPage(p)
                    }
                  >
                    {p + 1}
                  </button>
                ))}

                {totalPages > 5 &&
                  pageButtons[pageButtons.length - 1] <
                    totalPages - 1 && (
                    <span className="pagination-dots">
                      ...
                    </span>
                  )}

                {/* NEXT */}
                <button
                  type="button"
                  disabled={
                    safePage >=
                      totalPages - 1 ||
                    totalPages <= 1
                  }
                  onClick={() =>
                    setPage((prev) =>
                      Math.min(
                        prev + 1,
                        totalPages - 1
                      )
                    )
                  }
                >
                  <ChevronRight
                    size={16}
                    strokeWidth={1.8}
                  />
                </button>

              </div>

            </div>

          </section>

        </div>

      </main>

    </div>
  );
}

export default AuditLog;
