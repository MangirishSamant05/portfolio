/**
 * Content models. Every file in src/content/ is typed against these,
 * so a typo in a field name fails the build instead of breaking the page.
 */

export type SkillTrack =
  | "analysis"
  | "bigdata"
  | "nlp"
  | "ml"
  | "bi"
  | "deployment"
  | "tools";

export interface Skill {
  /** Stable id used to link projects, journey stages and pipeline steps to this skill. */
  id: string;
  name: string;
  track: SkillTrack;
}

export type ProjectCategory =
  | "Data Analytics"
  | "Machine Learning"
  | "Data Engineering"
  | "Backend & MLOps"
  | "Deep Learning"
  | "NLP";

export type PipelineStageId =
  | "collection"
  | "cleaning"
  | "eda"
  | "features"
  | "modeling"
  | "evaluation"
  | "deployment"
  | "insights";

export interface Metric {
  label: string;
  /** Shown exactly as written, e.g. "0.91" or "−18%". */
  value: string;
  /** What the number was measured on, so it can't be misread. */
  context?: string;
}

export interface ProjectLink {
  kind: "github" | "demo" | "docs" | "paper";
  label: string;
  url: string;
}

export interface Project {
  slug: string;
  title: string;
  /** Two or three words, used where space is tight (skills matrix, ML Lab). */
  shortTitle: string;
  /** One line shown on the card. */
  tagline: string;
  categories: ProjectCategory[];
  /** Featured projects get the large cards at the top of the grid. */
  featured: boolean;
  /**
   * "draft" projects are visible in `npm run dev` (with a Draft label) and
   * hidden from the production build. Use it while you fill in details.
   */
  status: "published" | "draft";
  /** Lower numbers appear first. */
  order: number;
  problem: string;
  data: {
    description: string;
    source?: { label: string; url: string };
  };
  /** Only the stages this project actually covered. */
  pipeline: { stage: PipelineStageId; detail: string }[];
  /** Skill ids from src/content/skills.ts. */
  stack: string[];
  methodology: string[];
  /** What you personally did. Recruiters read this first. */
  contributions: string[];
  /** Leave empty when you don't have real numbers. Nothing is shown then. */
  results: Metric[];
  insights: string[];
  links: ProjectLink[];
}

export interface JourneyStage {
  id: PipelineStageId;
  title: string;
  summary: string;
  skills: string[];
  evidence: { project: string; note: string }[];
}

export interface PipelineStep {
  id: string;
  title: string;
  description: string;
  skills: string[];
}

export interface Certification {
  id: string;
  title: string;
  issuer: string;
  /** ISO date (YYYY-MM-DD) or year-month (YYYY-MM). Leave undefined if unknown. */
  date?: string;
  credentialId?: string;
  verifyUrl?: string;
  /** Preview image under /public. */
  image: string;
  /** Original PDF under /public, if you have one. */
  file?: string;
  /** Topics the certificate covers (free text, shown as tags). */
  skills: string[];
  note?: string;
}

export interface Badge {
  id: string;
  title: string;
  issuer: string;
  /** ISO date YYYY-MM-DD */
  date: string;
  image: string;
  verifyUrl: string;
  topic: string;
}

export interface EducationEntry {
  institution: string;
  qualification: string;
  period?: string;
  score?: string;
  detail?: string;
}

export interface ExperienceEntry {
  organization: string;
  role: string;
  period: string;
  kind: "leadership" | "internship" | "job" | "freelance";
  points: string[];
}

export interface LearningItem {
  topic: string;
  focus: string;
  evidence?: { label: string; url: string };
}
