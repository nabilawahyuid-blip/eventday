// AUTH SERVICE - EVENTDAY
// Sync with backend API.md 2026-09-09 (port 8082, wrapper {msg,status,data})

// BACKEND — supports both localhost and ngrok
// Priority: VITE_API_URL env > ngrok (teman) > localhost 8082
// Canonical per API.md:3 is http://localhost:8082
// Ngrok teman: https://9538-2400-9800-264-e7e4-18d3-656d-b87c-b0ad.ngrok-free.app
// Legacy alias /api/auth/** also permit, canonical is /api/v1/auth

const API_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) ||
  (typeof process !== 'undefined' && process.env?.VITE_API_URL) ||
  "https://d85c-2400-9800-3cd-197d-71d1-7b90-e13c-943f.ngrok-free.app/api/v1/auth";

const getHeaders = () => ({
  "Content-Type": "application/json",
  Accept: "application/json",
  "ngrok-skip-browser-warning": "true",
});

// HELPER - BACA RESPONSE BACKEND (support wrapper {msg,status,data})

const getResponseData = async (response) => {
  const text = await response.text();

  // Kalau backend tidak mengirim body
  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    // Kalau response bukan JSON
    return {
      message: text,
    };
  }
};

const isWrappedResponse = (obj) =>
  obj &&
  typeof obj === "object" &&
  "msg" in obj &&
  "status" in obj &&
  "data" in obj;

const extractErrorMessage = (result, fallback) => {
  if (!result) return fallback;
  if (typeof result === "string") return result;
  // wrapper msg takes priority, fallback to message/error
  return (
    result.msg ||
    result.message ||
    result.error ||
    (result.data && typeof result.data === "object"
      ? result.data.msg || result.data.message
      : null) ||
    fallback
  );
};

const normalizeSuccess = (result) => {
  if (isWrappedResponse(result)) {
    const payload = result.data;
    const msg = result.msg;
    const status = result.status;
    if (payload && typeof payload === "object") {
      // attach compatibility fields so callers can use .message or .msg
      if (!payload.message && msg) payload.message = msg;
      if (!payload.msg && msg) payload.msg = msg;
      payload._status = status;
      payload._msg = msg;
      return payload;
    } else {
      // data null (verify-otp, resend-otp, reset-password) -> return object with message
      return { message: msg, msg, status, data: payload };
    }
  }
  return result;
};

// REGISTER

export const register = async (data) => {
  try {
    const username = data.username?.trim();
    const name = data.name?.trim();
    const email = data.email?.trim().toLowerCase();
    const phone = data.phone?.trim();
    const password = data.password;
    const nik = data.nik?.trim();
    const role = data.role || "CUSTOMER";

    console.log("REGISTER DATA:", {
      name,
      username,
      email,
      phone,
      nik,
      role,
    });

    // VALIDASI FRONTEND

    if (!name) {
      throw new Error("Nama wajib diisi.");
    }

    if (!username) {
      throw new Error("Username wajib diisi.");
    }

    if (!email) {
      throw new Error("Email wajib diisi.");
    }

    if (!password) {
      throw new Error("Password wajib diisi.");
    }

    if (password.length < 6) {
      throw new Error("Password minimal 6 karakter.");
    }

    // REQUEST REGISTER

    const response = await fetch(`${API_URL}/register`, {
      method: "POST",

      headers: getHeaders(),

      body: JSON.stringify({
        name,
        username,
        email,
        phone: phone || null,
        password,
        nik: nik || null,
        role,
      }),
    });

    const result = await getResponseData(response);

    console.log("REGISTER STATUS:", response.status);
    console.log("REGISTER RESPONSE:", result);

    // HANDLE ERROR - backend now returns {msg,status,data}

    if (!response.ok) {
      throw new Error(
        extractErrorMessage(result, `Registrasi gagal. Status: ${response.status}`)
      );
    }

    return normalizeSuccess(result);
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    throw error;
  }
};

// VERIFY OTP REGISTER

export const verifyOtp = async (data) => {
  try {
    const email = data.email?.trim().toLowerCase();
    const otpCode = data.otpCode?.trim();

    console.log("VERIFY OTP EMAIL:", email);
    console.log("VERIFY OTP CODE:", otpCode);

    // VALIDASI

    if (!email) {
      throw new Error("Email wajib diisi.");
    }

    if (!otpCode) {
      throw new Error("Kode OTP wajib diisi.");
    }

    // REQUEST VERIFY OTP

    const response = await fetch(`${API_URL}/verify-otp`, {
      method: "POST",

      headers: getHeaders(),

      body: JSON.stringify({
        email,
        otpCode,
      }),
    });

    const result = await getResponseData(response);

    console.log("VERIFY OTP STATUS:", response.status);
    console.log("VERIFY OTP RESPONSE:", result);

    // HANDLE ERROR

    if (!response.ok) {
      throw new Error(
        extractErrorMessage(result, `Verifikasi OTP gagal. Status: ${response.status}`)
      );
    }

    return normalizeSuccess(result);
  } catch (error) {
    console.error("VERIFY OTP ERROR:", error);
    throw error;
  }
};

// RESEND OTP REGISTER

export const resendOtp = async (data) => {
  try {
    const email = data.email?.trim().toLowerCase();

    console.log("RESEND OTP EMAIL:", email);

    if (!email) {
      throw new Error("Email wajib diisi.");
    }

    // REQUEST RESEND OTP

    const response = await fetch(`${API_URL}/resend-otp`, {
      method: "POST",

      headers: getHeaders(),

      body: JSON.stringify({
        email,
      }),
    });

    const result = await getResponseData(response);

    console.log("RESEND OTP STATUS:", response.status);
    console.log("RESEND OTP RESPONSE:", result);

    if (!response.ok) {
      throw new Error(
        extractErrorMessage(result, `Gagal mengirim ulang OTP. Status: ${response.status}`)
      );
    }

    return normalizeSuccess(result);
  } catch (error) {
    console.error("RESEND OTP ERROR:", error);
    throw error;
  }
};

// LOGIN
// Bisa menggunakan USERNAME atau EMAIL

export const login = async (data) => {
  try {
    const identifier = data.identifier?.trim();

    console.log("LOGIN DATA:", {
      identifier,
      password: "********",
    });

    // VALIDASI

    if (!identifier) {
      throw new Error("Username atau email wajib diisi.");
    }

    if (!data.password) {
      throw new Error("Password wajib diisi.");
    }

    // TENTUKAN EMAIL ATAU USERNAME

    let payload;

    if (identifier.includes("@")) {
      // Login menggunakan email
      payload = {
        email: identifier.toLowerCase(),
        password: data.password,
      };
    } else {
      // Login menggunakan username
      payload = {
        username: identifier,
        password: data.password,
      };
    }

    console.log("LOGIN PAYLOAD:", {
      ...payload,
      password: "********",
    });

    // REQUEST LOGIN

    const response = await fetch(`${API_URL}/login`, {
      method: "POST",

      headers: getHeaders(),

      body: JSON.stringify(payload),
    });

    const result = await getResponseData(response);

    console.log("LOGIN STATUS:", response.status);
    console.log("LOGIN RESPONSE:", result);

    // HANDLE ERROR

    if (!response.ok) {
      throw new Error(
        extractErrorMessage(result, `Login gagal. Status: ${response.status}`)
      );
    }

    return normalizeSuccess(result);
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    throw error;
  }
};

// GOOGLE LOGIN

export const loginGoogle = async (data) => {
  try {
    console.log("GOOGLE LOGIN DIMULAI...");

    if (!data?.idToken) {
      throw new Error("ID Token Google tidak ditemukan.");
    }

    // REQUEST GOOGLE LOGIN

    const response = await fetch(`${API_URL}/google`, {
      method: "POST",

      headers: getHeaders(),

      body: JSON.stringify({
        idToken: data.idToken,
      }),
    });

    const result = await getResponseData(response);

    console.log("GOOGLE LOGIN STATUS:", response.status);
    console.log("GOOGLE LOGIN RESPONSE:", result);

    // HANDLE ERROR

    if (!response.ok) {
      throw new Error(
        extractErrorMessage(result, `Login Google gagal. Status: ${response.status}`)
      );
    }

    return normalizeSuccess(result);
  } catch (error) {
    console.error("GOOGLE LOGIN ERROR:", error);
    throw error;
  }
};

// FORGOT PASSWORD

// Body:
// {
//   email: "user@gmail.com"
// }
//
// Backend akan:
// 1. mencari user
// 2. membuat code 6-digit reset (disimpan di auth.reset_token, exp 15 menit)
// 3. mengirim via EmailService (Mailtrap)

export const forgotPassword = async (data) => {
  try {
    const email = data.email?.trim().toLowerCase();

    console.log("FORGOT PASSWORD EMAIL:", email);

    // VALIDASI

    if (!email) {
      throw new Error("Email wajib diisi.");
    }

    // REQUEST FORGOT PASSWORD

    const response = await fetch(`${API_URL}/reset-password`, {
      method: "POST",

      headers: getHeaders(),

      body: JSON.stringify({
        email,
      }),
    });

    const result = await getResponseData(response);

    console.log("SEND RESET OTP STATUS:", response.status);
    console.log("SEND RESET OTP RESPONSE:", result);

    // HANDLE ERROR

    if (!response.ok) {
      throw new Error(
        extractErrorMessage(result, `Gagal mengirim kode OTP. Status: ${response.status}`)
      );
    }

    return normalizeSuccess(result);
  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);
    throw error;
  }
};

// RESET PASSWORD

// Body:
// {
//   email: "user@gmail.com",
//   code: "123456",        // alias token/otp di backend via @JsonAlias
//   newPassword: "passwordbaru" // alias password/new_password
// }
//
// Backend akan:
// 1. mengecek email
// 2. mengecek auth.resetToken == code && not expired via getEffectiveCode()
// 3. update BCrypt + clear resetToken

export const resetPassword = async (data) => {
  try {
    const email = data.email?.trim().toLowerCase();
    const code = data.code?.trim();
    const newPassword = data.newPassword;

    console.log("RESET PASSWORD DATA:", {
      email,
      code,
      newPassword: "********",
    });

    // VALIDASI

    if (!email) {
      throw new Error("Email wajib diisi.");
    }

    if (!code) {
      throw new Error("Kode OTP wajib diisi.");
    }

    if (!newPassword) {
      throw new Error("Password baru wajib diisi.");
    }

    if (newPassword.length < 6) {
      throw new Error("Password minimal 6 karakter.");
    }

    // REQUEST RESET PASSWORD

    const response = await fetch(`${API_URL}/reset-password`, {
      method: "POST",

      headers: getHeaders(),

      body: JSON.stringify({
        email,
        code,
        newPassword,
      }),
    });

    const result = await getResponseData(response);

    console.log("RESET PASSWORD STATUS:", response.status);
    console.log("RESET PASSWORD RESPONSE:", result);

    // HANDLE ERROR

    if (!response.ok) {
      throw new Error(
        extractErrorMessage(result, `Reset password gagal. Status: ${response.status}`)
      );
    }

    return normalizeSuccess(result);
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);
    throw error;
  }
};
