// authService.js — pakai Vite proxy (/api/...) → same-origin → cookie HttpOnly otomatis
const getHeaders = () => ({
  "Content-Type": "application/json",
  Accept: "application/json",
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

const authFetch = async (path, options = {}) => {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  const response = await fetch(`/api${cleanPath}`, {
    method: options.method || "POST",
    credentials: "include",
    headers: getHeaders(),
    body: options.body,
  });

  const result = await getResponseData(response);

  if (!response.ok) {
    throw new Error(
      extractErrorMessage(result, `Request gagal. Status: ${response.status}`),
    );
  }

  return normalizeSuccess(result);
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

    return authFetch("/auth/register", {
      method: "POST",
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

    return authFetch("/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({
        email,
        otpCode,
      }),
    });
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

    return authFetch("/auth/resend-otp", {
      method: "POST",
      body: JSON.stringify({
        email,
      }),
    });
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

    return authFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
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

    return authFetch("/auth/google", {
      method: "POST",
      body: JSON.stringify({
        idToken: data.idToken,
      }),
    });
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

    return authFetch("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({
        email,
      }),
    });
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

    return authFetch("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({
        email,
        code,
        newPassword,
      }),
    });
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);
    throw error;
  }
};
