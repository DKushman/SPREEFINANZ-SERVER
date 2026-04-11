"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { DESKTOP_NAV_TAIL, RECHNER_SUBLINKS } from "./headerNav";

function HeaderDesktopPillInner() {
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const shellRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);
  const toggle = useCallback(() => setOpen((o) => !o), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      const el = shellRef.current;
      if (el && !el.contains(e.target as Node)) close();
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    return () =>
      document.removeEventListener("pointerdown", onPointerDown, true);
  }, [open, close]);

  return (
    <div
      ref={shellRef}
      id="preiseberechnen-site-header-pill"
      className="relative z-10 flex w-full min-w-0 flex-col text-[#ffffe3] md:rounded-[clamp(1.15rem,2.2vw,1.75rem)] md:bg-transparent md:px-8 md:pb-3.5 md:pt-3.5"
    >
      <div className="flex w-full min-w-0 items-center justify-between gap-3 py-2 md:py-0 md:preiseberechnen-header-blend md:text-white">
        <div className="flex min-w-0 shrink-0 items-center gap-2 md:gap-3">
          <Link
            href="/"
            id="preiseberechnen-site-header-logo"
            className="inline-flex min-w-0 max-w-[min(100%,70vw)] items-center truncate text-[1.02rem] font-semibold tracking-[0.04em] text-inherit hover:opacity-80"
          >
            Preiseberechnen.
          </Link>
        </div>

        <nav
          id="preiseberechnen-site-header-nav-desktop"
          className="hidden min-w-0 md:block md:flex-1"
          aria-label="Hauptnavigation"
        >
          <ul className="m-0 flex list-none items-center justify-end gap-6 p-0 text-sm font-medium lg:gap-8 lg:text-[0.9375rem]">
            <li className="relative">
              <button
                type="button"
                id="preiseberechnen-header-rechner-trigger"
                className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap border-0 bg-transparent p-0 font-medium text-inherit hover:opacity-80"
                aria-expanded={open}
                aria-controls={panelId}
                aria-haspopup="true"
                onClick={toggle}
              >
                <span
                  aria-hidden
                  className={`text-[0.65em] leading-none opacity-90 transition-transform duration-[300ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${
                    open ? "rotate-180" : ""
                  }`}
                >
                  ▾
                </span>
                Rechner
              </button>
            </li>
            {DESKTOP_NAV_TAIL.slice(0, 2).map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  className="whitespace-nowrap hover:opacity-80"
                >
                  {item.label}
                </a>
              </li>
            ))}
            <li className="opacity-50" aria-hidden>
              |
            </li>
            <li>
              <a
                href={DESKTOP_NAV_TAIL[2].href}
                className="whitespace-nowrap hover:opacity-80"
              >
                {DESKTOP_NAV_TAIL[2].label}
              </a>
            </li>
          </ul>
        </nav>

        <label
          htmlFor="preiseberechnen-nav-toggle"
          id="preiseberechnen-site-header-burger"
          className="inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-inherit hover:opacity-80 md:hidden"
          aria-label="Menü öffnen"
        >
          <span
            className="flex w-[1.35rem] flex-col justify-center gap-[0.32rem]"
            aria-hidden
          >
            <span className="h-[2px] w-full rounded-full bg-current" />
            <span className="h-[2px] w-full rounded-full bg-current" />
            <span className="h-[2px] w-full rounded-full bg-current" />
          </span>
        </label>
      </div>

      <div
        id={panelId}
        role="region"
        aria-label="Preisrechner"
        className={`hidden text-[#ffffe3] md:block ${
          open
            ? "pointer-events-auto max-h-52 opacity-100"
            : "pointer-events-none max-h-0 opacity-0"
        } overflow-hidden transition-[max-height,opacity] duration-[300ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none motion-reduce:duration-0`}
        aria-hidden={!open}
        inert={!open}
      >
        <ul className="m-0 flex list-none flex-col gap-1 py-3 pl-0 pr-0">
          {RECHNER_SUBLINKS.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="block rounded-md py-1.5 text-left text-sm font-medium text-[#ffffe3] hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffffe3] focus-visible:ring-offset-2 focus-visible:ring-offset-[#030F03]/40"
                onClick={close}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/** Remount bei Routenwechsel → Menü zu, ohne setState in useEffect. */
export function HeaderDesktopPill() {
  const pathname = usePathname();
  return <HeaderDesktopPillInner key={pathname} />;
}
