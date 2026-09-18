import React, { useRef, useState } from "react";
import "./RegisterEO.css";

import {
  registerOrganizer,
  uploadOrganizerDocument,
} from "../../services/organizerRegisterService";

function RegisterEO() {
  // =====================================================
  // STATE FILE
  // =====================================================

  const [cvFile, setCvFile] = useState(null);
  const [aktaFile, setAktaFile] = useState(null);

  const [draggingCv, setDraggingCv] = useState(false);
  const [draggingAkta, setDraggingAkta] = useState(false);

  const [loading, setLoading] = useState(false);

  const cvInputRef = useRef(null);
  const aktaInputRef = useRef(null);

  // =====================================================
  // HANDLE FILE
  // =====================================================

  const handleCvChange = (event) => {
    const file = event.target.files[0];

    if (file) {
      if (file.type !== "application/pdf") {
        alert("File CV/Portofolio harus berupa PDF.");
        return;
      }

      setCvFile(file);
    }
  };

  const handleAktaChange = (event) => {
    const file = event.target.files[0];

    if (file) {
      if (file.type !== "application/pdf") {
        alert("File Akta harus berupa PDF.");
        return;
      }

      setAktaFile(file);
    }
  };

  // =====================================================
  // DRAG & DROP CV
  // =====================================================

  const handleCvDragOver = (event) => {
    event.preventDefault();
    setDraggingCv(true);
  };

  const handleCvDragLeave = () => {
    setDraggingCv(false);
  };

  const handleCvDrop = (event) => {
    event.preventDefault();

    setDraggingCv(false);

    const file = event.dataTransfer.files[0];

    if (file && file.type === "application/pdf") {
      setCvFile(file);
    } else {
      alert("File CV/Portofolio harus berupa PDF.");
    }
  };

  // =====================================================
  // DRAG & DROP AKTA
  // =====================================================

  const handleAktaDragOver = (event) => {
    event.preventDefault();
    setDraggingAkta(true);
  };

  const handleAktaDragLeave = () => {
    setDraggingAkta(false);
  };

  const handleAktaDrop = (event) => {
    event.preventDefault();

    setDraggingAkta(false);

    const file = event.dataTransfer.files[0];

    if (file && file.type === "application/pdf") {
      setAktaFile(file);
    } else {
      alert("File Akta harus berupa PDF.");
    }
  };

  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) return;

    try {
      setLoading(true);

      // =================================================
      // AMBIL DATA FORM
      // =================================================

      const formData = new FormData(event.target);

      const namaEO = formData.get("namaEO");
      const npwp = formData.get("npwp");
      const namaBank = formData.get("namaBank");
      const nomorRekening = formData.get("nomorRekening");

      // =================================================
      // VALIDASI FILE
      // =================================================

      if (!cvFile) {
        alert("Silakan upload CV/Portofolio terlebih dahulu.");
        setLoading(false);
        return;
      }

      if (!aktaFile) {
        alert("Silakan upload Akta Perusahaan terlebih dahulu.");
        setLoading(false);
        return;
      }

      console.log("================================");
      console.log("DATA REGISTER EO");
      console.log("================================");

      console.log("Nama EO:", namaEO);
      console.log("NPWP:", npwp);
      console.log("Nama Bank:", namaBank);
      console.log("Nomor Rekening:", nomorRekening);
      console.log("CV / Portofolio:", cvFile);
      console.log("Akta Perusahaan:", aktaFile);

      // =================================================
      // 1. REGISTER EO
      // =================================================

      const registerResponse = await registerOrganizer({
        organizer_name: namaEO,
        npwp_number: npwp,
        bank_name: namaBank,
        bank_account_number: nomorRekening,
      });

      console.log("REGISTER EO RESPONSE:");
      console.log(registerResponse);

      // =================================================
      // 2. UPLOAD CV / PORTOFOLIO
      // =================================================

      const portfolioResponse = await uploadOrganizerDocument(
        cvFile,
        "PORTFOLIO"
      );

      console.log("UPLOAD PORTFOLIO RESPONSE:");
      console.log(portfolioResponse);

      // =================================================
      // 3. UPLOAD AKTA PERUSAHAAN
      // =================================================

      const deedResponse = await uploadOrganizerDocument(
        aktaFile,
        "AKTA_PERUSAHAAN"
      );

      console.log("UPLOAD AKTA RESPONSE:");
      console.log(deedResponse);

      // =================================================
      // BERHASIL
      // =================================================

      alert("Pengajuan Event Organizer berhasil dikirim.");

      window.history.back();
    } catch (error) {
      console.error("================================");
      console.error("REGISTER EO GAGAL");
      console.error("================================");
      console.error(error);

      alert(
        error?.message ||
          "Terjadi kesalahan saat mendaftarkan Event Organizer."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // CANCEL
  // =====================================================

  const handleCancel = () => {
    window.history.back();
  };

  // =====================================================
  // FORMAT FILE NAME
  // =====================================================

  const getFileName = (file) => {
    if (!file) {
      return "";
    }

    return file.name;
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="eo-page">
      {/* =================================================
          HEADER
      ================================================= */}

      <header className="eo-header">
        <button
          type="button"
          className="eo-back-button"
          onClick={handleCancel}
          aria-label="Kembali"
        >
          ←
        </button>

        <h1>Daftar EO</h1>
      </header>

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="eo-main">
        <div className="eo-card">
          {/* =================================================
              LOGO
          ================================================= */}

          <div className="eo-logo">
            <div className="eo-logo-main">
              <span className="eo-event">EVENT</span>

              <span className="eo-day">DAY</span>
            </div>

            <div className="eo-logo-subtitle">
              <span className="eo-event">EVENT</span>

              <span className="eo-organizer">ORGANIZER</span>
            </div>
          </div>

          {/* =================================================
              TITLE
          ================================================= */}

          <div className="eo-title">
            <h2>Informasi Event Organizer</h2>

            <p>
              Lengkapi informasi berikut untuk mendaftarkan EO kamu.
            </p>
          </div>

          {/* =================================================
              FORM
          ================================================= */}

          <form onSubmit={handleSubmit}>
            {/* =================================================
                NAMA EO
            ================================================= */}

            <div className="eo-form-group">
              <label htmlFor="namaEO">Nama Event Organizer</label>

              <input
                id="namaEO"
                name="namaEO"
                type="text"
                placeholder="Masukan Nama EO"
                required
              />
            </div>

            {/* =================================================
                NPWP
            ================================================= */}

            <div className="eo-form-group">
              <label htmlFor="npwp">
                NPWP
                <span> (Opsional)</span>
              </label>

              <input
                id="npwp"
                name="npwp"
                type="text"
                placeholder="Masukan NPWP"
              />
            </div>

            {/* =================================================
                NAMA BANK
            ================================================= */}

            <div className="eo-form-group">
              <label htmlFor="namaBank">Nama Bank</label>

              <input
                id="namaBank"
                name="namaBank"
                type="text"
                placeholder="Masukan Nama Bank"
                required
              />
            </div>

            {/* =================================================
                NOMOR REKENING
            ================================================= */}

            <div className="eo-form-group">
              <label htmlFor="nomorRekening">Nomor Rekening</label>

              <input
                id="nomorRekening"
                name="nomorRekening"
                type="text"
                placeholder="Masukan Nomor Rekening"
                required
              />
            </div>

            {/* =================================================
                CV / PORTOFOLIO
            ================================================= */}

            <div className="eo-upload-section">
              <label>
                CV/PORTOFOLIO
                <span> (PDF)</span>
              </label>

              <div
                className={`eo-upload-box ${
                  draggingCv ? "eo-dragging" : ""
                } ${cvFile ? "eo-has-file" : ""}`}
                onClick={() => cvInputRef.current?.click()}
                onDragOver={handleCvDragOver}
                onDragLeave={handleCvDragLeave}
                onDrop={handleCvDrop}
              >
                <input
                  ref={cvInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  hidden
                  onChange={handleCvChange}
                />

                <div className="eo-upload-icon">↑</div>

                {cvFile ? (
                  <>
                    <strong>{getFileName(cvFile)}</strong>

                    <p>Klik untuk mengganti file</p>
                  </>
                ) : (
                  <>
                    <strong>Upload Dokumen Porto/CV</strong>

                    <p>
                      Drag and drop file here
                      <br />
                      or click to browse
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* =================================================
                AKTA PERUSAHAAN
            ================================================= */}

            <div className="eo-upload-section">
              <label>
                AKTA PERUSAHAAN
                <span> (PDF)</span>
              </label>

              <div
                className={`eo-upload-box ${
                  draggingAkta ? "eo-dragging" : ""
                } ${aktaFile ? "eo-has-file" : ""}`}
                onClick={() => aktaInputRef.current?.click()}
                onDragOver={handleAktaDragOver}
                onDragLeave={handleAktaDragLeave}
                onDrop={handleAktaDrop}
              >
                <input
                  ref={aktaInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  hidden
                  onChange={handleAktaChange}
                />

                <div className="eo-upload-icon">↑</div>

                {aktaFile ? (
                  <>
                    <strong>{getFileName(aktaFile)}</strong>

                    <p>Klik untuk mengganti file</p>
                  </>
                ) : (
                  <>
                    <strong>Upload Dokumen Akta Perusahaan</strong>

                    <p>
                      Drag and drop file here
                      <br />
                      or click to browse
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* =================================================
                BUTTON
            ================================================= */}

            <div className="eo-buttons">
              <button
                type="submit"
                className="eo-submit"
                disabled={loading}
              >
                {loading ? "Mengirim..." : "Ajukan Permohonan"}
              </button>

              <button
                type="button"
                className="eo-cancel"
                onClick={handleCancel}
                disabled={loading}
              >
                Batalkan
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default RegisterEO;