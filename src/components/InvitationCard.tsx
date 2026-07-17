"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import DateTheatrePicker from "./DateTheatrePicker";
import { submitRsvp } from "@/lib/rsvp";

type Stage = "question" | "yes" | "no";

interface InvitationCardProps {
  onDecision: (decision: "yes" | "no") => void;
}

const QUESTION_LINES = [
  { text: "One Small Question...", variant: "heading" as const },
  { text: "You remember when we talked about watching Spider-Man?", variant: "body" as const },
  { text: "Hmm so... its awkward but I'm gonna ask anyway", variant: "body" as const },
  { text: "So...", variant: "beat" as const },
  { text: "I don't really want to watch it with just anyone.", variant: "body" as const },
  { text: "Would you like to watch it with me?", variant: "emphasis" as const },
  { text: "Not as a date.", variant: "emphasis" as const },
  { text: "We're not really friends either.", variant: "body" as const },
  { text: "Just...", variant: "beat" as const },
  { text: "Two fellow strangers watching Spider-Man.", variant: "body" as const },
  { text: "I know there's a very good chance you'll say no.", variant: "emphasis" as const },
  { text: "My friends don't even believe I'd actually ask you.", variant: "body" as const },
  { text: "Yet...", variant: "beat" as const },
  { text: "Here we are. I had to try", variant: "body" as const },
  { text: "What do you say?", variant: "emphasis" as const },
];

export default function InvitationCard({ onDecision }: InvitationCardProps) {
  const [stage, setStage] = useState<Stage>("question");
  const [noTooltip, setNoTooltip] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (stage === "question") {
      const lines = gsap.utils.toArray<HTMLElement>(".card-line", content);
      if (prefersReduced) {
        gsap.set(lines, { opacity: 1, y: 0 });
        return;
      }
      gsap.set(lines, { opacity: 0, y: 14 });
      gsap.to(lines, {
        opacity: 1,
        y: 0,
        duration: 0.55,
        stagger: 0.1,
        ease: "power2.out",
        delay: 0.15,
      });
      return;
    }

    if (prefersReduced) {
      gsap.set(content, { opacity: 1, y: 0 });
      return;
    }
    gsap.fromTo(
      content,
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
    );
  }, [stage]);

  function handleYes() {
    setStage("yes");
    onDecision("yes");
  }

  function handleNo() {
    setStage("no");
    onDecision("no");
    void submitRsvp({ decision: "no" });
  }

  return (
    <div className="invitation-card glass-card halftone">
      <div className="invitation-card-content" ref={contentRef} key={stage}>
        {stage === "question" && (
          <>
            <div className="card-lines">
              {QUESTION_LINES.map((line, i) => (
                <p key={i} className={`card-line card-line-${line.variant}`}>
                  {line.text}
                </p>
              ))}
            </div>

            <div className="card-actions">
              <button
                type="button"
                className="btn btn-yes"
                onClick={handleYes}
                aria-label="Yes, let's go — I'd like to watch Spider-Man with you"
              >
                🕷 Yes, let&apos;s go
              </button>
              <div className="no-button-wrap">
                <button
                  type="button"
                  className="btn btn-no"
                  onClick={handleNo}
                  onMouseEnter={() => setNoTooltip(true)}
                  onMouseLeave={() => setNoTooltip(false)}
                  onFocus={() => setNoTooltip(true)}
                  onBlur={() => setNoTooltip(false)}
                  aria-label="I'll pass on watching Spider-Man together"
                  aria-describedby="no-button-tooltip"
                >
                  🙂🥲 I&apos;ll pass
                </button>
                {noTooltip && (
                  <div id="no-button-tooltip" className="comic-bubble floating-bubble no-tooltip" role="tooltip">
                    Don&apos;t worry, it won&apos;t run away 😉
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {stage === "yes" && (
          <div className="result-panel">
            <p className="result-heading neon-text-blue">Amazing!</p>
            <p>I honestly thought you&apos;d press the other button.</p>
            <p>Let&apos;s pick a day, show your nachos sneakin skills!</p>
            <DateTheatrePicker />
          </div>
        )}

        {stage === "no" && (
          <div className="result-panel">
            <p>That&apos;s completely okay.</p>
            <p>I said I&apos;d probably get a no, so I was prepared.</p>
            <p>But I&apos;m still glad you took the time to read this.</p>
            <p>Have an amazing day ❤️</p>
          </div>
        )}
      </div>
    </div>
  );
}
