/**
 * Committee Slug Utilities
 * Convert committee names to URL-friendly slugs and vice versa
 * Format: {chamber}-{committee-name} (e.g., "assembly-aging", "senate-banks")
 */

import { Tables } from "@/integrations/supabase/types";

type Committee = Tables<"Committees">;

/**
 * Generate a URL-friendly slug from a committee
 * Example: { chamber: "Assembly", committee_name: "Aging" } → "assembly-aging"
 */
export function generateCommitteeSlug(committee: Committee): string {
  const chamber = committee.chamber?.toLowerCase().trim() || '';
  const name = committee.committee_name?.toLowerCase().trim() || '';

  // Create: "assembly-aging" or "senate-banks"
  return `${chamber}-${name}`
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')          // Replace spaces with hyphens
    .replace(/-+/g, '-')           // Replace multiple hyphens with single
    .replace(/^-|-$/g, '');        // Remove leading/trailing hyphens
}

/**
 * Parse a slug to extract chamber and committee name
 * Example: "assembly-aging" → { chamber: "assembly", name: "aging" }
 */
export function parseCommitteeSlug(slug: string): { chamber: string; name: string } {
  const parts = slug.split('-');

  // First part is chamber (assembly or senate)
  const chamber = parts[0] || '';

  // Rest is committee name (e.g., "aging" or "banks-and-finance")
  const name = parts.slice(1).join(' ');

  return { chamber, name };
}
