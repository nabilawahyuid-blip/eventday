// Satu-satunya sumber kebenaran kategori event.
// Backend Java: com.example.eventday.model.Category — strict valueOf,
// hanya 4 nilai ini yang diterima. Nilai lain ("Musik", "Konser",
// "ENTERTAINMENT", "TECHNOLOGY", ...) → 400 "No enum constant Category.X".
export const VALID_CATEGORIES = [
  "MUSIC_FESTIVAL",
  "CONFERENCE",
  "EXHIBITION",
  "CULINARY",
];

export const CATEGORY_LABELS = {
  MUSIC_FESTIVAL: "Music Festival",
  CONFERENCE: "Conference",
  EXHIBITION: "Exhibition",
  CULINARY: "Culinary",
};

export const isValidCategory = (value) =>
  VALID_CATEGORIES.includes(String(value || "").trim());

// Label tampilan, toleran untuk data lama busuk di DB:
// "Musik" → "Musik", "MUSIC_FESTIVAL" → "Music Festival".
export const categoryLabel = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return "Umum";
  if (CATEGORY_LABELS[raw]) return CATEGORY_LABELS[raw];
  return raw.replace(/_/g, " ");
};

// Normalisasi nilai lama busuk ke enum valid sebelum dikirim ke BE.
// Return null bila tidak bisa dipetakan (panggil validasi di form).
export const normalizeCategoryForBackend = (value) => {
  const raw = String(value || "").trim();
  if (VALID_CATEGORIES.includes(raw)) return raw;
  const upper = raw.toUpperCase().replace(/\s+/g, "_");
  if (VALID_CATEGORIES.includes(upper)) return upper;
  const alias = {
    MUSIK: "MUSIC_FESTIVAL",
    MUSIC: "MUSIC_FESTIVAL",
    FESTIVAL: "MUSIC_FESTIVAL",
    KONSER: "MUSIC_FESTIVAL",
    SEMINAR: "CONFERENCE",
    KONFERENSI: "CONFERENCE",
    PAMERAN: "EXHIBITION",
    KULINER: "CULINARY",
  };
  return alias[upper] || null;
};
