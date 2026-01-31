/**
 * Normalize a bill number to the NYS 5-digit zero-padded convention.
 * e.g. "S256" → "S00256", "a405" → "A00405", "S00256A" → "S00256A"
 */
export function normalizeBillNumber(billNumber: string | null | undefined): string {
  if (!billNumber) return '';
  const match = billNumber.trim().toUpperCase().match(/^([A-Z])(\d+)([A-Z]?)$/);
  if (!match) return billNumber.toUpperCase();
  const [, prefix, digits, suffix] = match;
  return `${prefix}${digits.padStart(5, '0')}${suffix}`;
}
