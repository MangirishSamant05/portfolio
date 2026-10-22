import Link from "next/link";
import type { Project } from "@/types/content";
import { Icon } from "@/components/Icon";

export function ProjectCard({ project, skillNames }: { project: Project; skillNames: Record<string, string> }) {
  const shownStack = project.stack.slice(0, 5);
  const more = project.stack.length - shownStack.length;

  return (
    <article className="group relative flex h-full flex-col rounded-xl border border-line bg-surface p-6 transition-[border-color,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-card focus-within:border-accent">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-faint">
        {project.status === "draft" && (
          <span className="rounded bg-viz-2/15 px-1.5 py-0.5 text-[0.75rem] font-medium text-viz-2">Draft — hidden in production</span>
        )}
        <span>{project.categories.join(", ")}</span>
      </div>

      <h3 className="mt-3 text-[1.1875rem] font-semibold leading-snug tracking-[-0.01em]">
        <Link href={`/projects/${project.slug}`} className="after:absolute after:inset-0 after:rounded-xl focus:outline-none">
          {project.title}
        </Link>
      </h3>
      <p className="mt-2 leading-relaxed text-muted">{project.tagline}</p>

      {project.results.length > 0 && (
        <dl className="mt-5 grid grid-cols-2 gap-3">
          {project.results.slice(0, 2).map((m) => (
            <div key={m.label} className="rounded-lg bg-surface-2 px-3.5 py-3">
              <dt className="text-[0.8125rem] text-faint">{m.label}</dt>
              <dd className="mt-0.5 font-mono text-lg font-medium tabular">{m.value}</dd>
            </div>
          ))}
        </dl>
      )}

      <div className="mt-auto pt-5">
        <ul className="flex flex-wrap gap-1.5" aria-label="Technologies">
          {shownStack.map((id) => (
            <li key={id} className="rounded-md border border-line px-2 py-0.5 text-[0.8125rem] text-muted">
              {skillNames[id] ?? id}
            </li>
          ))}
          {more > 0 && <li className="px-1 py-0.5 text-[0.8125rem] text-faint">+{more} more</li>}
        </ul>
        <p className="mt-5 inline-flex items-center gap-1.5 text-[0.9375rem] font-medium text-accent">
          Read case study
          <Icon name="arrowRight" size={16} className="transition-transform group-hover:translate-x-0.5" />
        </p>
      </div>
    </article>
  );
}
