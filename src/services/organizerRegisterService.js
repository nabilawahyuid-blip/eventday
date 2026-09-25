// src/services/organizerRegisterService.js

import { apiFetch } from "./api";

// ==========================================
// REGISTER EVENT ORGANIZER
// POST /api/organizer/register
// ==========================================
export const registerOrganizer = async (data) => {
  const formData = new FormData();

  formData.append(
    "organizer_name",
    String(data.organizer_name || "").trim()
  );

  if (data.npwp_number) {
    formData.append(
      "npwp_number",
      String(data.npwp_number).trim()
    );
  }

  formData.append(
    "bank_name",
    String(data.bank_name || "").trim()
  );

  formData.append(
    "bank_account_number",
    String(data.bank_account_number || "").trim()
  );

  return apiFetch("/api/organizer/register", {
    method: "POST",
    body: formData,
  });
};

// ==========================================
// UPLOAD DOKUMEN REGISTER EO
// POST /api/organizer/documents/upload
// ==========================================
export const uploadOrganizerDocument = async (file, documentType) => {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("documentType", documentType);

  // Ambil token dari localStorage secara manual agar lolos otentikasi
  const token = localStorage.getItem("token");

  return apiFetch("/api/organizer/documents/upload", {
    method: "POST",
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: formData,
  });
};