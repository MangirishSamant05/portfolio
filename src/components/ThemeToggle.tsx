"use client";

import { useEffect, useState } from "react";
import { Icon } from "./Icon";
import { THEME_STORAGE_KEY } from "@/lib/theme";

type Theme = "light" | "dark";

function currentTheme(): Theme {
  return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
}

/** Flips the theme, remembers it, and tells other components. Also used by the command palette. */
export function toggleTheme(): Theme {
  const next: Theme = currentTheme() === "light" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", next);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, next);
  } catch {
    // Private mode or blocked storage: the choice just won't be remembered.
  }
  window.dispatchEvent(new CustomEvent("themechange", { detail: next }));
  return next;
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    setTheme(currentTheme());
    const sync = () => setTheme(currentTheme());
    window.addEventListener("themechange", sync);
    return () => window.removeEventListener("themechange", sync);
  }, []);

  function toggle() {
    setTheme(toggleTheme());
  }

  const label = theme === "light" ? "Switch to dark theme" : "Switch to light theme";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-ink"
    >
      {/* Render both and hide one with CSS so the icon is right before hydration. */}
      <Icon name="sun" className="hidden dark:block" />
      <Icon name="moon" className="block dark:hidden" />
    </button>
  );
}
