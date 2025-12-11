"use client";

import { useEffect, useRef } from "react";

export default function GlobalParticleField() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || typeof window === "undefined") return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    let frameId: number;
    // time variable is not strictly needed but good practice for smooth wave/phase
    // let time = 0; // Removed since it's not used in the draw loop, but phase is.

    const resize = () => {
      const { innerWidth, innerHeight } = window;
      canvas.width = innerWidth * dpr;
      canvas.height = innerHeight * dpr;
      canvas.style.width = `${innerWidth}px`;
      canvas.style.height = `${innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    // [TWEAK 1: REDUCE DENSITY] Lowered the particle count to be sparser (Antigravity look)
    const particleCount =
      window.innerWidth < 640 ? 60 : window.innerWidth < 1280 ? 110 : 160;

    type P = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      baseX: number;
      baseY: number;
      r: number;
      phase: number;
      opacity: number;
    };

    const particles: P[] = [];
    const center = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    let mouse: { x: number; y: number } | null = null;

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      // [TWEAK 2: EXPAND FIELD SIZE] Made the initial circle larger to fill the screen better
      const radius = Math.random() * 400 + 100;
      const x = center.x + Math.cos(angle) * radius;
      const y = center.y + Math.sin(angle) * radius;

      particles.push({
        x,
        y,
        baseX: x,
        baseY: y,
        // [TWEAK 3: SLOW INITIAL SPEED] Reduced initial random velocity for slower drift
        vx: (Math.random() - 0.5) * 0.08,
        vy: (Math.random() - 0.5) * 0.08,
        r: Math.random() * 1.5 + 0.5, // Subtle radius reduction
        phase: Math.random() * Math.PI * 2,
        opacity: 0,
      });
    }

    const handlePointerMove = (e: PointerEvent) => {
      mouse = { x: e.clientX, y: e.clientY };
    };
    const handlePointerLeave = () => {
      mouse = null;
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerleave", handlePointerLeave);

    const draw = () => {
      const { innerWidth, innerHeight } = window;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      ctx.globalAlpha = 1;

      const color = getComputedStyle(document.documentElement).getPropertyValue(
        "--hf-particle-color"
      );
      const altColor =
        getComputedStyle(document.documentElement).getPropertyValue(
          "--hf-particle-color-alt"
        ) || color;

      for (const p of particles) {
        // [TWEAK 4: SLOW WAVE DRIFT] Reduced phase increment for slower, subtler "wave" movement
        p.phase += 0.008;
        p.x += p.vx + Math.sin(p.phase) * 0.03; // Reduced wave amplitude
        p.y += p.vy + Math.cos(p.phase * 0.8) * 0.03; // Reduced wave amplitude

        // [TWEAK 5: WEAKEN CENTRIPETAL PULL] The pull back to the base position is much weaker
        p.x += (p.baseX - p.x) * 0.0005;
        p.y += (p.baseY - p.y) * 0.0005;

        if (mouse) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const radius = 180;
          if (dist < radius) {
            const force = (radius - dist) / radius;
            // [TWEAK 6: WEAKEN MOUSE PULL] Mouse interaction is much weaker/subtler
            const pull = 0.03;
            p.x += (dx / dist) * force * 6 * pull;
            p.y += (dy / dist) * force * 6 * pull;
          }
        }

        let targetOpacity = 0.08; // Base opacity lowered significantly
        if (mouse) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const bubbleRadius = 220;
          if (dist < bubbleRadius) {
            // Lowered max brightness near cursor
            targetOpacity = 0.2 + ((bubbleRadius - dist) / bubbleRadius) * 0.5;
          }
        }
        p.opacity += (targetOpacity - p.opacity) * 0.08;

        // Wrap around logic remains unchanged for a continuous field
        if (p.x < -20) p.x = innerWidth + 20;
        if (p.x > innerWidth + 20) p.x = -20;
        if (p.y < -20) p.y = innerHeight + 20;
        if (p.y > innerHeight + 20) p.y = -20;

        // [TWEAK 7: ALT COLOR FREQUENCY] The secondary color appears less often
        const chosen = Math.random() < 0.15 ? altColor : color;
        const parts = chosen.replace(/rgba?\(|\)/g, "").split(",");
        let fill = chosen.trim();
        if (parts.length >= 3) {
          const [r, g, b] = parts;
          fill = `rgba(${r.trim()}, ${g.trim()}, ${b.trim()}, ${p.opacity || 0})`;
        }

        ctx.beginPath();
        ctx.fillStyle = fill;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      frameId = window.requestAnimationFrame(draw);
    };

    frameId = window.requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
      window.cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 -z-50">
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}