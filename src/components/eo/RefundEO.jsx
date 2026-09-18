import React, { useEffect, useState } from "react";
import SidebarEO from "../shared/SidebarEO";
import NavbarEO from "../shared/NavbarEO";
import "./RefundEO.css";

import {
  getOrganizerRefunds,
  getOrganizerRefundDetail,
  updateOrganizerRefundStatus,
} from "../../services/organizerRefundService";

function RefundEO() {
  // =========================================
  // STATE
  // =========================================

  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);

  // Detail modal
  const [showDetail, setShowDetail] = useState(false);
  const [detailData, setDetailData] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Loading approve / reject
  const [processingId, setProcessingId] = useState(null);

  // =========================================
  // FORMAT RUPIAH
  // =========================================

  const formatRupiah = (amount) => {
    return `Rp ${Number(amount || 0).toLocaleString("id-ID")}`;
  };

  // =========================================
  // FORMAT TANGGAL
  // =========================================

  const formatDate = (date) => {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "-";
    }

    return parsedDate.toLocaleString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // =========================================
  // STATUS CLASS
  // =========================================

  const getStatusClass = (status) => {
    const normalizedStatus = String(status || "").toUpperCase();

    if (
      normalizedStatus === "APPROVED" ||
      normalizedStatus === "ACCEPTED"
    ) {
      return "status-approved";
    }

    if (
      normalizedStatus === "REJECTED" ||
      normalizedStatus === "DENIED"
    ) {
      return "status-rejected";
    }

    return "status-pending";
  };

  // =========================================
  // STATUS LABEL
  // =========================================

  const getStatusLabel = (status) => {
    const normalizedStatus = String(status || "").toUpperCase();

    switch (normalizedStatus) {
      case "APPROVED":
      case "ACCEPTED":
        return "Disetujui";

      case "PENDING":
      case "WAITING":
        return "Menunggu";

      case "REJECTED":
      case "DENIED":
        return "Ditolak";

      default:
        return status || "-";
    }
  };

  // =========================================
  // GET REFUND LIST
  // =========================================

  const fetchRefunds = async () => {
    try {
      setLoading(true);

      const response = await getOrganizerRefunds();

      console.log("REFUND LIST RESPONSE:", response);

      setRefunds(response?.data || []);
    } catch (error) {
      console.error("Gagal mengambil data refund:", error);

      setRefunds([]);
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // LOAD DATA SAAT HALAMAN DIBUKA
  // =========================================

  useEffect(() => {
    fetchRefunds();
  }, []);

  // =========================================
  // DETAIL REFUND
  // =========================================

  const handleDetail = async (refundId) => {
    try {
      setShowDetail(true);
      setLoadingDetail(true);
      setDetailData(null);

      const response = await getOrganizerRefundDetail(refundId);

      console.log("DETAIL REFUND RESPONSE:", response);

      setDetailData(response?.data || null);
    } catch (error) {
      console.error("Gagal mengambil detail refund:", error);

      alert(
        error?.message || "Gagal mengambil detail refund."
      );

      setShowDetail(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  // =========================================
  // CLOSE DETAIL
  // =========================================

  const closeDetail = () => {
    setShowDetail(false);
    setDetailData(null);
  };

  // =========================================
  // APPROVE REFUND
  // =========================================

  const handleApprove = async (refundId) => {
    const confirmed = window.confirm(
      "Apakah kamu yakin ingin menyetujui refund ini?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setProcessingId(refundId);

      await updateOrganizerRefundStatus(
        refundId,
        "APPROVED"
      );

      alert("Refund berhasil disetujui.");

      await fetchRefunds();
    } catch (error) {
      console.error("Gagal menyetujui refund:", error);

      alert(
        error?.message || "Gagal menyetujui refund."
      );
    } finally {
      setProcessingId(null);
    }
  };

  // =========================================
  // REJECT REFUND
  // =========================================

  const handleReject = async (refundId) => {
    const confirmed = window.confirm(
      "Apakah kamu yakin ingin menolak refund ini?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setProcessingId(refundId);

      await updateOrganizerRefundStatus(
        refundId,
        "REJECTED"
      );

      alert("Refund berhasil ditolak.");

      await fetchRefunds();
    } catch (error) {
      console.error("Gagal menolak refund:", error);

      alert(
        error?.message || "Gagal menolak refund."
      );
    } finally {
      setProcessingId(null);
    }
  };

  // =========================================
  // RENDER
  // =========================================

  return (
    <div className="refund-layout">

      {/* =====================================
          SIDEBAR EO
      ===================================== */}

      <SidebarEO />

      {/* =====================================
          MAIN CONTENT
      ===================================== */}

      <main className="refund-main">

        {/* NAVBAR EO */}

        <NavbarEO />

        {/* CONTENT */}

        <div className="refund-content">

          {/* =====================================
              HEADER
          ===================================== */}

          <div className="refund-header">

            <h1>Refund</h1>

            <div className="refund-description">

              <h2>Daftar Refund</h2>

              <p>
                Kelola permintaan pengembalian dana tiket.
              </p>

            </div>

          </div>

          {/* =====================================
              REFUND LIST
          ===================================== */}

          <div className="refund-list">

            {/* LOADING */}

            {loading && (
              <div className="refund-empty">
                Memuat data refund...
              </div>
            )}

            {/* EMPTY */}

            {!loading && refunds.length === 0 && (
              <div className="refund-empty">
                Tidak ada permintaan refund.
              </div>
            )}

            {/* DATA REFUND */}

            {!loading &&
              refunds.map((refund) => {

                const status = String(
                  refund.status || ""
                ).toUpperCase();

                const isPending =
                  status === "PENDING";

                const isProcessing =
                  processingId === refund.refund_id;

                return (
                  <div
                    className={`refund-card ${
                      isPending
                        ? "refund-card-pending"
                        : ""
                    }`}
                    key={refund.refund_id}
                  >

                    {/* =================================
                        REFUND INFORMATION
                    ================================= */}

                    <div className="refund-info">

                      {/* COLUMN 1 */}

                      <div className="refund-column">

                        {/* ID REFUND */}

                        <div className="refund-item">

                          <span className="refund-label">
                            ID REFUND
                          </span>

                          <span className="refund-value">
                            {refund.refund_id || "-"}
                          </span>

                        </div>

                        {/* ID TRANSAKSI */}

                        <div className="transaction-item">

                          <span className="refund-label">
                            ID TRANSAKSI
                          </span>

                          <span className="transaction-id">
                            {refund.order_id || "-"}
                          </span>

                        </div>

                      </div>

                      {/* COLUMN 2 */}

                      <div className="refund-column">

                        {/* JUMLAH REFUND */}

                        <div className="refund-item">

                          <span className="refund-label">
                            JUMLAH REFUND
                          </span>

                          <span className="refund-value">
                            {formatRupiah(
                              refund.amount
                            )}
                          </span>

                        </div>

                        {/* ALASAN REFUND */}

                        <div className="reason-item">

                          <span className="refund-label">
                            ALASAN REFUND
                          </span>

                          <span className="reason-text">
                            {refund.reason || "-"}
                          </span>

                        </div>

                      </div>

                    </div>

                    {/* =================================
                        RIGHT ACTION
                    ================================= */}

                    <div className="refund-action">

                      {/* STATUS */}

                      <span
                        className={`refund-status ${getStatusClass(
                          refund.status
                        )}`}
                      >
                        {getStatusLabel(
                          refund.status
                        )}
                      </span>

                      {/* DETAIL BUTTON */}

                      <button
                        type="button"
                        className="detail-refund-btn"
                        onClick={() =>
                          handleDetail(
                            refund.refund_id
                          )
                        }
                      >
                        Detail Refund
                      </button>

                    </div>

                    {/* =================================
                        PENDING ACTION
                    ================================= */}

                    {isPending && (
                      <div className="pending-action">

                        <p className="pending-text">
                          Tindakan Diperlukan
                        </p>

                        <div className="pending-buttons">

                          {/* TOLAK */}

                          <button
                            type="button"
                            className="reject-btn"
                            disabled={isProcessing}
                            onClick={() =>
                              handleReject(
                                refund.refund_id
                              )
                            }
                          >

                            <span>✕</span>

                            {isProcessing
                              ? "Memproses..."
                              : "Tolak"}

                          </button>

                          {/* SETUJUI */}

                          <button
                            type="button"
                            className="approve-btn"
                            disabled={isProcessing}
                            onClick={() =>
                              handleApprove(
                                refund.refund_id
                              )
                            }
                          >

                            <span>✓</span>

                            {isProcessing
                              ? "Memproses..."
                              : "Setujui"}

                          </button>

                        </div>

                      </div>
                    )}

                  </div>
                );
              })}

          </div>

        </div>

      </main>

      {/* =========================================
          DETAIL REFUND MODAL
      ========================================= */}

      {showDetail && (
        <div
          className="refund-modal-overlay"
          onClick={closeDetail}
        >

          <div
            className="refund-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* =================================
                MODAL HEADER
            ================================= */}

            <div className="refund-modal-header">

              <h2>Detail Refund</h2>

              <button
                type="button"
                className="refund-modal-close"
                onClick={closeDetail}
              >
                ✕
              </button>

            </div>

            {/* =================================
                LOADING DETAIL
            ================================= */}

            {loadingDetail && (
              <div className="refund-modal-loading">
                Memuat detail refund...
              </div>
            )}

            {/* =================================
                DETAIL DATA
            ================================= */}

            {!loadingDetail && detailData && (
              <div className="refund-detail-content">

                {/* ID REFUND */}

                <div className="detail-row">

                  <span>ID Refund</span>

                  <strong>
                    {detailData.refund_id || "-"}
                  </strong>

                </div>

                {/* ID TRANSAKSI */}

                <div className="detail-row">

                  <span>ID Transaksi</span>

                  <strong>
                    {detailData.order_id || "-"}
                  </strong>

                </div>

                {/* ALASAN */}

                <div className="detail-row">

                  <span>Alasan Refund</span>

                  <strong>
                    {detailData.reason || "-"}
                  </strong>

                </div>

                {/* JUMLAH */}

                <div className="detail-row">

                  <span>Jumlah Refund</span>

                  <strong>
                    {formatRupiah(
                      detailData.amount
                    )}
                  </strong>

                </div>

                {/* PEMILIK REKENING */}

                <div className="detail-row">

                  <span>
                    Nama Pemilik Rekening
                  </span>

                  <strong>
                    {detailData.account_holder ||
                      "-"}
                  </strong>

                </div>

                {/* BANK */}

                <div className="detail-row">

                  <span>Bank</span>

                  <strong>
                    {detailData.bank_name || "-"}
                  </strong>

                </div>

                {/* NOMOR REKENING */}

                <div className="detail-row">

                  <span>Nomor Rekening</span>

                  <strong>
                    {detailData.account_number ||
                      "-"}
                  </strong>

                </div>

                {/* STATUS */}

                <div className="detail-row">

                  <span>Status</span>

                  <strong>
                    {getStatusLabel(
                      detailData.status
                    )}
                  </strong>

                </div>

                {/* TANGGAL */}

                <div className="detail-row">

                  <span>
                    Tanggal Pengajuan
                  </span>

                  <strong>
                    {formatDate(
                      detailData.created_at
                    )}
                  </strong>

                </div>

                {/* CATATAN ADMIN */}

                <div className="detail-row">

                  <span>Catatan Admin</span>

                  <strong>
                    {detailData.admin_note || "-"}
                  </strong>

                </div>

                {/* ALASAN PENOLAKAN */}

                <div className="detail-row">

                  <span>
                    Alasan Penolakan
                  </span>

                  <strong>
                    {detailData.rejection_reason ||
                      "-"}
                  </strong>

                </div>

              </div>
            )}

            {/* =================================
                MODAL FOOTER
            ================================= */}

            <div className="refund-modal-footer">

              <button
                type="button"
                className="btn-close-modal"
                onClick={closeDetail}
              >
                Tutup
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default RefundEO;