import React, { useEffect, useState } from "react";

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

import {
  getOrganizerBankAccounts,
  getOrganizerEventsForPayout,
  getOrganizerEventPayoutBalance,
  createOrganizerPayout,
} from "../../services/organizerPayoutService";

import "./PengajuanPayoutEO.css";

function PengajuanPayoutEO() {
  // =========================================
  // STATE FORM
  // =========================================

  const [amount, setAmount] = useState("");
  const [bank, setBank] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [note, setNote] = useState("");

  // =========================================
  // STATE DATA BACKEND
  // =========================================

  const [availableBalance, setAvailableBalance] = useState(0);

  const [bankAccounts, setBankAccounts] = useState([]);

  const [loadingData, setLoadingData] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  // =========================================
  // FORMAT RUPIAH
  // =========================================

  const formatRupiah = (number) => {
    return new Intl.NumberFormat("id-ID").format(
      Number(number || 0)
    );
  };

  // =========================================
  // NUMERIC AMOUNT
  // =========================================

  const numericAmount = Number(
    String(amount || "").replace(/\D/g, "")
  );

  // =========================================
  // HANDLE NOMINAL
  // =========================================

  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");

    setAmount(value);
  };

  // =========================================
  // LOAD BANK ACCOUNT
  // =========================================

  const loadBankAccounts = async () => {
    try {
      const response = await getOrganizerBankAccounts();

      console.log(
        "BANK ACCOUNTS RESPONSE:",
        response
      );

      const accounts = response?.data || [];

      setBankAccounts(accounts);

      // Otomatis pilih rekening primary
      const primaryAccount =
        accounts.find(
          (account) => account.is_primary === true
        ) || accounts[0];

      if (primaryAccount) {
        setBank(
          primaryAccount.bank_name || ""
        );

        setAccountNumber(
          primaryAccount.account_number || ""
        );

        setAccountName(
          primaryAccount.account_holder || ""
        );
      }
    } catch (error) {
      console.error(
        "Gagal mengambil rekening bank:",
        error
      );

      setBankAccounts([]);
    }
  };

  // =========================================
  // LOAD SALDO
  // =========================================

  const loadAvailableBalance = async () => {
    try {
      const eventsResponse =
        await getOrganizerEventsForPayout();

      console.log(
        "EVENTS PAYOUT RESPONSE:",
        eventsResponse
      );

      const events = eventsResponse?.data || [];

      if (!events.length) {
        setAvailableBalance(0);
        return;
      }

      // Ambil saldo masing-masing event
      const balanceResults =
        await Promise.all(
          events
            .filter((event) => event.event_id)
            .map(async (event) => {
              try {
                const response =
                  await getOrganizerEventPayoutBalance(
                    event.event_id
                  );

                return response?.data || null;
              } catch (error) {
                console.error(
                  `Gagal mengambil saldo event ${event.event_id}:`,
                  error
                );

                return null;
              }
            })
        );

      // Jumlahkan withdrawable_balance semua event
      const totalWithdrawable =
        balanceResults.reduce(
          (total, balance) => {
            return (
              total +
              Number(
                balance?.withdrawable_balance || 0
              )
            );
          },
          0
        );

      console.log(
        "TOTAL WITHDRAWABLE BALANCE:",
        totalWithdrawable
      );

      setAvailableBalance(
        totalWithdrawable
      );
    } catch (error) {
      console.error(
        "Gagal mengambil saldo payout:",
        error
      );

      setAvailableBalance(0);
    }
  };

  // =========================================
  // LOAD SEMUA DATA
  // =========================================

  const loadData = async () => {
    try {
      setLoadingData(true);

      await Promise.all([
        loadBankAccounts(),
        loadAvailableBalance(),
      ]);
    } catch (error) {
      console.error(
        "Gagal memuat data payout:",
        error
      );
    } finally {
      setLoadingData(false);
    }
  };

  // =========================================
  // LOAD SAAT PAGE DIBUKA
  // =========================================

  useEffect(() => {
    loadData();
  }, []);

  // =========================================
  // HANDLE PILIH BANK
  // =========================================

  const handleBankChange = (e) => {
    const selectedBankName =
      e.target.value;

    setBank(selectedBankName);

    const selectedAccount =
      bankAccounts.find(
        (account) =>
          account.bank_name ===
          selectedBankName
      );

    if (selectedAccount) {
      setAccountNumber(
        selectedAccount.account_number || ""
      );

      setAccountName(
        selectedAccount.account_holder || ""
      );
    }
  };

  // =========================================
  // SUBMIT PAYOUT
  // =========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    // -----------------------------------------
    // VALIDASI NOMINAL
    // -----------------------------------------

    if (!amount) {
      alert("Nominal payout wajib diisi.");
      return;
    }

    if (numericAmount <= 0) {
      alert(
        "Nominal payout harus lebih dari Rp 0."
      );
      return;
    }

    // -----------------------------------------
    // VALIDASI SALDO
    // -----------------------------------------

    if (numericAmount > availableBalance) {
      alert(
        "Nominal payout melebihi saldo tersedia."
      );
      return;
    }

    // -----------------------------------------
    // VALIDASI BANK
    // -----------------------------------------

    if (!bank) {
      alert("Silakan pilih bank.");
      return;
    }

    // -----------------------------------------
    // VALIDASI NOMOR REKENING
    // -----------------------------------------

    if (!accountNumber) {
      alert(
        "Nomor rekening wajib diisi."
      );
      return;
    }

    // -----------------------------------------
    // VALIDASI NAMA
    // -----------------------------------------

    if (!accountName) {
      alert(
        "Nama pemilik rekening wajib diisi."
      );
      return;
    }

    try {
      setSubmitting(true);

      // =======================================
      // PAYLOAD SESUAI BACKEND
      // =======================================

      const payload = {
        amount: numericAmount,

        description:
          note.trim() ||
          "Pencairan dana",

        bank_name: bank,

        account_number:
          accountNumber,

        account_holder:
          accountName,
      };

      console.log(
        "SUBMIT PAYOUT PAYLOAD:",
        payload
      );

      const response =
        await createOrganizerPayout(
          payload
        );

      console.log(
        "CREATE PAYOUT RESPONSE:",
        response
      );

      alert(
        "Pengajuan payout berhasil dikirim."
      );

      // =======================================
      // RESET FORM
      // =======================================

      setAmount("");
      setNote("");

      // =======================================
      // REFRESH SALDO
      // =======================================

      await loadAvailableBalance();

      // =======================================
      // KEMBALI KE HALAMAN SEBELUMNYA
      // =======================================

      window.history.back();
    } catch (error) {
      console.error(
        "Gagal mengajukan payout:",
        error
      );

      alert(
        error?.message ||
          "Gagal mengajukan payout."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =========================================
  // RENDER
  // =========================================

  return (
    <div className="pengajuan-payout-eo-page">

      {/* =====================================
          SIDEBAR
      ===================================== */}

      <SidebarEO />

      {/* =====================================
          MAIN
      ===================================== */}

      <main className="pengajuan-payout-eo-main">

        {/* =====================================
            NAVBAR
        ===================================== */}

        <NavbarEO />

        <div className="pengajuan-payout-eo-content">

          {/* =====================================
              BACK BUTTON
          ===================================== */}

          <button
            type="button"
            className="payout-back-button"
            onClick={() =>
              window.history.back()
            }
          >
            <ArrowLeft size={16} />

            <span>
              Kembali ke Payout
            </span>
          </button>

          {/* =====================================
              PAGE HEADER
          ===================================== */}

          <div className="pengajuan-payout-header">

            <div>

              <h1>
                Pengajuan Payout
              </h1>

              <p>
                Ajukan pencairan dana dari
                saldo Event Organizer.
              </p>

            </div>

          </div>

          {/* =====================================
              MAIN LAYOUT
          ===================================== */}

          <div className="pengajuan-payout-layout">

            {/* =================================
                LEFT FORM
            ================================= */}

            <section className="payout-form-card">

              <div className="payout-form-title">

                <div className="payout-form-title-icon">
                  <Wallet size={19} />
                </div>

                <div>

                  <h2>
                    Form Pengajuan Payout
                  </h2>

                  <p>
                    Lengkapi informasi pencairan
                    dana berikut.
                  </p>

                </div>

              </div>

              <div className="payout-form-divider"></div>

              <form onSubmit={handleSubmit}>

                {/* =================================
                    SALDO
                ================================= */}

                <div className="available-balance">

                  <div className="balance-left">

                    <div className="balance-icon">
                      <CircleDollarSign
                        size={20}
                      />
                    </div>

                    <div>

                      <span>
                        Saldo Tersedia
                      </span>

                      <strong>
                        {loadingData
                          ? "Memuat..."
                          : `Rp ${formatRupiah(
                              availableBalance
                            )}`}
                      </strong>

                    </div>

                  </div>

                </div>

                {/* =================================
                    NOMINAL
                ================================= */}

                <div className="form-group">

                  <label htmlFor="amount">

                    NOMINAL PAYOUT

                    <span className="required">
                      *
                    </span>

                  </label>

                  <div className="input-with-prefix">

                    <span>
                      Rp
                    </span>

                    <input
                      id="amount"
                      type="text"
                      inputMode="numeric"
                      placeholder="Masukkan nominal payout"
                      value={
                        numericAmount
                          ? formatRupiah(
                              numericAmount
                            )
                          : ""
                      }
                      onChange={
                        handleAmountChange
                      }
                      disabled={submitting}
                    />

                  </div>

                  <small>
                    Maksimal payout Rp{" "}
                    {formatRupiah(
                      availableBalance
                    )}
                  </small>

                </div>

                {/* =================================
                    BANK
                ================================= */}

                <div className="form-group">

                  <label htmlFor="bank">

                    BANK

                    <span className="required">
                      *
                    </span>

                  </label>

                  <div className="input-with-icon">

                    <Building2 size={17} />

                    <select
                      id="bank"
                      value={bank}
                      onChange={
                        handleBankChange
                      }
                      disabled={
                        submitting ||
                        loadingData
                      }
                    >

                      <option value="">
                        {loadingData
                          ? "Memuat rekening..."
                          : "Pilih bank"}
                      </option>

                      {bankAccounts.map(
                        (account) => (
                          <option
                            key={
                              account.id
                            }
                            value={
                              account.bank_name
                            }
                          >
                            {account.bank_name}
                          </option>
                        )
                      )}

                    </select>

                  </div>

                </div>

                {/* =================================
                    NOMOR REKENING
                ================================= */}

                <div className="form-group">

                  <label htmlFor="accountNumber">

                    NOMOR REKENING

                    <span className="required">
                      *
                    </span>

                  </label>

                  <div className="input-with-icon">

                    <CreditCard size={17} />

                    <input
                      id="accountNumber"
                      type="text"
                      inputMode="numeric"
                      placeholder="Masukkan nomor rekening"
                      value={
                        accountNumber
                      }
                      onChange={(e) =>
                        setAccountNumber(
                          e.target.value.replace(
                            /\D/g,
                            ""
                          )
                        )
                      }
                      disabled={submitting}
                    />

                  </div>

                </div>

                {/* =================================
                    NAMA REKENING
                ================================= */}

                <div className="form-group">

                  <label htmlFor="accountName">

                    NAMA PEMILIK REKENING

                    <span className="required">
                      *
                    </span>

                  </label>

                  <div className="input-with-icon">

                    <User size={17} />

                    <input
                      id="accountName"
                      type="text"
                      placeholder="Masukkan nama pemilik rekening"
                      value={
                        accountName
                      }
                      onChange={(e) =>
                        setAccountName(
                          e.target.value
                        )
                      }
                      disabled={submitting}
                    />

                  </div>

                </div>

                {/* =================================
                    CATATAN
                ================================= */}

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
                        setNote(
                          e.target.value
                        )
                      }
                      disabled={submitting}
                    />

                  </div>

                </div>

                {/* =================================
                    BUTTON
                ================================= */}

                <div className="payout-form-actions">

                  <button
                    type="button"
                    className="cancel-payout-btn"
                    onClick={() =>
                      window.history.back()
                    }
                    disabled={submitting}
                  >
                    Batal
                  </button>

                  <button
                    type="submit"
                    className="submit-payout-btn"
                    disabled={
                      submitting ||
                      loadingData
                    }
                  >

                    <span>
                      {submitting
                        ? "Mengirim..."
                        : "Ajukan Payout"}
                    </span>

                    {!submitting && (
                      <ArrowRight
                        size={17}
                      />
                    )}

                  </button>

                </div>

              </form>

            </section>

            {/* =================================
                RIGHT SUMMARY
            ================================= */}

            <aside className="payout-summary-card">

              <div className="summary-title">

                <h2>
                  Ringkasan Payout
                </h2>

                <p>
                  Periksa kembali data
                  sebelum mengajukan.
                </p>

              </div>

              <div className="summary-divider"></div>

              {/* NOMINAL */}

              <div className="summary-item">

                <span>
                  Nominal Payout
                </span>

                <strong className="summary-amount">

                  Rp{" "}

                  {formatRupiah(
                    numericAmount || 0
                  )}

                </strong>

              </div>

              {/* BANK */}

              <div className="summary-item">

                <span>
                  Bank
                </span>

                <strong>
                  {bank || "-"}
                </strong>

              </div>

              {/* ACCOUNT */}

              <div className="summary-item">

                <span>
                  Nomor Rekening
                </span>

                <strong>

                  {accountNumber
                    ? `**** ${accountNumber.slice(
                        -4
                      )}`
                    : "-"}

                </strong>

              </div>

              {/* NAME */}

              <div className="summary-item">

                <span>
                  Nama Rekening
                </span>

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
                        (numericAmount ||
                          0),
                      0
                    )
                  )}

                </strong>

              </div>

              {/* INFO */}

              <div className="payout-info-box">

                <span className="info-icon">
                  i
                </span>

                <p>
                  Pengajuan payout akan
                  diproses setelah dilakukan
                  verifikasi oleh sistem.
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