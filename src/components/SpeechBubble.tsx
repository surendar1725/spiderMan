"use client";

import { type ReactNode } from "react";

interface SpeechBubbleProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/** A reusable comic-style speech bubble, used for celebration copy and easter eggs. */
export default function SpeechBubble({ children, className = "", style }: SpeechBubbleProps) {
  return (
    <div className={`comic-bubble floating-bubble ${className}`} style={style} role="status">
      {children}
    </div>
  );
}
