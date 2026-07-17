"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";

interface SpiderCharacterProps {
  onFifthClick: () => void;
}

/** A small, cute (not creepy) spider that swings, occasionally climbs, and hides an easter egg. */
export default function SpiderCharacter({ onFifthClick }: SpiderCharacterProps) {
  const pivotRef = useRef<HTMLDivElement>(null);
  const threadRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const [clicks, setClicks] = useState(0);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pivot = pivotRef.current;
    const thread = threadRef.current;
    if (!pivot || !thread) return;

    const ctx = gsap.context(() => {
      if (prefersReduced) {
        gsap.set(pivot, { rotate: 4 });
        return;
      }

      // Gentle pendulum swing, forever.
      gsap.to(pivot, {
        rotate: 9,
        duration: 3.6,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        transformOrigin: "top center",
      });

      // Occasional climb-up / descend, on its own loose loop.
      const climbTl = gsap.timeline({ repeat: -1, repeatDelay: 5.5 });
      climbTl
        .to(thread, { height: "34%", duration: 1.8, ease: "power2.inOut" })
        .to(thread, { height: "34%", duration: 1.4 })
        .to(thread, { height: "62%", duration: 1.8, ease: "power2.inOut" });
    }, pivot);

    return () => ctx.revert();
  }, []);

  const handleClick = useCallback(() => {
    const body = bodyRef.current;
    if (body) {
      gsap.fromTo(
        body,
        { scale: 1 },
        { scale: 0.82, duration: 0.09, yoyo: true, repeat: 1, ease: "power1.inOut" }
      );
    }
    setClicks((prev) => {
      const next = prev + 1;
      if (next === 5) {
        onFifthClick();
        return 0;
      }
      return next;
    });
  }, [onFifthClick]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleClick();
      }
    },
    [handleClick]
  );

  return (
    <div className="spider-anchor" ref={pivotRef} aria-hidden="false">
      <div className="spider-thread" ref={threadRef} />
      <div
        className="spider-body-wrap"
        ref={bodyRef}
        role="button"
        tabIndex={0}
        aria-label="A small spider hanging from a web. Click it a few times."
        onClick={handleClick}
        onKeyDown={handleKeyDown}
      >
        <svg viewBox="0 0 60 50" width="46" height="38">
          {/* legs */}
          <g stroke="#0c0f1e" strokeWidth="2.4" strokeLinecap="round" fill="none">
            <path d="M18 24 C 8 18, 4 14, 2 8" />
            <path d="M18 26 C 6 26, 2 26, 0 26" />
            <path d="M18 30 C 8 34, 4 38, 2 44" />
            <path d="M42 24 C 52 18, 56 14, 58 8" />
            <path d="M42 26 C 54 26, 58 26, 60 26" />
            <path d="M42 30 C 52 34, 56 38, 58 44" />
          </g>
          {/* body */}
          <ellipse cx="30" cy="27" rx="13" ry="11" fill="#12162c" stroke="#3fd0ff" strokeWidth="1" />
          <circle cx="30" cy="14" r="8" fill="#12162c" stroke="#3fd0ff" strokeWidth="1" />
          {/* eyes */}
          <circle cx="26" cy="13" r="3.2" fill="#eef2ff" />
          <circle cx="34" cy="13" r="3.2" fill="#eef2ff" />
          <circle cx="26.8" cy="13.4" r="1.5" fill="#0c0f1e" />
          <circle cx="34.8" cy="13.4" r="1.5" fill="#0c0f1e" />
          <circle cx="20" cy="16" r="1.6" fill="#eef2ff" opacity="0.8" />
          <circle cx="40" cy="16" r="1.6" fill="#eef2ff" opacity="0.8" />
        </svg>
      </div>
    </div>
  );
}
