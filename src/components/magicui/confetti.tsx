"use client";

import confetti from "canvas-confetti";
import React, { useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";

export interface ConfettiProps {
  particleCount?: number;
  angle?: number;
  spread?: number;
  startVelocity?: number;
  decay?: number;
  gravity?: number;
  drift?: number;
  flat?: boolean;
  ticks?: number;
  origin?: {
    x?: number;
    y?: number;
  };
  colors?: string[];
  shapes?: ("square" | "circle")[];
  scalar?: number;
  zIndex?: number;
  disableForReducedMotion?: boolean;
}

export interface ConfettiRef {
  fire: (options?: Partial<ConfettiProps>) => void;
}

export const Confetti = React.forwardRef<
  ConfettiRef,
  ConfettiProps & React.HTMLAttributes<HTMLCanvasElement>
>(
  (
    {
      particleCount = 50,
      angle = 90,
      spread = 45,
      startVelocity = 45,
      decay = 0.9,
      gravity = 1,
      drift = 0,
      flat = false,
      ticks = 200,
      origin = { x: 0.5, y: 0.5 },
      colors = ["#26ccff", "#a25afd", "#ff5e7e", "#88f27a", "#fce838"],
      shapes = ["square", "circle"],
      scalar = 1,
      zIndex = 100,
      disableForReducedMotion = true,
      className,
      ...props
    },
    ref
  ) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const fire = useCallback((options: Partial<ConfettiProps> = {}) => {
      if (disableForReducedMotion && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
      }

      const canvas = canvasRef.current;
      if (!canvas) return;

      const myConfetti = confetti.create(canvas, {
        resize: true,
        useWorker: true,
      });

      myConfetti({
        particleCount,
        angle,
        spread,
        startVelocity,
        decay,
        gravity,
        drift,
        flat,
        ticks,
        origin,
        colors,
        shapes,
        scalar,
        zIndex,
        ...options,
      });
    }, [
      particleCount,
      angle,
      spread,
      startVelocity,
      decay,
      gravity,
      drift,
      flat,
      ticks,
      origin,
      colors,
      shapes,
      scalar,
      zIndex,
      disableForReducedMotion,
    ]);

    React.useImperativeHandle(ref, () => ({
      fire,
    }), [fire]);

    return (
      <canvas
        ref={canvasRef}
        className={className}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex,
        }}
        {...props}
      />
    );
  }
);

Confetti.displayName = "Confetti";

export interface ConfettiButtonProps extends React.ComponentProps<typeof Button> {
  options?: ConfettiProps;
  children?: React.ReactNode;
}

export function ConfettiButton({
  options = {},
  children,
  ...props
}: ConfettiButtonProps) {
  const handleClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    confetti({
      particleCount: 50,
      angle: 90,
      spread: 45,
      origin: { x, y },
      ...options,
    });

    if (props.onClick) {
      props.onClick(event);
    }
  }, [options, props.onClick]);

  return (
    <Button {...props} onClick={handleClick}>
      {children}
    </Button>
  );
}