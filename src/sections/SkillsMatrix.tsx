"use client";

import Link from "next/link";
import { useState } from "react";
import type { Skill, SkillTrack } from "@/types/content";
import { cn } from "@/lib/utils";

interface TrackData {
  track: { id: SkillTrack; name: string; description: string };
  evidenced: { skill: Skill; projects: string[] }[];
  other: Skill[];
}

interface Props {
  tracks: TrackData[];
  projects: { slug: string; shortTitle: string }[];
}

/**
 * Skills as evidence, not percentages: each row is a skill from the resume,
 * each column a project, and a mark means the project used it.
 */
export function SkillsMatrix({ tracks, projects }: Props) {
  const [active, setActive] = useState<SkillTrack>(tracks[0].track.id);
  const [hoverCol, setHoverCol] = useState<string | null>(null);
  const current = tracks.find((t) => t.track.id === active) ?? tracks[0];

  return (
    <div>
      <div role="tablist" aria-label="Skill areas" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:px-0">
        {tracks.map(({ track, evidenced, other }) => {
          const selected = track.id === active;
          return (
            <button
              key={track.id}
              type="button"
              role="tab"
              id={`tab-${track.id}`}
              aria-selected={selected}
              aria-controls="skills-panel"
              onClick={() => setActive(track.id)}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2 text-[0.9375rem] transition-colors",
                selected ? "border-accent bg-accent-soft text-ink" : "border-line text-muted hover:border-line-strong hover:text-ink",
              )}
            >
              {track.name}
              <span className="ml-2 text-sm text-faint tabular">{evidenced.length + other.length}</span>
            </button>
          );
        })}
      </div>

      <div
        id="skills-panel"
        role="tabpanel"
        aria-labelledby={`tab-${active}`}
        className="mt-6 overflow-hidden rounded-xl border border-line bg-surface"
      >
        <p className="border-b border-line px-5 py-3 text-[0.9375rem] text-muted">{current.track.description}</p>

        {current.evidenced.length > 0 && (
          <>
            {/* Matrix on tablet and up */}
            <table className="hidden w-full border-collapse text-left md:table">
              <caption className="sr-only">
                {current.track.name} skills and the projects that used them
              </caption>
              <thead>
                <tr className="border-b border-line">
                  <th scope="col" className="px-5 py-3 text-sm font-normal text-faint">
                    Skill
                  </th>
                  {projects.map((p) => (
                    <th
                      key={p.slug}
                      scope="col"
                      className={cn(
                        "px-2 py-3 text-center text-[0.8125rem] font-normal leading-tight transition-colors",
                        hoverCol === p.slug ? "text-ink" : "text-faint",
                      )}
                      onMouseEnter={() => setHoverCol(p.slug)}
                      onMouseLeave={() => setHoverCol(null)}
                    >
                      <Link href={`/projects/${p.slug}`} className="hover:text-accent">
                        {p.shortTitle}
                      </Link>
                    </th>
                  ))}
                  <th scope="col" className="px-5 py-3 text-right text-sm font-normal text-faint">
                    Projects
                  </th>
                </tr>
              </thead>
              <tbody>
                {current.evidenced.map(({ skill, projects: used }) => (
                  <tr key={skill.id} className="group border-b border-line last:border-0 hover:bg-surface-2">
                    <th scope="row" className="px-5 py-2.5 text-[0.9375rem] font-medium">
                      {skill.name}
                    </th>
                    {projects.map((p) => {
                      const on = used.includes(p.slug);
                      return (
                        <td
                          key={p.slug}
                          className={cn("px-2 py-2.5 text-center", hoverCol === p.slug && "bg-surface-2")}
                          onMouseEnter={() => setHoverCol(p.slug)}
                          onMouseLeave={() => setHoverCol(null)}
                        >
                          {on ? (
                            <span className="inline-block h-3 w-3 rounded-full bg-accent" title={`${skill.name} — ${p.shortTitle}`}>
                              <span className="sr-only">Used</span>
                            </span>
                          ) : (
                            <span aria-hidden className="inline-block h-1 w-1 rounded-full bg-line-strong" />
                          )}
                        </td>
                      );
                    })}
                    <td className="px-5 py-2.5 text-right text-sm text-muted tabular">{used.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Compact list on phones */}
            <ul className="divide-y divide-line md:hidden">
              {current.evidenced.map(({ skill, projects: used }) => (
                <li key={skill.id} className="px-5 py-3">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="font-medium">{skill.name}</span>
                    <span className="text-sm text-faint tabular">
                      {used.length} {used.length === 1 ? "project" : "projects"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted">
                    {used.map((slug) => projects.find((p) => p.slug === slug)?.shortTitle).join(", ")}
                  </p>
                </li>
              ))}
            </ul>
          </>
        )}

        {current.other.length > 0 && (
          <div className="border-t border-line px-5 py-4">
            <p className="text-sm text-faint">Also in my toolkit</p>
            <p className="mt-1 text-[0.9375rem] text-muted">{current.other.map((s) => s.name).join(", ")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
