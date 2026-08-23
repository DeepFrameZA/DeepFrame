import {
  parsePhoneNumber,
  parsePhoneNumberFromString,
  AsYouType,
} from "libphonenumber-js/mobile";

export const PHONE_REGION = "ZA";

export function validateRequired(value, { label = "This field", max = 100 } = {}) {
  const v = (value ?? "").toString().trim();
  if (!v) return { valid: false, error: `${label} is required.` };
  if (v.length > max)
    return { valid: false, error: `${label} is too long (max ${max} characters).` };
  return { valid: true, value: v };
}

export function validateUnitNumber(value) {
  const r = validateRequired(value, { label: "Unit number", max: 20 });
  if (!r.valid) return r;
  if (!/^\d+$/.test(r.value))
    return {
      valid: false,
      error: "Unit number can only contain digits.",
    };
  return r;
}

export function validateSurname(value) {
  const r = validateRequired(value, { label: "Surname", max: 50 });
  if (!r.valid) return r;
  if (!/^[A-Za-z][A-Za-z' -]*$/.test(r.value))
    return {
      valid: false,
      error: "Surname can only contain letters, spaces, hyphens or apostrophes.",
    };
  return r;
}

export function validateName(value, label = "Name") {
  const r = validateRequired(value, { label, max: 50 });
  if (!r.valid) return r;
  if (!/^[A-Za-z0-9][A-Za-z0-9 '.-]*$/.test(r.value))
    return {
      valid: false,
      error: `${label} can only contain letters, numbers, spaces, hyphens or periods.`,
    };
  return r;
}

export function validateNotes(value) {
  const v = (value ?? "").toString();
  if (v.length > 2000)
    return { valid: false, error: "Notes are too long (max 2000 characters)." };
  return { valid: true, value: v };
}

export function validatePhone(value, region = PHONE_REGION) {
  const v = (value ?? "").toString().trim();
  if (!v) return { valid: false, error: "Contact number is required." };
  try {
    const parsed = v.startsWith("+")
      ? parsePhoneNumberFromString(v)
      : parsePhoneNumber(v, region);
    if (!parsed || !parsed.isValid())
      return {
        valid: false,
        error: "Enter a valid phone number with country code, e.g. +27 82 123 4567.",
      };
    return { valid: true, value: parsed.number };
  } catch {
    return {
      valid: false,
      error: "Enter a valid phone number with country code, e.g. +27 82 123 4567.",
    };
  }
}

export function validateDimension(value, label = "Value") {
  const v = (value ?? "").toString().trim();
  if (!v) return { valid: false, error: `${label} is required.` };
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0)
    return { valid: false, error: `${label} must be a positive number.` };
  if (n > 100000) return { valid: false, error: `${label} is too large.` };
  return { valid: true, value: n };
}

export function validateEmail(value) {
  const v = (value ?? "").toString().trim();
  if (!v) return { valid: false, error: "Email is required." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))
    return { valid: false, error: "Enter a valid email address." };
  return { valid: true, value: v };
}

export function validatePassword(value, min = 8) {
  const v = (value ?? "").toString();
  if (!v) return { valid: false, error: "Password is required." };
  if (v.length < min)
    return { valid: false, error: `Password must be at least ${min} characters.` };
  return { valid: true, value: v };
}

export function formatPhoneInput(value, region = PHONE_REGION) {
  return new AsYouType(region).input(value ?? "");
}

export function formatPhoneDisplay(value, region = PHONE_REGION) {
  try {
    const p = value?.startsWith("+")
      ? parsePhoneNumberFromString(value)
      : parsePhoneNumber(value, region);
    if (p) return p.formatNational();
  } catch {
    /* fall through */
  }
  return value || "Contact Number";
}
