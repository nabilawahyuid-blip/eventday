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
  Ticket,
  CalendarPlus,
  CircleCheck,
  LogIn,
  RotateCcw,
  UserRound,
} from "lucide-react";

import Sidebar from "../shared/Sidebar";
import Navbar from "../shared/Navbar";

import "./AuditLog.css";

function AuditLog() {
  const [search, setSearch] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("Semua Kategori");
  const [currentPage, setCurrentPage] = useState(1);
  const [auditData, setAuditData] = useState([]);
  const [totalEntries, setTotalEntries] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const itemsPerPage = 5;

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

    let activityType = "approval";

    if (rawAction.includes("TICKET")) {
      activityType = "ticket";
    } else if (rawAction.includes("EVENT")) {
      activityType = "event";
    } else if (
      rawAction.includes("APPROV") ||
      rawAction.includes("VERIF") ||
      rawAction.includes("EO")
    ) {
      activityType = "approval";
    } else if (
      rawAction.includes("LOGIN") ||
      rawAction.includes("AUTH")
    ) {
      activityType = "login";
    } else if (
      rawAction.includes("REFUND") ||
      rawAction.includes("PAYOUT")
    ) {
      activityType = "refund";
    }

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
    };
  };

  /* =========================================================
     LOAD DARI BACKEND (fallback ke mock bila BE mati)
  ========================================================= */

  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      const res = await getAdminAuditLogs(0, 100);
      const data = res?.data || res;
      const list = Array.isArray(data)
        ? data
        : data?.content || [];

      setAuditData(list);
      setTotalEntries(data?.totalElements ?? list.length);
      setLoadError("");
    } catch (err) {
      console.error("Gagal memuat audit log:", err);
      setLoadError(
        err?.data?.msg ||
          err?.message ||
          "Gagal memuat audit log."
      );
      setAuditData(mockAuditData);
      setTotalEntries(mockAuditData.length);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuditLogs();
  }, []);

  /* =========================================================
     DATA AUDIT LOG
  ========================================================= */

  const mockAuditData = [
    {
      id: "aud_8f9a2b1c",
      timestamp: "2023-10-24T14:30:15Z",

      date: "24 Okt 2023",
      time: "14:30 WIB",

      actor: "Budi Santoso",
      actorId: "U-8921",
      actorType: "User",

      avatar: "photo",

      ipAddress: "114.125.x.x",

      activity: "Pembelian Tiket",
      activityType: "ticket",

      detail:
        "Berhasil memproses pembayaran untuk Tiket VIP Event A.",

      status: "Berhasil",
      statusType: "success",

      targetId: "TRX-10294",
      targetType: "transaction",

      amount: "500000",
      currency: "IDR",
      paymentMethod: "credit_card",

      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) ...",
    },

    {
      id: "aud_7d8c1a2e",
      timestamp: "2023-10-24T13:15:00Z",

      date: "24 Okt 2023",
      time: "13:15 WIB",

      actor: "Maju Jaya Event",
      actorId: "E-102",
      actorType: "EO",

      avatar: "EO",

      ipAddress: "103.25.x.x",

      activity: "Tambah Event",
      activityType: "event",

      detail:
        'Membuat draft event baru "Tech Conference 2024".',

      status: "Berhasil",
      statusType: "success",

      targetId: "EVT-2024-001",
      targetType: "event",

      amount: "-",
      currency: "IDR",
      paymentMethod: "-",

      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) ...",
    },

    {
      id: "aud_6c7b2d3f",
      timestamp: "2023-10-24T11:05:00Z",

      date: "24 Okt 2023",
      time: "11:05 WIB",

      actor: "Siti Rahma",
      actorId: "SP-001",
      actorType: "Superadmin",

      avatar: "photo",

      ipAddress: "103.45.x.x",

      activity: "Persetujuan EO",
      activityType: "approval",

      detail:
        'Menyetujui aplikasi akun EO untuk "Berkah Organizer".',

      status: "Berhasil",
      statusType: "success",

      targetId: "EO-001",
      targetType: "event_organizer",

      amount: "-",
      currency: "IDR",
      paymentMethod: "-",

      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) ...",
    },

    {
      id: "aud_5a6b3c4d",
      timestamp: "2023-10-24T09:45:00Z",

      date: "24 Okt 2023",
      time: "09:45 WIB",

      actor: "Unknown",
      actorId: "Unauthenticated",
      actorType: "Unknown",

      avatar: "unknown",

      ipAddress: "192.168.1.1",

      activity: "Percobaan Login Gagal",
      activityType: "login",

      detail:
        "Percobaan login gagal melebihi batas (5x) dari IP 192.168.1.1.",

      status: "Gagal",
      statusType: "failed",

      targetId: "-",
      targetType: "-",

      amount: "-",
      currency: "IDR",
      paymentMethod: "-",

      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) ...",
    },

    {
      id: "aud_4e5f6a7b",
      timestamp: "2023-10-24T08:20:00Z",

      date: "24 Okt 2023",
      time: "08:20 WIB",

      actor: "Alex Johnson",
      actorId: "SP-002",
      actorType: "Superadmin",

      avatar: "unknown",

      ipAddress: "114.125.x.x",

      activity: "Proses Refund",
      activityType: "refund",

      detail:
        "Refund disetujui untuk Transaksi #TRX-9921.",

      status: "Berhasil",
      statusType: "success",

      targetId: "TRX-9921",
      targetType: "transaction",

      amount: "1500000",
      currency: "IDR",
      paymentMethod: "credit_card",

      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) ...",
    },

    {
      id: "aud_3d4e5f6a",
      timestamp: "2023-10-23T16:20:00Z",

      date: "23 Okt 2023",
      time: "16:20 WIB",

      actor: "Dina Putri",
      actorId: "U-7832",
      actorType: "User",

      avatar: "unknown",

      ipAddress: "103.10.x.x",

      activity: "Pembelian Tiket",
      activityType: "ticket",

      detail:
        "Berhasil memproses pembayaran untuk Tiket Regular Event B.",

      status: "Berhasil",
      statusType: "success",

      targetId: "TRX-9918",
      targetType: "transaction",

      amount: "250000",
      currency: "IDR",
      paymentMethod: "credit_card",

      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) ...",
    },

    {
      id: "aud_2b3c4d5e",
      timestamp: "2023-10-23T14:10:00Z",

      date: "23 Okt 2023",
      time: "14:10 WIB",

      actor: "Nusantara Event",
      actorId: "E-118",
      actorType: "EO",

      avatar: "EO",

      ipAddress: "103.22.x.x",

      activity: "Tambah Event",
      activityType: "event",

      detail:
        'Membuat draft event baru "Music Festival 2024".',

      status: "Berhasil",
      statusType: "success",

      targetId: "EVT-2024-002",
      targetType: "event",

      amount: "-",
      currency: "IDR",
      paymentMethod: "-",

      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) ...",
    },

    {
      id: "aud_1a2b3c4d",
      timestamp: "2023-10-23T10:30:00Z",

      date: "23 Okt 2023",
      time: "10:30 WIB",

      actor: "Unknown",
      actorId: "Unauthenticated",
      actorType: "Unknown",

      avatar: "unknown",

      ipAddress: "192.168.1.8",

      activity: "Percobaan Login Gagal",
      activityType: "login",

      detail:
        "Percobaan login gagal dari perangkat yang tidak dikenal.",

      status: "Gagal",
      statusType: "failed",

      targetId: "-",
      targetType: "-",

      amount: "-",
      currency: "IDR",
      paymentMethod: "-",

      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) ...",
    },
  ];

  /* =========================================================
     ICON AKTIVITAS
  ========================================================= */

  const getActivityIcon = (type) => {
    switch (type) {
      case "ticket":
        return <Ticket size={12} strokeWidth={2} />;

      case "event":
        return <CalendarPlus size={12} strokeWidth={2} />;

      case "approval":
        return <CircleCheck size={12} strokeWidth={2} />;

      case "login":
        return <LogIn size={12} strokeWidth={2} />;

      case "refund":
        return <RotateCcw size={12} strokeWidth={2} />;

      default:
        return <CircleCheck size={12} strokeWidth={2} />;
    }
  };

  /* =========================================================
     FILTER DATA
  ========================================================= */

  const filteredData = useMemo(() => {
    return auditData.map(normalizeLog).filter((item) => {
      const searchValue = search.toLowerCase().trim();

      const matchesSearch =
        !searchValue ||
        item.actor.toLowerCase().includes(searchValue) ||
        item.activity.toLowerCase().includes(searchValue) ||
        item.detail.toLowerCase().includes(searchValue) ||
        item.actorId.toLowerCase().includes(searchValue);

      const categoryKey = {
        "Pembelian Tiket": ["TICKET", "PEMBELIAN"],
        "Tambah Event": ["EVENT", "TAMBAH"],
        "Persetujuan EO": [
          "APPROV",
          "VERIF",
          "PERSETUJUAN",
          "EO",
        ],
        "Percobaan Login Gagal": [
          "LOGIN",
          "AUTH",
          "PERCOBAAN",
        ],
        "Proses Refund": [
          "REFUND",
          "PAYOUT",
          "PROSES",
        ],
      }[category];

      const matchesCategory =
        category === "Semua Kategori" ||
        !categoryKey ||
        categoryKey.some((k) =>
          `${item.activity} ${item.activityType}`
            .toUpperCase()
            .includes(k)
        );

      let matchesDate = true;

      if (date) {
        const selectedDate = new Date(date);

        const formattedDate = selectedDate.toLocaleDateString(
          "id-ID",
          {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }
        );

        const normalizedSelectedDate =
          formattedDate.replace(".", "");

        matchesDate =
          item.date.toLowerCase() ===
          normalizedSelectedDate.toLowerCase();
      }

      return (
        matchesSearch &&
        matchesCategory &&
        matchesDate
      );
    });
  }, [search, category, date, auditData]);

  /* =========================================================
     PAGINATION
  ========================================================= */

  const totalPages = Math.max(
    1,
    Math.ceil(filteredData.length / itemsPerPage)
  );

  const safeCurrentPage = Math.min(
    currentPage,
    totalPages
  );

  const startIndex =
    (safeCurrentPage - 1) * itemsPerPage;

  const displayedData = filteredData.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  /* =========================================================
     EXPORT CSV
  ========================================================= */

  const handleExportCSV = async () => {
    if (filteredData.length === 0) {
      Swal.fire({
        icon: "info",
        title: "Tidak ada data",
        text: "Tidak ada data audit log yang dapat diekspor.",
        confirmButtonColor: "#5546df",
      });

      return;
    }

    // Utamakan export dari backend (GET /api/admin/audit-logs/export/csv)
    try {
      await exportAdminAuditLogsCSV();

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

    const rows = filteredData.map((item) => [
      item.id,
      item.timestamp,
      item.date,
      item.time,
      item.actor,
      item.actorId,
      item.actorType,
      item.ipAddress,
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
      text: `${filteredData.length} data audit log berhasil diekspor.`,
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

      html: `
        <div class="audit-popup-container">

          <div class="audit-popup-section">
            <span class="audit-popup-label">
              LOG ID
            </span>

            <span class="audit-popup-value">
              ${item.id}
            </span>
          </div>

          <div class="audit-popup-section">
            <span class="audit-popup-label">
              TIMESTAMP
            </span>

            <span class="audit-popup-value">
              ${item.timestamp}
            </span>
          </div>

          <div class="audit-popup-section">
            <span class="audit-popup-label">
              WAKTU
            </span>

            <span class="audit-popup-value">
              ${item.date} • ${item.time}
            </span>
          </div>

          <div class="audit-popup-section">
            <span class="audit-popup-label">
              AKTOR
            </span>

            <span class="audit-popup-value">
              ${item.actor}
            </span>
          </div>

          <div class="audit-popup-section">
            <span class="audit-popup-label">
              ID AKTOR
            </span>

            <span class="audit-popup-value">
              ${item.actorId}
            </span>
          </div>

          <div class="audit-popup-section">
            <span class="audit-popup-label">
              TIPE AKTOR
            </span>

            <span class="audit-popup-value">
              ${item.actorType}
            </span>
          </div>

          <div class="audit-popup-section">
            <span class="audit-popup-label">
              IP ADDRESS
            </span>

            <span class="audit-popup-value">
              ${item.ipAddress}
            </span>
          </div>

          <div class="audit-popup-section">
            <span class="audit-popup-label">
              AKTIVITAS
            </span>

            <span class="audit-popup-value">
              ${item.activity}
            </span>
          </div>

          <div class="audit-popup-section audit-popup-description-row">
            <span class="audit-popup-label">
              DETAIL / DESKRIPSI
            </span>

            <span class="audit-popup-value">
              ${item.detail}
            </span>
          </div>

          <div class="audit-popup-section">
            <span class="audit-popup-label">
              STATUS
            </span>

            <span class="
              audit-popup-status
              ${
                item.statusType === "success"
                  ? "success"
                  : "failed"
              }
            ">
              ${item.status}
            </span>
          </div>

          <div class="audit-popup-section">
            <span class="audit-popup-label">
              TARGET ID
            </span>

            <span class="audit-popup-value">
              ${item.targetId}
            </span>
          </div>

          <div class="audit-popup-section">
            <span class="audit-popup-label">
              TARGET TYPE
            </span>

            <span class="audit-popup-value">
              ${item.targetType}
            </span>
          </div>

          <div class="audit-popup-section">
            <span class="audit-popup-label">
              AMOUNT
            </span>

            <span class="audit-popup-value">
              ${item.amount}
            </span>
          </div>

          <div class="audit-popup-section">
            <span class="audit-popup-label">
              CURRENCY
            </span>

            <span class="audit-popup-value">
              ${item.currency}
            </span>
          </div>

          <div class="audit-popup-section">
            <span class="audit-popup-label">
              PAYMENT METHOD
            </span>

            <span class="audit-popup-value">
              ${item.paymentMethod}
            </span>
          </div>

          <div class="audit-popup-section audit-popup-user-agent">
            <span class="audit-popup-label">
              USER AGENT
            </span>

            <span class="audit-popup-value">
              ${item.userAgent}
            </span>
          </div>

        </div>
      `,

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
                  setCurrentPage(1);
                }}
                placeholder="Cari aktor atau aktivitas..."
              />
            </div>

            {/* DATE */}
            <div className="audit-date-box">
              <CalendarDays
                size={16}
                strokeWidth={1.9}
              />

              <input
                type="date"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            {/* CATEGORY */}
            <div className="audit-category-box">
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option>
                  Semua Kategori
                </option>

                <option>
                  Pembelian Tiket
                </option>

                <option>
                  Tambah Event
                </option>

                <option>
                  Persetujuan EO
                </option>

                <option>
                  Percobaan Login Gagal
                </option>

                <option>
                  Proses Refund
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
                        {loadError} — menampilkan data contoh.
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

                {filteredData.length === 0
                  ? 0
                  : startIndex + 1}

                -

                {Math.min(
                  startIndex + itemsPerPage,
                  filteredData.length
                )}

                {" "}dari {totalEntries} entri

              </span>

              <div className="audit-pagination">

                {/* PREVIOUS */}
                <button
                  type="button"
                  disabled={
                    safeCurrentPage === 1
                  }
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.max(prev - 1, 1)
                    )
                  }
                >
                  <ChevronLeft
                    size={16}
                    strokeWidth={1.8}
                  />
                </button>

                {/* PAGE NUMBERS (DINAMIS) */}
                {Array.from(
                  { length: Math.min(totalPages, 5) },
                  (_, i) => i + 1
                ).map((p) => (
                  <button
                    key={p}
                    type="button"
                    className={
                      safeCurrentPage === p
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      setCurrentPage(p)
                    }
                  >
                    {p}
                  </button>
                ))}

                {totalPages > 5 && (
                  <span className="pagination-dots">
                    ...
                  </span>
                )}

                {/* NEXT */}
                <button
                  type="button"
                  disabled={
                    safeCurrentPage >=
                      totalPages ||
                    totalPages === 1
                  }
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.min(
                        prev + 1,
                        totalPages
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