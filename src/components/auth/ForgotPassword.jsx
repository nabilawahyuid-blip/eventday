import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { forgotPassword } from "../../services/authService";

import {
  showSuccess,
  showError,
} from "../../utils/alert";

import "./ForgotPassword.css";

function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailUser = email
      .trim()
      .toLowerCase();

    if (!emailUser) {
      showError(
        "Email Belum Diisi",
        "Silakan masukkan email terlebih dahulu."
      );

      return;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        emailUser
      )
    ) {
      showError(
        "Email Tidak Valid",
        "Silakan masukkan alamat email yang valid."
      );

      return;
    }

    try {
      setLoading(true);

      console.log(
        "MEMINTA OTP FORGOT PASSWORD:",
        emailUser
      );

      const data = await forgotPassword({
        email: emailUser,
      });

      console.log(
        "FORGOT PASSWORD BERHASIL:",
        data
      );

      sessionStorage.setItem(
        "otpEmail",
        emailUser
      );

      sessionStorage.setItem(
        "otpFlow",
        "forgot-password"
      );

      sessionStorage.removeItem(
        "resetToken"
      );

      await showSuccess(
        "OTP Berhasil Dikirim!",
        data.message ||
          "Kode OTP telah dikirim ke email Anda. Silakan cek email."
      );

      navigate(
        `/otp?email=${encodeURIComponent(
          emailUser
        )}`
      );
    } catch (error) {
      console.error(
        "FORGOT PASSWORD ERROR:",
        error
      );

      showError(
        "Gagal Mengirim OTP",
        error?.message ||
          "Gagal mengirim kode OTP. Silakan coba lagi."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/");
  };

  return (
    <div className="forgot-page">

      <div className="forgot-card">

        <div className="forgot-header">

          <h1>
            LUPA PASSWORD
            <br />
            LOGIN
          </h1>

          <p>
            Masukkan email yang terdaftar pada akun Anda.
            Kami akan mengirimkan kode OTP untuk melakukan
            reset password.
          </p>

        </div>

        <form
          className="forgot-form"
          onSubmit={handleSubmit}
          noValidate
        >

          <div className="forgot-field">

            <label htmlFor="email">
              EMAIL
            </label>

            <div className="forgot-input-box">

              <div className="forgot-input-icon">
                ✉
              </div>

              <input
                id="email"
                type="email"
                placeholder="Email Pengguna"
                value={email}
                onChange={(e) =>
                  setEmail(
                    e.target.value
                  )
                }
                autoComplete="email"
                disabled={loading}
              />

            </div>

          </div>

          <button
            type="button"
            className="forgot-back-button"
            onClick={handleBack}
            disabled={loading}
          >
            Batal / Kembali
          </button>

          <button
            type="submit"
            className="forgot-submit-button"
            disabled={loading}
          >
            {loading
              ? "Mengirim OTP..."
              : "Kirim Kode OTP"}
          </button>

        </form>

        <div className="forgot-divider">

          <span></span>

          <p>
            Pastikan email sudah benar
          </p>

          <span></span>

        </div>

      </div>

    </div>
  );
}

export default ForgotPassword;