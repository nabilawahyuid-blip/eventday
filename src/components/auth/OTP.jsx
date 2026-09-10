import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import {
  verifyOtp,
  resendOtp,
  forgotPassword,
} from "../../services/authService";

import {
  showSuccess,
  showError,
} from "../../utils/alert";

import "./OTP.css";

function OTP() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [otp, setOtp] = useState([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);

  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] =
    useState(false);

  const inputRefs = useRef([]);

  const emailFromUrl =
    searchParams.get("email");

  const email =
    emailFromUrl ||
    sessionStorage.getItem("otpEmail") ||
    "";

  const storedOtpFlow =
    sessionStorage.getItem("otpFlow") ||
    "register";

  const otpFlow =
    storedOtpFlow === "forgot"
      ? "forgot-password"
      : storedOtpFlow;

  useEffect(() => {
    if (!email) {
      showError(
        "Email Tidak Ditemukan",
        "Email OTP tidak ditemukan. Silakan ulangi proses."
      );

      navigate("/register", {
        replace: true,
      });
    }
  }, [email, navigate]);

  const handleChange = (
    index,
    value
  ) => {
    if (!/^\d*$/.test(value)) {
      return;
    }

    const newOtp = [...otp];

    newOtp[index] = value.slice(-1);

    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index,
    e
  ) => {
    if (
      e.key === "Backspace" &&
      !otp[index] &&
      index > 0
    ) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();

    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (!pastedData) {
      return;
    }

    const newOtp = [
      "",
      "",
      "",
      "",
      "",
      "",
    ];

    pastedData
      .split("")
      .forEach((number, index) => {
        newOtp[index] = number;
      });

    setOtp(newOtp);

    const nextIndex = Math.min(
      pastedData.length,
      5
    );

    inputRefs.current[nextIndex]?.focus();
  };

  const handleVerify = async (e) => {
    e.preventDefault();

    const otpCode = otp.join("");

    if (otpCode.length !== 6) {
      showError(
        "Kode OTP Belum Lengkap",
        "Silakan masukkan 6 digit kode OTP."
      );

      return;
    }

    if (!email) {
      showError(
        "Email Tidak Ditemukan",
        "Email OTP tidak ditemukan."
      );

      navigate("/register");
      return;
    }

    try {
      setLoading(true);

      console.log(
        "OTP FLOW:",
        otpFlow
      );

      console.log(
        "EMAIL:",
        email
      );

      console.log(
        "OTP CODE:",
        otpCode
      );

      if (otpFlow === "register") {
        console.log(
          "VERIFY OTP REGISTER..."
        );

        const data = await verifyOtp({
          email: email,
          otpCode: otpCode,
        });

        console.log(
          "VERIFY REGISTER RESPONSE:",
          data
        );

        await showSuccess(
          "Verifikasi Berhasil!",
          data.message ||
            "Kode OTP berhasil diverifikasi."
        );

        sessionStorage.removeItem(
          "otpEmail"
        );

        sessionStorage.removeItem(
          "otpFlow"
        );

        sessionStorage.removeItem(
          "forgotName"
        );

        navigate("/", {
          replace: true,
        });

        return;
      }

      if (
        otpFlow ===
        "forgot-password"
      ) {
        console.log(
          "OTP FORGOT PASSWORD VALID..."
        );

        sessionStorage.setItem(
          "resetToken",
          otpCode
        );

        sessionStorage.setItem(
          "resetEmail",
          email
        );

        console.log(
          "RESET TOKEN:",
          otpCode
        );

        navigate(
          `/forgot-password/reset?email=${encodeURIComponent(
            email
          )}`,
          {
            replace: true,
          }
        );

        return;
      }

      showError(
        "Flow OTP Tidak Dikenali",
        "Flow OTP tidak dikenali."
      );

      sessionStorage.removeItem(
        "otpEmail"
      );

      sessionStorage.removeItem(
        "otpFlow"
      );

      navigate("/", {
        replace: true,
      });
    } catch (error) {
      console.error(
        "VERIFY OTP ERROR:",
        error
      );

      showError(
        "Verifikasi OTP Gagal",
        error.message ||
          "Kode OTP tidak valid atau sudah kedaluwarsa."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      showError(
        "Email Tidak Ditemukan",
        "Email OTP tidak ditemukan."
      );

      navigate("/register");
      return;
    }

    try {
      setResendLoading(true);

      console.log(
        "RESEND OTP FLOW:",
        otpFlow
      );

      console.log(
        "RESEND OTP EMAIL:",
        email
      );

      if (otpFlow === "register") {
        console.log(
          "RESEND OTP REGISTER..."
        );

        const data =
          await resendOtp({
            email: email,
          });

        console.log(
          "RESEND REGISTER RESPONSE:",
          data
        );

        setOtp([
          "",
          "",
          "",
          "",
          "",
          "",
        ]);

        inputRefs.current[0]?.focus();

        showSuccess(
          "OTP Dikirim Ulang!",
          data.message ||
            "Kode OTP telah dikirim ulang."
        );

        return;
      }

      if (
        otpFlow ===
        "forgot-password"
      ) {
        console.log(
          "RESEND OTP FORGOT PASSWORD..."
        );

        const data =
          await forgotPassword({
            email: email,
          });

        console.log(
          "RESEND FORGOT PASSWORD RESPONSE:",
          data
        );

        sessionStorage.removeItem(
          "resetToken"
        );

        setOtp([
          "",
          "",
          "",
          "",
          "",
          "",
        ]);

        inputRefs.current[0]?.focus();

        showSuccess(
          "OTP Baru Dikirim!",
          data.message ||
            "Kode OTP baru telah dikirim ke email Anda."
        );

        return;
      }

      showError(
        "Flow OTP Tidak Dikenali",
        "Flow OTP tidak dikenali."
      );
    } catch (error) {
      console.error(
        "RESEND OTP ERROR:",
        error
      );

      showError(
        "Gagal Mengirim OTP",
        error.message ||
          "Gagal mengirim ulang kode OTP."
      );
    } finally {
      setResendLoading(false);
    }
  };

  const handleClose = () => {
    sessionStorage.removeItem(
      "otpEmail"
    );

    sessionStorage.removeItem(
      "otpFlow"
    );

    sessionStorage.removeItem(
      "forgotName"
    );

    navigate("/");
  };

  return (
    <div className="otp-page">

      <header className="otp-header">
        <h1>
          EVENT<span>DAY</span>
        </h1>
      </header>

      <main className="otp-content">

        <div className="otp-card">

          <button
            type="button"
            className="otp-close"
            onClick={handleClose}
            aria-label="Tutup"
          >
            ×
          </button>

          <div className="otp-title">

            <h2>
              Verifikasi OTP
            </h2>

            <p>
              Silakan masukkan kode OTP yang
              telah dikirim
              <br className="desktop-break" />
              ke Email Anda.
            </p>

          </div>

          <div className="otp-divider"></div>

          <form
            onSubmit={handleVerify}
          >

            <label className="otp-label">
              MASUKKAN KODE OTP
            </label>

            <div
              className="otp-input-wrapper"
              onPaste={handlePaste}
            >

              {otp.map(
                (value, index) => (
                  <input
                    key={index}
                    ref={(element) => {
                      inputRefs.current[index] =
                        element;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength="1"
                    value={value}
                    onChange={(e) =>
                      handleChange(
                        index,
                        e.target.value
                      )
                    }
                    onKeyDown={(e) =>
                      handleKeyDown(
                        index,
                        e
                      )
                    }
                    className={`otp-input ${
                      index === 0 &&
                      !otp[0]
                        ? "otp-input-active"
                        : ""
                    }`}
                    aria-label={`Digit OTP ${
                      index + 1
                    }`}
                    disabled={loading}
                  />
                )
              )}

            </div>

            <button
              type="submit"
              className="otp-verify-button"
              disabled={loading}
            >
              {loading
                ? "MEMPROSES..."
                : otpFlow ===
                  "forgot-password"
                ? "Lanjutkan"
                : "Verifikasi"}
            </button>

            <button
              type="button"
              className="otp-resend-button"
              onClick={handleResend}
              disabled={
                resendLoading ||
                loading
              }
            >
              {resendLoading
                ? "MENGIRIM..."
                : "Kirim Ulang Kode"}
            </button>

          </form>

        </div>

      </main>

    </div>
  );
}

export default OTP;