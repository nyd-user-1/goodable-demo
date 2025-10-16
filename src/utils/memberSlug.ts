/**
 * Member Slug Utilities
 * Convert member names to URL-friendly slugs and vice versa
 */

import { Tables } from "@/integrations/supabase/types";

type Member = Tables<"People">;

/**
 * Generate a URL-friendly slug from a member's name
 * Filters out middle initials (single letters) for consistency
 * Example: "Donna A. Lupardo" → "donna-lupardo"
 * Example: "Alex Bores" → "alex-bores"
 */
export function generateMemberSlug(member: Member): string {
  const name = member.name || `${member.first_name} ${member.last_name}`.trim();

  // Split name into parts and filter out single-letter parts (middle initials)
  const nameParts = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .split(/\s+/) // Split on whitespace
    .filter(part => part.length > 1); // Remove single-letter parts (middle initials)

  // Join with hyphens
  return nameParts
    .join('-')
    .replace(/-+/g, '-')           // Replace multiple hyphens with single
    .replace(/^-|-$/g, '');        // Remove leading/trailing hyphens
}

/**
 * Convert a slug back to a searchable name pattern
 * Example: "alex-bores" → "alex bores" for ILIKE matching
 */
export function slugToNamePattern(slug: string): string {
  return slug.replace(/-/g, ' ');
}
