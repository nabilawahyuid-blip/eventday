import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
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

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.username.trim() ||
      !formData.email.trim() ||
      !formData.phone.trim() ||
      !formData.nik.trim()
    ) {
      Swal.fire({
        icon: "warning",
        title: "Data Belum Lengkap",
        text: "Silakan lengkapi semua data terlebih dahulu.",
        confirmButtonColor: "#5143e6",
      });

      return;
    }

    Swal.fire({
      icon: "success",
      title: "Berhasil Disimpan",
      text: "Data diri kamu berhasil diperbarui.",
      confirmButtonColor: "#5143e6",
    }).then(() => {
      navigate("/customer/profile");
    });
  };

  return (
    <div className="edit-profile-page">
      {/* HEADER */}

      <header className="edit-profile-header">
        <button
          type="button"
          className="edit-profile-back-button"
          onClick={handleCancel}
          aria-label="Kembali"
        >
          <svg viewBox="0 0 24 24">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <div className="edit-profile-logo">
          EVENT<span>DAY</span>
        </div>

        <div className="edit-profile-location">
          <svg viewBox="0 0 24 24">
            <path d="M12 21s7-6.1 7-12a7 7 0 1 0-14 0c0 5.9 7 12 7 12Z" />
            <circle cx="12" cy="9" r="2.5" />
          </svg>

          <span>Jakarta, ID</span>
        </div>
      </header>

      {/* MAIN */}

      <main className="edit-profile-content">
        {/* PROFILE CARD */}

        <section className="edit-profile-user-card">
          <div className="edit-profile-photo">
            <img
              src="https://ui-avatars.com/api/?name=Adit+Ramadan&background=f5f5f5&color=777&size=180"
              alt="Foto Profil"
            />
          </div>

          <div className="edit-profile-user-info">
            <h1>{formData.name}</h1>
            <p>{formData.email}</p>
          </div>
        </section>

        {/* FORM CARD */}

        <section className="edit-profile-form-card">
          <div className="edit-profile-form-title">
            <h2>Edit Data Diri</h2>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="edit-profile-form-body">
              {/* NAMA */}

              <div className="edit-profile-input-group">
                <label htmlFor="name">
                  Nama Lengkap
                </label>

                <input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Masukan Nama Lengkap"
                />
              </div>

              {/* USERNAME */}

              <div className="edit-profile-input-group">
                <label htmlFor="username">
                  Username
                </label>

                <input
                  id="username"
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Masukan Username"
                />
              </div>

              {/* EMAIL */}

              <div className="edit-profile-input-group">
                <label htmlFor="email">
                  Email
                </label>

                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Masukan Email"
                />
              </div>

              {/* WHATSAPP */}

              <div className="edit-profile-input-group">
                <label htmlFor="phone">
                  No WhatsApp
                </label>

                <input
                  id="phone"
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Masukan No WhatsApp"
                  inputMode="numeric"
                />
              </div>

              {/* NIK */}

              <div className="edit-profile-input-group">
                <label htmlFor="nik">
                  NIK
                </label>

                <input
                  id="nik"
                  type="text"
                  name="nik"
                  value={formData.nik}
                  onChange={handleChange}
                  placeholder="Masukan NIK"
                  inputMode="numeric"
                  maxLength={16}
                />
              </div>
            </div>

            {/* BUTTON */}

            <div className="edit-profile-form-footer">
              <button
                type="button"
                className="edit-profile-cancel-button"
                onClick={handleCancel}
              >
                Batal
              </button>

              <button
                type="submit"
                className="edit-profile-save-button"
              >
                Simpan
              </button>
            </div>
          </form>
        </section>
      </main>

      {/* FOOTER */}

      <footer className="edit-profile-footer">
        © 2027 EVENTDAY. Hak cipta dilindungi
        undang-undang.
      </footer>
    </div>
  );
}

export default EditProfileCustomer;