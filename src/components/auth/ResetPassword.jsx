import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { resetPassword } from "../../services/authService";
import "./ResetPassword.css";

function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  
  // AMBIL DATA RESET
  

  const token =
    sessionStorage.getItem("resetToken") || "";

  const email =
    searchParams.get("email") ||
    sessionStorage.getItem("resetEmail") ||
    "";

  
  // STATE
  

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);

  
  // RESET PASSWORD
  

  const handleResetPassword = async (e) => {
    e.preventDefault();

    // Cek token
    if (!token) {
      alert(
        "Kode reset password tidak ditemukan. Silakan ulangi proses Lupa Password."
      );

      navigate("/forgot-password", {
        replace: true,
      });

      return;
    }

    // Cek password
    if (!password || !confirmPassword) {
      alert(
        "Kata Sandi Baru dan Konfirmasi Kata Sandi wajib diisi."
      );

      return;
    }

    // Minimal 6 karakter
    if (password.length < 6) {
      alert(
        "Kata sandi minimal 6 karakter."
      );

      return;
    }

    // Cek password sama
    if (password !== confirmPassword) {
      alert(
        "Konfirmasi kata sandi tidak sesuai."
      );

      return;
    }

    try {
      setLoading(true);

      console.log(
        "RESET PASSWORD DIMULAI..."
      );

      console.log("RESET EMAIL:", email);

      console.log(
        "RESET TOKEN:",
        token
      );

      if (!email) {
        alert("Email tidak ditemukan. Silakan ulangi proses Lupa Password.");
        navigate("/forgot-password", { replace: true });
        return;
      }

      const data = await resetPassword({
        email: email,
        code: token,
        newPassword: password,
      });

      console.log(
        "RESET PASSWORD RESPONSE:",
        data
      );

      alert(
        data.message ||
          "Password berhasil direset! Silakan login dengan password baru."
      );

      
      // BERSIHKAN DATA RESET
      

      sessionStorage.removeItem(
        "resetToken"
      );

      sessionStorage.removeItem(
        "resetEmail"
      );

      sessionStorage.removeItem(
        "otpEmail"
      );

      sessionStorage.removeItem(
        "otpFlow"
      );

      
      // KEMBALI KE LOGIN
      

      navigate("/", {
        replace: true,
      });

    } catch (error) {
      console.error(
        "RESET PASSWORD ERROR:",
        error
      );

      alert(
        error.message ||
          "Gagal mereset password. Silakan coba lagi."
      );

    } finally {
      setLoading(false);
    }
  };

  
  // BATAL
  

  const handleCancel = () => {
    sessionStorage.removeItem(
      "resetToken"
    );

    sessionStorage.removeItem(
      "resetEmail"
    );

    sessionStorage.removeItem(
      "otpEmail"
    );

    sessionStorage.removeItem(
      "otpFlow"
    );

    navigate("/");
  };

  
  // TOGGLE PASSWORD
  

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPassword = () => {
    setShowConfirmPassword(
      !showConfirmPassword
    );
  };

  
  // RENDER
  

  return (
    <div className="reset-password-page">

      {/* HEADER */}
      <header className="reset-password-header">
        <h1>
          EVENT<span>DAY</span>
        </h1>
      </header>

      {/* CONTENT */}
      <main className="reset-password-content">

        <div className="reset-password-card">

          {/* TITLE */}
          <div className="reset-password-title">
            <h2>
              ATUR ULANG KATA SANDI
            </h2>

            <p>
              Masukkan kata sandi baru
              untuk akun Anda.
            </p>
          </div>

          {/* EMAIL INFO */}
          {email && (
            <div className="reset-password-email">
              <span>Email:</span>
              <strong>{email}</strong>
            </div>
          )}

          {/* FORM */}
          <form onSubmit={handleResetPassword}>

            {/* PASSWORD BARU */}
            <div className="reset-password-field">

              <label htmlFor="new-password">
                Kata Sandi Baru
              </label>

              <div className="reset-password-input-wrapper">

                <input
                  id="new-password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(e) =>
                    setPassword(
                      e.target.value
                    )
                  }
                  placeholder="Masukkan Kata Sandi Baru"
                  autoComplete="new-password"
                  disabled={loading}
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={togglePassword}
                  aria-label={
                    showPassword
                      ? "Sembunyikan kata sandi"
                      : "Tampilkan kata sandi"
                  }
                  disabled={loading}
                >
                  {showPassword
                    ? "◉"
                    : "◉"}
                </button>

              </div>

            </div>

            {/* KONFIRMASI PASSWORD */}
            <div className="reset-password-field">

              <label htmlFor="confirm-password">
                Konfirmasi Kata Sandi Baru
              </label>

              <div className="reset-password-input-wrapper">

                <input
                  id="confirm-password"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(
                      e.target.value
                    )
                  }
                  placeholder="Konfirmasi Kata Sandi Baru"
                  autoComplete="new-password"
                  disabled={loading}
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={
                    toggleConfirmPassword
                  }
                  aria-label={
                    showConfirmPassword
                      ? "Sembunyikan kata sandi"
                      : "Tampilkan kata sandi"
                  }
                  disabled={loading}
                >
                  {showConfirmPassword
                    ? "◉"
                    : "◉"}
                </button>

              </div>

            </div>

            {/* RESET */}
            <button
              type="submit"
              className="reset-password-button"
              disabled={loading}
            >
              {loading
                ? "MEMPROSES..."
                : "Reset Kata Sandi"}
            </button>

            {/* BATAL */}
            <button
              type="button"
              className="reset-password-cancel"
              onClick={handleCancel}
              disabled={loading}
            >
              Batal
            </button>

          </form>

        </div>

      </main>

    </div>
  );
}

export default ResetPassword;