import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";

import {
  login,
  loginGoogle,
} from "../../services/authService";

import {
  showSuccess,
  showError,
} from "../../utils/alert";

import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const saveLoginData = (data) => {
    // BE sekarang pakai HttpOnly Cookie (data.token = null / @JsonIgnore).
    // Jika BE masih kirim token (legacy), simpan. Jika tidak, jangan hapus token lama — cookie sudah tersimpan otomatis via credentials:'include'.
    if (data.token) {
      localStorage.setItem("token", data.token);
    }

    if (data.userId) {
      localStorage.setItem("userId", data.userId);
    }

    if (data.name) {
      localStorage.setItem("name", data.name);
    }

    if (data.username) {
      localStorage.setItem("username", data.username);
    }

    if (data.email) {
      localStorage.setItem("email", data.email);
    }

    if (data.role) {
      localStorage.setItem("role", data.role);
    }
  };

  const redirectByRole = async (role) => {
    if (role === "ADMIN") {
      await showSuccess(
        "Login Berhasil!",
        "Selamat datang kembali, Admin."
      );

      navigate("/admin/dashboard");
    } else if (role === "ORGANIZER") {
      await showSuccess(
        "Login Berhasil!",
        "Selamat datang kembali di EventDay."
      );

      navigate("/eo/dashboard");
    } else if (role === "CUSTOMER") {
      await showSuccess(
        "Login Berhasil!",
        "Selamat datang kembali di EventDay."
      );

      navigate("/customer/dashboard");
    } else {
      showError(
        "Role Tidak Dikenali",
        "Role pengguna tidak dikenali oleh sistem."
      );
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      showError(
        "Data Belum Lengkap",
        "Username/Email dan Password wajib diisi."
      );
      return;
    }

    try {
      setLoading(true);

      const data = await login({
        identifier: username.trim(),
        password: password,
      });

      console.log("Login berhasil:", data);

      saveLoginData(data);

      await redirectByRole(data.role);
    } catch (error) {
      console.error("Error login:", error);

      showError(
        "Login Gagal",
        error.message ||
          "Username/Email atau password salah."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);

      console.log(
        "Google Login berhasil mendapatkan credential."
      );

      if (!credentialResponse?.credential) {
        showError(
          "Login Google Gagal",
          "ID Token Google tidak ditemukan."
        );
        return;
      }

      const data = await loginGoogle({
        idToken: credentialResponse.credential,
      });

      console.log(
        "Login Google berhasil:",
        data
      );

      saveLoginData(data);

      await redirectByRole(data.role);
    } catch (error) {
      console.error(
        "Error login Google:",
        error
      );

      showError(
        "Login Google Gagal",
        error.message ||
          "Silakan coba lagi."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    console.error("Google Login gagal.");

    showError(
      "Login Google Gagal",
      "Silakan coba lagi."
    );
  };

  const handleForgotPassword = () => {
    navigate("/forgot-password");
  };

  const handleRegister = () => {
    navigate("/register");
  };

  return (
    <div className="login-page">
      <div className="login-card">

        <div className="login-logo">
          EVENTDAY
        </div>

        <form onSubmit={handleLogin}>

          <div className="login-field">
            <label htmlFor="username">
              Username/Email
            </label>

            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) =>
                setUsername(e.target.value)
              }
              placeholder="Masukan Username/Email"
              autoComplete="username"
              disabled={loading}
            />
          </div>

          <div className="login-field password-field">

            <div className="password-label">
              <label htmlFor="password">
                Password
              </label>

              <button
                type="button"
                className="forgot-password"
                onClick={handleForgotPassword}
                disabled={loading}
              >
                Lupa Password?
              </button>
            </div>

            <div className="password-input-wrapper">

              <input
                id="password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="************"
                autoComplete="current-password"
                disabled={loading}
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                disabled={loading}
                aria-label={
                  showPassword
                    ? "Sembunyikan password"
                    : "Tampilkan password"
                }
              >
                {showPassword ? (
                  <svg
                    viewBox="0 0 24 24"
                    className="eye-icon"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M2.5 12C4 8.5 7.5 5 12 5C16.5 5 20 8.5 21.5 12C20 15.5 16.5 19 12 19C7.5 19 4 15.5 2.5 12Z"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    <circle
                      cx="12"
                      cy="12"
                      r="3"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />

                    <path
                      d="M3 3L21 21"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    className="eye-icon"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M2.5 12C4 8.5 7.5 5 12 5C16.5 5 20 8.5 21.5 12C20 15.5 16.5 19 12 19C7.5 19 4 15.5 2.5 12Z"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    <circle
                      cx="12"
                      cy="12"
                      r="3"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />
                  </svg>
                )}
              </button>

            </div>
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading
              ? "Memproses..."
              : "Lanjutkan"}
          </button>

        </form>

        <div className="login-divider">
          <span></span>
          <p>atau</p>
          <span></span>
        </div>

        <div className="google-login-wrapper">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            useOneTap={false}
            theme="outline"
            size="large"
            text="continue_with"
            shape="rectangular"
            width="100%"
          />
        </div>

        <div className="register-text">
          Belum punya akun?

          <button
            type="button"
            onClick={handleRegister}
            disabled={loading}
          >
            Register
          </button>
        </div>

      </div>
    </div>
  );
}

export default Login;