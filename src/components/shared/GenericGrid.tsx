import { ReactNode } from "react";

interface GenericGridProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  keyExtractor: (item: T, index: number) => string | number;
  className?: string;
  emptyState?: ReactNode;
}

export function GenericGrid<T>({ 
  items, 
  renderItem, 
  keyExtractor,
  className = "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3",
  emptyState
}: GenericGridProps<T>) {
  if (items.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <div className={className}>
      {items.map((item, index) => (
        <div key={keyExtractor(item, index)}>
          {renderItem(item, index)}
        </div>
      ))}
    </div>
  );
}