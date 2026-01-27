"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  base64?: string;
  mediaType?: string;
}

export function Image({ base64, mediaType, src, alt, className, ...props }: ImageProps) {
  const imageSrc = base64 && mediaType
    ? `data:${mediaType};base64,${base64}`
    : src;

  return (
    <img
      src={imageSrc}
      alt={alt || ""}
      className={cn("rounded-md object-cover", className)}
      {...props}
    />
  );
}
