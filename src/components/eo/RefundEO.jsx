import React from "react";
import { useNavigate } from "react-router-dom";
import SidebarEO from "../shared/SidebarEO";
import NavbarEO from "../shared/NavbarEO";
import "./RefundEO.css";

function RefundEO() {
  const navigate = useNavigate();

  const refundData = [
    {
      id: "TRX-9982-A",
      customer: "Ahmad Hidayat",
      ticket: "VIP Festival Day 1",
      reason: "Acara berbenturan dengan jadwal dinas...",
      status: "Approved",
      statusClass: "approved",
    },
    {
      id: "TRX-7712-B",
      customer: "Budi Santoso",
      ticket: "Regular Pass",
      reason: "Sakit parah, surat dokter terlampir...",
      status: "Approved",
      statusClass: "approved",
    },
    {
      id: "TRX-4421-P",
      customer: "Siti Rahma",
      ticket: "Early Bird Pass",
      reason: "Salah beli tiket untuk hari yang berbeda...",
      status: "Menunggu",
      statusClass: "pending",
      action: true,
    },
    {
      id: "TRX-1102-R",
      customer: "Dian Sastro",
      ticket: "Group Package (5 Pax)",
      reason: "Alasan tidak valid sesuai S&K...",
      status: "Rejected",
      statusClass: "rejected",
    },
    {
      id: "TRX-1103-R",
      customer: "Nia Eka Putri",
      ticket: "VIP Backstage",
      reason: "Permintaan melewati batas waktu H-7...",
      status: "Rejected",
      statusClass: "rejected",
    },
  ];

  const handleDetail = (refund) => {
    navigate(`/eo/refund/${refund.id}`);
  };

  const handleApprove = (refund) => {
    alert(`Refund ${refund.id} disetujui`);
  };

  const handleReject = (refund) => {
    alert(`Refund ${refund.id} ditolak`);
  };

  return (
    <div className="refund-page">

      {/* SIDEBAR */}
      <SidebarEO />

      {/* MAIN AREA */}
      <main className="refund-main">

        {/* NAVBAR */}
        <NavbarEO />

        {/* CONTENT */}
        <div className="refund-content">

          {/* HEADER */}
          <div className="refund-header">
            <div>
              <h1>Daftar Refund</h1>
              <p>Kelola permintaan pengembalian dana tiket.</p>
            </div>
          </div>

          {/* FILTER / SEARCH */}
          <div className="refund-toolbar">

            <div className="refund-search">
              <span>⌕</span>
              <input
                type="text"
                placeholder="Cari refund..."
              />
            </div>

            <select className="refund-filter">
              <option>Semua Status</option>
              <option>Menunggu</option>
              <option>Approved</option>
              <option>Rejected</option>
            </select>

          </div>

          {/* REFUND LIST */}
          <section className="refund-list">

            {refundData.map((refund) => (
              <div
                className={`refund-card ${
                  refund.action ? "refund-pending-card" : ""
                }`}
                key={refund.id}
              >

                {/* CUSTOMER */}
                <div className="refund-column customer-column">

                  <span className="refund-label">
                    NAMA CUSTOMER
                  </span>

                  <strong>
                    {refund.customer}
                  </strong>

                  <span className="refund-label refund-id-label">
                    ID TRANSAKSI
                  </span>

                  <span className="refund-id">
                    {refund.id}
                  </span>

                </div>

                {/* TICKET */}
                <div className="refund-column ticket-column">

                  <span className="refund-label">
                    TIKET YANG DIPESAN
                  </span>

                  <strong>
                    {refund.ticket}
                  </strong>

                  <span className="refund-label refund-reason-label">
                    ALASAN REFUND
                  </span>

                  <span className="refund-reason">
                    {refund.reason}
                  </span>

                </div>

                {/* RIGHT SIDE */}
                <div className="refund-action-area">

                  <span
                    className={`refund-status ${refund.statusClass}`}
                  >
                    {refund.status}
                  </span>

                  <button
                    className="refund-detail-button"
                    onClick={() => handleDetail(refund)}
                  >
                    Detail Refund
                  </button>

                </div>

                {/* APPROVE / REJECT */}
                {refund.action && (
                  <div className="refund-decision">

                    <span>
                      Tindakan Diperlukan
                    </span>

                    <div className="decision-buttons">

                      <button
                        className="reject-button"
                        onClick={() => handleReject(refund)}
                      >
                        ✕ Tolak
                      </button>

                      <button
                        className="approve-button"
                        onClick={() => handleApprove(refund)}
                      >
                        ✓ Setujui
                      </button>

                    </div>

                  </div>
                )}

              </div>
            ))}

          </section>

        </div>

      </main>

    </div>
  );
}

export default RefundEO;