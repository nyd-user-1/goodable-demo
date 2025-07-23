import { LucideIcon } from "lucide-react";

interface GenericEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
}

export function GenericEmptyState({ 
  icon: Icon, 
  title, 
  description, 
  className = "" 
}: GenericEmptyStateProps) {
  return (
    <div className={`text-center py-12 ${className}`}>
      <Icon className="mx-auto h-12 w-12 text-muted-foreground" />
      <h3 className="mt-2 text-sm font-semibold text-foreground">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}