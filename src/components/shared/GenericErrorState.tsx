import { AlertCircle } from "lucide-react";

interface GenericErrorStateProps {
  title?: string;
  description?: string;
  className?: string;
}

export function GenericErrorState({ 
  title = "Error loading data", 
  description = "Please try again later", 
  className = "" 
}: GenericErrorStateProps) {
  return (
    <div className={`rounded-lg border border-red-200 bg-red-50 p-4 ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">{title}</h3>
          <div className="mt-2 text-sm text-red-700">
            <p>{description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}