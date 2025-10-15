/**
 * Member Slug Utilities
 * Convert member names to URL-friendly slugs and vice versa
 */

import { Tables } from "@/integrations/supabase/types";

type Member = Tables<"People">;

/**
 * Generate a URL-friendly slug from a member's name
 * Example: "Alex Bores" → "alex-bores"
 */
export function generateMemberSlug(member: Member): string {
  const name = member.name || `${member.first_name} ${member.last_name}`.trim();
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')          // Replace spaces with hyphens
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
