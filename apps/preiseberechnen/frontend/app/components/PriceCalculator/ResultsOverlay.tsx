"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { Button } from "../Button";
import { TuevPreisrechnerStarRating } from "../TuevPreisrechnerStarRating";

type BreakdownItem = {
  label: string;
  range: [number, number];
};

type ResultsOverlayProps = {
  priceRange: [number, number];
  breakdownItems: BreakdownItem[];
  currency: string;
  onClose: () => void;
};

function fmt(value: number, c: string): string {
  return `${value.toLocaleString("de-DE")} ${c}`;
}

function fmtRange(r: [number, number], c: string): string {
  return `${fmt(r[0], c)} – ${fmt(r[1], c)}`;
}

/* ------------------------------------------------------------------ */
/*  Confetti                                                           */
/* ------------------------------------------------------------------ */

function ConfettiBurst() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const w = rect.width;
    const h = rect.height;

    type Piece = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      color: string;
      size: number;
      rot: number;
      rotV: number;
      life: number;
      decay: number;
    };

    const colors = [
      "rgba(255,255,227,0.92)",
      "rgba(255,215,0,0.88)",
      "rgba(80,220,100,0.85)",
      "rgba(100,149,237,0.85)",
      "rgba(255,105,180,0.82)",
      "rgba(255,165,0,0.85)",
    ];

    const pieces: Piece[] = [];
    const COUNT = 70;
    for (let i = 0; i < COUNT; i++) {
      const angle = (Math.PI * 2 * i) / COUNT + (Math.random() - 0.5) * 0.6;
      const speed = 2.5 + Math.random() * 5;
      pieces.push({
        x: w / 2,
        y: h * 0.22,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 3 + Math.random() * 4,
        rot: Math.random() * Math.PI * 2,
        rotV: (Math.random() - 0.5) * 0.15,
        life: 1,
        decay: 0.011 + Math.random() * 0.007,
      });
    }

    let raf = 0;
    const animate = () => {
      ctx.clearRect(0, 0, w, h);
      let alive = 0;
      for (const p of pieces) {
        if (p.life <= 0) continue;
        alive++;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1;
        p.vx *= 0.992;
        p.life -= p.decay;
        p.rot += p.rotV;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.55);
        ctx.restore();
      }
      if (alive > 0) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-30 h-full w-full"
      aria-hidden="true"
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Cursor-reactive particle matter background                         */
/* ------------------------------------------------------------------ */

const MATTER_COUNT = 55;
const MATTER_CONN = 68;
const MATTER_SPEED = 0.04;
const MATTER_DOT = 1.6;
const MATTER_LINE_ALPHA = 0.18;

type MatterParticle = { x: number; y: number; vx: number; vy: number };

function createMatter(w: number, h: number): MatterParticle[] {
  const arr: MatterParticle[] = [];
  const cols = Math.ceil(Math.sqrt(MATTER_COUNT));
  const rows = Math.ceil(MATTER_COUNT / cols);
  const cw = w / cols;
  const ch = h / rows;
  for (let i = 0; i < MATTER_COUNT; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const a = Math.random() * Math.PI * 2;
    arr.push({
      x: col * cw + cw * 0.5 + (Math.random() - 0.5) * cw * 0.5,
      y: row * ch + ch * 0.5 + (Math.random() - 0.5) * ch * 0.5,
      vx: Math.cos(a) * MATTER_SPEED,
      vy: Math.sin(a) * MATTER_SPEED,
    });
  }
  return arr;
}

function MatterBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<MatterParticle[]>([]);
  const rafRef = useRef(0);
  const sizeRef = useRef({ w: 0, h: 0 });
  const mouseRef = useRef<{ x: number; y: number } | null>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { w, h } = sizeRef.current;
    const particles = particlesRef.current;
    const mouse = mouseRef.current;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const attractR = 120;

    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
      p.x = Math.max(0, Math.min(w, p.x));
      p.y = Math.max(0, Math.min(h, p.y));

      if (mouse) {
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < attractR && dist > 1) {
          const force = 0.012 * (1 - dist / attractR);
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
          const maxV = 0.35;
          const mag = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
          if (mag > maxV) {
            p.vx = (p.vx / mag) * maxV;
            p.vy = (p.vy / mag) * maxV;
          }
        }
      }
    }

    const connDist = MATTER_CONN * (w / 300);
    const connSq = connDist * connDist;

    ctx.lineWidth = 0.5;
    ctx.lineCap = "round";
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dSq = dx * dx + dy * dy;
        if (dSq < connSq) {
          const d = Math.sqrt(dSq);
          let alpha = MATTER_LINE_ALPHA * (1 - d / connDist);
          if (mouse) {
            const mx = (particles[i].x + particles[j].x) / 2;
            const my = (particles[i].y + particles[j].y) / 2;
            const md = Math.sqrt(
              (mouse.x - mx) ** 2 + (mouse.y - my) ** 2,
            );
            if (md < attractR) alpha += 0.25 * (1 - md / attractR);
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
      let r = MATTER_DOT;
      let a = 0.6;
      if (mouse) {
        const md = Math.sqrt((mouse.x - p.x) ** 2 + (mouse.y - p.y) ** 2);
        if (md < attractR) {
          const f = 1 - md / attractR;
          r += f * 1.8;
          a += f * 0.35;
        }
      }
      ctx.fillStyle = `rgba(255,255,227,${Math.min(1, a)})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
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
        particlesRef.current = createMatter(rect.width, rect.height);
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
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const handleLeave = () => {
      mouseRef.current = null;
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
      className="pointer-events-none absolute inset-0 z-0 h-full w-full"
      aria-hidden="true"
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Bell-curve chart                                                   */
/* ------------------------------------------------------------------ */

function CostChart({
  min,
  max,
  typical,
  currency,
}: {
  min: number;
  max: number;
  typical: number;
  currency: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hover, setHover] = useState<{ x: number; price: number } | null>(
    null,
  );
  const layoutRef = useRef({
    padL: 0,
    padR: 0,
    padT: 0,
    padB: 0,
    cw: 0,
    ch: 0,
  });

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    const padL = 8;
    const padR = 8;
    const padT = 40;
    const padB = 32;
    const cw = w - padL - padR;
    const ch = h - padT - padB;
    layoutRef.current = { padL, padR, padT, padB, cw, ch };

    const range = max - min || 1;
    const mu = (typical - min) / range;
    const sigma = 0.19;
    const steps = 200;

    const points: Array<[number, number]> = [];
    let peak = 0;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const y = Math.exp(-0.5 * ((t - mu) / sigma) ** 2);
      if (y > peak) peak = y;
      points.push([t, y]);
    }

    const grad = ctx.createLinearGradient(padL, padT, padL, padT + ch);
    grad.addColorStop(0, "rgba(255,255,227,0.10)");
    grad.addColorStop(0.6, "rgba(255,255,227,0.04)");
    grad.addColorStop(1, "rgba(255,255,227,0)");
    ctx.beginPath();
    ctx.moveTo(padL, padT + ch);
    for (const [t, y] of points)
      ctx.lineTo(padL + t * cw, padT + ch - (y / peak) * ch * 0.92);
    ctx.lineTo(padL + cw, padT + ch);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.beginPath();
    for (let i = 0; i < points.length; i++) {
      const [t, y] = points[i];
      const px = padL + t * cw;
      const py = padT + ch - (y / peak) * ch * 0.92;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.strokeStyle = "rgba(255,255,227,0.5)";
    ctx.lineWidth = 1.8;
    ctx.stroke();

    const typX = padL + mu * cw;
    ctx.setLineDash([3, 4]);
    ctx.strokeStyle = "rgba(255,255,227,0.28)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(typX, padT + 4);
    ctx.lineTo(typX, padT + ch);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "rgba(255,255,227,0.5)";
    ctx.font = "500 10px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("typisch", typX, padT - 4);

    ctx.strokeStyle = "rgba(255,255,227,0.12)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padL, padT + ch);
    ctx.lineTo(padL + cw, padT + ch);
    ctx.stroke();
    ctx.fillStyle = "rgba(255,255,227,0.36)";
    ctx.font = "400 10px system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(fmt(min, currency), padL, padT + ch + 18);
    ctx.textAlign = "right";
    ctx.fillText(fmt(max, currency), padL + cw, padT + ch + 18);

    if (hover) {
      const hx = hover.x;
      const ht = Math.max(0, Math.min(1, (hx - padL) / cw));
      const yVal = Math.exp(-0.5 * ((ht - mu) / sigma) ** 2);
      const hy = padT + ch - (yVal / peak) * ch * 0.92;
      ctx.strokeStyle = "rgba(255,255,227,0.22)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(hx, padT + ch);
      ctx.lineTo(hx, hy);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(hx, hy, 4, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,227,0.95)";
      ctx.fill();
      ctx.strokeStyle = "rgba(3,15,3,0.6)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      const label = fmt(hover.price, currency);
      ctx.font = "600 11px system-ui, sans-serif";
      const tw = ctx.measureText(label).width;
      const tooltipW = tw + 14;
      const tooltipH = 22;
      let tx = hx - tooltipW / 2;
      if (tx < padL) tx = padL;
      if (tx + tooltipW > padL + cw) tx = padL + cw - tooltipW;
      let ty = hy - 14 - tooltipH;
      if (ty < 0) ty = hy + 16;
      const r = 6;
      ctx.fillStyle = "rgba(255,255,227,0.95)";
      ctx.beginPath();
      ctx.moveTo(tx + r, ty);
      ctx.lineTo(tx + tooltipW - r, ty);
      ctx.quadraticCurveTo(tx + tooltipW, ty, tx + tooltipW, ty + r);
      ctx.lineTo(tx + tooltipW, ty + tooltipH - r);
      ctx.quadraticCurveTo(tx + tooltipW, ty + tooltipH, tx + tooltipW - r, ty + tooltipH);
      ctx.lineTo(tx + r, ty + tooltipH);
      ctx.quadraticCurveTo(tx, ty + tooltipH, tx, ty + tooltipH - r);
      ctx.lineTo(tx, ty + r);
      ctx.quadraticCurveTo(tx, ty, tx + r, ty);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "rgba(3,15,3,0.92)";
      ctx.textAlign = "center";
      ctx.fillText(label, tx + tooltipW / 2, ty + 15);
    }
  }, [min, max, typical, currency, hover]);

  useEffect(() => {
    draw();
    const ro = new ResizeObserver(draw);
    if (canvasRef.current) ro.observe(canvasRef.current);
    return () => ro.disconnect();
  }, [draw]);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const { padL, cw } = layoutRef.current;
      const t = Math.max(0, Math.min(1, (x - padL) / cw));
      const price = Math.round(min + t * (max - min || 1));
      setHover({ x, price });
    },
    [min, max],
  );

  return (
    <canvas
      ref={canvasRef}
      className="h-[clamp(8rem,16vw,11rem)] w-full cursor-crosshair"
      aria-label={`Kostenverteilung von ${fmt(min, currency)} bis ${fmt(max, currency)}`}
      role="img"
      onPointerMove={handlePointerMove}
      onPointerLeave={() => setHover(null)}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Contact Gate – split card: matter left · form right                */
/* ------------------------------------------------------------------ */

function ContactGate({
  onSubmit,
}: {
  onSubmit: (data: {
    name: string;
    email: string;
    phone: string;
    wantContact: boolean;
  }) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [wantContact, setWantContact] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const emailValid =
    !touched.email ||
    email.length === 0 ||
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const canSubmit =
    name.trim().length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleBlur = (field: string) =>
    setTouched((p) => ({ ...p, [field]: true }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !canSubmit) return;
    setIsSubmitting(true);
    setTimeout(() => onSubmit({ name, email, phone, wantContact }), 350);
  };

  const inputCls =
    "w-full rounded-[0.6rem] border border-[rgba(255,255,227,0.14)] bg-[rgba(255,255,227,0.04)] px-3.5 py-[0.62rem] text-[0.88rem] text-[var(--foreground)] outline-none transition-colors placeholder:text-[rgba(255,255,227,0.22)] focus:border-[rgba(255,255,227,0.38)] focus:bg-[rgba(255,255,227,0.06)]";

  return (
    <div className="w-full max-w-[24rem]">
          <header className="mb-6">
            <h3 className="text-[clamp(1.2rem,2.2vw,1.5rem)] font-semibold text-[var(--foreground)]">
              Ergebnis freischalten
            </h3>
            <p className="mt-1.5 text-[0.82rem] leading-relaxed text-[rgba(255,255,227,0.45)]">
              Gib kurz deine Daten ein, um deine persönliche
              Kostenschätzung zu sehen.
            </p>
          </header>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-[clamp(0.85rem,1.5vw,1.1rem)]"
            noValidate
          >
            <fieldset className="flex flex-col gap-[clamp(0.85rem,1.5vw,1.1rem)] border-none p-0">
              <legend className="sr-only">Kontaktinformationen</legend>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="contact-name"
                  className="text-[0.78rem] font-medium text-[rgba(255,255,227,0.7)]"
                >
                  Name <span className="text-[rgba(255,255,227,0.3)]">*</span>
                </label>
                <input
                  id="contact-name"
                  type="text"
                  required
                  autoFocus
                  autoComplete="name"
                  placeholder="Max Mustermann"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => handleBlur("name")}
                  className={inputCls}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="contact-email"
                  className="text-[0.78rem] font-medium text-[rgba(255,255,227,0.7)]"
                >
                  E-Mail{" "}
                  <span className="text-[rgba(255,255,227,0.3)]">*</span>
                </label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="max@beispiel.de"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => handleBlur("email")}
                  aria-invalid={!emailValid}
                  aria-describedby={!emailValid ? "email-error" : undefined}
                  className={`${inputCls} ${
                    !emailValid
                      ? "!border-red-400/60 focus:!border-red-400/80"
                      : ""
                  }`}
                />
                {!emailValid && (
                  <p
                    id="email-error"
                    role="alert"
                    className="text-[0.72rem] text-red-400/85"
                  >
                    Bitte gib eine gültige E-Mail-Adresse ein.
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="contact-phone"
                  className="text-[0.78rem] font-medium text-[rgba(255,255,227,0.7)]"
                >
                  Telefon{" "}
                  <span className="text-[0.72rem] font-normal text-[rgba(255,255,227,0.3)]">
                    (optional)
                  </span>
                </label>
                <input
                  id="contact-phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+49 123 456 789"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={inputCls}
                />
              </div>
            </fieldset>

            {/* Dienstleister-Kontakt (über Ergebnis-Button) */}
            <button
              type="button"
              id="price-calculator-contact-dienstleister-toggle"
              onClick={() => setWantContact((v) => !v)}
              aria-pressed={wantContact}
              className={`group relative flex w-full items-start gap-3 rounded-[0.7rem] border px-3.5 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(255,255,227,0.3)] ${
                wantContact
                  ? "border-[rgba(80,220,100,0.35)] bg-[rgba(80,220,100,0.06)]"
                  : "border-[rgba(255,255,227,0.1)] bg-[rgba(255,255,227,0.02)] hover:border-[rgba(255,255,227,0.2)]"
              }`}
            >
              <span
                aria-hidden="true"
                className={`relative mt-0.5 inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
                  wantContact
                    ? "bg-[rgba(80,220,100,0.5)]"
                    : "bg-[rgba(255,255,227,0.15)]"
                }`}
              >
                <span
                  className={`inline-block size-[0.9rem] rounded-full bg-white shadow transition-transform ${
                    wantContact
                      ? "translate-x-[1.05rem]"
                      : "translate-x-[2px]"
                  }`}
                />
              </span>
              <div className="min-w-0 flex-1 pr-10 sm:pr-11">
                <span
                  className={`text-[0.78rem] font-semibold leading-snug transition-colors ${
                    wantContact
                      ? "text-[rgba(255,255,227,0.92)]"
                      : "text-[rgba(255,255,227,0.6)]"
                  }`}
                >
                  Von geprüftem Dienstleister kontaktiert werden
                </span>
                <span className="mt-0.5 block text-[0.68rem] leading-snug text-[rgba(255,255,227,0.35)]">
                  Kostenlos & unverbindlich ein Angebot erhalten
                </span>
              </div>
              <span
                className={`absolute right-2.5 top-2 rounded-full px-[0.35rem] py-px text-[0.48rem] font-semibold leading-tight transition-colors ${
                  wantContact
                    ? "bg-[rgba(80,220,100,0.55)] text-[var(--background)]"
                    : "bg-[rgba(255,255,227,0.1)] text-[rgba(255,255,227,0.45)]"
                }`}
              >
                Empfohlen
              </span>
            </button>

            <div
              id="price-calculator-contact-star-rating-wrap"
              className="rounded-[0.65rem] border border-[rgba(255,255,227,0.08)] bg-[rgba(255,255,227,0.03)] px-[clamp(0.5rem,1.2vw,0.85rem)] py-[clamp(0.65rem,1.4vw,0.9rem)]"
            >
              <TuevPreisrechnerStarRating
                idPrefix="price-calculator-results"
                legend="Wie hilfreich ist der Rechner für dich? (optional)"
                hintIdle="Tippe oder klicke auf die Sterne."
                hintDone="Danke für deine Bewertung."
              />
            </div>

            {/* Ergebnis */}
            <button
              id="price-calculator-contact-submit-ergebnis"
              type="submit"
              disabled={!canSubmit || isSubmitting}
              className="flex h-[2.85rem] w-full items-center justify-center rounded-[0.6rem] bg-[var(--foreground)] text-[0.9rem] font-semibold text-[var(--background)] transition-all hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--foreground)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
            >
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <span className="inline-block size-[1em] animate-spin rounded-full border-2 border-[var(--background)] border-t-transparent" />
                  Wird geladen…
                </span>
              ) : (
                "Ergebnis"
              )}
            </button>

            {/* Trust micro-copy */}
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 pt-1">
              <span className="inline-flex items-center gap-1.5 text-[0.66rem] text-[rgba(255,255,227,0.28)]">
                <svg viewBox="0 0 16 16" className="size-[0.85em]" fill="none" aria-hidden="true">
                  <rect x="2" y="7.33" width="12" height="7.34" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
                  <path d="M5.33 7.33V4.67a2.67 2.67 0 1 1 5.34 0v2.66" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
                SSL-verschlüsselt
              </span>
              <span className="inline-flex items-center gap-1.5 text-[0.66rem] text-[rgba(255,255,227,0.28)]">
                <svg viewBox="0 0 16 16" className="size-[0.85em]" fill="none" aria-hidden="true">
                  <path d="M8 14.67A6.67 6.67 0 1 0 8 1.33a6.67 6.67 0 0 0 0 13.34z" stroke="currentColor" strokeWidth="1.2" />
                  <path d="M5.33 8l2 2 3.34-3.33" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                100% kostenlos
              </span>
            </div>
          </form>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Results view                                                       */
/* ------------------------------------------------------------------ */

function ResultsView({
  priceRange,
  breakdownItems,
  currency,
}: {
  priceRange: [number, number];
  breakdownItems: BreakdownItem[];
  currency: string;
}) {
  const [detailOpen, setDetailOpen] = useState(false);

  const typical = Math.round(
    priceRange[0] + (priceRange[1] - priceRange[0]) * 0.33,
  );
  const savingsHint = Math.round((priceRange[1] - typical) * 0.6);

  return (
    <div className="relative w-full max-w-[min(50rem,96vw)]">
      <ConfettiBurst />

      <div className="flex flex-col gap-[clamp(1rem,2vw,1.5rem)] px-[clamp(0.5rem,1.5vw,1rem)] pt-[clamp(0.5rem,1vw,0.75rem)]">
        {/* Header */}
        <header className="flex flex-col items-center gap-[clamp(0.5rem,1vw,0.75rem)] text-center">
          <div className="inline-flex items-center gap-[clamp(0.25rem,0.5vw,0.35rem)] rounded-full border border-[rgba(80,220,100,0.25)] bg-[rgba(80,220,100,0.06)] px-[clamp(0.5rem,1vw,0.75rem)] py-[clamp(0.15rem,0.3vw,0.22rem)]">
            <svg viewBox="0 0 16 16" className="size-[clamp(0.65rem,0.9vw,0.75rem)]" fill="none" aria-hidden="true">
              <path d="M8 14.67A6.67 6.67 0 1 0 8 1.33a6.67 6.67 0 0 0 0 13.34z" stroke="rgba(80,220,100,0.7)" strokeWidth="1.2" />
              <path d="M5.33 8l2 2 3.34-3.33" stroke="rgba(80,220,100,0.7)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-[clamp(0.56rem,0.8vw,0.66rem)] font-medium text-[rgba(80,220,100,0.7)]">
              Berechnung abgeschlossen
            </span>
          </div>
          <h2 className="text-[clamp(1.1rem,2.2vw,1.6rem)] font-semibold text-[var(--foreground)]">
            Deine Kostenschätzung
          </h2>
          {breakdownItems.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-[clamp(0.2rem,0.4vw,0.3rem)]">
              {breakdownItems.map((item) => (
                <span
                  key={`${item.label}-${item.range[0]}`}
                  className="rounded-full border border-[rgba(255,255,227,0.14)] bg-[rgba(255,255,227,0.03)] px-[clamp(0.4rem,0.8vw,0.6rem)] py-[clamp(0.1rem,0.25vw,0.16rem)] text-[clamp(0.52rem,0.75vw,0.62rem)] text-[rgba(255,255,227,0.52)]"
                >
                  {item.label}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* Hero price card */}
        <div className="flex flex-col items-center rounded-[1rem] border border-[rgba(255,255,227,0.1)] bg-[rgba(255,255,227,0.02)] px-[clamp(1rem,2vw,1.5rem)] pb-[clamp(0.8rem,1.4vw,1rem)] pt-[clamp(1.2rem,2.4vw,1.8rem)]">
          <p className="text-[clamp(0.58rem,0.82vw,0.68rem)] font-medium uppercase tracking-[0.1em] text-[rgba(255,255,227,0.4)]">
            Typischer Preis
          </p>
          <span className="mt-[clamp(0.15rem,0.3vw,0.2rem)] text-[clamp(2.4rem,5.5vw,3.8rem)] font-semibold leading-none text-[var(--foreground)]" aria-live="polite">
            {fmt(typical, currency)}
          </span>
          <div className="mt-[clamp(0.6rem,1.2vw,0.9rem)] flex w-full max-w-[22rem] flex-col gap-[clamp(0.2rem,0.4vw,0.3rem)]">
            <div className="relative h-[3px] w-full overflow-hidden rounded-full bg-[rgba(255,255,227,0.08)]">
              <div className="absolute left-0 top-0 h-full rounded-full bg-[var(--foreground)]" style={{ width: "33%" }} aria-hidden="true" />
            </div>
            <div className="flex items-center justify-between text-[clamp(0.52rem,0.75vw,0.62rem)] tabular-nums text-[rgba(255,255,227,0.38)]">
              <span>{fmt(priceRange[0], currency)}</span>
              <span className="font-medium text-[rgba(255,255,227,0.55)]">Spanne</span>
              <span>{fmt(priceRange[1], currency)}</span>
            </div>
          </div>
          <div className="mt-[clamp(0.8rem,1.6vw,1.2rem)] w-full">
            <CostChart min={priceRange[0]} max={priceRange[1]} typical={typical} currency={currency} />
          </div>
          <p className="mt-[clamp(0.15rem,0.3vw,0.2rem)] text-center text-[clamp(0.46rem,0.65vw,0.54rem)] text-[rgba(255,255,227,0.26)]">
            Fahre mit der Maus über die Kurve, um Werte zu erkunden
          </p>
        </div>

        {/* Savings hint */}
        {savingsHint > 100 && (
          <div className="flex items-start gap-[clamp(0.4rem,0.8vw,0.6rem)] rounded-[0.75rem] border border-[rgba(255,215,0,0.15)] bg-[rgba(255,215,0,0.04)] px-[clamp(0.65rem,1.2vw,0.85rem)] py-[clamp(0.5rem,0.9vw,0.65rem)]">
            <svg viewBox="0 0 20 20" className="mt-[0.1em] size-[clamp(0.85rem,1.2vw,1rem)] shrink-0 text-[rgba(255,215,0,0.6)]" fill="none" aria-hidden="true">
              <path d="M10 2a5.5 5.5 0 0 1 3.5 9.75V13a1 1 0 0 1-1 1h-5a1 1 0 0 1-1-1v-1.25A5.5 5.5 0 0 1 10 2zm-2.5 14h5m-4 2h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="text-[clamp(0.6rem,0.85vw,0.72rem)] leading-relaxed text-[rgba(255,255,227,0.55)]">
              <strong className="font-semibold text-[rgba(255,255,227,0.78)]">Spar-Tipp:</strong>{" "}
              Mit dem richtigen Anbieter sparst du bis zu{" "}
              <strong className="font-semibold text-[rgba(255,255,227,0.78)]">{fmt(savingsHint, currency)}</strong>.
              Vergleiche mehrere Angebote.
            </p>
          </div>
        )}

        {/* Collapsible breakdown */}
        <div className="flex flex-col">
          <button
            type="button"
            onClick={() => setDetailOpen((o) => !o)}
            aria-expanded={detailOpen}
            aria-controls="results-breakdown"
            className="group flex w-full items-center justify-between rounded-[0.65rem] border border-[rgba(255,255,227,0.1)] bg-[rgba(255,255,227,0.02)] px-[clamp(0.65rem,1.2vw,0.85rem)] py-[clamp(0.5rem,0.9vw,0.65rem)] text-left transition-colors hover:border-[rgba(255,255,227,0.2)] hover:bg-[rgba(255,255,227,0.04)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--foreground)]"
          >
            <span className="flex items-center gap-[clamp(0.3rem,0.6vw,0.45rem)]">
              <svg viewBox="0 0 20 20" className="size-[clamp(0.8rem,1.1vw,0.92rem)] text-[rgba(255,255,227,0.45)]" fill="none" aria-hidden="true">
                <path d="M3 5h14M3 10h14M3 15h8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
              <span className="text-[clamp(0.72rem,1.05vw,0.86rem)] font-medium text-[var(--foreground)]">Kostenaufschlüsselung</span>
              <span className="text-[clamp(0.56rem,0.78vw,0.64rem)] text-[rgba(255,255,227,0.35)]">
                ({breakdownItems.length} {breakdownItems.length === 1 ? "Position" : "Positionen"})
              </span>
            </span>
            <svg viewBox="0 0 16 16" className={`size-[clamp(0.65rem,0.9vw,0.75rem)] text-[rgba(255,255,227,0.4)] transition-transform duration-200 ${detailOpen ? "rotate-180" : ""}`} fill="none" aria-hidden="true">
              <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <div
            id="results-breakdown"
            className={`overflow-hidden transition-all duration-300 ${detailOpen ? "mt-[clamp(0.4rem,0.8vw,0.6rem)] max-h-[80rem] opacity-100" : "max-h-0 opacity-0"}`}
            style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
          >
            <table className="hidden w-full text-[clamp(0.68rem,1vw,0.82rem)] sm:table">
              <thead>
                <tr className="border-b border-[rgba(255,255,227,0.12)] text-left text-[clamp(0.54rem,0.76vw,0.64rem)] font-medium uppercase tracking-[0.06em] text-[rgba(255,255,227,0.38)]">
                  <th className="pb-[clamp(0.25rem,0.45vw,0.35rem)] font-medium">Leistung</th>
                  <th className="pb-[clamp(0.25rem,0.45vw,0.35rem)] text-right font-medium">Min</th>
                  <th className="pb-[clamp(0.25rem,0.45vw,0.35rem)] text-right font-medium">Max</th>
                </tr>
              </thead>
              <tbody>
                {breakdownItems.map((item) => (
                  <tr key={`${item.label}-${item.range[0]}-${item.range[1]}`} className="border-b border-[rgba(255,255,227,0.06)]">
                    <td className="py-[clamp(0.3rem,0.5vw,0.38rem)] text-[rgba(255,255,227,0.62)]">{item.label}</td>
                    <td className="py-[clamp(0.3rem,0.5vw,0.38rem)] text-right tabular-nums text-[rgba(255,255,227,0.75)]">{fmt(item.range[0], currency)}</td>
                    <td className="py-[clamp(0.3rem,0.5vw,0.38rem)] text-right tabular-nums text-[rgba(255,255,227,0.75)]">{fmt(item.range[1], currency)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="text-[clamp(0.74rem,1.08vw,0.9rem)] font-semibold text-[var(--foreground)]">
                  <td className="pt-[clamp(0.35rem,0.6vw,0.48rem)]">Gesamt</td>
                  <td className="pt-[clamp(0.35rem,0.6vw,0.48rem)] text-right tabular-nums">{fmt(priceRange[0], currency)}</td>
                  <td className="pt-[clamp(0.35rem,0.6vw,0.48rem)] text-right tabular-nums">{fmt(priceRange[1], currency)}</td>
                </tr>
              </tfoot>
            </table>
            <div className="flex flex-col gap-[clamp(0.3rem,0.6vw,0.45rem)] sm:hidden">
              {breakdownItems.map((item) => (
                <div key={`m-${item.label}-${item.range[0]}-${item.range[1]}`} className="flex items-center justify-between border-b border-[rgba(255,255,227,0.06)] pb-[clamp(0.3rem,0.55vw,0.4rem)]">
                  <span className="text-[clamp(0.68rem,1vw,0.82rem)] text-[rgba(255,255,227,0.62)]">{item.label}</span>
                  <span className="shrink-0 tabular-nums text-[clamp(0.62rem,0.9vw,0.74rem)] text-[rgba(255,255,227,0.75)]">{fmtRange(item.range, currency)}</span>
                </div>
              ))}
              <div className="flex items-center justify-between pt-[clamp(0.15rem,0.3vw,0.2rem)]">
                <span className="text-[clamp(0.74rem,1.08vw,0.9rem)] font-semibold text-[var(--foreground)]">Gesamt</span>
                <span className="tabular-nums text-[clamp(0.74rem,1.08vw,0.9rem)] font-semibold text-[var(--foreground)]">{fmtRange(priceRange, currency)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col items-center gap-[clamp(0.6rem,1.2vw,0.9rem)] rounded-[1rem] border border-[rgba(255,255,227,0.08)] bg-[rgba(255,255,227,0.015)] px-[clamp(1rem,2vw,1.5rem)] py-[clamp(1rem,2vw,1.5rem)] text-center">
          <p className="text-[clamp(0.72rem,1.05vw,0.86rem)] font-medium text-[var(--foreground)]">
            Nächster Schritt
          </p>
          <p className="max-w-[26rem] text-[clamp(0.58rem,0.82vw,0.68rem)] leading-relaxed text-[rgba(255,255,227,0.45)]">
            Lade dein Ergebnis als PDF herunter oder lass dich unverbindlich
            von einem geprüften Dienstleister beraten.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-[clamp(0.4rem,0.8vw,0.6rem)]">
            <Button variant="primary" size="lg">
              <span className="inline-flex items-center gap-[clamp(0.25rem,0.5vw,0.35rem)]">
                <svg viewBox="0 0 20 20" className="size-[1em]" fill="none" aria-hidden="true">
                  <path d="M10 3v10m0 0l-3.5-3.5M10 13l3.5-3.5M4 17h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                PDF herunterladen
              </span>
            </Button>
            <Button variant="ghost" size="lg">
              Beraten lassen
            </Button>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="pb-[clamp(0.5rem,1vw,0.75rem)] text-center text-[clamp(0.44rem,0.6vw,0.52rem)] leading-relaxed text-[rgba(255,255,227,0.24)]">
          Richtwerte auf Basis von Marktdurchschnittswerten. Tatsächliche
          Kosten können je nach Projektumfang und Anbieter abweichen.
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Overlay                                                       */
/* ------------------------------------------------------------------ */

export function ResultsOverlay({
  priceRange,
  breakdownItems,
  currency,
  onClose,
}: ResultsOverlayProps) {
  const [phase, setPhase] = useState<"contact" | "results">("contact");
  const [phaseAnim, setPhaseAnim] = useState<"idle" | "exiting">("idle");
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (phase === "results") {
          triggerPhase("contact");
        } else {
          onClose();
        }
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [phase, onClose]);

  useEffect(() => {
    overlayRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [phase]);

  const triggerPhase = useCallback((target: "contact" | "results") => {
    setPhaseAnim("exiting");
    setTimeout(() => {
      setPhase(target);
      setPhaseAnim("idle");
    }, 260);
  }, []);

  const handleContactSubmit = useCallback(
    (_data: { name: string; email: string; phone: string; wantContact: boolean }) => {
      triggerPhase("results");
    },
    [triggerPhase],
  );

  const handleBack = () => {
    if (phase === "results") {
      triggerPhase("contact");
      return;
    }
    onClose();
  };

  if (phase === "contact") {
    return (
      <div
        ref={overlayRef}
        id="price-calculator-results-overlay"
        role="region"
        aria-label="Kontaktdaten eingeben"
        className={`relative flex min-h-0 w-full flex-1 flex-col overflow-hidden md:flex-row ${
          phaseAnim === "exiting" ? "opacity-0" : "opacity-100"
        }`}
        style={{ transition: "opacity 260ms cubic-bezier(0.16,1,0.3,1)" }}
      >
        {/* ——— Left half: Matter network + claim ——— */}
        <aside className="relative hidden flex-col justify-end overflow-hidden bg-[var(--background)] md:flex md:w-[48%] md:shrink-0">
          <div className="absolute inset-0 z-0">
            <MatterBackground />
          </div>
          <div
            className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-[rgba(3,15,3,0.72)] via-transparent to-transparent"
            aria-hidden="true"
          />
          <div className="relative z-[2] flex flex-col gap-3 px-[clamp(1.5rem,3vw,2.5rem)] py-[clamp(1.5rem,3.5vw,2.5rem)]">
            <p className="text-[clamp(0.62rem,0.85vw,0.72rem)] font-medium uppercase tracking-[0.14em] text-[rgba(255,255,227,0.4)]">
              Preisrechner
            </p>
            <h2 className="max-w-[18ch] text-[clamp(1.6rem,3.2vw,2.4rem)] font-semibold leading-[1.1] tracking-[-0.02em] text-[var(--foreground)]">
              Lass dich nicht übers Ohr hauen!
            </h2>
            <p className="max-w-[30ch] text-[clamp(0.78rem,1.05vw,0.88rem)] leading-relaxed text-[rgba(255,255,227,0.5)]">
              Wir schicken dir ein individuelles Angebots-PDF – kostenlos und
              unverbindlich.
            </p>
          </div>
        </aside>

        {/* ——— Right half: form ——— */}
        <div className="relative flex min-h-0 flex-1 flex-col overflow-y-auto rounded-[clamp(0.9rem,1.8vw,1.25rem)] bg-[rgba(8,18,8,0.95)] backdrop-blur-xl">
          <div className="sticky left-0 top-0 z-20 flex items-center justify-between px-[clamp(1rem,2vw,1.5rem)] pt-[clamp(1rem,2vw,1.5rem)] pb-[clamp(0.5rem,1.2vw,0.85rem)]">
            <button
              type="button"
              onClick={handleBack}
              aria-label="Zurück zum Rechner"
              className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(255,255,227,0.2)] px-[clamp(0.6rem,1.2vw,0.85rem)] py-[clamp(0.35rem,0.65vw,0.5rem)] text-[clamp(0.68rem,0.95vw,0.78rem)] text-[rgba(255,255,227,0.88)] transition-colors hover:border-[rgba(255,255,227,0.35)] hover:bg-[rgba(255,255,227,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--foreground)]"
            >
              <svg viewBox="0 0 16 16" className="size-[0.85em]" fill="none" aria-hidden="true">
                <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Anpassen</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Preisrechner schließen"
              className="inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-[rgba(255,255,227,0.24)] text-[1rem] text-[rgba(255,255,227,0.9)] transition-colors hover:bg-[rgba(255,255,227,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--foreground)]"
            >
              ×
            </button>
          </div>

          <div className="flex flex-1 items-center justify-center px-[clamp(1.3rem,3vw,2.2rem)] py-[clamp(1rem,2vw,1.5rem)]">
            <ContactGate onSubmit={handleContactSubmit} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={overlayRef}
      id="price-calculator-results-overlay"
      role="region"
      aria-label="Deine Kostenschätzung"
      className="relative flex min-h-0 w-full flex-1 flex-col items-center overflow-y-auto py-[clamp(2.5rem,5vh,3.5rem)]"
    >
      <div className="absolute inset-0 z-0 overflow-hidden">
        <MatterBackground />
      </div>

      <div className="absolute left-0 right-0 z-20 flex items-center justify-between px-[clamp(1rem,2vw,1.5rem)] pt-[clamp(1rem,2vw,1.5rem)]">
        <button
          type="button"
          onClick={handleBack}
          aria-label="Zurück zum Formular"
          className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(255,255,227,0.2)] px-[clamp(0.6rem,1.2vw,0.85rem)] py-[clamp(0.35rem,0.65vw,0.5rem)] text-[clamp(0.68rem,0.95vw,0.78rem)] text-[rgba(255,255,227,0.88)] transition-colors hover:border-[rgba(255,255,227,0.35)] hover:bg-[rgba(255,255,227,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--foreground)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
        >
          <svg viewBox="0 0 16 16" className="size-[0.85em]" fill="none" aria-hidden="true">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>Zurück</span>
        </button>
        <button
          type="button"
          onClick={onClose}
          aria-label="Preisrechner schließen"
          className="inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-[rgba(255,255,227,0.24)] text-[1rem] text-[rgba(255,255,227,0.9)] transition-colors hover:bg-[rgba(255,255,227,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--foreground)]"
        >
          ×
        </button>
      </div>

      <div
        className={`relative z-10 mx-auto flex min-h-0 w-full max-w-[min(50rem,96vw)] flex-1 flex-col items-center justify-center px-[clamp(0.5rem,2vw,1rem)] transition-all duration-[260ms] ${
          phaseAnim === "exiting" ? "scale-[0.97] opacity-0" : "scale-100 opacity-100"
        }`}
        style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
      >
        <ResultsView
          priceRange={priceRange}
          breakdownItems={breakdownItems}
          currency={currency}
        />
      </div>
    </div>
  );
}
