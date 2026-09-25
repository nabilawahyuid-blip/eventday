// src/pages/RegisterEO.jsx

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

      const formData = new FormData(event.target);

      const namaEO = formData.get("namaEO")?.trim();
      const npwpRaw = formData.get("npwp")?.trim();
      const namaBank = formData.get("namaBank")?.trim();
      const nomorRekening = formData.get("nomorRekening")?.trim();

      const npwp = npwpRaw ? npwpRaw : null;

      // VALIDASI FILE
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

      console.log("Mendaftarkan EO...");

      // 1. REGISTER EO
      const registerResponse = await registerOrganizer({
        organizer_name: namaEO,
        npwp_number: npwp,
        bank_name: namaBank,
        bank_account_number: nomorRekening,
      });

      console.log("REGISTER EO SUCCESS:", registerResponse);

      // Simpan token baru jika backend mengembalikan token pendaftaran/login baru
      const newToken =
        registerResponse?.token ||
        registerResponse?.data?.token ||
        registerResponse?.data?.accessToken;

      if (newToken) {
        localStorage.setItem("token", newToken);
      }

      // 2. UPLOAD DOKUMEN CV / PORTOFOLIO
      try {
        await uploadOrganizerDocument(cvFile, "PORTFOLIO");
        console.log("UPLOAD PORTFOLIO SUCCESS");
      } catch (uploadErr) {
        console.warn("Upload CV gagal:", uploadErr);
      }

      // 3. UPLOAD DOKUMEN AKTA PERUSAHAAN
      try {
        await uploadOrganizerDocument(aktaFile, "AKTA_PERUSAHAAN");
        console.log("UPLOAD AKTA SUCCESS");
      } catch (uploadErr) {
        console.warn("Upload Akta gagal:", uploadErr);
      }

      alert("Pengajuan Event Organizer berhasil dikirim.");
      window.history.back();

    } catch (error) {
      console.error("REGISTER EO ERROR:", error?.response?.data || error);

      const errorMsg =
        error?.response?.data?.message ||
        error?.message ||
        "Terjadi kesalahan saat mendaftarkan Event Organizer.";

      alert(errorMsg);
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

      <main className="eo-main">
        <div className="eo-card">
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

          <div className="eo-title">
            <h2>Informasi Event Organizer</h2>
            <p>
              Lengkapi informasi berikut untuk mendaftarkan EO kamu.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
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