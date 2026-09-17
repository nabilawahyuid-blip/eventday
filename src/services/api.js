// src/services/api.js

const API_URL = import.meta.env.VITE_NGROK_URL;

const getHeaders = () => {
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  const token = localStorage.getItem("token");
  if (token) {
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

// Path sudah include /api/v1/... mis: "/events", "/checkout/initiate"
// Opsi raw: path langsung dikirim tanpa auto-prepend "/api" (untuk endpoint seperti /payments/charge yang base path-nya /api tanpa /v1)
export const apiFetch = async (path, options = {}) => {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const url = options.raw ? cleanPath : `/api${cleanPath}`;

  const response = await fetch(url, {
    method: options.method || "GET",
    credentials: "include",
    headers: getHeaders(),
    body: options.body,
  });

  const result = await getResponseData(response);

  if (!response.ok) {
    const error = new Error(
      extractErrorMessage(
        result,
        `Request gagal. Status: ${response.status}`
      )
    );

    throw error;
  }

  return result;
};