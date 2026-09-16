// src/pages/PengajuanPayoutEO.jsx

import React, { useState } from "react";
import {
  Wallet,
  Building2,
  CreditCard,
  User,
  FileText,
  ArrowLeft,
  ArrowRight,
  CircleDollarSign,
} from "lucide-react";

import SidebarEO from "../shared/SidebarEO";
import NavbarEO from "../shared/NavbarEO";

import "./PengajuanPayoutEO.css";

function PengajuanPayoutEO() {
  const [amount, setAmount] = useState("");
  const [bank, setBank] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [note, setNote] = useState("");

  const availableBalance = 45500000;

  const formatRupiah = (number) => {
    return new Intl.NumberFormat("id-ID").format(number);
  };

  const numericAmount = Number(
    amount.replace(/\D/g, "")
  );

  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");

    setAmount(value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!amount) {
      alert("Nominal payout wajib diisi.");
      return;
    }

    if (numericAmount <= 0) {
      alert("Nominal payout harus lebih dari Rp 0.");
      return;
    }

    if (numericAmount > availableBalance) {
      alert("Nominal payout melebihi saldo tersedia.");
      return;
    }

    if (!bank) {
      alert("Silakan pilih bank.");
      return;
    }

    if (!accountNumber) {
      alert("Nomor rekening wajib diisi.");
      return;
    }

    if (!accountName) {
      alert("Nama pemilik rekening wajib diisi.");
      return;
    }

    alert("Pengajuan payout berhasil dikirim.");
  };

  return (
    <div className="pengajuan-payout-eo-page">

      {/* =========================
          SIDEBAR
      ========================= */}

      <SidebarEO />

      {/* =========================
          MAIN
      ========================= */}

      <main className="pengajuan-payout-eo-main">

        {/* =========================
            NAVBAR
        ========================= */}

        <NavbarEO />

        <div className="pengajuan-payout-eo-content">

          {/* =========================
              BREADCRUMB
          ========================= */}

          <button
            type="button"
            className="payout-back-button"
            onClick={() => window.history.back()}
          >
            <ArrowLeft size={16} />
            <span>Kembali ke Payout</span>
          </button>

          {/* =========================
              PAGE HEADER
          ========================= */}

          <div className="pengajuan-payout-header">
            <div>
              <h1>Pengajuan Payout</h1>
              <p>
                Ajukan pencairan dana dari saldo Event Organizer.
              </p>
            </div>
          </div>

          {/* =========================
              MAIN LAYOUT
          ========================= */}

          <div className="pengajuan-payout-layout">

            {/* =================================================
                LEFT FORM
            ================================================= */}

            <section className="payout-form-card">

              <div className="payout-form-title">
                <div className="payout-form-title-icon">
                  <Wallet size={19} />
                </div>

                <div>
                  <h2>Form Pengajuan Payout</h2>
                  <p>
                    Lengkapi informasi pencairan dana berikut.
                  </p>
                </div>
              </div>

              <div className="payout-form-divider"></div>

              <form onSubmit={handleSubmit}>

                {/* =========================
                    SALDO
                ========================= */}

                <div className="available-balance">
                  <div className="balance-left">
                    <div className="balance-icon">
                      <CircleDollarSign size={20} />
                    </div>

                    <div>
                      <span>Saldo Tersedia</span>
                      <strong>
                        Rp {formatRupiah(availableBalance)}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* =========================
                    NOMINAL
                ========================= */}

                <div className="form-group">

                  <label htmlFor="amount">
                    NOMINAL PAYOUT
                    <span className="required">*</span>
                  </label>

                  <div className="input-with-prefix">
                    <span>Rp</span>

                    <input
                      id="amount"
                      type="text"
                      inputMode="numeric"
                      placeholder="Masukkan nominal payout"
                      value={
                        numericAmount
                          ? formatRupiah(numericAmount)
                          : ""
                      }
                      onChange={handleAmountChange}
                    />
                  </div>

                  <small>
                    Maksimal payout Rp{" "}
                    {formatRupiah(availableBalance)}
                  </small>

                </div>

                {/* =========================
                    BANK
                ========================= */}

                <div className="form-group">

                  <label htmlFor="bank">
                    BANK
                    <span className="required">*</span>
                  </label>

                  <div className="input-with-icon">

                    <Building2 size={17} />

                    <select
                      id="bank"
                      value={bank}
                      onChange={(e) =>
                        setBank(e.target.value)
                      }
                    >
                      <option value="">
                        Pilih bank
                      </option>

                      <option value="BCA">
                        BCA
                      </option>

                      <option value="BRI">
                        BRI
                      </option>

                      <option value="BNI">
                        BNI
                      </option>

                      <option value="Mandiri">
                        Bank Mandiri
                      </option>

                      <option value="BSI">
                        BSI
                      </option>
                    </select>

                  </div>

                </div>

                {/* =========================
                    NOMOR REKENING
                ========================= */}

                <div className="form-group">

                  <label htmlFor="accountNumber">
                    NOMOR REKENING
                    <span className="required">*</span>
                  </label>

                  <div className="input-with-icon">

                    <CreditCard size={17} />

                    <input
                      id="accountNumber"
                      type="text"
                      inputMode="numeric"
                      placeholder="Masukkan nomor rekening"
                      value={accountNumber}
                      onChange={(e) =>
                        setAccountNumber(
                          e.target.value.replace(/\D/g, "")
                        )
                      }
                    />

                  </div>

                </div>

                {/* =========================
                    NAMA REKENING
                ========================= */}

                <div className="form-group">

                  <label htmlFor="accountName">
                    NAMA PEMILIK REKENING
                    <span className="required">*</span>
                  </label>

                  <div className="input-with-icon">

                    <User size={17} />

                    <input
                      id="accountName"
                      type="text"
                      placeholder="Masukkan nama pemilik rekening"
                      value={accountName}
                      onChange={(e) =>
                        setAccountName(e.target.value)
                      }
                    />

                  </div>

                </div>

                {/* =========================
                    CATATAN
                ========================= */}

                <div className="form-group">

                  <label htmlFor="note">
                    CATATAN
                    <span className="optional">
                      (OPSIONAL)
                    </span>
                  </label>

                  <div className="textarea-wrapper">

                    <FileText size={17} />

                    <textarea
                      id="note"
                      rows="4"
                      placeholder="Tambahkan catatan jika diperlukan..."
                      value={note}
                      onChange={(e) =>
                        setNote(e.target.value)
                      }
                    />

                  </div>

                </div>

                {/* =========================
                    BUTTON
                ========================= */}

                <div className="payout-form-actions">

                  <button
                    type="button"
                    className="cancel-payout-btn"
                    onClick={() =>
                      window.history.back()
                    }
                  >
                    Batal
                  </button>

                  <button
                    type="submit"
                    className="submit-payout-btn"
                  >
                    <span>Ajukan Payout</span>
                    <ArrowRight size={17} />
                  </button>

                </div>

              </form>

            </section>


            {/* =================================================
                RIGHT SUMMARY
            ================================================= */}

            <aside className="payout-summary-card">

              <div className="summary-title">
                <h2>Ringkasan Payout</h2>
                <p>
                  Periksa kembali data sebelum mengajukan.
                </p>
              </div>

              <div className="summary-divider"></div>

              {/* NOMINAL */}

              <div className="summary-item">

                <span>Nominal Payout</span>

                <strong className="summary-amount">
                  Rp{" "}
                  {formatRupiah(
                    numericAmount || 0
                  )}
                </strong>

              </div>

              {/* BANK */}

              <div className="summary-item">

                <span>Bank</span>

                <strong>
                  {bank || "-"}
                </strong>

              </div>

              {/* ACCOUNT */}

              <div className="summary-item">

                <span>Nomor Rekening</span>

                <strong>
                  {accountNumber
                    ? `**** ${accountNumber.slice(-4)}`
                    : "-"}
                </strong>

              </div>

              {/* NAME */}

              <div className="summary-item">

                <span>Nama Rekening</span>

                <strong>
                  {accountName || "-"}
                </strong>

              </div>

              <div className="summary-divider"></div>

              {/* REMAINING BALANCE */}

              <div className="remaining-balance">

                <span>
                  Saldo Setelah Payout
                </span>

                <strong>
                  Rp{" "}
                  {formatRupiah(
                    Math.max(
                      availableBalance -
                        (numericAmount || 0),
                      0
                    )
                  )}
                </strong>

              </div>

              {/* INFO */}

              <div className="payout-info-box">

                <span className="info-icon">i</span>

                <p>
                  Pengajuan payout akan diproses
                  setelah dilakukan verifikasi oleh
                  sistem.
                </p>

              </div>

            </aside>

          </div>
        </div>
      </main>
    </div>
  );
}

export default PengajuanPayoutEO;