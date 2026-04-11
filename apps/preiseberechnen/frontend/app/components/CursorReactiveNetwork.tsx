"use client";

import { useCallback, useEffect, useRef } from "react";

const PARTICLE_COUNT = 55;
const CONNECTION_DISTANCE = 68;
const PARTICLE_SPEED = 0.055;
const PARTICLE_RADIUS = 1.6;
const LINE_ALPHA = 0.22;

type Particle = { x: number; y: number; vx: number; vy: number };

function createParticles(width: number, height: number): Particle[] {
  const particles: Particle[] = [];
  const cols = Math.ceil(Math.sqrt(PARTICLE_COUNT));
  const rows = Math.ceil(PARTICLE_COUNT / cols);
  const cellW = width / cols;
  const cellH = height / rows;

  for (let i = 0; i < PARTICLE_COUNT; i += 1) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const angle = Math.random() * Math.PI * 2;
    particles.push({
      x: col * cellW + cellW * 0.5 + (Math.random() - 0.5) * cellW * 0.5,
      y: row * cellH + cellH * 0.5 + (Math.random() - 0.5) * cellH * 0.5,
      vx: Math.cos(angle) * PARTICLE_SPEED,
      vy: Math.sin(angle) * PARTICLE_SPEED,
    });
  }

  return particles;
}

export function CursorReactiveNetwork({ id }: { id?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef(0);
  const sizeRef = useRef({ w: 0, h: 0 });
  const pointerRef = useRef<{ x: number; y: number } | null>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { w, h } = sizeRef.current;
    const particles = particlesRef.current;
    const pointer = pointerRef.current;
    const attractRadius = 170;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;

      p.x = Math.max(0, Math.min(w, p.x));
      p.y = Math.max(0, Math.min(h, p.y));

      if (pointer) {
        const dx = pointer.x - p.x;
        const dy = pointer.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < attractRadius && dist > 1) {
          const force = 0.03 * (1 - dist / attractRadius);
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;

          const maxVelocity = 0.9;
          const velocityMagnitude = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
          if (velocityMagnitude > maxVelocity) {
            p.vx = (p.vx / velocityMagnitude) * maxVelocity;
            p.vy = (p.vy / velocityMagnitude) * maxVelocity;
          }
        }
      }
    }

    const connDist = CONNECTION_DISTANCE * (w / 300);
    const connDistSq = connDist * connDist;
    ctx.lineWidth = 0.5;
    ctx.lineCap = "round";

    for (let i = 0; i < particles.length; i += 1) {
      for (let j = i + 1; j < particles.length; j += 1) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distSq = dx * dx + dy * dy;

        if (distSq < connDistSq) {
          const dist = Math.sqrt(distSq);
          let alpha = LINE_ALPHA * (1 - dist / connDist);
          if (pointer) {
            const mx = (particles[i].x + particles[j].x) / 2;
            const my = (particles[i].y + particles[j].y) / 2;
            const md = Math.sqrt((pointer.x - mx) ** 2 + (pointer.y - my) ** 2);
            if (md < attractRadius) alpha += 0.4 * (1 - md / attractRadius);
          }
          ctx.strokeStyle = `rgba(255,255,227,${alpha})`;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    ctx.shadowColor = "rgba(255,255,227,0.5)";
    ctx.shadowBlur = 8;
    for (const p of particles) {
      let radius = PARTICLE_RADIUS;
      let alpha = 0.6;

      if (pointer) {
        const distance = Math.sqrt((pointer.x - p.x) ** 2 + (pointer.y - p.y) ** 2);
        if (distance < attractRadius) {
          const factor = 1 - distance / attractRadius;
          radius += factor * 2.4;
          alpha += factor * 0.5;
        }
      }

      ctx.fillStyle = `rgba(255,255,227,${Math.min(1, alpha)})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;

    rafRef.current = requestAnimationFrame(draw);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const resize = () => {
      const rect = parent.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      sizeRef.current = { w: rect.width, h: rect.height };

      const ctx = canvas.getContext("2d");
      if (ctx) ctx.scale(dpr, dpr);
      if (particlesRef.current.length === 0) {
        particlesRef.current = createParticles(rect.width, rect.height);
      }
    };

    resize();
    rafRef.current = requestAnimationFrame(draw);

    const ro = new ResizeObserver(resize);
    ro.observe(parent);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [draw]);

  useEffect(() => {
    const handleMove = (e: PointerEvent) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      pointerRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const handleLeave = () => {
      pointerRef.current = null;
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerleave", handleLeave);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerleave", handleLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id={id}
      className="pointer-events-none absolute inset-0 z-0 h-full w-full"
      aria-hidden="true"
    />
  );
}
