"use client";

import { useState, type FormEvent } from "react";
import { Icon } from "@/components/Icon";

type Status = { state: "idle" } | { state: "sending" } | { state: "sent" } | { state: "error"; message: string };

/**
 * Only rendered when NEXT_PUBLIC_CONTACT_FORM_ENDPOINT is set. Posts JSON to
 * that endpoint (Formspree and similar services accept this) and reports the
 * real result — it never claims a message was sent when it wasn't.
 */
export function ContactForm({ endpoint, fallbackEmail }: { endpoint: string; fallbackEmail: string }) {
  const [status, setStatus] = useState<Status>({ state: "idle" });

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    if (data._gotcha) return; // honeypot filled in: almost certainly a bot
    setStatus({ state: "sending" });
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(`The form service responded with ${res.status}.`);
      form.reset();
      setStatus({ state: "sent" });
    } catch (err) {
      setStatus({
        state: "error",
        message: err instanceof Error ? err.message : "The message couldn't be sent.",
      });
    }
  }

  const field =
    "mt-1.5 w-full rounded-lg border border-line-strong bg-bg px-3.5 py-2.5 text-[0.9375rem] text-ink placeholder:text-faint focus:border-accent focus:outline-none";

  if (status.state === "sent") {
    return (
      <div className="rounded-xl border border-line bg-surface p-6" role="status">
        <p className="flex items-center gap-2 font-medium">
          <Icon name="check" size={18} className="text-accent" />
          Message sent
        </p>
        <p className="mt-2 text-muted">Thanks — I&apos;ll reply to the email address you gave.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="rounded-xl border border-line bg-surface p-5 sm:p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm text-muted">
          Name
          <input name="name" required autoComplete="name" className={field} />
        </label>
        <label className="block text-sm text-muted">
          Email
          <input name="email" type="email" required autoComplete="email" className={field} />
        </label>
      </div>
      <label className="mt-4 block text-sm text-muted">
        Message
        <textarea name="message" required rows={5} className={field} />
      </label>
      <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <div className="mt-5 flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={status.state === "sending"}
          className="inline-flex h-11 items-center gap-2 rounded-lg bg-accent px-5 text-[0.9375rem] font-medium text-accent-ink hover:brightness-110 disabled:opacity-60"
        >
          {status.state === "sending" ? "Sending…" : "Send message"}
        </button>
        {status.state === "error" && (
          <p role="alert" className="text-sm text-viz-4">
            {status.message} You can email me directly at{" "}
            <a className="underline" href={`mailto:${fallbackEmail}`}>
              {fallbackEmail}
            </a>
            .
          </p>
        )}
      </div>
    </form>
  );
}
