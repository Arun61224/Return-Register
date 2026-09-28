/**
 * Helper to normalize inventory prefix codes.
 * Supports:
 * - TSUT (T-Shirt Suit / T-Suit)
 * - PSUT (Pant Suit)
 * - YKTs / YKT/s (meaning YK Tshrt / YK T-shirt)
 */
export function normalizePrefix(raw: string): string {
  if (!raw) return 'TSUT';
  const clean = raw.trim();
  if (/^ykt[\s\/\-_]?s?$/i.test(clean) || /yk\s*t[\s\-_]?sh[ir]*t/i.test(clean)) {
    return 'YKTs';
  }
  if (/^tsut$/i.test(clean)) return 'TSUT';
  if (/^psut$/i.test(clean)) return 'PSUT';
  return clean;
}
