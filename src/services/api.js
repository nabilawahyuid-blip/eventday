// src/services/api.js

const RAW_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  (typeof process !== "undefined" && process.env?.VITE_API_URL) ||
  "https://90bc-2400-9800-25a-64b-45cc-9a26-5944-a73.ngrok-free.app/api/v1";

const API_BASE = RAW_URL.replace(/\/auth\/?$/, "").replace(/\/+$/, "");

// Helper untuk mengambil token dari localStorage atau Cookie
const getToken = () => {
  // 1. Cek dari localStorage (tempat umum untuk menyimpan access_token)
  const token =
    localStorage.getItem("access_token") || localStorage.getItem("token");
  if (token) return token;

  // 2. Jika disimpan dalam bentuk JSON user di localStorage
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.token || user.accessToken) return user.token || user.accessToken;
  } catch (e) {
    // abaikan jika parse gagal
  }

  return null;
};

const getHeaders = () => {
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    "ngrok-skip-browser-warning": "true",
  };

  const token = getToken();
  if (token) {
    // Tambahkan Bearer Token jika token ditemukan
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
};

const getResponseData = async (response) => {
  const text = await response.text();
  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
};

const extractErrorMessage = (result, fallback) => {
  if (!result) return fallback;
  if (typeof result === "string") return result;

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

export const toQueryString = (params = {}) => {
  const query = new URLSearchParams(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== null && value !== "",
    ),
  ).toString();

  return query ? `?${query}` : "";
};

export const apiFetch = async (path, options = {}) => {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  const response = await fetch(`${API_BASE}${cleanPath}`, {
    method: options.method || "GET",
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

  return result;
};
