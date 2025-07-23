export const getChamberFromBillNumber = (billNumber: string | null): string => {
  if (!billNumber) return "Unknown";
  if (billNumber.startsWith("S")) return "Senate";
  if (billNumber.startsWith("A")) return "Assembly";
  return "Unknown";
};

export const formatLastAction = (dateString: string | null): string => {
  if (!dateString) return "No date";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    });
  } catch {
    return "Invalid date";
  }
};

export const getStatusBadgeVariant = (status: string | null) => {
  if (!status) return "secondary";
  const lowercaseStatus = status.toLowerCase();
  if (lowercaseStatus.includes("passed") || lowercaseStatus.includes("signed")) return "default";
  if (lowercaseStatus.includes("committee")) return "outline";
  if (lowercaseStatus.includes("withdrawn") || lowercaseStatus.includes("died")) return "destructive";
  return "secondary";
};