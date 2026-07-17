"use client";

import { useEffect, useMemo, useRef } from "react";
import gsap from "gsap";

/** Deterministic PRNG so server-rendered markup matches the client (no Math.random in render). */
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Building {
  x: number;
  width: number;
  height: number;
  windows: { x: number; y: number; lit: boolean }[];
}

function makeSkyline(seed: number, count: number, viewWidth: number, maxHeight: number): Building[] {
  const rand = mulberry32(seed);
  const buildings: Building[] = [];
  let x = -20;
  for (let i = 0; i < count; i++) {
    const width = 60 + rand() * 90;
    const height = maxHeight * (0.35 + rand() * 0.65);
    const windows: Building["windows"] = [];
    const cols = Math.max(2, Math.floor(width / 18));
    const rows = Math.max(3, Math.floor(height / 22));
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        if (rand() > 0.62) {
          windows.push({
            x: 8 + c * (width / cols),
            y: 10 + r * (height / rows),
            lit: rand() > 0.45,
          });
        }
      }
    }
    buildings.push({ x, width, height, windows });
    x += width + 4 + rand() * 14;
    if (x > viewWidth + 40) break;
  }
  return buildings;
}

function SkylineLayer({
  seed,
  count,
  maxHeight,
  color,
  windowColor,
  opacity,
}: {
  seed: number;
  count: number;
  maxHeight: number;
  color: string;
  windowColor: string;
  opacity: number;
}) {
  const buildings = useMemo(() => makeSkyline(seed, count, 1600, maxHeight), [seed, count, maxHeight]);

  return (
    <svg
      viewBox={`0 0 1600 ${maxHeight}`}
      preserveAspectRatio="none"
      style={{ width: "100%", height: "100%", opacity }}
      aria-hidden="true"
    >
      {buildings.map((b, i) => (
        <g key={i} transform={`translate(${b.x}, ${maxHeight - b.height})`}>
          <rect width={b.width} height={b.height} fill={color} />
          {b.windows.map((w, wi) => (
            <rect
              key={wi}
              x={w.x}
              y={w.y}
              width={4}
              height={6}
              fill={w.lit ? windowColor : "rgba(0,0,0,0.4)"}
              opacity={w.lit ? 0.9 : 0.3}
            />
          ))}
        </g>
      ))}
    </svg>
  );
}

function WebStrands() {
  return (
    <svg
      viewBox="0 0 1600 400"
      preserveAspectRatio="none"
      className="web-strands"
      aria-hidden="true"
    >
      <path d="M 120 0 Q 340 140 560 40" />
      <path d="M 560 40 Q 780 -20 980 90" />
      <path d="M 980 90 Q 1180 10 1420 70" />
      <path d="M 300 0 Q 320 90 340 140" />
      <path d="M 900 90 Q 940 10 980 90" />
    </svg>
  );
}

export default function CitySkyline() {
  const rootRef = useRef<HTMLDivElement>(null);
  const farRef = useRef<HTMLDivElement>(null);
  const nearRef = useRef<HTMLDivElement>(null);
  const cloudRef = useRef<HTMLDivElement>(null);
  const dustCanvasRef = useRef<HTMLCanvasElement>(null);

  // Subtle mouse-driven parallax (skipped for reduced-motion / touch-only users).
  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const xToFar = gsap.quickTo(farRef.current, "x", { duration: 1.2, ease: "power3.out" });
    const xToNear = gsap.quickTo(nearRef.current, "x", { duration: 0.9, ease: "power3.out" });
    const yToFar = gsap.quickTo(farRef.current, "y", { duration: 1.2, ease: "power3.out" });
    const yToNear = gsap.quickTo(nearRef.current, "y", { duration: 0.9, ease: "power3.out" });

    function onMove(e: MouseEvent) {
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      xToFar(nx * -8);
      yToFar(ny * -4);
      xToNear(nx * -18);
      yToNear(ny * -8);
    }

    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  // Floating dust particles on a lightweight canvas loop.
  useEffect(() => {
    const canvas = dustCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const rand = mulberry32(42);
    const particles = Array.from({ length: 60 }, () => ({
      x: rand() * width,
      y: rand() * height,
      r: 0.6 + rand() * 1.6,
      speed: 0.08 + rand() * 0.22,
      drift: (rand() - 0.5) * 0.15,
      twinkle: rand() * Math.PI * 2,
    }));

    function resize() {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    }
    window.addEventListener("resize", resize);

    let raf = 0;
    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        p.twinkle += 0.02;
        const alpha = 0.25 + Math.sin(p.twinkle) * 0.2;
        ctx.beginPath();
        ctx.fillStyle = `rgba(160, 200, 255, ${Math.max(0, alpha)})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();

        if (!prefersReduced) {
          p.y -= p.speed;
          p.x += p.drift;
          if (p.y < -4) {
            p.y = height + 4;
            p.x = rand() * width;
          }
          if (p.x < -4) p.x = width + 4;
          if (p.x > width + 4) p.x = -4;
        }
      }
      raf = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div ref={rootRef} className="city-skyline" aria-hidden="true">
      <div className="sky-glow" />

      <div className="clouds" ref={cloudRef}>
        <span className="cloud cloud-a" />
        <span className="cloud cloud-b" />
        <span className="cloud cloud-c" />
      </div>

      <div className="skyline-layer skyline-far" ref={farRef}>
        <SkylineLayer seed={7} count={22} maxHeight={340} color="#0c1023" windowColor="#3fd0ff" opacity={0.55} />
      </div>

      <WebStrands />

      <div className="skyline-layer skyline-near" ref={nearRef}>
        <SkylineLayer seed={19} count={16} maxHeight={420} color="#070914" windowColor="#ff2d4d" opacity={0.92} />
      </div>

      <canvas ref={dustCanvasRef} className="dust-canvas" />
    </div>
  );
}
