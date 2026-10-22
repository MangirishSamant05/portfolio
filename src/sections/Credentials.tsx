"use client";

import { useEffect, useRef, useState } from "react";
import type { Badge, Certification } from "@/types/content";
import { formatDate } from "@/lib/utils";
import { Icon } from "@/components/Icon";
import { Tag } from "@/components/ui";

export function CertificateGallery({ items }: { items: Certification[] }) {
  const [open, setOpen] = useState<Certification | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <>
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((cert) => (
          <li key={cert.id}>
            <button
              type="button"
              onClick={() => setOpen(cert)}
              aria-haspopup="dialog"
              className="group flex h-full w-full flex-col overflow-hidden rounded-xl border border-line bg-surface text-left transition-colors hover:border-line-strong"
            >
              <span className="block aspect-[4/3] overflow-hidden border-b border-line bg-surface-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cert.image}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.02]"
                />
              </span>
              <span className="flex flex-1 flex-col p-4">
                <span className="font-medium leading-snug">{cert.title}</span>
                <span className="mt-1 text-sm text-muted">{cert.issuer}</span>
                <span className="mt-auto flex items-center justify-between pt-3 text-sm text-faint">
                  <span>{formatDate(cert.date) ?? "Date not listed"}</span>
                  {cert.verifyUrl && (
                    <span className="inline-flex items-center gap-1 text-accent">
                      <Icon name="shield" size={15} />
                      Verifiable
                    </span>
                  )}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        onClose={() => setOpen(null)}
        onClick={(e) => {
          // Clicking the backdrop (the dialog element itself) closes it.
          if (e.target === e.currentTarget) setOpen(null);
        }}
        aria-labelledby="cert-dialog-title"
        className="m-auto w-[min(56rem,calc(100vw-2rem))] max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-2xl border border-line bg-surface p-0 text-ink shadow-card backdrop:bg-black/60 backdrop:backdrop-blur-sm"
      >
        {open && (
          <div className="grid md:grid-cols-[1.4fr_1fr]">
            <div className="border-b border-line bg-surface-2 p-4 md:border-b-0 md:border-r">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={open.image} alt={`${open.title} certificate issued to Mangirish Samant`} className="w-full rounded-lg" />
            </div>
            <div className="flex flex-col p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <h3 id="cert-dialog-title" className="text-xl font-semibold leading-snug">
                  {open.title}
                </h3>
                <button
                  type="button"
                  onClick={() => setOpen(null)}
                  aria-label="Close"
                  className="-mr-2 -mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-surface-2 hover:text-ink"
                >
                  <Icon name="close" size={20} />
                </button>
              </div>
              <dl className="mt-4 space-y-3 text-[0.9375rem]">
                <Detail label="Issued by" value={open.issuer} />
                <Detail label="Date" value={formatDate(open.date) ?? "Not listed on the certificate"} />
                {open.credentialId && <Detail label="Credential ID" value={open.credentialId} mono />}
                {open.note && <Detail label="Note" value={open.note} />}
              </dl>
              {open.skills.length > 0 && (
                <ul className="mt-5 flex flex-wrap gap-2" aria-label="Topics covered">
                  {open.skills.map((s) => (
                    <li key={s}>
                      <Tag>{s}</Tag>
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-auto flex flex-wrap gap-3 pt-6">
                {open.verifyUrl && (
                  <a
                    href={open.verifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-10 items-center gap-2 rounded-lg bg-accent px-4 text-[0.9375rem] font-medium text-accent-ink hover:brightness-110"
                  >
                    <Icon name="shield" size={17} />
                    Verify credential
                  </a>
                )}
                {open.file && (
                  <a
                    href={open.file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-10 items-center gap-2 rounded-lg border border-line-strong px-4 text-[0.9375rem] font-medium hover:border-accent"
                  >
                    <Icon name="file" size={17} />
                    Open PDF
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}

function Detail({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="grid grid-cols-[7rem_1fr] gap-3">
      <dt className="text-faint">{label}</dt>
      <dd className={mono ? "font-mono" : undefined}>{value}</dd>
    </div>
  );
}

export function BadgeGrid({ badges }: { badges: Badge[] }) {
  const topics = Array.from(new Set(badges.map((b) => b.topic)));
  return (
    <div className="space-y-8">
      {topics.map((topic) => {
        const group = badges.filter((b) => b.topic === topic);
        return (
          <div key={topic}>
            <h4 className="text-[0.9375rem] font-medium">
              {topic} <span className="font-normal text-faint tabular">({group.length})</span>
            </h4>
            <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {group.map((badge) => (
                <li key={badge.id}>
                  <a
                    href={badge.verifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-full items-center gap-3.5 rounded-xl border border-line bg-surface p-3 transition-colors hover:border-line-strong"
                  >
                    <BadgeImage src={badge.image} />
                    <span className="min-w-0">
                      <span className="block text-[0.9375rem] font-medium leading-snug">{badge.title}</span>
                      <span className="mt-0.5 block text-[0.8125rem] text-faint">
                        {badge.issuer}, {formatDate(badge.date)}
                      </span>
                    </span>
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

function BadgeImage({ src }: { src: string }) {
  const [failed, setFailed] = useState(false);
  const ref = useRef<HTMLImageElement>(null);
  // An image that failed before hydration never fires onError in React, so check once on mount.
  useEffect(() => {
    const img = ref.current;
    if (img && img.complete && img.naturalWidth === 0) setFailed(true);
  }, []);
  if (failed) {
    return (
      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-surface-2 text-faint">
        <Icon name="award" size={24} />
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={ref}
      src={src}
      alt=""
      width={56}
      height={56}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className="h-14 w-14 shrink-0 object-contain"
    />
  );
}
