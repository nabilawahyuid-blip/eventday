// src/services/downloadExport.js
// Helper export download — dipisah dari api.js (api.js TIDAK BOLEH diubah).
// Backend admin punya 2 bentuk export:
//  - binary attachment (events/tickets/transactions) → blob
//  - string CSV dibungkus ApiResponse (audit-logs/export/csv)
// Helper ini otomatis mendeteksi keduanya dan memicu download.

const cleanPath = (path) => (path.startsWith("/") ? path : `/${path}`);

const buildQuery = (params = {}) => {
  const query = new URLSearchParams(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== null && value !== "",
    ),
  ).toString();

  return query ? `?${query}` : "";
};

export const downloadFromEndpoint = async (
  path,
  params = {},
  filename = "export.csv",
) => {
  const url = cleanPath(path);
  const token = localStorage.getItem("token");

  const res = await fetch(`${url}${buildQuery(params)}`, {
    credentials: "include",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Export gagal (${res.status})`);
  }

  const contentType = res.headers.get("content-type") || "";
  const rawText = await res.text();
  const isJson =
    contentType.includes("json") || rawText.trim().startsWith("{");

  let content = rawText;
  let saveAs = filename;

  if (isJson) {
    try {
      const parsed = JSON.parse(rawText);
      const data = parsed?.data ?? parsed?.csv ?? parsed;
      content = typeof data === "string" ? data : JSON.stringify(data, null, 2);
      if (typeof data !== "string") saveAs = saveAs.replace(/\.csv$/i, ".json");
    } catch {
      // bukan JSON valid → pakai teks polos apa adanya
    }
  }

  const blob = new Blob(["\ufeff" + content], {
    type: "text/csv;charset=utf-8",
  });

  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = blobUrl;
  a.download = saveAs;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(blobUrl);
};