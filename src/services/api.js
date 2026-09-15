// src/services/api.js
// Semua request lewat Vite proxy (/api/...) → same-origin → cookie HttpOnly ikut otomatis

const getHeaders = () => ({
  "Content-Type": "application/json",
  Accept: "application/json",
  // "ngrok-skip-browser-warning" tidak perlu lagi lewat proxy
});

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

// Path sudah include /api/v1/... mis: "/events", "/checkout/initiate"
export const apiFetch = async (path, options = {}) => {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  const response = await fetch(`/api${cleanPath}`, {
    method: options.method || "GET",
    credentials: "include", // Cookie HttpOnly ikut otomatis (same-origin via proxy)
    headers: getHeaders(),
    body: options.body,
  });

  const result = await getResponseData(response);

  if (!response.ok) {
    const error = new Error(
      extractErrorMessage(result, `Request gagal. Status: ${response.status}`),
    );
    throw error;
  }

  return result;
};
