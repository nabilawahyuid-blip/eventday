import React from "react";
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

function PengajuanPayout() {
  const navigate = useNavigate();

  const payoutData = [
    {
      id: "PO-001",
      event: "Jakarta Music Festival 2024",
      organizer: "PT Harmoni Musik Indonesia",
      date: "24 Sep 2025",
      status: "Pending",
      statusType: "pending",
    },
    {
      id: "PO-002",
      event: "Jazz Music Jogja",
      organizer: "PT Harmoni Musik Indonesia",
      date: "24 Sep 2025",
      status: "Pending",
      statusType: "pending",
    },
    {
      id: "PO-003",
      event: "Pianist Center",
      organizer: "CV Gelora Event Nusantara",
      date: "29 Aug 2025",
      status: "Disetujui",
      statusType: "approved",
    },
  ];

const handleDetail = (item) => {
  navigate(`/admin/pengajuan-payout/${item.id}`);
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
              Review dan verifikasi pengajuan Event Organizer baru.
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
                  24
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
                  DISETUJUI BULAN INI
                </span>

                <strong className="payout-stat-number">
                  156
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
                  8
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

            {payoutData.map((item) => (
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
            ))}

          </div>
        </div>
      </main>
    </div>
  );
}

export default PengajuanPayout;