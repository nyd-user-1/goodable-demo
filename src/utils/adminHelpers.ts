// Admin email whitelist
const ADMIN_EMAILS = [
  'ian@mail.com',
  'admin@goodable.com'
];

/**
 * Check if a user has admin privileges based on their email
 */
export const isAdmin = (email: string | undefined): boolean => {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
};

/**
 * Get the list of admin emails (for display purposes)
 */
export const getAdminEmails = (): string[] => {
  return [...ADMIN_EMAILS];
};