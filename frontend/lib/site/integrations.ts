const GTM_ID_PATTERN = /^GTM-[A-Z0-9]+$/i;
const TAWK_TO_ID_PATTERN = /^[a-f0-9]{20,32}\/[a-f0-9]{1,32}$/i;

export function sanitizeGtmId(value: string | null | undefined): string | null {
  const trimmed = (value ?? "").trim();
  if (!trimmed || !GTM_ID_PATTERN.test(trimmed)) {
    return null;
  }

  return trimmed.toUpperCase();
}

export function sanitizeTawkToId(value: string | null | undefined): string | null {
  const trimmed = (value ?? "").trim();
  if (!trimmed || !TAWK_TO_ID_PATTERN.test(trimmed)) {
    return null;
  }

  return trimmed.toLowerCase();
}

export function isValidGtmId(value: string): boolean {
  return sanitizeGtmId(value) !== null;
}

export function isValidTawkToId(value: string): boolean {
  return sanitizeTawkToId(value) !== null;
}
