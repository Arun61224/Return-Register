/**
 * Helper to normalize inventory prefix codes.
 * Supports:
 * - TS / T-S / Tshrt -> Tshrt
 * - TSUT (T-Shirt Suit / T-Suit)
 * - PSUT (Pant Suit)
 * - YKTs / YKT/s (meaning YK Tshrt / YK T-shirt)
 */
export function normalizePrefix(raw: string): string {
  if (!raw) return 'TSUT';
  const clean = raw.trim();
  // Match TS, T-S, T/S, Tshrt, T-shrt, T-shirt (alone as prefix)
  if (/^(ts|t[\s\/\-_]s|tshrt|t[\s\-_]?sh[ir]*t)$/i.test(clean)) {
    return 'Tshrt';
  }
  // Match YKTs, YKT/s, YKT/S, YKTS, YK Tshrt, YK T-shirt
  if (/^ykt[\s\/\-_]?s?$/i.test(clean) || /yk\s*t[\s\-_]?sh[ir]*t/i.test(clean)) {
    return 'YKTs';
  }
  if (/^tsut$/i.test(clean)) return 'TSUT';
  if (/^psut$/i.test(clean)) return 'PSUT';
  return clean;
}
