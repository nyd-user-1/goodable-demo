
import { ReactNode } from "react";

interface ChatContainerProps {
  children: ReactNode;
}

export const ChatContainer = ({ children }: ChatContainerProps) => {
  return (
    <div className="flex-1 flex flex-col gap-4 min-h-0">
      {children}
    </div>
  );
};
