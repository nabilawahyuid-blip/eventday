import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  WalletCards,
  CircleCheck,
  CircleX,
  Building2,
  Eye,
} from "lucide-react";

import Sidebar from "../shared/Sidebar";
import Navbar from "../shared/Navbar";

import "./PengajuanPayout.css";

import { getAdminPayouts } from "../../services/adminPayoutService";

import { showWarning } from "../../utils/alert";

// Status payout BE → label + class CSS (pending/approved/rejected)
const STATUS_MAP = {
  PENDING: { label: "Pending", statusType: "pending" },
  PROCESSING: { label: "Diproses", statusType: "pending" },
  APPROVED: { label: "Disetujui", statusType: "approved" },
  REJECTED: { label: "Ditolak", statusType: "rejected" },
};

const formatDate = (iso) => {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getItem = (item) => {
  const st = String(item.status || "PENDING").toUpperCase();
  const map = STATUS_MAP[st] || {
    label: item.status || "Pending",
    statusType: "pending",
  };

  return {
    id:
      item.id ||
      item.payout_id ||
      item.request_id ||
      item.payoutId,
    event:
      item.event?.title ||
      item.eventTitle ||
      item.eventName ||
      item.event?.name ||
      "-",
    organizer:
      item.nameOrganizer ||
      item.organizerName ||
      item.companyName ||
      item.organizer?.name ||
      item.user?.name ||
      item.userName ||
      "-",
    date: formatDate(item.createdAt || item.requestDate || item.submittedAt),
    status: map.label,
    statusType: map.statusType,
    rawStatus: st,
  };
};

function PengajuanPayout() {
  const navigate = useNavigate();

  const [payoutData, setPayoutData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPayouts = async () => {
    try {
      setLoading(true);
      const res = await getAdminPayouts("");
      const data = res?.data || res;
      const list = Array.isArray(data) ? data : data?.content || [];

      // Hanya tampilkan pengajuan PAYOUT EO.
      // Backend masih men-sharing tabel refund_requests sehingga record refund
      // customer ikut masuk (organizerId null + nameOrganizer "-").
      // Baris tanpa organizer = refund → dibuang dari list payout.
      const payoutsOnly = list.filter(
        (item) =>
          item.organizerId != null &&
          item.nameOrganizer &&
          item.nameOrganizer !== "-"
      );

      setPayoutData(payoutsOnly);
      setError("");
    } catch (err) {
      console.error("Gagal memuat payout:", err);
      setError(
        err?.data?.msg || err?.message || "Gagal memuat payout."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayouts();
  }, []);

  // Statistik turunan dari data yang dimuat
  const stats = payoutData.reduce(
    (acc, item) => {
      const st = String(item.rawStatus || item.status || "").toUpperCase();
      if (["PENDING", "PROCESSING"].includes(st)) acc.pending += 1;
      if (st === "APPROVED") acc.approved += 1;
      if (st === "REJECTED") acc.rejected += 1;
      return acc;
    },
    { pending: 0, approved: 0, rejected: 0 }
  );

  const handleDetail = async (item) => {
    if (!item?.id) {
      await showWarning(
        "ID Payout Tidak Ditemukan",
        "ID payout tidak ditemukan pada data."
      );

      return;
    }

    navigate(
      `/admin/pengajuan-payout/${item.id}`
    );
  };

  return (
    <div className="pengajuan-payout-page">
      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN */}
      <main className="pengajuan-payout-main">
        {/* NAVBAR */}
        <Navbar />

        <div className="pengajuan-payout-content">
          {/* HEADER */}
          <div className="pengajuan-payout-header">
            <h1>Pengajuan Payout</h1>

            <p>
              Review dan verifikasi pengajuan payout Event Organizer.
            </p>
          </div>

          {/* STATISTIC CARDS */}
          <div className="payout-statistics">

            {/* TOTAL PENDING */}
            <div className="payout-stat-card">
              <div className="payout-stat-info">
                <span className="payout-stat-label">
                  TOTAL PENDING
                </span>

                <strong className="payout-stat-number">
                  {stats.pending}
                </strong>
              </div>

              <div className="payout-stat-icon payout-icon-pending">
                <WalletCards
                  size={20}
                  strokeWidth={2}
                />
              </div>
            </div>

            {/* DISETUJUI */}
            <div className="payout-stat-card">
              <div className="payout-stat-info">
                <span className="payout-stat-label">
                  DISETUJUI
                </span>

                <strong className="payout-stat-number">
                  {stats.approved}
                </strong>
              </div>

              <div className="payout-stat-icon payout-icon-approved">
                <CircleCheck
                  size={21}
                  strokeWidth={2}
                />
              </div>
            </div>

            {/* DITOLAK */}
            <div className="payout-stat-card">
              <div className="payout-stat-info">
                <span className="payout-stat-label">
                  DITOLAK
                </span>

                <strong className="payout-stat-number">
                  {stats.rejected}
                </strong>
              </div>

              <div className="payout-stat-icon payout-icon-rejected">
                <CircleX
                  size={21}
                  strokeWidth={2}
                />
              </div>
            </div>

          </div>

          {/* PAYOUT LIST */}
          <div className="payout-list">

            {loading ? (
              <div className="payout-request-card payout-empty">
                Memuat pengajuan payout...
              </div>
            ) : error ? (
              <div className="payout-request-card payout-empty">
                {error}
              </div>
            ) : payoutData.length > 0 ? (

              payoutData.map((raw) => {
                const item = getItem(raw);

                return (
                  <div
                    className="payout-request-card"
                    key={item.id}
                  >

                    {/* LEFT ICON */}
                    <div className="payout-event-icon">
                      <Building2
                        size={21}
                        strokeWidth={1.8}
                      />
                    </div>

                    {/* EVENT INFORMATION */}
                    <div className="payout-event-info">

                      <h2>{item.event}</h2>

                      <p className="payout-organizer">
                        {item.organizer}
                      </p>

                      <p className="payout-date">
                        Diajukan pada {item.date}
                      </p>

                    </div>

                    {/* RIGHT SIDE */}
                    <div className="payout-request-action">

                      <span
                        className={`payout-status payout-status-${item.statusType}`}
                      >
                        {item.status}
                      </span>

                      <button
                        type="button"
                        className="payout-detail-button"
                        onClick={() => handleDetail(item)}
                      >
                        <span>Lihat Detail</span>

                        <Eye
                          size={14}
                          strokeWidth={1.8}
                        />
                      </button>

                    </div>

                  </div>
                );
              })

            ) : (

              <div className="payout-request-card payout-empty">
                Tidak ada pengajuan payout ditemukan.
              </div>

            )}

          </div>
        </div>
      </main>
    </div>
  );
}

export default PengajuanPayout;