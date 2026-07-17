"use client";

import { useEffect, useRef } from "react";

interface ConfettiCanvasProps {
  /** Increment this to fire a new confetti burst. */
  burstKey: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  life: number;
}

const COLORS = ["#3fd0ff", "#ff2d4d", "#f5f1e6", "#6ee7ff", "#d81633"];

export default function ConfettiCanvas({ burstKey }: ConfettiCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);
  const runningRef = useRef(false);
  const startLoopRef = useRef<() => void>(() => {});

  // Loop only runs while particles are alive — no perpetual rAF work at rest.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    function loop() {
      if (!ctx || !canvas) return;
      const particles = particlesRef.current;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.vy += 0.12;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        p.life -= 1;

        if (p.life <= 0 || p.y > canvas.height + 40) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = Math.min(1, p.life / 40);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        ctx.restore();
      }

      if (particles.length === 0) {
        runningRef.current = false;
        return;
      }

      rafRef.current = requestAnimationFrame(loop);
    }

    startLoopRef.current = () => {
      if (runningRef.current) return;
      runningRef.current = true;
      rafRef.current = requestAnimationFrame(loop);
    };

    return () => {
      cancelAnimationFrame(rafRef.current);
      runningRef.current = false;
      window.removeEventListener("resize", resize);
    };
  }, []);

  useEffect(() => {
    if (burstKey === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const count = prefersReduced ? 24 : 140;
    const originX = canvas.width / 2;
    const originY = canvas.height * 0.35;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 9;
      particlesRef.current.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 4,
        size: 6 + Math.random() * 6,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        rotation: Math.random() * Math.PI,
        rotationSpeed: (Math.random() - 0.5) * 0.3,
        life: 70 + Math.random() * 50,
      });
    }

    startLoopRef.current();
  }, [burstKey]);

  return <canvas ref={canvasRef} className="confetti-canvas" aria-hidden="true" />;
}
