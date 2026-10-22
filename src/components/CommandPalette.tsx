"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { profile } from "@/content/profile";
import { getProjects } from "@/lib/content";
import { cn } from "@/lib/utils";
import { Icon, type IconName } from "./Icon";
import { toggleTheme } from "./ThemeToggle";

interface Command {
  id: string;
  group: "Go to" | "Projects" | "Actions";
  label: string;
  hint?: string;
  icon: IconName;
  keywords?: string;
  run: () => void | string;
}

const SECTIONS: [string, string][] = [
  ["top", "Home"],
  ["about", "About"],
  ["workflow", "How I work"],
  ["skills", "Skills"],
  ["projects", "Projects"],
  ["results", "Results"],
  ["lab", "Live demos"],
  ["credentials", "Certifications"],
  ["background", "Education & leadership"],
  ["contact", "Contact"],
];

function go(href: string) {
  window.location.href = href;
}

/** Quick navigation and actions. Opens with Ctrl+K / ⌘K or the button in the header. */
export function CommandPalette() {
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [toast, setToast] = useState("");

  const commands = useMemo<Command[]>(() => {
    const onHome = () => typeof window !== "undefined" && window.location.pathname === "/";
    return [
      ...SECTIONS.map(([id, label]) => ({
        id: `s-${id}`,
        group: "Go to" as const,
        label,
        icon: "arrowRight" as IconName,
        run: () => go(onHome() ? `#${id}` : `/#${id}`),
      })),
      ...getProjects().map((p) => ({
        id: `p-${p.slug}`,
        group: "Projects" as const,
        label: p.title,
        hint: p.categories.join(", "),
        icon: "file" as IconName,
        keywords: p.stack.join(" "),
        run: () => go(`/projects/${p.slug}/`),
      })),
      {
        id: "a-email",
        group: "Actions",
        label: "Copy email address",
        hint: profile.email,
        icon: "copy",
        run: () => {
          navigator.clipboard?.writeText(profile.email).catch(() => undefined);
          return `Copied ${profile.email}`;
        },
      },
      { id: "a-resume", group: "Actions", label: "Download resume (PDF)", icon: "download", run: () => go(profile.resume.path) },
      { id: "a-gh", group: "Actions", label: "Open GitHub", icon: "github", run: () => void window.open(profile.links.github, "_blank", "noopener") },
      { id: "a-li", group: "Actions", label: "Open LinkedIn", icon: "linkedin", run: () => void window.open(profile.links.linkedin, "_blank", "noopener") },
      { id: "a-mail", group: "Actions", label: "Write an email", icon: "mail", run: () => go(`mailto:${profile.email}`) },
      { id: "a-theme", group: "Actions", label: "Switch light / dark theme", icon: "sun", keywords: "dark light mode", run: () => void toggleTheme() },
    ];
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    const words = q.split(/\s+/);
    return commands.filter((c) => {
      const hay = `${c.label} ${c.hint ?? ""} ${c.keywords ?? ""} ${c.group}`.toLowerCase();
      return words.every((w) => hay.includes(w));
    });
  }, [commands, query]);

  const open = useCallback(() => {
    setQuery("");
    setActive(0);
    setToast("");
    dialog.current?.showModal();
    requestAnimationFrame(() => input.current?.focus());
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (dialog.current?.open) dialog.current.close();
        else open();
      }
    };
    const onOpen = () => open();
    window.addEventListener("keydown", onKey);
    window.addEventListener("open-command-palette", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("open-command-palette", onOpen);
    };
  }, [open]);

  useEffect(() => setActive(0), [query]);

  function run(c: Command | undefined) {
    if (!c) return;
    const message = c.run();
    if (typeof message === "string") {
      setToast(message);
      setTimeout(() => dialog.current?.close(), 900);
    } else {
      dialog.current?.close();
    }
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(results.length - 1, a + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      run(results[active]);
    }
  }

  useEffect(() => {
    document.getElementById(`cmd-${results[active]?.id}`)?.scrollIntoView({ block: "nearest" });
  }, [active, results]);

  let lastGroup = "";
  return (
    <dialog
      ref={dialog}
      aria-label="Quick navigation"
      onClick={(e) => e.target === dialog.current && dialog.current?.close()}
      className="m-auto mt-[12vh] w-[min(36rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-line-strong bg-surface p-0 text-ink shadow-card backdrop:bg-black/50 backdrop:backdrop-blur-[2px]"
    >
      <div className="flex items-center gap-3 border-b border-line px-4">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-faint" aria-hidden>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          ref={input}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          role="combobox"
          aria-expanded="true"
          aria-controls="cmd-list"
          aria-activedescendant={results[active] ? `cmd-${results[active].id}` : undefined}
          placeholder="Jump to a section, project or action…"
          className="h-14 w-full bg-transparent text-[1.0625rem] outline-none placeholder:text-faint"
        />
        <kbd className="hidden rounded border border-line px-1.5 py-0.5 font-mono text-[0.75rem] text-faint sm:block">Esc</kbd>
      </div>
      {toast ? (
        <p className="flex items-center gap-2 px-5 py-6 text-accent" role="status">
          <Icon name="check" size={18} />
          {toast}
        </p>
      ) : (
        <ul id="cmd-list" role="listbox" className="max-h-[min(60vh,26rem)] overflow-y-auto p-2">
          {results.length === 0 && <li className="px-3 py-6 text-center text-muted">No matches. Try “spark”, “nlp” or “resume”.</li>}
          {results.map((c, i) => {
            const header = c.group !== lastGroup ? c.group : null;
            lastGroup = c.group;
            return (
              <li key={c.id} role="presentation">
                {header && <p className="px-3 pb-1 pt-3 text-[0.75rem] font-medium uppercase tracking-wider text-faint">{header}</p>}
                <div
                  id={`cmd-${c.id}`}
                  role="option"
                  aria-selected={i === active}
                  onMouseMove={() => setActive(i)}
                  onClick={() => run(c)}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5",
                    i === active ? "bg-accent-soft text-ink" : "text-muted",
                  )}
                >
                  <Icon name={c.icon} size={17} className="shrink-0" />
                  <span className="min-w-0 flex-1 truncate">{c.label}</span>
                  {c.hint && <span className="hidden max-w-[45%] truncate text-sm text-faint sm:block">{c.hint}</span>}
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <p className="flex gap-4 border-t border-line px-4 py-2.5 text-[0.75rem] text-faint">
        <span>
          <kbd className="font-mono">↑↓</kbd> move
        </span>
        <span>
          <kbd className="font-mono">Enter</kbd> open
        </span>
        <span>
          <kbd className="font-mono">Ctrl / ⌘ K</kbd> toggle
        </span>
      </p>
    </dialog>
  );
}
