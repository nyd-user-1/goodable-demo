/**
 * School funding context builder.
 *
 * Formats SchoolFundingDetails (stored in sessionStorage by the
 * SchoolFunding page) into a data-context string suitable for
 * `composeSystemPrompt({ dataContext })`.
 */

export interface SchoolFundingCategory {
  name: string;
  baseYear: string;
  schoolYear: string;
  change: string;
  percentChange: string;
}

export interface SchoolFundingDetails {
  district: string;
  county: string | null;
  budgetYear: string;
  totalBaseYear: number;
  totalSchoolYear: number;
  totalChange: number;
  percentChange: number;
  categories: SchoolFundingCategory[];
}

/**
 * Read and consume the school funding data from sessionStorage.
 * Returns `undefined` if nothing is stored.
 */
export function consumeSchoolFundingData(): SchoolFundingDetails | undefined {
  try {
    const stored = sessionStorage.getItem('schoolFundingDetails');
    if (!stored) return undefined;
    sessionStorage.removeItem('schoolFundingDetails');
    return JSON.parse(stored) as SchoolFundingDetails;
  } catch {
    return undefined;
  }
}

/**
 * Build a data-context string from school funding details.
 */
export function buildSchoolFundingContext(
  data: SchoolFundingDetails,
): string {
  const lines: string[] = [
    `SCHOOL FUNDING DATA — ${data.district}`,
    `County: ${data.county || 'N/A'}`,
    `Budget Year: ${data.budgetYear}`,
    '',
    `Total Base Year:   $${data.totalBaseYear.toLocaleString()}`,
    `Total School Year: $${data.totalSchoolYear.toLocaleString()}`,
    `Total Change:      $${data.totalChange.toLocaleString()} (${data.percentChange >= 0 ? '+' : ''}${data.percentChange.toFixed(1)}%)`,
    '',
    'Category Breakdown:',
  ];

  for (const cat of data.categories) {
    lines.push(
      `  - ${cat.name}: ${cat.baseYear} → ${cat.schoolYear} (${cat.change}, ${cat.percentChange})`,
    );
  }

  return lines.join('\n');
}
