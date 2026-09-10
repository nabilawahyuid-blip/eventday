import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";

import {
  register,
  loginGoogle,
} from "../../services/authService";

import {
  showSuccess,
  showError,
} from "../../utils/alert";

import "./Register.css";

function Register() {
  const navigate = useNavigate();

  const [namaLengkap, setNamaLengkap] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [nik, setNik] = useState("");
  const [password, setPassword] = useState("");
  const [ulangiPassword, setUlangiPassword] = useState("");

  const [setuju, setSetuju] = useState(false);

  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showUlangiPassword, setShowUlangiPassword] =
    useState(false);

  const saveLoginData = (data) => {
    if (data.token) {
      localStorage.setItem("token", data.token);
    }

    if (data.userId) {
      localStorage.setItem(
        "userId",
        data.userId
      );
    }

    if (data.name) {
      localStorage.setItem(
        "name",
        data.name
      );
    }

    if (data.username) {
      localStorage.setItem(
        "username",
        data.username
      );
    }

    if (data.email) {
      localStorage.setItem(
        "email",
        data.email
      );
    }

    if (data.role) {
      localStorage.setItem(
        "role",
        data.role
      );
    }
  };

  const redirectByRole = (role) => {
    if (role === "ADMIN") {
      navigate("/admin/dashboard");
      return;
    }

    if (role === "ORGANIZER") {
      navigate("/eo/dashboard");
      return;
    }

    navigate("/customer/dashboard");
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    const nama = namaLengkap.trim();
    const user = username.trim();
    const emailUser = email.trim().toLowerCase();
    const phone = whatsapp.trim();
    const nikUser = nik.trim();

    if (
      !nama ||
      !user ||
      !emailUser ||
      !phone ||
      !nikUser ||
      !password ||
      !ulangiPassword
    ) {
      showError(
        "Data Belum Lengkap",
        "Silakan lengkapi semua data terlebih dahulu."
      );

      return;
    }

    if (user.length < 3) {
      showError(
        "Username Tidak Valid",
        "Username minimal 3 karakter."
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

    if (password !== ulangiPassword) {
      showError(
        "Password Tidak Sama",
        "Kata sandi dan ulangi kata sandi tidak sama."
      );

      return;
    }

    if (password.length < 6) {
      showError(
        "Password Terlalu Pendek",
        "Kata sandi minimal 6 karakter."
      );

      return;
    }

    if (!setuju) {
      showError(
        "Persetujuan Diperlukan",
        "Silakan setujui Syarat & Ketentuan terlebih dahulu."
      );

      return;
    }

    if (!/^\d{16}$/.test(nikUser)) {
      showError(
        "NIK Tidak Valid",
        "NIK harus terdiri dari 16 digit angka."
      );

      return;
    }

    if (!/^\d+$/.test(phone)) {
      showError(
        "Nomor WhatsApp Tidak Valid",
        "Nomor WhatsApp hanya boleh berisi angka."
      );

      return;
    }

    try {
      setLoading(true);

      const data = await register({
        name: nama,
        username: user,
        email: emailUser,
        phone: phone,
        nik: nikUser,
        password: password,
        role: "CUSTOMER",
      });

      console.log(
        "Register response:",
        data
      );

      sessionStorage.setItem(
        "otpEmail",
        emailUser
      );

      sessionStorage.setItem(
        "otpFlow",
        "register"
      );

      await showSuccess(
        "Registrasi Berhasil!",
        data.message ||
          "Akun berhasil dibuat. Silakan cek email untuk mendapatkan kode OTP."
      );

      navigate(
        `/otp?email=${encodeURIComponent(
          emailUser
        )}`,
        {
          replace: true,
        }
      );
    } catch (error) {
      console.error(
        "Register error:",
        error
      );

      const message =
        error?.message ||
        "Registrasi gagal.";

      const belumVerifikasi =
        message
          .toLowerCase()
          .includes(
            "belum diverifikasi"
          ) ||
        message
          .toLowerCase()
          .includes(
            "belum terverifikasi"
          ) ||
        message
          .toLowerCase()
          .includes(
            "belum diaktifkan"
          );

      if (belumVerifikasi) {
        sessionStorage.setItem(
          "otpEmail",
          emailUser
        );

        sessionStorage.setItem(
          "otpFlow",
          "register"
        );

        await showError(
          "Akun Belum Terverifikasi",
          message
        );

        navigate(
          `/otp?email=${encodeURIComponent(
            emailUser
          )}`,
          {
            replace: true,
          }
        );

        return;
      }

      if (
        message
          .toLowerCase()
          .includes(
            "nik sudah terdaftar"
          )
      ) {
        showError(
          "NIK Sudah Terdaftar",
          "NIK sudah terdaftar. Silakan gunakan NIK lain atau gunakan akun yang sudah terdaftar."
        );

        return;
      }

      if (
        message
          .toLowerCase()
          .includes(
            "username sudah terdaftar"
          )
      ) {
        showError(
          "Username Sudah Terdaftar",
          "Username sudah terdaftar. Silakan gunakan username lain."
        );

        return;
      }

      if (
        message
          .toLowerCase()
          .includes(
            "email sudah terdaftar"
          )
      ) {
        showError(
          "Email Sudah Terdaftar",
          "Email sudah terdaftar. Silakan gunakan email lain atau lakukan verifikasi akun."
        );

        return;
      }

      showError(
        "Registrasi Gagal",
        message
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (
    credentialResponse
  ) => {
    try {
      setLoading(true);

      if (
        !credentialResponse ||
        !credentialResponse.credential
      ) {
        showError(
          "Login Google Gagal",
          "Credential Google tidak ditemukan."
        );

        return;
      }

      console.log(
        "Google credential berhasil didapat."
      );

      const data = await loginGoogle({
        idToken:
          credentialResponse.credential,
      });

      console.log(
        "Google login response:",
        data
      );

      saveLoginData(data);

      await showSuccess(
        "Berhasil!",
        data.message ||
          "Berhasil masuk dengan Google."
      );

      redirectByRole(data.role);
    } catch (error) {
      console.error(
        "Google login error:",
        error
      );

      showError(
        "Login Google Gagal",
        error?.message ||
          "Login dengan Google gagal."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    console.error(
      "Google Login gagal."
    );

    showError(
      "Login Google Gagal",
      "Login dengan Google gagal atau dibatalkan."
    );
  };

  const handleLogin = () => {
    navigate("/");
  };

  return (
    <div className="register-page">

      <header className="register-header">
        <h1>
          EVENT<span>DAY</span>
        </h1>
      </header>

      <main className="register-content">

        <div className="register-container">

          <h2>DAFTAR AKUN</h2>

          <form
            onSubmit={handleRegister}
            noValidate
          >

            <div className="register-field">

              <label htmlFor="namaLengkap">
                Nama Lengkap
              </label>

              <input
                id="namaLengkap"
                type="text"
                placeholder="Masukan Nama Lengkap"
                value={namaLengkap}
                onChange={(e) =>
                  setNamaLengkap(
                    e.target.value
                  )
                }
                autoComplete="name"
                disabled={loading}
              />

            </div>

            <div className="register-field">

              <label htmlFor="username">
                Username
              </label>

              <input
                id="username"
                type="text"
                placeholder="Masukan Username"
                value={username}
                onChange={(e) =>
                  setUsername(
                    e.target.value
                  )
                }
                autoComplete="username"
                disabled={loading}
              />

            </div>

            <div className="register-field">

              <label htmlFor="email">
                Email
              </label>

              <input
                id="email"
                type="email"
                placeholder="Masukan Email"
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

            <div className="register-field">

              <label htmlFor="whatsapp">
                No WhatsApp
              </label>

              <input
                id="whatsapp"
                type="tel"
                placeholder="Masukan Nomor WhatsApp"
                value={whatsapp}
                onChange={(e) =>
                  setWhatsapp(
                    e.target.value
                  )
                }
                autoComplete="tel"
                inputMode="numeric"
                disabled={loading}
              />

            </div>

            <div className="register-field">

              <label htmlFor="nik">
                NIK
              </label>

              <input
                id="nik"
                type="text"
                placeholder="Masukan NIK"
                value={nik}
                onChange={(e) => {
                  const value =
                    e.target.value;

                  if (
                    /^\d*$/.test(value) &&
                    value.length <= 16
                  ) {
                    setNik(value);
                  }
                }}
                inputMode="numeric"
                maxLength={16}
                autoComplete="off"
                disabled={loading}
              />

            </div>

            <div className="register-field">

              <label htmlFor="password">
                Kata Sandi
              </label>

              <div className="register-password-wrapper">

                <input
                  id="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Masukan Kata Sandi"
                  value={password}
                  onChange={(e) =>
                    setPassword(
                      e.target.value
                    )
                  }
                  autoComplete="new-password"
                  disabled={loading}
                />

                <button
                  type="button"
                  className="register-password-toggle"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
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
                      className="register-eye-icon"
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
                      className="register-eye-icon"
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

            <div className="register-field">

              <label htmlFor="ulangiPassword">
                Ulangi Kata Sandi
              </label>

              <div className="register-password-wrapper">

                <input
                  id="ulangiPassword"
                  type={
                    showUlangiPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Ulangi Kata Sandi"
                  value={ulangiPassword}
                  onChange={(e) =>
                    setUlangiPassword(
                      e.target.value
                    )
                  }
                  autoComplete="new-password"
                  disabled={loading}
                />

                <button
                  type="button"
                  className="register-password-toggle"
                  onClick={() =>
                    setShowUlangiPassword(
                      !showUlangiPassword
                    )
                  }
                  disabled={loading}
                  aria-label={
                    showUlangiPassword
                      ? "Sembunyikan password"
                      : "Tampilkan password"
                  }
                >

                  {showUlangiPassword ? (

                    <svg
                      viewBox="0 0 24 24"
                      className="register-eye-icon"
                      xmlns="http://www.w3.org/2000/svg"
                    >

                      <path
                        d="M2.5 12C4 8.5 7.5 5 12 5C16.5 5 20 8.5 21.5 12C20 15.5 16.5 15 12 19C7.5 19 4 15.5 2.5 12Z"
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
                      className="register-eye-icon"
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

            <div className="register-agreement">

              <input
                id="agreement"
                type="checkbox"
                checked={setuju}
                onChange={(e) =>
                  setSetuju(
                    e.target.checked
                  )
                }
                disabled={loading}
              />

              <label htmlFor="agreement">

                Saya telah membaca & setuju
                dengan{" "}

                <span>
                  "Syarat & Ketentuan"
                </span>

              </label>

            </div>

            <button
              type="submit"
              className="register-button"
              disabled={loading}
            >
              {loading
                ? "MEMBUAT AKUN..."
                : "BUAT AKUN"}
            </button>

          </form>

          <div className="register-divider">

            <span></span>

            <p>
              Atau daftar dengan
            </p>

            <span></span>

          </div>

          <div className="register-google-wrapper">

            <GoogleLogin
              onSuccess={
                handleGoogleSuccess
              }
              onError={
                handleGoogleError
              }
              theme="outline"
              size="large"
              width="100%"
              text="continue_with"
              shape="rectangular"
            />

          </div>

          <p className="register-login">

            Sudah punya akun?

            <button
              type="button"
              onClick={handleLogin}
              disabled={loading}
            >
              Masuk
            </button>

          </p>

        </div>

      </main>

    </div>
  );
}

export default Register;