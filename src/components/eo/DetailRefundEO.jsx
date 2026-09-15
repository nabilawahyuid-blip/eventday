import React, { useState } from "react";
import { Gavel, Ticket, ArrowRight } from "lucide-react";

import SidebarEO from "../shared/SidebarEO";
import NavbarEO from "../shared/NavbarEO";
import "./DetailRefundEO.css";

function DetailRefundEO() {
  const [percentage, setPercentage] = useState(100);
  const [note, setNote] = useState("");

  const totalPaid = 1500000;

  const refundAmount =
    (totalPaid * Number(percentage || 0)) / 100;

  const formatRupiah = (number) => {
    return new Intl.NumberFormat("id-ID").format(number);
  };

  return (
    <div className="detail-refund-page">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}
      <SidebarEO />


      {/* =====================================================
          MAIN
      ===================================================== */}
      <main className="detail-refund-main">

        {/* =================================================
            NAVBAR
        ================================================= */}
        <NavbarEO />


        {/* =================================================
            CONTENT
        ================================================= */}
        <div className="detail-refund-content">

          {/* =================================================
              BREADCRUMB
          ================================================= */}
          <div className="refund-breadcrumb">
            <span>›</span>
            <span>Request #RF-9982</span>
          </div>


          {/* =================================================
              TITLE
          ================================================= */}
          <div className="refund-title-row">

            <div className="refund-title-left">

              <h1>Refund Detail</h1>

              <span className="pending-badge">
                PENDING
              </span>

            </div>


            <p className="request-date">
              Requested on Oct 24, 2023
            </p>

          </div>


          {/* =================================================
              MAIN LAYOUT

              LEFT  = Customer + Ticket + Refund Reason
              RIGHT = Tindakan Penyelenggara
          ================================================= */}
          <div className="refund-main-layout">


            {/* =================================================
                LEFT AREA
            ================================================= */}
            <div className="refund-left-area">


              {/* =================================================
                  CUSTOMER + TICKET TITLES
              ================================================= */}
              <div className="information-header-row">

                <h2 className="information-title">
                  Customer Information
                </h2>

                <h2 className="information-title">
                  Ticket Information
                </h2>

              </div>


              {/* =================================================
                  CUSTOMER + TICKET CARDS
              ================================================= */}
              <div className="information-card-row">


                {/* =================================================
                    CUSTOMER CARD
                ================================================= */}
                <section className="refund-card customer-information">

                  <div className="customer-grid">

                    <div className="customer-item">

                      <span className="field-label">
                        NAME
                      </span>

                      <span className="field-value">
                        Ahmad Hidayat
                      </span>

                    </div>


                    <div className="customer-item">

                      <span className="field-label">
                        TRANSACTION ID
                      </span>

                      <span className="field-value">
                        TRX-9982-A
                      </span>

                    </div>

                  </div>

                </section>


                {/* =================================================
                    TICKET CARD
                ================================================= */}
                <section className="refund-card ticket-information">

                  <div className="ticket-box">

                    {/* TICKET ICON */}
                    <div className="ticket-icon">

                      <Ticket
                        size={22}
                        strokeWidth={2}
                      />

                    </div>


                    {/* TICKET DETAIL */}
                    <div className="ticket-detail">

                      <span className="ticket-name">
                        VIP Festival Day 1
                      </span>

                      <span className="ticket-quantity">
                        Qty: 2 Tickets
                      </span>

                    </div>


                    {/* TICKET PRICE */}
                    <div className="ticket-price">

                      <span className="ticket-total">
                        Rp 1.500.000
                      </span>

                      <span className="ticket-paid">
                        Total Paid
                      </span>

                    </div>

                  </div>

                </section>

              </div>


              {/* =================================================
                  REFUND REASON
              ================================================= */}
              <div className="refund-reason-wrapper">

                <h2 className="information-title refund-reason-title">
                  Refund Reason
                </h2>


                <section className="refund-card refund-reason">

                  <div className="reason-line"></div>

                  <div className="reason-box">
                    “Acara berbenturan dengan jadwal dinas
                    yang mendadak keluar hari ini. Mohon
                    bantuannya untuk proses refund. Terima kasih.”
                  </div>

                </section>

              </div>

            </div>


            {/* =================================================
                RIGHT AREA
                TINDAKAN PENYELENGGARA
            ================================================= */}
            <aside className="organizer-action">


              {/* =================================================
                  ORGANIZER TITLE
              ================================================= */}
              <div className="organizer-title">

                <Gavel
                  className="gavel"
                  size={25}
                  strokeWidth={2}
                />

                <h2>
                  Tindakan
                  <br />
                  Penyelenggara
                </h2>

              </div>


              {/* =================================================
                  DECISION BUTTONS
              ================================================= */}
              <div className="decision-buttons">

                <button
                  type="button"
                  className="reject-button"
                >
                  Tolak
                </button>


                <button
                  type="button"
                  className="approve-button"
                >
                  Setujui
                </button>

              </div>


              {/* =================================================
                  PERCENTAGE REFUND
              ================================================= */}
              <div className="percentage-section">

                <label className="action-label">
                  PERSENTASE REFUND (%)
                </label>


                <div className="percentage-input">

                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={percentage}
                    onChange={(e) => {

                      let value = Number(
                        e.target.value
                      );

                      if (value < 0) {
                        value = 0;
                      }

                      if (value > 100) {
                        value = 100;
                      }

                      setPercentage(value);

                    }}
                  />


                  <span>%</span>

                </div>

              </div>


              {/* =================================================
                  TOTAL REFUND
              ================================================= */}
              <div className="total-refund">

                <span className="total-label">
                  TOTAL PENGEMBALIAN DANA
                </span>


                <span className="total-amount">
                  Rp {formatRupiah(refundAmount)}
                </span>

              </div>


              {/* =================================================
                  NOTE
              ================================================= */}
              <div className="note-section">

                <label className="action-label">

                  CATATAN PENYELENGGARA

                  <br />

                  (OPSIONAL)

                </label>


                <textarea
                  value={note}
                  onChange={(e) =>
                    setNote(e.target.value)
                  }
                  placeholder="Tambahkan catatan untuk customer..."
                />

              </div>


              {/* =================================================
                  CONFIRM BUTTON
              ================================================= */}
              <button
                type="button"
                className="confirm-button"
              >

                <span>
                  Konfirmasi Keputusan
                </span>

                <ArrowRight
                  size={17}
                  strokeWidth={2}
                />

              </button>

            </aside>

          </div>

        </div>

      </main>

    </div>
  );
}

export default DetailRefundEO;