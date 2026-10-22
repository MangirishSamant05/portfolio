import Link from "next/link";
import type { Project } from "@/types/content";

/** Every model metric on the site in one table, each tied to what it was measured on. */
export function MlLab({ projects }: { projects: Project[] }) {
  const rows = projects.flatMap((p) => p.results.map((m) => ({ project: p, metric: m })));
  if (!rows.length) return null;

  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-surface">
      <table className="w-full min-w-[640px] border-collapse text-left">
        <caption className="sr-only">Model and system results by project</caption>
        <thead>
          <tr className="border-b border-line text-sm text-faint">
            <th scope="col" className="px-5 py-3 font-normal">Project</th>
            <th scope="col" className="px-5 py-3 font-normal">Measure</th>
            <th scope="col" className="px-5 py-3 text-right font-normal">Result</th>
            <th scope="col" className="px-5 py-3 font-normal">Measured on</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ project, metric }, i) => {
            const firstOfProject = i === 0 || rows[i - 1].project.slug !== project.slug;
            return (
              <tr key={project.slug + metric.label} className={firstOfProject ? "border-t border-line first:border-t-0" : ""}>
                <th scope="row" className="px-5 py-3 align-top font-medium">
                  {firstOfProject && (
                    <Link href={`/projects/${project.slug}`} className="hover:text-accent">
                      {project.shortTitle}
                    </Link>
                  )}
                </th>
                <td className="px-5 py-3 align-top text-muted">{metric.label}</td>
                <td className="px-5 py-3 text-right align-top font-mono text-[1.0625rem] font-medium tabular">{metric.value}</td>
                <td className="px-5 py-3 align-top text-[0.9375rem] text-muted">{metric.context}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
