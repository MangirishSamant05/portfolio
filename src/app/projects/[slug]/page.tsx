import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { profile } from "@/content/profile";
import { skillTracks } from "@/content/skills";
import { getProject, getProjects, getSkill, stageLabels, stageOrder } from "@/lib/content";
import { cn } from "@/lib/utils";
import { ButtonLink, Container } from "@/components/ui";
import { Icon } from "@/components/Icon";

export const dynamicParams = false;

export function generateStaticParams() {
  return getProjects().map((p) => ({ slug: p.slug }));
}

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.tagline,
    alternates: { canonical: `/projects/${project.slug}/` },
    openGraph: { title: `${project.title} — ${profile.name}`, description: project.tagline, type: "article" },
  };
}

export default async function ProjectPage({ params }: Params) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const all = getProjects();
  const index = all.findIndex((p) => p.slug === project.slug);
  const prev = index > 0 ? all[index - 1] : undefined;
  const next = index < all.length - 1 ? all[index + 1] : undefined;
  const covered = new Set(project.pipeline.map((s) => s.stage));
  const stackByTrack = skillTracks
    .map((t) => ({ track: t, skills: project.stack.map(getSkill).filter((s) => s.track === t.id) }))
    .filter((g) => g.skills.length > 0);

  return (
    <article className="pb-20 pt-8 sm:pt-12">
      <Container>
        <Link href="/#projects" className="inline-flex items-center gap-1.5 text-[0.9375rem] text-muted hover:text-ink">
          <Icon name="arrowLeft" size={16} />
          All projects
        </Link>

        <header className="mt-8 max-w-3xl">
          {project.status === "draft" && (
            <p className="mb-4 inline-block rounded bg-viz-2/15 px-2 py-1 text-sm font-medium text-viz-2">
              Draft — this page is not included in the production build
            </p>
          )}
          <p className="text-[0.9375rem] text-faint">{project.categories.join(", ")}</p>
          <h1 className="mt-2 text-[2.125rem] font-semibold leading-[1.1] tracking-[-0.025em] sm:text-[2.75rem]">{project.title}</h1>
          <p className="mt-4 text-lg leading-relaxed text-muted">{project.tagline}</p>
          {project.links.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-3">
              {project.links.map((link) => (
                <ButtonLink key={link.url} href={link.url} external={link.url.startsWith("http")} icon={link.kind === "github" ? "github" : link.url.startsWith("http") ? "arrowUpRight" : "arrowRight"}>
                  {link.label}
                </ButtonLink>
              ))}
            </div>
          )}
        </header>

        {project.results.length > 0 && (
          <dl className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {project.results.map((m) => (
              <div key={m.label} className="rounded-xl border border-line bg-surface px-5 py-4">
                <dt className="text-sm text-faint">{m.label}</dt>
                <dd className="mt-1 font-mono text-[1.75rem] font-medium leading-tight tabular">{m.value}</dd>
                {m.context && <dd className="mt-1.5 text-sm leading-snug text-muted">{m.context}</dd>}
              </div>
            ))}
          </dl>
        )}

        <div className="mt-14 grid gap-12 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-16">
          <div className="min-w-0 space-y-12">
            <Block title="Problem">
              <p>{project.problem}</p>
            </Block>

            <Block title="Data">
              <p>{project.data.description}</p>
              {project.data.source && (
                <p className="mt-3 text-[0.9375rem]">
                  Source:{" "}
                  <a
                    href={project.data.source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent underline-offset-4 hover:underline"
                  >
                    {project.data.source.label}
                  </a>
                </p>
              )}
            </Block>

            {project.pipeline.length > 0 && (
              <Block title="Pipeline">
                <ol className="mb-6 flex flex-wrap gap-1.5" aria-label="Stages covered by this project">
                  {stageOrder.map((stage) => (
                    <li
                      key={stage}
                      className={cn(
                        "rounded-md px-2.5 py-1 text-[0.8125rem]",
                        covered.has(stage) ? "bg-accent-soft font-medium text-ink" : "bg-surface-2 text-faint",
                      )}
                    >
                      <span className="sr-only">{covered.has(stage) ? "Covered: " : "Not covered: "}</span>
                      {stageLabels[stage]}
                    </li>
                  ))}
                </ol>
                <ol className="border-l border-line-strong">
                  {stageOrder
                    .filter((stage) => covered.has(stage))
                    .map((stage) => {
                      const step = project.pipeline.find((s) => s.stage === stage)!;
                      return (
                        <li key={stage} className="relative pb-5 pl-6 last:pb-0">
                          <span aria-hidden className="absolute -left-[5px] top-2 h-2.5 w-2.5 rounded-full border-2 border-accent bg-bg" />
                          <p className="font-medium">{stageLabels[stage]}</p>
                          <p className="mt-0.5 text-muted">{step.detail}</p>
                        </li>
                      );
                    })}
                </ol>
              </Block>
            )}

            <Block title="Methodology">
              <BulletList items={project.methodology} />
            </Block>

            <Block title="What I built">
              <BulletList items={project.contributions} />
            </Block>

            {project.insights.length > 0 && (
              <Block title="Key insights">
                <BulletList items={project.insights} />
              </Block>
            )}
          </div>

          <aside className="space-y-8 lg:sticky lg:top-24 lg:self-start">
            <div>
              <h2 className="text-sm text-faint">Technology stack</h2>
              <div className="mt-3 space-y-4">
                {stackByTrack.map(({ track, skills }) => (
                  <div key={track.id}>
                    <p className="text-[0.9375rem] font-medium">{track.name}</p>
                    <ul className="mt-2 flex flex-wrap gap-1.5">
                      {skills.map((s) => (
                        <li key={s.id} className="rounded-md border border-line px-2 py-0.5 text-[0.8125rem] text-muted">
                          {s.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
            {project.links.length > 0 && (
              <div>
                <h2 className="text-sm text-faint">Links</h2>
                <ul className="mt-3 space-y-2">
                  {project.links.map((link) => (
                    <li key={link.url}>
                      <a
                        href={link.url}
                        {...(link.url.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                        className="inline-flex items-center gap-1.5 text-[0.9375rem] font-medium text-accent underline-offset-4 hover:underline"
                      >
                        {link.label}
                        <Icon name="arrowUpRight" size={15} />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>

        <nav aria-label="More projects" className="mt-20 grid gap-4 border-t border-line pt-8 sm:grid-cols-2">
          {prev ? <PagerLink project={prev} direction="Previous" /> : <span />}
          {next && <PagerLink project={next} direction="Next" />}
        </nav>
      </Container>
    </article>
  );
}

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-xl font-semibold tracking-[-0.01em]">{title}</h2>
      <div className="mt-3 max-w-[42rem] text-[1.0625rem] leading-[1.7]">{children}</div>
    </section>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <span aria-hidden className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function PagerLink({ project, direction }: { project: { slug: string; title: string }; direction: "Previous" | "Next" }) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className={cn(
        "group rounded-xl border border-line p-5 transition-colors hover:border-line-strong",
        direction === "Next" && "sm:text-right",
      )}
    >
      <span className="text-sm text-faint">{direction} project</span>
      <span className="mt-1 block font-medium group-hover:text-accent">{project.title}</span>
    </Link>
  );
}
