/**
 * Automatically classifies age / size into 'months' or 'years'.
 * 
 * Months:
 * 0-3, 3-6, 6-9, 9-12, 6-12, 12-18, 18-24
 * 
 * Years:
 * 1-2, 2-3, 3-4, 4-5, 5-6, 6-7, 7-8, 8-9, 9-10, 11-12, 13-14, 15-16, etc.
 */
export function getAgeUnit(value: string): 'months' | 'years' {
  if (!value) return 'years';
  const clean = value.trim().toLowerCase().replace(/\s+/g, '');

  // Exact months patterns
  const monthsPatterns = new Set([
    '0-3',
    '3-6',
    '6-9',
    '9-12',
    '6-12',
    '12-18',
    '18-24',
    '0/3',
    '3/6',
    '6/9',
    '9/12',
    '6/12',
    '12/18',
    '18/24',
    '0-3m',
    '3-6m',
    '6-9m',
    '9-12m',
    '12-18m',
    '18-24m',
  ]);

  if (monthsPatterns.has(clean)) {
    return 'months';
  }

  // Match month ranges if written with spaces or suffixes
  if (/^(0-3|3-6|6-9|9-12|6-12|12-18|18-24)(m|months?)?$/i.test(clean)) {
    return 'months';
  }

  return 'years';
}
