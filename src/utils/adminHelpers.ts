// Admin email whitelist
const ADMIN_EMAILS = [
  'ian@mail.com',
  'admin@goodable.com'
];

// Allowed user emails (admin + user testing)
const ALLOWED_EMAILS = [
  'ian@mail.com',        // admin
  'steve@mail.com',      // user testing
  'dray@mail.com',       // user testing  
  'admin@goodable.com'   // backup admin
];

/**
 * Check if a user has admin privileges based on their email
 */
export const isAdmin = (email: string | undefined): boolean => {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
};

/**
 * Check if a user is allowed to access the app
 */
export const isAllowedUser = (email: string | undefined): boolean => {
  if (!email) return false;
  return ALLOWED_EMAILS.includes(email.toLowerCase());
};

/**
 * Get the list of admin emails (for display purposes)
 */
export const getAdminEmails = (): string[] => {
  return [...ADMIN_EMAILS];
};

/**
 * Get the list of allowed emails (for display purposes)
 */
export const getAllowedEmails = (): string[] => {
  return [...ALLOWED_EMAILS];
};