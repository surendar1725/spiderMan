"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import "@/styles/scene.css";
import CitySkyline from "./CitySkyline";
import SpiderCharacter from "./SpiderCharacter";
import EntranceSequence from "./EntranceSequence";
import InvitationCard from "./InvitationCard";
import ConfettiCanvas from "./ConfettiCanvas";
import SpeechBubble from "./SpeechBubble";

export default function InvitationExperience() {
  const [introDone, setIntroDone] = useState(false);
  const [decided, setDecided] = useState(false);
  const [confettiBurstKey, setConfettiBurstKey] = useState(0);
  const [spiderEasterEgg, setSpiderEasterEgg] = useState(false);
  const [idleNudgeVisible, setIdleNudgeVisible] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleIntroComplete = useCallback(() => setIntroDone(true), []);

  const handleDecision = useCallback((decision: "yes" | "no") => {
    setDecided(true);
    if (decision === "yes") {
      setConfettiBurstKey((k) => k + 1);
    }
  }, []);

  const handleSpiderFifthClick = useCallback(() => {
    setSpiderEasterEgg(true);
    window.setTimeout(() => setSpiderEasterEgg(false), 3200);
  }, []);

  // 30-second "still thinking?" nudge — only while a decision hasn't been made.
  useEffect(() => {
    if (decided) {
      setIdleNudgeVisible(false);
      return;
    }
    const timer = window.setTimeout(() => setIdleNudgeVisible(true), 30000);
    return () => window.clearTimeout(timer);
  }, [decided]);

  // Ambient soundtrack: attempt autoplay, and retry once on first user
  // interaction if the browser's autoplay policy blocked it.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 0.35;
    const tryPlay = () => audio.play().catch(() => undefined);
    tryPlay();

    const retry = () => {
      tryPlay();
      document.removeEventListener("pointerdown", retry);
      document.removeEventListener("keydown", retry);
    };
    document.addEventListener("pointerdown", retry);
    document.addEventListener("keydown", retry);

    return () => {
      document.removeEventListener("pointerdown", retry);
      document.removeEventListener("keydown", retry);
    };
  }, []);

  return (
    <main className="experience-root">
      <audio ref={audioRef} loop preload="auto" aria-hidden="true">
        {/* Drop an original / royalty-free ambient lo-fi loop here as public/assets/audio/audio.mp3 */}
        <source src="/assets/audio/audio.mp3" type="audio/mpeg" />
      </audio>

      <CitySkyline />
      <SpiderCharacter onFifthClick={handleSpiderFifthClick} />

      {!introDone && <EntranceSequence onComplete={handleIntroComplete} />}

      {introDone && (
        <div className="stage">
          <InvitationCard onDecision={handleDecision} />
        </div>
      )}

      <ConfettiCanvas burstKey={confettiBurstKey} />

      {spiderEasterEgg && (
        <SpeechBubble className="easter-egg-bubble" style={{ right: "clamp(16px, 10vw, 140px)" }}>
          &ldquo;With great courage comes awkward conversations.&rdquo;
        </SpeechBubble>
      )}

      {idleNudgeVisible && !decided && (
        <SpeechBubble className="idle-nudge-bubble">Still thinking? No pressure.</SpeechBubble>
      )}
    </main>
  );
}
