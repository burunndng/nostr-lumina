/**
 * URL sanitization for untrusted Nostr event data.
 * Prevents XSS via javascript: URLs and other dangerous schemes.
 */

const ALLOWED_PROTOCOLS = ['https:', 'http:', 'mailto:'];

const DANGEROUS_PROTOCOLS = ['javascript:', 'data:', 'blob:'];

export function sanitizeUrl(url: string | null | undefined): string | null {
  if (!url) return null;

  try {
    const parsed = new URL(url);

    // Block dangerous protocols
    if (DANGEROUS_PROTOCOLS.some((p) => parsed.protocol === p)) {
      return null;
    }

    // Only allow http, https, mailto
    if (!ALLOWED_PROTOCOLS.includes(parsed.protocol)) {
      return null;
    }

    return parsed.href;
  } catch {
    // Invalid URL
    return null;
  }
}

/**
 * Sanitize a string for use in CSS contexts.
 * Prevents CSS injection attacks.
 */
export function sanitizeCssString(value: string): string {
  // Remove characters that could inject CSS
  return value
    .replace(/["']/g, '')
    .replace(/[;]/g, '')
    .replace(/[{}]/g, '')
    .replace(/@/g, '')
    .replace(/\\/g, '')
    .trim();
}

/**
 * Sanitize HTML entities for display.
 */
export function sanitizeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Sanitize a Nostr identifier (npub, note, etc.) for display.
 */
export function sanitizeNostrIdentifier(value: string): string {
  // Only allow alphanumeric and special NIP-19 characters
  return value.replace(/[^a-zA-Z0-9]/g, '');
}
