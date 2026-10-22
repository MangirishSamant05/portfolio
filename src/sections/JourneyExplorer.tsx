"use client";

import Link from "next/link";
import { useState } from "react";
import type { JourneyStage, Skill } from "@/types/content";
import { useInViewOnce } from "@/hooks";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/Icon";
import { Tag } from "@/components/ui";

interface Props {
  stages: JourneyStage[];
  skills: Record<string, Skill>;
  projectTitles: Record<string, string>;
}

/** The eight-stage workflow. Lights up in order when scrolled into view; each stage opens its evidence. */
export function JourneyExplorer({ stages, skills, projectTitles }: Props) {
  const [selected, setSelected] = useState(0);
  const [ref, seen] = useInViewOnce<HTMLOListElement>();
  const stage = stages[selected];
  const evidence = stage.evidence.filter((e) => projectTitles[e.project]);

  return (
    <div>
      <ol ref={ref} className="relative grid grid-cols-4 gap-x-2 gap-y-5 lg:grid-cols-8">
        {/* Connector, drawn behind the markers on wide screens */}
        <span aria-hidden className="absolute left-[6.25%] right-[6.25%] top-[18px] hidden h-px bg-line lg:block" />
        <span
          aria-hidden
          className="absolute left-[6.25%] top-[18px] hidden h-px bg-accent transition-[width] duration-[1600ms] ease-out lg:block"
          style={{ width: seen ? "87.5%" : "0%" }}
        />
        {stages.map((s, i) => {
          const isSelected = i === selected;
          return (
            <li key={s.id} className="relative">
              <button
                type="button"
                onClick={() => setSelected(i)}
                aria-pressed={isSelected}
                aria-controls="journey-detail"
                className="group flex w-full flex-col items-center gap-2 rounded-lg px-1 pb-2 text-center"
              >
                <span
                  className={cn(
                    "relative z-10 flex h-9 w-9 items-center justify-center rounded-full border text-sm font-medium tabular transition-all duration-500",
                    isSelected
                      ? "border-accent bg-accent text-accent-ink"
                      : seen
                        ? "border-accent/60 bg-surface text-ink group-hover:border-accent"
                        : "border-line bg-surface text-faint",
                  )}
                  style={{ transitionDelay: seen && !isSelected ? `${i * 160}ms` : "0ms" }}
                >
                  {i + 1}
                </span>
                <span
                  className={cn(
                    "text-[0.8125rem] leading-snug sm:text-sm",
                    isSelected ? "font-medium text-ink" : "text-muted group-hover:text-ink",
                  )}
                >
                  {s.title}
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      <div
        id="journey-detail"
        aria-live="polite"
        className="mt-8 grid gap-8 rounded-xl border border-line bg-surface p-5 sm:p-7 md:grid-cols-[1fr_1.3fr]"
      >
        <div>
          <p className="text-sm text-faint tabular">
            Stage {selected + 1} of {stages.length}
          </p>
          <h3 className="mt-1 text-xl font-semibold tracking-[-0.01em]">{stage.title}</h3>
          <p className="mt-2 leading-relaxed text-muted">{stage.summary}</p>
          <ul className="mt-5 flex flex-wrap gap-2" aria-label="Tools used at this stage">
            {stage.skills.map((id) => (
              <li key={id}>
                <Tag>{skills[id]?.name ?? id}</Tag>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-sm text-faint">Where I&apos;ve done this</h4>
          <ul className="mt-3 divide-y divide-line">
            {evidence.map((e) => (
              <li key={e.project + e.note}>
                <Link
                  href={`/projects/${e.project}`}
                  className="group flex items-start justify-between gap-4 py-3"
                >
                  <span>
                    <span className="block font-medium group-hover:text-accent">{projectTitles[e.project]}</span>
                    <span className="mt-0.5 block text-[0.9375rem] text-muted">{e.note}</span>
                  </span>
                  <Icon name="arrowRight" size={17} className="mt-1 shrink-0 text-faint group-hover:text-accent" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
