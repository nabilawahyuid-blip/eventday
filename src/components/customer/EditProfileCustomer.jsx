import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./EditProfileCustomer.css";

function EditProfileCustomer() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "Adit Ramadan",
    username: "Adit",
    email: "adt@gmail.com",
    phone: "08483958934",
    nik: "3542094093004309",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSave = (e) => {
    e.preventDefault();

    alert("Data profile berhasil disimpan!");

    navigate("/customer/profile");
  };

  const handleCancel = () => {
    navigate("/customer/profile");
  };

  return (
    <div className="edit-profile-page">

      {/* Header */}
      <header className="edit-profile-header">
        <div
          className="edit-profile-back"
          onClick={() => navigate("/customer/profile")}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M19 12H5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M12 19L5 12L12 5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div className="edit-profile-logo">
          <span>EVENT</span>
          <strong>DAY</strong>
        </div>

        <div className="edit-profile-location">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M20 10C20 15 12 21 12 21C12 21 4 15 4 10C4 5.58 7.58 2 12 2C16.42 2 20 5.58 20 10Z"
              stroke="currentColor"
              strokeWidth="1.8"
            />
            <circle
              cx="12"
              cy="10"
              r="2.5"
              stroke="currentColor"
              strokeWidth="1.8"
            />
          </svg>

          <span>Jakarta, ID</span>
        </div>
      </header>

      {/* Main */}
      <main className="edit-profile-main">

        {/* Profile Card */}
        <section className="edit-profile-card">

          <div className="profile-image-wrapper">
            <div className="profile-image-placeholder">
              <span>Silahkan Edit Data Diri</span>

              <div className="placeholder-fields">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
              </div>
            </div>
          </div>

          <h1>{formData.name}</h1>
          <p>{formData.email}</p>
        </section>

        {/* Form */}
        <section className="edit-profile-form-card">

          <div className="edit-profile-form-title">
            <h2>Edit Data Diri</h2>
          </div>

          <form onSubmit={handleSave}>

            <div className="edit-form-group">
              <label htmlFor="name">
                Nama Lengkap
              </label>

              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className="edit-form-group">
              <label htmlFor="username">
                Username
              </label>

              <input
                id="username"
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
              />
            </div>

            <div className="edit-form-group">
              <label htmlFor="email">
                Email
              </label>

              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="edit-form-group">
              <label htmlFor="phone">
                No WhatsApp
              </label>

              <input
                id="phone"
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className="edit-form-group">
              <label htmlFor="nik">
                NIK
              </label>

              <input
                id="nik"
                type="text"
                name="nik"
                value={formData.nik}
                disabled
              />
            </div>

            <div className="edit-profile-divider"></div>

            <div className="edit-profile-actions">
              <button
                type="button"
                className="cancel-profile-button"
                onClick={handleCancel}
              >
                Batal
              </button>

              <button
                type="submit"
                className="save-profile-button"
              >
                Simpan
              </button>
            </div>

          </form>
        </section>

      </main>

      {/* Footer */}
      <footer className="edit-profile-footer">
        © 2027 EVENTDAY. Hak cipta dilindungi undang-undang.
      </footer>

    </div>
  );
}

export default EditProfileCustomer;