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
        "relative min-h-[60px] w-full overflow-hidden rounded-lg bg-background",
        className
      )}
      style={{
        borderRadius: borderRadius,
      }}
    >
      {/* Shine border container */}
      <div
        className={cn(
          "absolute inset-0",
          "before:absolute before:inset-0",
          "before:bg-transparent"
        )}
        style={{
          padding: borderWidth,
          background: `linear-gradient(90deg, ${
            Array.isArray(shineColor) ? shineColor.join(", ") : shineColor
          })`,
          backgroundSize: "200% 100%",
          animation: `shine ${duration}s ease-in-out infinite`,
        }}
      >
        <div
          className="h-full w-full rounded-lg bg-background"
          style={{
            borderRadius: borderRadius - borderWidth,
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10">{children}</div>

      <style jsx>{`
        @keyframes shine {
          0% {
            background-position: 0% center;
          }
          50% {
            background-position: 200% center;
          }
          100% {
            background-position: 0% center;
          }
        }
      `}</style>
    </div>
  );
}