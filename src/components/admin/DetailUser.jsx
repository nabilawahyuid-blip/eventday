import React from "react";
import { useNavigate, useParams } from "react-router-dom";

import Sidebar from "../shared/Sidebar";
import Navbar from "../shared/Navbar";

import "./DetailUser.css";

function DetailUser() {
  const navigate = useNavigate();
  const { id } = useParams();

  // Dummy data sementara
  // Nanti bisa diganti dengan data dari database/API
  const users = {
    1: {
      name: "Sarah Lee",
      email: "sarah.lee@gmail.com",
      role: "Event Organizer",
      joined: "Jan 2023",
      company: "PT Imajinasi Musik Entertainment",
      phone: "+62 812-3456-7890",
      status: "Active",
      verified: true,
      events: 42,
    },

    2: {
      name: "Alex Johnson",
      email: "alex.j@example.com",
      role: "Event Organizer",
      joined: "Oct 2023",
      company: "PT Alex Organizer Indonesia",
      phone: "+62 812-1234-5678",
      status: "Active",
      verified: true,
      events: 18,
    },

    3: {
      name: "Marcus Rodriguez",
      email: "m.rodriguez@example.com",
      role: "Event Organizer",
      joined: "Jul 2023",
      company: "PT Creative Event Indonesia",
      phone: "+62 813-9876-5432",
      status: "Suspended",
      verified: false,
      events: 12,
    },

    4: {
      name: "Emily Wong",
      email: "emily.w@designco.com",
      role: "Regular User",
      joined: "Dec 2023",
      company: "-",
      phone: "+62 811-2345-6789",
      status: "Active",
      verified: true,
      events: 5,
    },
  };

  const user = users[id] || users[1];

  const handleBack = () => {
    navigate("/admin/users");
  };

  return (
    <div className="detail-user-page">

      {/* = SIDEBAR = */}
      <Sidebar />

      {/* = MAIN AREA = */}
      <main className="detail-user-main">

        {/* = NAVBAR = */}
        <Navbar />

        {/* = CONTENT = */}
        <div className="detail-user-content">

          {/* PAGE TITLE */}
          <div className="detail-user-heading">
            <button
              type="button"
              className="back-button"
              onClick={handleBack}
            >
              ←
            </button>

            <h1>User Management</h1>
          </div>

          {/* = USER PROFILE CARD = */}
          <section className="user-profile-card">

            <div className="user-profile-left">

              <div className="user-avatar">
                {user.name
                  .split(" ")
                  .map((word) => word[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>

              <div className="user-profile-info">

                <h2>{user.name}</h2>

                <div className="user-role">
                  {user.role}
                  <span>•</span>
                  Joined {user.joined}
                </div>

                <div className="user-badges">

                  {user.verified && (
                    <span className="user-badge verified-badge">
                      ✓ Top Rated
                    </span>
                  )}

                  <span className="user-badge event-badge">
                    {user.events} Events
                  </span>

                </div>

              </div>

            </div>

            <div className="user-profile-actions">

              <button
                type="button"
                className="suspend-button"
                onClick={() => console.log("Suspend user:", user.name)}
              >
                Suspend
              </button>

              <button
                type="button"
                className="edit-profile-button"
                onClick={() => console.log("Edit profile:", user.name)}
              >
                Edit Profile
              </button>

            </div>

          </section>

          {/* = INFORMATION GRID = */}
          <div className="user-information-grid">

            {/* = CONTACT = */}
            <section className="information-card">

              <div className="information-header">

                <div className="information-icon">
                  □
                </div>

                <h3>Informasi Kontak</h3>

              </div>

              <div className="information-divider"></div>

              <div className="information-content">

                <div className="information-field">

                  <label>Nama Perusahaan</label>

                  <div className="information-value">
                    {user.company}
                  </div>

                </div>

                <div className="information-field">

                  <label>Email</label>

                  <div className="information-value email-value">
                    <span>{user.email}</span>
                    <button
                      type="button"
                      onClick={() =>
                        navigator.clipboard?.writeText(user.email)
                      }
                    >
                      □
                    </button>
                  </div>

                </div>

                <div className="information-field">

                  <label>Nomor Telepon</label>

                  <div className="information-value phone-value">
                    <span>{user.phone}</span>
                    <button
                      type="button"
                      onClick={() =>
                        navigator.clipboard?.writeText(user.phone)
                      }
                    >
                      □
                    </button>
                  </div>

                </div>

              </div>

            </section>

            {/* = DOCUMENT = */}
            <section className="information-card">

              <div className="information-header">

                <div className="information-icon">
                  □
                </div>

                <h3>Dokumen & Verifikasi</h3>

              </div>

              <div className="information-divider"></div>

              <div className="information-content">

                {/* STATUS */}
                <div className="verification-status">

                  <label>Status Verifikasi</label>

                  <div className="verification-row">

                    {user.verified ? (
                      <>
                        <span className="verified-status">
                          ✓ Verified
                        </span>

                        <span className="verification-date">
                          Sejak 15 Jan 2023
                        </span>
                      </>
                    ) : (
                      <span className="not-verified-status">
                        Belum Terverifikasi
                      </span>
                    )}

                  </div>

                </div>

                {/* PORTFOLIO */}
                <div className="information-field">

                  <label>
                    Portfolio / Company Profile
                  </label>

                  <div className="document-box">

                    <div className="document-icon">
                      PDF
                    </div>

                    <div className="document-info">

                      <strong>
                        IM_Entertainment_Profile_2023.pdf
                      </strong>

                      <span>
                        4.2 MB
                      </span>

                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        console.log("Download portfolio")
                      }
                    >
                      ↓
                    </button>

                  </div>

                </div>

                {/* KTP */}
                <div className="information-field">

                  <label>
                    KTP Penanggung Jawab
                  </label>

                  <div className="document-box">

                    <div className="document-icon image-document">
                      IMG
                    </div>

                    <div className="document-info">

                      <strong>
                        KTP_Direktur_Utama.jpg
                      </strong>

                      <span>
                        1.1 MB
                      </span>

                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        console.log("Preview KTP")
                      }
                    >
                      ◉
                    </button>

                  </div>

                </div>

              </div>

            </section>

          </div>

          {/* = ACCOUNT STATUS = */}
          <section className="account-summary-card">

            <div className="account-summary-item">

              <span className="summary-label">
                Status Akun
              </span>

              <span
                className={`account-status ${
                  user.status === "Active"
                    ? "status-active"
                    : "status-suspended"
                }`}
              >
                {user.status}
              </span>

            </div>

            <div className="account-summary-item">

              <span className="summary-label">
                Role
              </span>

              <strong>
                {user.role}
              </strong>

            </div>

            <div className="account-summary-item">

              <span className="summary-label">
                Total Event
              </span>

              <strong>
                {user.events} Events
              </strong>

            </div>

            <div className="account-summary-item">

              <span className="summary-label">
                User ID
              </span>

              <strong>
                USR-{String(id).padStart(4, "0")}
              </strong>

            </div>

          </section>

        </div>

      </main>

    </div>
  );
}

export default DetailUser;