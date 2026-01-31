/**
 * Normalize a bill number by uppercasing and stripping leading zeros.
 * The NYS API returns basePrintNo un-padded (S256, A405, A10049).
 * e.g. "S00256" → "S256", "a405" → "A405", "S00256A" → "S256A"
 */
export function normalizeBillNumber(billNumber: string | null | undefined): string {
  if (!billNumber) return '';
  const match = billNumber.trim().toUpperCase().match(/^([A-Z])(\d+)([A-Z]?)$/);
  if (!match) return billNumber.toUpperCase();
  const [, prefix, digits, suffix] = match;
  return `${prefix}${digits.replace(/^0+/, '') || '0'}${suffix}`;
}
