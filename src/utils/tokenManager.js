// src/utils/tokenManager.js
// Manajemen token Eventday untuk cross-site (localhost ↔ ngrok)
// Token disimpan di localStorage dengan key ber-namespace

const TOKEN_KEY = "eventday_token";
const TOKEN_LEGACY_KEY = "token";

export const getToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_LEGACY_KEY);
  } catch {
    return null;
  }
};

export const setToken = (token) => {
  try {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(TOKEN_LEGACY_KEY, token); // compat lama
    return true;
  } catch {
    return false;
  }
};

export const clearToken = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_LEGACY_KEY);
  } catch {
    // ignore
  }
};

export const hasToken = () => !!getToken();

// Decode payload JWT (tanpa verifikasi signature) — cek exp
export const decodeToken = (token) => {
  try {
    const parts = String(token).split(".");
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
};

export const isTokenExpired = (token) => {
  const payload = decodeToken(token);
  if (!payload || !payload.exp) return true;
  return Date.now() >= payload.exp * 1000;
};

export const isTokenValid = () => {
  const token = getToken();
  return token && !isTokenExpired(token);
};

// Hapus token asing (Django SimpleJWT dll) yang nyangkut di localStorage
export const purgeForeignTokens = () => {
  const foreignKeys = ["access_token", "refresh_token"];
  foreignKeys.forEach((key) => {
    try {
      const value = localStorage.getItem(key);
      if (value) {
        const payload = decodeToken(value);
        // Django SimpleJWT punya claim "token_type"
        if (payload?.token_type) {
          localStorage.removeItem(key);
        }
      }
    } catch {
      // ignore
    }
  });
};

// Jalankan pembersihan saat load
purgeForeignTokens();