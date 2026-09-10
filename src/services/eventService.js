import { getApiBaseUrl } from "./authService";

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

const extractErrorMessage = (result, fallback) => {
  if (!result) {
    return fallback;
  }

  if (typeof result === "string") {
    return result;
  }

  return (
    result.msg ||
    result.message ||
    result.error ||
    fallback
  );
};

const normalizePaginated = (json) => {
  if (
    json &&
    json.data &&
    Array.isArray(json.data.content)
  ) {
    return json.data;
  }

  return json?.data || json;
};

export const getEvents = async (params = {}) => {
  const base = getApiBaseUrl();

  const clean = {};

  Object.entries(params).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      value !== "" &&
      value !== "ALL"
    ) {
      clean[key] = value;
    }
  });

  const queryString = new URLSearchParams(clean).toString();

  const url = `${base}/events${
    queryString ? `?${queryString}` : ""
  }`;

  console.log("GET EVENTS URL:", url);

  const response = await fetch(url, {
    method: "GET",
    headers: getHeaders(),
    credentials: "include",
  });

  const json = await getResponseData(response);

  console.log("GET EVENTS STATUS:", response.status);
  console.log("GET EVENTS RESPONSE:", json);

  if (!response.ok) {
    throw new Error(
      extractErrorMessage(
        json,
        `Gagal ambil events: ${response.status}`
      )
    );
  }

  return json;
};

export const getFeaturedEvents = async () => {
  const base = getApiBaseUrl();

  const url = `${base}/events/featured`;

  console.log("GET FEATURED EVENTS URL:", url);

  const response = await fetch(url, {
    method: "GET",
    headers: getHeaders(),
    credentials: "include",
  });

  const json = await getResponseData(response);

  console.log(
    "GET FEATURED EVENTS STATUS:",
    response.status
  );

  console.log(
    "GET FEATURED EVENTS RESPONSE:",
    json
  );

  if (!response.ok) {
    throw new Error(
      extractErrorMessage(
        json,
        `Gagal ambil featured: ${response.status}`
      )
    );
  }

  return json;
};

export const getEventById = async (id) => {
  const base = getApiBaseUrl();

  const url = `${base}/events/${id}`;

  console.log("GET EVENT BY ID URL:", url);

  const response = await fetch(url, {
    method: "GET",
    headers: getHeaders(),
    credentials: "include",
  });

  const json = await getResponseData(response);

  console.log(
    "GET EVENT BY ID STATUS:",
    response.status
  );

  console.log(
    "GET EVENT BY ID RESPONSE:",
    json
  );

  if (!response.ok) {
    throw new Error(
      extractErrorMessage(
        json,
        `Event tidak ditemukan: ${response.status}`
      )
    );
  }

  return json;
};

export { normalizePaginated };