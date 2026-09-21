// src/services/api.js

// ==========================================
// API CONFIG
// ==========================================

// URL backend dari .env
const API_URL = (import.meta.env.VITE_NGROK_URL || "").replace(/\/$/, "");

// ==========================================
// HEADERS
// ==========================================

const getHeaders = () => {
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  // Ambil JWT dari localStorage
  const token = localStorage.getItem("token");

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
};

// ==========================================
// PARSE RESPONSE
// ==========================================

const getResponseData = async (response) => {
  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

// ==========================================
// ERROR MESSAGE
// ==========================================

const extractErrorMessage = (result, fallback) => {
  if (!result) {
    return fallback;
  }

  if (typeof result === "string") {
    return result;
  }

  return (
    result.message ||
    result.error ||
    (result.data && typeof result.data === "object"
      ? result.data.msg || result.data.message || result.data.error
      : null) ||
    fallback
  );
};

// ==========================================
// QUERY STRING
// ==========================================

export const toQueryString = (params = {}) => {
  const query = new URLSearchParams(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== null && value !== "",
    ),
  ).toString();

  return query ? `?${query}` : "";
};

// ==========================================
// BUILD URL
// ==========================================

const buildUrl = (path, raw = false) => {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  // RAW REQUEST
  //
  // Kalau raw: true, langsung menggunakan
  // URL backend/ngrok.
  if (raw) {
    return `${API_URL}${cleanPath}`;
  }

  // DEFAULT → VITE PROXY
  //
  // Browser request:
  // localhost:5173/api/...
  //
  // Vite proxy meneruskannya ke backend.
  return cleanPath;
};

// ==========================================
// MAIN API FETCH
// ==========================================

export const apiFetch = async (path, options = {}) => {
  // ========================================
  // URL
  // ========================================

  const url = buildUrl(path, options.raw === true);

  console.log(`[API] ${options.method || "GET"} ${url}`);

  // ========================================
  // FORMDATA CHECK
  // ========================================

  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData;

  // ========================================
  // HEADERS
  // ========================================

  const headers = {
    ...(isFormData
      ? {
          // Jangan set Content-Type secara manual
          // untuk FormData.
          Accept: "application/json",
        }
      : getHeaders()),

    // Header tambahan dari service
    ...(options.headers || {}),
  };

  // Untuk FormData, browser yang menentukan
  // multipart/form-data + boundary.
  if (isFormData) {
    delete headers["Content-Type"];
    delete headers["content-type"];
  }

  // ========================================
  // FETCH
  // ========================================

  const response = await fetch(url, {
    method: options.method || "GET",

    // Support HttpOnly Cookie
    credentials: "include",

    headers,

    body: options.body,
  });

  // ========================================
  // RESPONSE
  // ========================================

  const result = await getResponseData(response);

  // ========================================
  // ERROR HANDLING
  // ========================================

  if (!response.ok) {
    const error = new Error(
      extractErrorMessage(result, `Request gagal (${response.status})`),
    );

    error.status = response.status;
    error.data = result;

    throw error;
  }

  // ========================================
  // RETURN
  // ========================================

  return result;
};
