import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface WordRotateProps {
  words: string[];
  className?: string;
  duration?: number;
  pauseDuration?: number;
  animationStyle?: "fade" | "slide";
  loop?: boolean;
}

export function WordRotate({
  words,
  className,
  duration = 1200,
  pauseDuration = 500,
  animationStyle = "fade",
  loop = true,
}: WordRotateProps) {
  const [index, setIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const totalCycle = duration + pauseDuration;

    const interval = setInterval(() => {
      setIsVisible(false);

      setTimeout(() => {
        setIndex((prev) => {
          const next = prev + 1;
          if (next >= words.length) {
            return loop ? 0 : prev;
          }
          return next;
        });
        setIsVisible(true);
      }, 300);
    }, totalCycle);

    return () => clearInterval(interval);
  }, [words.length, duration, pauseDuration, loop]);

  return (
    <span
      className={cn(
        "inline-block transition-opacity duration-300",
        isVisible ? "opacity-100" : "opacity-0",
        className
      )}
    >
      {words[index]}
    </span>
  );
}
