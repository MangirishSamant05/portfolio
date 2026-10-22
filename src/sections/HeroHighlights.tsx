"use client";

import { useEffect, useState } from "react";
import { profile } from "@/content/profile";
import { useInViewOnce, usePrefersReducedMotion } from "@/hooks";

type Highlight = (typeof profile.highlights)[number];

/** The resume's headline numbers, counting up once when they come into view. */
export function HeroHighlights() {
  const [ref, seen] = useInViewOnce<HTMLUListElement>("0px");
  const reduced = usePrefersReducedMotion();
  const [t, setT] = useState(0);

  useEffect(() => {
    if (!seen) return;
    if (reduced) {
      setT(1);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / 1400);
      setT(1 - Math.pow(1 - p, 3));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [seen, reduced]);

  return (
    <ul ref={ref} aria-label="Highlights" className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-4">
      {profile.highlights.map((h: Highlight) => {
        const decimals = "decimals" in h ? h.decimals : 0;
        const suffix = "suffix" in h ? h.suffix : "";
        const shown = (h.value * t).toFixed(decimals);
        return (
          <li key={h.label} className="bg-surface"><a href={h.href} className="group flex h-full flex-col px-4 py-3.5 transition-colors hover:bg-surface-2">
            <span className="block font-mono text-2xl font-medium tabular sm:text-[1.75rem]">
              {shown}
              {suffix}
              {/* Real value for screen readers and crawlers, independent of the animation. */}
              <span className="sr-only">
                {" "}
                ({h.value}
                {suffix})
              </span>
            </span>
            <span className="mt-1 block text-[0.8125rem] leading-snug text-muted group-hover:text-ink">{h.label}</span>
          </a></li>
        );
      })}
    </ul>
  );
}
