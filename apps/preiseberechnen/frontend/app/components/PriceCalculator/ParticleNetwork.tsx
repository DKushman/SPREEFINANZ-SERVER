"use client";

import { useRef, useEffect, useCallback } from "react";

type ParticleNetworkProps = {
  boostKey: number;
};

const PARTICLE_COUNT = 30;
const CONNECTION_DIST = 52;
const BASE_SPEED = 0.055;
const BOOST_SPEED = 1.8;
const BOOST_DECAY = 0.95;
const DOT_RADIUS = 1.08;
const LINE_ALPHA_BASE = 0.13;
const BOOST_SIZE = 1.65;
const SIZE_DECAY = 0.92;
const BOOST_GLOW = 1.9;
const GLOW_DECAY = 0.9;

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
};

function createParticles(w: number, h: number): Particle[] {
  const arr: Particle[] = [];
  const cols = Math.ceil(Math.sqrt(PARTICLE_COUNT));
  const rows = Math.ceil(PARTICLE_COUNT / cols);
  const cellW = w / cols;
  const cellH = h / rows;
  const jitterX = cellW * 0.28;
  const jitterY = cellH * 0.28;

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const angle = Math.random() * Math.PI * 2;
    arr.push({
      x:
        col * cellW +
        cellW * 0.5 +
        (Math.random() * 2 - 1) * jitterX,
      y:
        row * cellH +
        cellH * 0.5 +
        (Math.random() * 2 - 1) * jitterY,
      vx: Math.cos(angle) * BASE_SPEED,
      vy: Math.sin(angle) * BASE_SPEED,
    });
  }
  return arr;
}

export function ParticleNetwork({ boostKey }: ParticleNetworkProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const speedRef = useRef(1);
  const targetSpeedRef = useRef(1);
  const sizeRefMult = useRef(1);
  const glowRef = useRef(1);
  const rafRef = useRef(0);
  const prevBoostRef = useRef(boostKey);
  const sizeRef = useRef({ w: 0, h: 0 });

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { w, h } = sizeRef.current;
    const particles = particlesRef.current;

    const target = targetSpeedRef.current;
    const current = speedRef.current;
    if (target > current) {
      speedRef.current = current + (target - current) * 0.13;
    } else {
      speedRef.current = 1 + (current - 1) * BOOST_DECAY;
      if (speedRef.current < 1.003) speedRef.current = 1;
    }
    if (targetSpeedRef.current > 1 && speedRef.current >= targetSpeedRef.current * 0.9) {
      targetSpeedRef.current = 1;
    }

    const speed = speedRef.current;

    sizeRefMult.current =
      1 + (sizeRefMult.current - 1) * SIZE_DECAY;
    if (sizeRefMult.current < 1.003) sizeRefMult.current = 1;

    glowRef.current = 1 + (glowRef.current - 1) * GLOW_DECAY;
    if (glowRef.current < 1.003) glowRef.current = 1;

    const sizeBoost = sizeRefMult.current;
    const glowBoost = glowRef.current;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx * speed;
      p.y += p.vy * speed;

      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
      p.x = Math.max(0, Math.min(w, p.x));
      p.y = Math.max(0, Math.min(h, p.y));
    }

    const connDist = CONNECTION_DIST * (w / 360);
    const connDistSq = connDist * connDist;

    ctx.lineWidth = 0.42;
    ctx.lineCap = "round";
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distSq = dx * dx + dy * dy;
        if (distSq < connDistSq) {
          const dist = Math.sqrt(distSq);
          const alpha =
            LINE_ALPHA_BASE *
            glowBoost *
            (1 - dist / connDist) *
            Math.min(speed, 3);
          ctx.strokeStyle = `rgba(255,255,227,${alpha})`;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    const dotAlpha = Math.min(0.9, 0.52 * glowBoost * Math.min(speed, 2.2));
    ctx.fillStyle = `rgba(255,255,227,${dotAlpha})`;
    // Soft glow bloom so clicks feel illuminated.
    ctx.shadowColor = "rgba(255,255,227,0.62)";
    ctx.shadowBlur = 9 * glowBoost;
    for (let i = 0; i < particles.length; i++) {
      ctx.beginPath();
      ctx.arc(
        particles[i].x,
        particles[i].y,
        DOT_RADIUS * sizeBoost,
        0,
        Math.PI * 2,
      );
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
      const cw = rect.width;
      const ch = rect.height;
      canvas.style.width = `${cw}px`;
      canvas.style.height = `${ch}px`;
      canvas.style.left = "0px";
      canvas.style.top = "0px";
      canvas.width = cw * dpr;
      canvas.height = ch * dpr;
      sizeRef.current = { w: cw, h: ch };
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.scale(dpr, dpr);
      if (particlesRef.current.length === 0) {
        particlesRef.current = createParticles(cw, ch);
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
    if (boostKey !== prevBoostRef.current) {
      targetSpeedRef.current = BOOST_SPEED;
      sizeRefMult.current = BOOST_SIZE;
      glowRef.current = BOOST_GLOW;
      prevBoostRef.current = boostKey;
    }
  }, [boostKey]);

  return (
    <canvas
      ref={canvasRef}
      id="price-calculator-particle-network"
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden="true"
    />
  );
}
