"use client";

import { useState } from "react";
import { profile, site } from "@/content/profile";
import { Section } from "@/components/ui";
import { Icon, type IconName } from "@/components/Icon";
import { ContactForm } from "./ContactForm";

export function Contact() {
  const hasForm = Boolean(site.contactFormEndpoint);
  return (
    <Section
      id="contact"
      title="Get in touch"
      intro="Open to data analyst, data engineer and data scientist internships and roles. Email is the quickest way to reach me."
    >
      <div className={hasForm ? "grid gap-8 lg:grid-cols-[1fr_1.3fr]" : "max-w-xl"}>
        <div>
          <CopyEmail email={profile.email} />
          <ul className="mt-4 divide-y divide-line rounded-xl border border-line bg-surface">
            <ContactRow icon="linkedin" label="LinkedIn" value="mangirish-samant" href={profile.links.linkedin} />
            <ContactRow icon="github" label="GitHub" value={profile.githubUsername} href={profile.links.github} />
            <ContactRow icon="mapPin" label="Location" value={profile.location} />
            <ContactRow icon="file" label="Resume" value="Download PDF" href={profile.resume.path} />
          </ul>
        </div>
        {hasForm && <ContactForm endpoint={site.contactFormEndpoint} fallbackEmail={profile.email} />}
      </div>
    </Section>
  );
}

function CopyEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.location.href = `mailto:${email}`;
    }
  }
  return (
    <div className="flex flex-wrap items-center gap-3">
      <a
        href={`mailto:${email}`}
        className="inline-flex h-11 items-center gap-2 rounded-lg bg-accent px-4 text-[0.9375rem] font-medium text-accent-ink hover:brightness-110"
      >
        <Icon name="mail" size={17} />
        {email}
      </a>
      <button
        type="button"
        onClick={copy}
        className="inline-flex h-11 items-center gap-2 rounded-lg border border-line-strong px-3.5 text-[0.9375rem] text-muted hover:border-accent hover:text-ink"
      >
        <Icon name={copied ? "check" : "copy"} size={17} />
        <span aria-live="polite">{copied ? "Copied" : "Copy address"}</span>
      </button>
    </div>
  );
}

function ContactRow({ icon, label, value, href }: { icon: IconName; label: string; value: string; href?: string }) {
  const inner = (
    <>
      <Icon name={icon} size={18} className="shrink-0 text-faint" />
      <span className="w-20 shrink-0 text-sm text-faint">{label}</span>
      <span className="min-w-0 flex-1 truncate">{value}</span>
      {href && <Icon name="arrowUpRight" size={16} className="shrink-0 text-faint" />}
    </>
  );
  return (
    <li>
      {href ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-3.5 hover:bg-surface-2">
          {inner}
        </a>
      ) : (
        <div className="flex items-center gap-3 px-4 py-3.5">{inner}</div>
      )}
    </li>
  );
}
