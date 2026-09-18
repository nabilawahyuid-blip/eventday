import { apiFetch } from "./api";

// ==========================================
// GET PROFILE EO
// ==========================================

export const getOrganizerProfile = async () => {
  return apiFetch("/api/organizer/profile");
};

// ==========================================
// UPDATE PROFILE EO
// ==========================================

export const updateOrganizerProfile = async (data) => {
  return apiFetch("/api/organizer/profile", {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

// ==========================================
// UPLOAD AVATAR
// ==========================================

export const uploadOrganizerAvatar = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  return apiFetch("/api/organizer/profile/avatar", {
    method: "POST",
    body: formData,
  });
};

// ==========================================
// UPLOAD PORTFOLIO
// ==========================================

export const uploadOrganizerPortfolio = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  return apiFetch(
    "/api/organizer/profile/upload-portfolio",
    {
      method: "POST",
      body: formData,
    }
  );
};

// ==========================================
// UPLOAD AKTA
// ==========================================

export const uploadOrganizerDeed = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  return apiFetch(
    "/api/organizer/profile/upload-deed",
    {
      method: "POST",
      body: formData,
    }
  );
};

// ==========================================
// GET DOKUMEN PROFILE
// ==========================================

export const getOrganizerProfileDocuments =
  async () => {
    return apiFetch(
      "/api/organizer/profile/document"
    );
  };

// ==========================================
// CHANGE PASSWORD
// ==========================================

export const changeOrganizerPassword = async ({
  oldPassword,
  newPassword,
}) => {
  return apiFetch(
    "/api/organizer/auth/change-password",
    {
      method: "POST",
      body: JSON.stringify({
        oldPassword,
        newPassword,
      }),
    }
  );
};