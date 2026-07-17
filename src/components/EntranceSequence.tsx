"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

interface EntranceSequenceProps {
  onComplete: () => void;
}

/** Black screen -> THWIP -> web shoots down -> title swings in -> fades to reveal the scene. */
export default function EntranceSequence({ onComplete }: EntranceSequenceProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const thwipRef = useRef<HTMLDivElement>(null);
  const webPathRef = useRef<SVGPathElement>(null);
  const titlePivotRef = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const overlay = overlayRef.current;
    const thwip = thwipRef.current;
    const webPath = webPathRef.current;
    const titlePivot = titlePivotRef.current;
    if (!overlay || !thwip || !webPath || !titlePivot) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finish = () => {
      setDone(true);
      onComplete();
    };

    if (prefersReduced) {
      const tl = gsap.timeline({ onComplete: finish });
      tl.to(overlay, { autoAlpha: 0, duration: 0.5, delay: 0.4 });
      return () => {
        tl.kill();
      };
    }

    const length = webPath.getTotalLength();
    gsap.set(webPath, { strokeDasharray: length, strokeDashoffset: length });
    gsap.set(thwip, { opacity: 0, scale: 0.4, rotate: -8 });
    gsap.set(titlePivot, { opacity: 0, rotate: -50, transformOrigin: "top center" });

    const tl = gsap.timeline({ onComplete: finish });

    tl.to(overlay, { autoAlpha: 1, duration: 0.01 })
      .to(thwip, {
        opacity: 1,
        scale: 1,
        rotate: -4,
        duration: 0.35,
        ease: "back.out(3)",
      }, 0.5)
      .to(thwip, { opacity: 0, duration: 0.35, ease: "power1.in" }, "+=0.25")
      .to(webPath, { strokeDashoffset: 0, duration: 0.7, ease: "power2.out" }, "<")
      .to(titlePivot, { opacity: 1, duration: 0.01 }, ">-0.1")
      .to(titlePivot, {
        rotate: 8,
        duration: 0.55,
        ease: "power1.out",
      })
      .to(titlePivot, {
        rotate: -3,
        duration: 0.45,
        ease: "power1.inOut",
      })
      .to(titlePivot, {
        rotate: 0,
        duration: 0.4,
        ease: "elastic.out(1, 0.6)",
      })
      .to({}, { duration: 0.9 })
      .to(overlay, { autoAlpha: 0, duration: 0.7, ease: "power2.inOut" });

    return () => {
      tl.kill();
    };
  }, [onComplete]);

  const handleSkip = () => {
    gsap.killTweensOf([overlayRef.current, thwipRef.current, titlePivotRef.current]);
    setDone(true);
    onComplete();
  };

  if (done) return null;

  return (
    <div className="entrance-overlay" ref={overlayRef} role="presentation">
      <button type="button" className="skip-intro" onClick={handleSkip}>
        Skip intro
      </button>

      <svg className="entrance-web" viewBox="0 0 200 400" aria-hidden="true">
        <path ref={webPathRef} d="M 100 0 L 100 190 L 60 230 M 100 190 L 140 230" />
      </svg>

      <div className="thwip-text" ref={thwipRef} aria-hidden="true">
        THWIP!
      </div>

      <div className="entrance-title-pivot" ref={titlePivotRef}>
        <h1 className="entrance-title">A question swings your way</h1>
      </div>
    </div>
  );
}
