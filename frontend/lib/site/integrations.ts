const GTM_ID_PATTERN = /^GTM-[A-Z0-9]+$/i;

export function sanitizeGtmId(value: string | null | undefined): string | null {
  const trimmed = (value ?? "").trim();
  if (!trimmed || !GTM_ID_PATTERN.test(trimmed)) {
    return null;
  }

  return trimmed.toUpperCase();
}

/** Normalize Tawk ID: extract from embed URL when pasted, otherwise keep as-is. */
export function sanitizeTawkToId(value: string | null | undefined): string | null {
  const trimmed = (value ?? "").trim();
  if (!trimmed) {
    return null;
  }

  const fromUrl = trimmed.match(
    /(?:embed\.tawk\.to|tawk\.to\/chat)\/([^/\s?#]+)\/([^/\s?#]+)/i
  );
  if (fromUrl) {
    return `${fromUrl[1]}/${fromUrl[2]}`;
  }

  return trimmed.replace(/^\/+|\/+$/g, "");
}

export function isValidGtmId(value: string): boolean {
  return sanitizeGtmId(value) !== null;
}

export function isValidTawkToId(value: string): boolean {
  return sanitizeTawkToId(value) !== null;
}
