import { projects } from "@/content/projects";
import { skills, skillTracks } from "@/content/skills";
import { journey, pipelineSteps } from "@/content/journey";
import type { PipelineStageId, Project, ProjectCategory, Skill } from "@/types/content";

const showDrafts = process.env.NODE_ENV !== "production";

/** Projects visible in this build, in display order. Drafts only appear in development. */
export function getProjects(): Project[] {
  return projects
    .filter((p) => p.status === "published" || showDrafts)
    .sort((a, b) => a.order - b.order);
}

export function getProject(slug: string): Project | undefined {
  return getProjects().find((p) => p.slug === slug);
}

const skillMap = new Map<string, Skill>(skills.map((s) => [s.id, s]));

export function getSkill(id: string): Skill {
  const found = skillMap.get(id);
  if (!found) throw new Error(`Unknown skill id "${id}". Add it to src/content/skills.ts first.`);
  return found;
}

export function skillName(id: string): string {
  return getSkill(id).name;
}

const categoryOrder: ProjectCategory[] = [
  "Data Analytics",
  "Data Engineering",
  "Machine Learning",
  "Backend & MLOps",
  "Deep Learning",
  "NLP",
];

/** Only the categories that at least one visible project uses — so no empty filters. */
export function getCategories(list: Project[]): ProjectCategory[] {
  const used = new Set(list.flatMap((p) => p.categories));
  return categoryOrder.filter((c) => used.has(c));
}

export const stageLabels: Record<PipelineStageId, string> = {
  collection: "Collection",
  cleaning: "Cleaning",
  eda: "Exploration",
  features: "Features",
  modeling: "Modelling",
  evaluation: "Evaluation",
  deployment: "Deployment",
  insights: "Insights",
};

export const stageOrder: PipelineStageId[] = [
  "collection",
  "cleaning",
  "eda",
  "features",
  "modeling",
  "evaluation",
  "deployment",
  "insights",
];

/** Skill rows for the matrix: each skill in a track, with the projects that used it. */
export function getSkillEvidence(list: Project[]) {
  return skillTracks.map((track) => {
    const trackSkills = skills.filter((s) => s.track === track.id);
    const rows = trackSkills.map((s) => ({
      skill: s,
      projects: list.filter((p) => p.stack.includes(s.id)).map((p) => p.slug),
    }));
    return {
      track,
      evidenced: rows.filter((r) => r.projects.length > 0),
      other: rows.filter((r) => r.projects.length === 0).map((r) => r.skill),
    };
  });
}

/**
 * Fails the build with a readable message if content references something
 * that doesn't exist (a misspelt skill id or project slug).
 */
export function validateContent(): void {
  const problems: string[] = [];
  const slugs = new Set<string>();
  for (const p of projects) {
    if (slugs.has(p.slug)) problems.push(`Duplicate project slug "${p.slug}"`);
    slugs.add(p.slug);
    for (const id of p.stack) if (!skillMap.has(id)) problems.push(`Project "${p.slug}" uses unknown skill "${id}"`);
  }
  for (const stage of journey) {
    for (const id of stage.skills) if (!skillMap.has(id)) problems.push(`Journey stage "${stage.id}" uses unknown skill "${id}"`);
    for (const e of stage.evidence) if (!slugs.has(e.project)) problems.push(`Journey stage "${stage.id}" points at unknown project "${e.project}"`);
  }
  for (const step of pipelineSteps) {
    for (const id of step.skills) if (!skillMap.has(id)) problems.push(`Pipeline step "${step.id}" uses unknown skill "${id}"`);
  }
  if (problems.length) throw new Error(`Content errors:\n- ${problems.join("\n- ")}`);
}
