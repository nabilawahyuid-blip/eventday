import React from "react";
import { Check, X } from "lucide-react";

import SidebarEO from "../shared/SidebarEO";
import NavbarEO from "../shared/NavbarEO";

import "./RefundEO.css";
const refundData = [
  {
    id: 1,
    customer: "Ahmad Hidayat",
    ticket: "VIP Festival Day 1",
    transaction: "TRX-9982-A",
    reason: "Acara berbenturan dengan jadwal dinas...",
    status: "Approved",
  },
  {
    id: 2,
    customer: "Budi Santoso",
    ticket: "Regular Pass",
    transaction: "TRX-7712-B",
    reason: "Sakit parah, surat dokter terlampir...",
    status: "Approved",
  },
  {
    id: 3,
    customer: "Siti Rahma",
    ticket: "Early Bird Pass",
    transaction: "TRX-4421-P",
    reason: "Salah beli tiket untuk hari yang berbeda...",
    status: "Menunggu",
  },
  {
    id: 4,
    customer: "Dian Sastro",
    ticket: "Group Package (5 Pax)",
    transaction: "TRX-1102-R",
    reason: "Alasan tidak valid sesuai S&K...",
    status: "Rejected",
  },
  {
    id: 5,
    customer: "Eka Putra",
    ticket: "VIP Backstage",
    transaction: "TRX-1103-R",
    reason: "Permintaan melewati batas waktu H-7...",
    status: "Rejected",
  },
];

function Refund() {
  const handleDetail = (refund) => {
    console.log("Detail refund:", refund);
  };

  const handleApprove = (refund) => {
    console.log("Setujui refund:", refund);
  };

  const handleReject = (refund) => {
    console.log("Tolak refund:", refund);
  };

  return (
    <div className="refund-layout">

      {/* SIDEBAR */}
      <SidebarEO />

      {/* AREA UTAMA */}
      <div className="refund-main">

        {/* NAVBAR */}
        <NavbarEO />

        <main className="refund-content">

          {/* TITLE */}
          <div className="refund-header">
            <h1>Refund</h1>

            <div className="refund-description">
              <h2>Daftar Refund</h2>
              <p>
                Kelola permintaan pengembalian dana tiket.
              </p>
            </div>
          </div>

          {/* LIST REFUND */}
          <div className="refund-list">

            {refundData.map((refund) => (
              <div
                key={refund.id}
                className={`refund-card ${
                  refund.status === "Menunggu"
                    ? "refund-card-pending"
                    : ""
                }`}
              >

                {/* DATA REFUND */}
                <div className="refund-info">

                  {/* CUSTOMER */}
                  <div className="refund-column">
                    <div className="refund-item">
                      <span className="refund-label">
                        {refund.id >= 3
                          ? `NAMA CUSTOMER ${refund.id}`
                          : "NAMA CUSTOMER"}
                      </span>

                      <span className="refund-value customer-name">
                        {refund.customer}
                      </span>
                    </div>

                    <div className="refund-item transaction-item">
                      <span className="refund-label">
                        ID TRANSAKSI
                      </span>

                      <span className="refund-value transaction-id">
                        {refund.transaction}
                      </span>
                    </div>
                  </div>

                  {/* TICKET */}
                  <div className="refund-column">
                    <div className="refund-item">
                      <span className="refund-label">
                        TIKET YANG DIPESAN
                      </span>

                      <span className="refund-value">
                        {refund.ticket}
                      </span>
                    </div>

                    <div className="refund-item reason-item">
                      <span className="refund-label">
                        ALASAN REFUND
                      </span>

                      <span className="refund-value reason-text">
                        {refund.reason}
                      </span>
                    </div>
                  </div>

                </div>

                {/* ACTION AREA */}
                <div className="refund-action">

                  {/* STATUS */}
                  <span
                    className={`refund-status ${
                      refund.status === "Approved"
                        ? "status-approved"
                        : refund.status === "Menunggu"
                        ? "status-pending"
                        : "status-rejected"
                    }`}
                  >
                    {refund.status}
                  </span>

                  {/* DETAIL */}
                  <button
                    className={`detail-refund-btn ${
                      refund.status === "Rejected"
                        ? "detail-disabled"
                        : ""
                    }`}
                    onClick={() => handleDetail(refund)}
                  >
                    Detail Refund
                  </button>

                </div>

                {/* PENDING ACTION */}
                {refund.status === "Menunggu" && (
                  <div className="pending-action">

                    <span className="pending-text">
                      Tindakan Diperlukan
                    </span>

                    <div className="pending-buttons">

                      <button
                        className="reject-btn"
                        onClick={() => handleReject(refund)}
                      >
                        <X size={15} strokeWidth={2.5} />
                        Tolak
                      </button>

                      <button
                        className="approve-btn"
                        onClick={() => handleApprove(refund)}
                      >
                        <Check size={15} strokeWidth={2.5} />
                        Setujui
                      </button>

                    </div>

                  </div>
                )}

              </div>
            ))}

          </div>

        </main>
      </div>
    </div>
  );
}

export default Refund;