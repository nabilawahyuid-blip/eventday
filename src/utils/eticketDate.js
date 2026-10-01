/**
 * Date formatting for the printable ticket.
 *
 * The backend hands back values like "2026-09-30T16:16:00+07:00" (or a plain
 * "2026-09-30 16:16 WIB"), which render as raw text on the card. These helpers
 * turn them into a readable concert-pass line and drop the ISO "T".
 */

/** WIB / WITA / WIT, or null when the source carries no offset at all. */
function zoneLabel(raw) {
  const text = String(raw || "");

  const named = /\b(WIB|WITA|WIT)\b/i.exec(text);
  if (named) return named[1].toUpperCase();

  const offset = /([+-])(\d{2}):?(\d{2})\s*$/.exec(text.trim());
  if (offset) {
    const sign = offset[1] === "-" ? -1 : 1;
    const minutes = sign * (Number(offset[2]) * 60 + Number(offset[3]));
    if (minutes === 480) return "WITA";
    if (minutes === 540) return "WIT";
  }

  return null;
}

/** Strip separators that break Date parsing, keeping the offset intact. */
function toParsable(raw) {
  return String(raw)
    .trim()
    .replace(/\s*(WIB|WITA|WIT)\s*$/i, "")
    .replace(/^(\d{4}-\d{2}-\d{2})\s+/, "$1T")
    .replace(" ", "T");
}

/**
 * "30 September 2026 · 16:16 WIB"
 *
 * When no offset is present the value is assumed to already be WIB, which
 * matches how the backend stores Indonesian event times.
 */
export function formatEventWhen(raw) {
  if (raw === null || raw === undefined) return "-";

  const text = String(raw).trim();
  if (text === "" || text === "-") return "-";

  const zone = zoneLabel(text);
  const parsed = new Date(toParsable(text));

  if (Number.isNaN(parsed.getTime())) {
    // Unparseable: at least drop the ISO "T" so it reads like a date.
    return text.replace("T", " ");
  }

  const datePart = parsed.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const timePart = parsed.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${datePart} · ${timePart} ${zone || "WIB"}`;
}

/** "30 September 2026" */
export function formatEventDay(raw) {
  if (raw === null || raw === undefined) return "-";

  const text = String(raw).trim();
  if (text === "" || text === "-") return "-";

  const parsed = new Date(toParsable(text));
  if (Number.isNaN(parsed.getTime())) return text.replace("T", " ");

  return parsed.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
