"use client";

import { useEffect, useState } from "react";
import { profile } from "@/content/profile";
import { useActiveSection } from "@/hooks";
import { cn } from "@/lib/utils";
import { Icon } from "./Icon";
import { ThemeToggle } from "./ThemeToggle";

export const navItems = [
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "projects", label: "Projects" },
  { id: "lab", label: "Demos" },
  { id: "credentials", label: "Credentials" },
  { id: "background", label: "Background" },
  { id: "contact", label: "Contact" },
] as const;

const sectionIds = navItems.map((n) => n.id);

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const active = useActiveSection(sectionIds);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onResize = () => window.innerWidth >= 1024 && setOpen(false);
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b transition-colors",
        scrolled || open ? "border-line bg-bg/90 backdrop-blur-md" : "border-transparent bg-bg",
      )}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-md focus:bg-accent focus:px-3 focus:py-2 focus:text-accent-ink"
      >
        Skip to content
      </a>
      <div className="mx-auto flex h-16 max-w-[1160px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <a href="/#top" className="flex items-center gap-2.5 font-semibold tracking-[-0.01em]" onClick={() => setOpen(false)}>
          <Monogram />
          <span className="whitespace-nowrap">{profile.name}</span>
        </a>

        <nav aria-label="Sections" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {navItems.map((item) => (
              <li key={item.id}>
                <a
                  href={`/#${item.id}`}
                  aria-current={active === item.id ? "true" : undefined}
                  className={cn(
                    "relative block whitespace-nowrap rounded-md px-3 py-2 text-[0.9375rem] transition-colors",
                    active === item.id ? "text-ink" : "text-muted hover:text-ink",
                  )}
                >
                  {item.label}
                  <span
                    aria-hidden
                    className={cn(
                      "absolute bottom-0 left-1/2 h-0.5 -translate-x-1/2 rounded-full bg-accent transition-all",
                      active === item.id ? "w-4 opacity-100" : "w-0 opacity-0",
                    )}
                  />
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event("open-command-palette"))}
            aria-label="Quick navigation (Ctrl+K)"
            title="Quick navigation (Ctrl+K)"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-ink"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
          </button>
          <ThemeToggle />
          <a
            href={profile.resume.path}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-1 hidden h-10 items-center gap-2 rounded-lg border border-line-strong px-3.5 text-[0.9375rem] font-medium transition-colors hover:border-accent sm:inline-flex"
          >
            <Icon name="file" size={17} />
            Resume
          </a>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-muted hover:bg-surface-2 hover:text-ink lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <Icon name={open ? "close" : "menu"} size={22} />
          </button>
        </div>
      </div>

      <nav id="mobile-nav" aria-label="Sections" hidden={!open} className="border-t border-line lg:hidden">
        <ul className="mx-auto grid max-w-[1160px] gap-1 px-4 py-3 sm:grid-cols-2 sm:px-6">
          {navItems.map((item) => (
            <li key={item.id}>
              <a
                href={`/#${item.id}`}
                onClick={() => setOpen(false)}
                className={cn(
                  "block rounded-lg px-3 py-3 text-base",
                  active === item.id ? "bg-surface-2 text-ink" : "text-muted hover:bg-surface-2 hover:text-ink",
                )}
              >
                {item.label}
              </a>
            </li>
          ))}
          <li className="sm:hidden">
            <a
              href={profile.resume.path}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 flex items-center gap-2 rounded-lg border border-line-strong px-3 py-3 text-base font-medium"
            >
              <Icon name="file" size={18} />
              Resume (PDF)
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
}

/** A tiny scatter-with-trend glyph: the site's mark. */
function Monogram() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden className="shrink-0">
      <rect x="0.5" y="0.5" width="27" height="27" rx="7" className="fill-surface-2 stroke-line" />
      <path d="M6 20 22 8" className="stroke-accent" strokeWidth="1.75" strokeLinecap="round" />
      <circle cx="8" cy="16" r="1.6" className="fill-viz-2" />
      <circle cx="12" cy="17" r="1.6" className="fill-muted" />
      <circle cx="15" cy="12" r="1.6" className="fill-muted" />
      <circle cx="19.5" cy="12.5" r="1.6" className="fill-viz-3" />
      <circle cx="21" cy="7" r="1.6" className="fill-muted" />
    </svg>
  );
}
