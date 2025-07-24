import { cn } from "@/lib/utils";

interface ShineBorderProps {
  className?: string;
  shineColor?: string | string[];
  borderRadius?: number;
  borderWidth?: number;
  duration?: number;
  children?: React.ReactNode;
}

export function ShineBorder({
  className,
  shineColor = "#FE8FB5",
  borderRadius = 8,
  borderWidth = 1,
  duration = 14,
  children,
}: ShineBorderProps) {
  return (
    <div
      className={cn(
        "relative w-full",
        className
      )}
    >
      {/* Animated border */}
      <div
        className="absolute inset-0 rounded-2xl"
        style={{
          padding: borderWidth,
          background: `linear-gradient(90deg, ${
            Array.isArray(shineColor) ? shineColor.join(", ") : shineColor
          })`,
          backgroundSize: "200% 100%",
          animation: `shine ${duration}s linear infinite`,
          borderRadius: borderRadius,
        }}
      />
      
      {/* Background mask to create border effect */}
      <div 
        className="absolute inset-0 bg-background"
        style={{
          margin: borderWidth,
          borderRadius: borderRadius - borderWidth,
        }}
      />
      
      {/* Content */}
      <div className="relative">{children}</div>

      <style jsx>{`
        @keyframes shine {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
    </div>
  );
}