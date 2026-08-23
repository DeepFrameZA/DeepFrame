// Centralized, leakage-safe error/success messaging for toasts.
//
// Design: in PRODUCTION we never surface raw Supabase text (message/hint/details
// can leak schema). We map the stable error `code` to a friendly message. In
// DEVELOPMENT we show the raw message + hint for debugging. `import.meta.env.DEV`
// is true under `vite` and false in `vite build`, so going public later requires
// no further changes — the app self-sanitizes.

const ERROR_MESSAGES = {
  "23505": "That value already exists. Try a different one.",
  "23503": "This is linked to other records and can't be changed right now.",
  "23502": "A required field is missing.",
  "42501": "You don't have permission to do that.",
  "PGRST204": "No results found.",
  "PGRST301": "This action is no longer valid. Refresh and try again.",
  invalid_credentials: "Email or password is incorrect.",
  email_not_confirmed: "Please verify your email before signing in.",
  user_not_found: "No account found with that email.",
  weak_password: "Password is too weak — use at least 8 characters.",
};

// Branch on column name only (never displayed) to give 23505 a specific message.
const UNIQUE_FIELD_MESSAGES = {
  unit_number: "A house with that unit number already exists.",
  client_contact_number: "That contact number is already used by another house.",
};

export function getErrorMessage(err, fallback = "Something went wrong. Please try again.") {
  const code = err?.code ?? err?.status;
  if (code === "23505") {
    const hay = `${err?.message ?? ""} ${err?.details ?? ""}`;
    for (const [col, msg] of Object.entries(UNIQUE_FIELD_MESSAGES)) {
      if (hay.includes(col)) return msg;
    }
  }
  if (code != null && ERROR_MESSAGES[code]) return ERROR_MESSAGES[code];
  if (code != null) return `${fallback} (ref: ${code})`;
  return fallback;
}

// Dev-only: raw Supabase message + hint. Returns null in production builds.
export function getDevErrorMessage(err) {
  if (!import.meta.env.DEV) return null;
  return [err?.message, err?.hint].filter(Boolean).join(" — ") || null;
}

export const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
