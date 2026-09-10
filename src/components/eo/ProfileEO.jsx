import React from "react";
import { useState } from "react";
import SidebarEO from "../shared/SidebarEO";
import NavbarEO from "../shared/NavbarEO";
import "./ProfileEO.css";

function ProfileEO() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="profile-eo-page">

      {/* SIDEBAR */}
      <SidebarEO />

      {/* MAIN */}
      <main className="profile-eo-main">

        {/* NAVBAR */}
        <NavbarEO />

        {/* CONTENT */}
        <div className="profile-eo-content">

          {/* PAGE TITLE */}
          <div className="profile-page-header">
            <h1>Profil</h1>
          </div>

          {/* PROFILE HEADER CARD */}
          <section className="profile-main-card">

            <div className="profile-company">

              <div className="profile-image-wrapper">
                <div className="profile-image">
                  IM
                </div>

                <button
                  type="button"
                  className="profile-image-edit"
                  onClick={() => alert("Ubah foto profil")}
                >
                  ✎
                </button>
              </div>

              <div className="profile-company-info">
                <h2>IM Entertainment</h2>
                <span>Nama Event Organizer</span>
              </div>

            </div>

            <div className="profile-actions">

              <button
                type="button"
                className="change-password-btn"
                onClick={() => setShowPassword(true)}
              >
                Ganti Password
              </button>

              <button
                type="button"
                className="edit-profile-btn"
                onClick={() => alert("Edit profil")}
              >
                ✎ Edit Profil
              </button>

            </div>

          </section>


          {/* INFORMATION CARD */}
          <section className="profile-information-card">

            <div className="profile-section-title">
              <div className="profile-section-icon">
                ⓘ
              </div>

              <h2>
                Informasi Event Organizer
              </h2>
            </div>

            <div className="profile-divider"></div>


            {/* INFORMATION GRID */}
            <div className="profile-info-grid">

              {/* NAMA PERUSAHAAN */}
              <div className="profile-field">

                <label>
                  NAMA PERUSAHAAN
                </label>

                <div className="profile-input-wrapper">

                  <input
                    type="text"
                    value="IM Entertainment"
                    readOnly
                  />

                  <span className="field-icon">
                    ✎
                  </span>

                </div>

              </div>


              {/* NIB */}
              <div className="profile-field">

                <label>
                  NO. NIB / NIK
                </label>

                <div className="profile-input-wrapper">

                  <input
                    type="text"
                    value="0898478578748"
                    readOnly
                  />

                  <span className="field-icon">
                    ✎
                  </span>

                </div>

              </div>


              {/* EMAIL */}
              <div className="profile-field">

                <label>
                  EMAIL
                </label>

                <div className="profile-input-wrapper">

                  <input
                    type="email"
                    value="im@gmail.com"
                    readOnly
                  />

                  <span className="field-icon">
                    ✎
                  </span>

                </div>

              </div>


              {/* AKTA */}
              <div className="profile-field">

                <label>
                  AKTA PERUSAHAAN
                </label>

                <div className="profile-input-wrapper">

                  <input
                    type="text"
                    value="im@gmail.com"
                    readOnly
                  />

                  <span className="field-icon">
                    ✎
                  </span>

                </div>

              </div>

            </div>


            {/* PORTFOLIO */}
            <div className="profile-document">

              <label>
                PORTOFOLIO/CV
              </label>

              <div className="document-box">

                <div className="document-left">

                  <div className="document-icon">
                    📄
                  </div>

                  <span>
                    Portfolio.pdf
                  </span>

                </div>

                <button
                  type="button"
                  className="download-document"
                  onClick={() =>
                    alert("Download Portfolio.pdf")
                  }
                >
                  ↓
                </button>

              </div>

            </div>

          </section>

        </div>

      </main>


      {/* PASSWORD MODAL */}
      {showPassword && (
        <div className="password-overlay">

          <div className="password-modal">

            <div className="password-modal-header">

              <div>
                <h2>Ganti Password</h2>

                <p>
                  Masukkan password baru Anda.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowPassword(false)}
              >
                ×
              </button>

            </div>

            <div className="password-form">

              <label>
                PASSWORD LAMA
              </label>

              <input
                type="password"
                placeholder="Masukkan password lama"
              />

              <label>
                PASSWORD BARU
              </label>

              <input
                type="password"
                placeholder="Masukkan password baru"
              />

              <label>
                KONFIRMASI PASSWORD
              </label>

              <input
                type="password"
                placeholder="Konfirmasi password baru"
              />

              <button
                type="button"
                className="save-password-btn"
                onClick={() => {
                  alert("Password berhasil diperbarui");
                  setShowPassword(false);
                }}
              >
                Simpan Password
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default ProfileEO;