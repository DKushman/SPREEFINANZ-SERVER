"use client";

import { useId, useState } from "react";
import { Button } from "../components/Button";

export function ContactForm() {
  const formId = useId();
  const [status, setStatus] = useState<
    "idle" | "sending" | "success" | "error" | "not_configured"
  >("idle");
  const [errorDetail, setErrorDetail] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setErrorDetail(null);
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") ?? "").trim();
    const email = String(fd.get("email") ?? "").trim();
    const message = String(fd.get("message") ?? "").trim();

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };

      if (res.ok && data.ok) {
        setStatus("success");
        e.currentTarget.reset();
        return;
      }
      if (res.status === 503 && data.error === "not_configured") {
        setStatus("not_configured");
        return;
      }
      setStatus("error");
      setErrorDetail(data.error ?? `HTTP ${res.status}`);
    } catch {
      setStatus("error");
      setErrorDetail("network");
    }
  }

  const fieldClass =
    "w-full rounded-[clamp(0.4rem,1vw,0.55rem)] border border-[rgba(255,255,227,0.22)] bg-[rgba(255,255,227,0.06)] px-[clamp(0.65rem,1.5vw,0.85rem)] py-[clamp(0.55rem,1.2vw,0.7rem)] text-[clamp(0.9rem,1.5vw,1rem)] text-[#ffffe3] placeholder:text-[rgba(255,255,227,0.4)] outline-none focus-visible:ring-2 focus-visible:ring-[#ffffe3] focus-visible:ring-offset-2 focus-visible:ring-offset-[#030F03]";

  const labelClass =
    "block text-[clamp(0.82rem,1.35vw,0.92rem)] font-medium text-[rgba(255,255,227,0.88)]";

  return (
    <form
      id="preiseberechnen-kontakt-form"
      className="flex max-w-[min(32rem,100%)] flex-col gap-[clamp(0.85rem,2vw,1.1rem)]"
      onSubmit={handleSubmit}
      noValidate
    >
      <div id="preiseberechnen-kontakt-field-name-wrap">
        <label
          id="preiseberechnen-kontakt-label-name"
          htmlFor={`${formId}-name`}
          className={labelClass}
        >
          Name
        </label>
        <input
          id={`${formId}-name`}
          name="name"
          type="text"
          autoComplete="name"
          className={`${fieldClass} mt-1.5`}
        />
      </div>
      <div id="preiseberechnen-kontakt-field-email-wrap">
        <label
          id="preiseberechnen-kontakt-label-email"
          htmlFor={`${formId}-email`}
          className={labelClass}
        >
          E-Mail <span className="text-[rgba(255,255,227,0.55)]">(Pflicht)</span>
        </label>
        <input
          id={`${formId}-email`}
          name="email"
          type="email"
          required
          autoComplete="email"
          className={`${fieldClass} mt-1.5`}
        />
      </div>
      <div id="preiseberechnen-kontakt-field-message-wrap">
        <label
          id="preiseberechnen-kontakt-label-message"
          htmlFor={`${formId}-message`}
          className={labelClass}
        >
          Nachricht <span className="text-[rgba(255,255,227,0.55)]">(Pflicht)</span>
        </label>
        <textarea
          id={`${formId}-message`}
          name="message"
          required
          rows={6}
          minLength={5}
          className={`${fieldClass} mt-1.5 min-h-[8rem] resize-y`}
        />
      </div>

      {status === "success" && (
        <p
          id="preiseberechnen-kontakt-feedback-success"
          role="status"
          className="text-[clamp(0.88rem,1.45vw,0.98rem)] text-[rgba(255,255,227,0.85)]"
        >
          Danke – deine Nachricht wurde übermittelt.
        </p>
      )}
      {status === "not_configured" && (
        <p
          id="preiseberechnen-kontakt-feedback-not-configured"
          role="alert"
          className="text-[clamp(0.88rem,1.45vw,0.98rem)] text-[rgba(255,255,227,0.78)]"
        >
          Das Kontaktformular ist technisch noch nicht mit dem Server verbunden.
          Bitte schreib uns vorerst an{" "}
          <a
            id="preiseberechnen-kontakt-mailto-fallback"
            href="mailto:info@preiseberechnen.de"
            className="text-[#ffffe3] underline underline-offset-4 decoration-[rgba(255,255,227,0.35)] outline-none hover:decoration-[#ffffe3] focus-visible:ring-2 focus-visible:ring-[#ffffe3] focus-visible:ring-offset-2 focus-visible:ring-offset-[#030F03] rounded-sm"
          >
            info@preiseberechnen.de
          </a>
          . (Entwickler: Umgebungsvariable{" "}
          <code className="rounded bg-[rgba(255,255,227,0.1)] px-1 text-[0.88em]">
            CONTACT_FORWARD_URL
          </code>{" "}
          setzen.)
        </p>
      )}
      {status === "error" && (
        <p
          id="preiseberechnen-kontakt-feedback-error"
          role="alert"
          className="text-[clamp(0.88rem,1.45vw,0.98rem)] text-[rgba(255,200,200,0.9)]"
        >
          Senden fehlgeschlagen. Bitte versuche es erneut oder nutze die E-Mail.
          {errorDetail ? ` (${errorDetail})` : ""}
        </p>
      )}

      <div id="preiseberechnen-kontakt-actions">
        <Button
          id="preiseberechnen-kontakt-submit"
          type="submit"
          size="md"
          variant="primary"
          disabled={status === "sending"}
          className={status === "sending" ? "pointer-events-none opacity-70" : ""}
        >
          {status === "sending" ? "Wird gesendet…" : "Absenden"}
        </Button>
      </div>
    </form>
  );
}
