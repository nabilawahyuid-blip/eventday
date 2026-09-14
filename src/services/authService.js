const API_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  (typeof process !== "undefined" && process.env?.VITE_API_URL) ||
  "https://90bc-2400-9800-25a-64b-45cc-9a26-5944-a73.ngrok-free.app/api/v1/auth";

export const getApiBaseUrl = () => {
  return API_URL.replace("/auth", "");
};

const getHeaders = () => ({
  "Content-Type": "application/json",
  Accept: "application/json",
  "ngrok-skip-browser-warning": "true",
});

const getResponseData = async (response) => {
  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
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

  if (typeof result === "string") {
    return result;
  }

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
      if (!payload.message && msg) {
        payload.message = msg;
      }

      if (!payload.msg && msg) {
        payload.msg = msg;
      }

      payload._status = status;
      payload._msg = msg;

      return payload;
    } else {
      return {
        message: msg,
        msg,
        status,
        data: payload,
      };
    }
  }

  return result;
};

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

    if (!response.ok) {
      throw new Error(
        extractErrorMessage(
          result,
          `Registrasi gagal. Status: ${response.status}`,
        ),
      );
    }

    return normalizeSuccess(result);
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    throw error;
  }
};

export const verifyOtp = async (data) => {
  try {
    const email = data.email?.trim().toLowerCase();
    const otpCode = data.otpCode?.trim();

    console.log("VERIFY OTP EMAIL:", email);
    console.log("VERIFY OTP CODE:", otpCode);

    if (!email) {
      throw new Error("Email wajib diisi.");
    }

    if (!otpCode) {
      throw new Error("Kode OTP wajib diisi.");
    }

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

    if (!response.ok) {
      throw new Error(
        extractErrorMessage(
          result,
          `Verifikasi OTP gagal. Status: ${response.status}`,
        ),
      );
    }

    return normalizeSuccess(result);
  } catch (error) {
    console.error("VERIFY OTP ERROR:", error);
    throw error;
  }
};

export const resendOtp = async (data) => {
  try {
    const email = data.email?.trim().toLowerCase();

    console.log("RESEND OTP EMAIL:", email);

    if (!email) {
      throw new Error("Email wajib diisi.");
    }

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
        extractErrorMessage(
          result,
          `Gagal mengirim ulang OTP. Status: ${response.status}`,
        ),
      );
    }

    return normalizeSuccess(result);
  } catch (error) {
    console.error("RESEND OTP ERROR:", error);
    throw error;
  }
};

export const login = async (data) => {
  try {
    const identifier = data.identifier?.trim();

    console.log("LOGIN DATA:", {
      identifier,
      password: "********",
    });

    if (!identifier) {
      throw new Error("Username atau email wajib diisi.");
    }

    if (!data.password) {
      throw new Error("Password wajib diisi.");
    }

    let payload;

    if (identifier.includes("@")) {
      payload = {
        email: identifier.toLowerCase(),
        password: data.password,
      };
    } else {
      payload = {
        username: identifier,
        password: data.password,
      };
    }

    console.log("LOGIN PAYLOAD:", {
      ...payload,
      password: "********",
    });

    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });

    const result = await getResponseData(response);

    console.log("LOGIN STATUS:", response.status);
    console.log("LOGIN RESPONSE:", result);

    if (!response.ok) {
      throw new Error(
        extractErrorMessage(result, `Login gagal. Status: ${response.status}`),
      );
    }

    return normalizeSuccess(result);
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    throw error;
  }
};

export const loginGoogle = async (data) => {
  try {
    console.log("GOOGLE LOGIN DIMULAI...");

    if (!data?.idToken) {
      throw new Error("ID Token Google tidak ditemukan.");
    }

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

    if (!response.ok) {
      throw new Error(
        extractErrorMessage(
          result,
          `Login Google gagal. Status: ${response.status}`,
        ),
      );
    }

    return normalizeSuccess(result);
  } catch (error) {
    console.error("GOOGLE LOGIN ERROR:", error);
    throw error;
  }
};

export const forgotPassword = async (data) => {
  try {
    const email = data.email?.trim().toLowerCase();

    console.log("FORGOT PASSWORD EMAIL:", email);

    if (!email) {
      throw new Error("Email wajib diisi.");
    }

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

    if (!response.ok) {
      throw new Error(
        extractErrorMessage(
          result,
          `Gagal mengirim kode OTP. Status: ${response.status}`,
        ),
      );
    }

    return normalizeSuccess(result);
  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);
    throw error;
  }
};

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

    if (!response.ok) {
      throw new Error(
        extractErrorMessage(
          result,
          `Reset password gagal. Status: ${response.status}`,
        ),
      );
    }

    return normalizeSuccess(result);
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);
    throw error;
  }
};
