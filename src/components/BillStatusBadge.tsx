import { Badge } from "@/components/ui/badge";

interface BillStatusBadgeProps {
  status: number;
  statusDesc?: string;
}

export const BillStatusBadge = ({ status, statusDesc }: BillStatusBadgeProps) => {
  const getStatusVariant = (status: number) => {
    switch (status) {
      case 1:
        return "secondary"; // Introduced
      case 2:
        return "default"; // Committee
      case 3:
        return "outline"; // Floor
      case 4:
        return "default"; // Passed
      case 5:
        return "destructive"; // Failed/Defeated
      case 6:
        return "secondary"; // Signed/Enacted
      default:
        return "outline";
    }
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 1:
        return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800"; // Introduced - Emerald
      case 2:
        return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800"; // Committee - Amber
      case 3:
        return "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800"; // Floor - Sky
      case 4:
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800"; // Passed - Blue
      case 5:
        return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800"; // Failed - Rose
      case 6:
        return "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950 dark:text-violet-300 dark:border-violet-800"; // Signed - Violet
      default:
        return "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-950 dark:text-slate-300 dark:border-slate-800"; // Default - Slate
    }
  };

  return (
    <Badge 
      variant={getStatusVariant(status)}
      className={`${getStatusColor(status)} font-medium`}
    >
      {statusDesc || `Status ${status}`}
    </Badge>
  );
};