// src/services/api.js

const API_BASE = (import.meta.env.VITE_API_URL || "")
  .replace(/\/auth\/?$/, "")
  .replace(/\/+$/, "");

// Helper untuk mengambil token dari localStorage
const getToken = () => {
  // 1. Cek access_token atau token
  const token =
    localStorage.getItem("access_token") ||
    localStorage.getItem("token");

  if (token) return token;

  // 2. Jika token disimpan dalam JSON user di localStorage
  try {
    const user = JSON.parse(
      localStorage.getItem("user") || "{}"
    );

    if (user.token || user.accessToken) {
      return user.token || user.accessToken;
    }
  } catch (e) {
    // Abaikan jika JSON gagal di-parse
  }

  return null;
};

// Helper untuk membuat headers
const getHeaders = () => {
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    "ngrok-skip-browser-warning": "true",
  };

  const token = getToken();

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
};

// Helper untuk mengambil response
const getResponseData = async (response) => {
  const text = await response.text();

  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return {
      message: text,
    };
  }
};

// Helper untuk mengambil pesan error
const extractErrorMessage = (result, fallback) => {
  if (!result) return fallback;

  if (typeof result === "string") {
    return result;
  }

  return (
    result.msg ||
    result.message ||
    result.error ||
    (
      result.data &&
      typeof result.data === "object"
        ? result.data.msg || result.data.message
        : null
    ) ||
    fallback
  );
};

// Membuat query string
export const toQueryString = (params = {}) => {
  const query = new URLSearchParams(
    Object.entries(params).filter(
      ([, value]) =>
        value !== undefined &&
        value !== null &&
        value !== ""
    )
  ).toString();

  return query ? `?${query}` : "";
};

// Fetch API
export const apiFetch = async (path, options = {}) => {
  const cleanPath = path.startsWith("/")
    ? path
    : `/${path}`;

  const response = await fetch(
    `${API_BASE}${cleanPath}`,
    {
      method: options.method || "GET",
      credentials: "include",
      headers: getHeaders(),
      body: options.body,
    }
  );

  const result = await getResponseData(response);

  if (!response.ok) {
    throw new Error(
      extractErrorMessage(
        result,
        `Request gagal. Status: ${response.status}`
      )
    );
  }

  return result;
};