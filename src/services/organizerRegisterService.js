import { apiFetch } from "./api";

// ==========================================
// REGISTER EVENT ORGANIZER
// POST /api/organizer/register
// ==========================================
export const registerOrganizer = async (data) => {
  return apiFetch("/api/organizer/register", {
    method: "POST",
    body: JSON.stringify({
      organizer_name: data.organizer_name,
      npwp_number: data.npwp_number,
      bank_name: data.bank_name,
      bank_account_number: data.bank_account_number,
    }),
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

  return apiFetch("/api/organizer/documents/upload", {
    method: "POST",
    body: formData,
  });
};