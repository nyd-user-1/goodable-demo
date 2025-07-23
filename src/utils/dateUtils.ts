export const formatDate = (dateString: string | null): string => {
  if (!dateString) return "No date";
  try {
    return new Date(dateString).toLocaleDateString();
  } catch {
    return dateString;
  }
};