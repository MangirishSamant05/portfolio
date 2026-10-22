"use client";

import { useMemo, useState } from "react";
import type { Project, ProjectCategory } from "@/types/content";
import { cn } from "@/lib/utils";
import { ProjectCard } from "./ProjectCard";

interface Props {
  projects: Project[];
  categories: ProjectCategory[];
  skillNames: Record<string, string>;
}

export function ProjectExplorer({ projects, categories, skillNames }: Props) {
  const [filter, setFilter] = useState<ProjectCategory | "All">("All");
  const visible = useMemo(
    () => (filter === "All" ? projects : projects.filter((p) => p.categories.includes(filter))),
    [filter, projects],
  );
  const options: (ProjectCategory | "All")[] = ["All", ...categories];

  return (
    <div>
      <div role="group" aria-label="Filter projects by area" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:px-0">
        {options.map((option) => {
          const count = option === "All" ? projects.length : projects.filter((p) => p.categories.includes(option)).length;
          const pressed = filter === option;
          return (
            <button
              key={option}
              type="button"
              aria-pressed={pressed}
              onClick={() => setFilter(option)}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2 text-[0.9375rem] transition-colors",
                pressed ? "border-accent bg-accent-soft text-ink" : "border-line text-muted hover:border-line-strong hover:text-ink",
              )}
            >
              {option}
              <span className="ml-2 text-sm text-faint tabular">{count}</span>
            </button>
          );
        })}
      </div>

      <p className="sr-only" aria-live="polite">
        Showing {visible.length} {visible.length === 1 ? "project" : "projects"}
        {filter === "All" ? "" : ` in ${filter}`}.
      </p>

      <ul className="mt-6 grid gap-5 md:grid-cols-2">
        {visible.map((project) => (
          <li key={project.slug}>
            <ProjectCard project={project} skillNames={skillNames} />
          </li>
        ))}
      </ul>
    </div>
  );
}
