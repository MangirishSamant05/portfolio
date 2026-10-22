import type { EducationEntry, ExperienceEntry, LearningItem } from "@/types/content";

export const education: EducationEntry[] = [
  {
    institution: "MCT's Rajiv Gandhi Institute of Technology, Mumbai",
    qualification: "Bachelor of Engineering (B.E.) in Computer Engineering",
    period: "2023 – 2027",
    score: "CGPA 8.76 / 10",
  },
  {
    institution: "Higher Secondary Certificate",
    qualification: "HSC (Class 12)",
    score: "84.50%",
  },
  {
    institution: "Secondary School Certificate",
    qualification: "SSC (Class 10)",
    score: "86.20%",
  },
];

/**
 * Work, internships and leadership. Add an internship here when you get one —
 * set `kind: "internship"` and it will be labelled accordingly.
 */
export const experience: ExperienceEntry[] = [
  {
    organization: "DMX Team, RGIT",
    role: "Web Secretary",
    period: "2026 – 2027",
    kind: "leadership",
    points: ["Manage web development initiatives and maintenance of the team's platform."],
  },
];

/**
 * "Recent learning". Each item should be something you're actually working on.
 * Evidence links are optional; the badges back these two up.
 */
export const learning: LearningItem[] = [
  {
    topic: "Generative AI & large language models",
    focus:
      "LLM fundamentals, building a small language model, responsible AI, and building applications with Gemini and Imagen.",
    evidence: { label: "5 Google Skills badges, Aug–Sep 2026", url: "#badges" },
  },
  {
    topic: "Google Cloud infrastructure",
    focus:
      "Compute, networking, load balancing, Kubernetes Engine and Terraform, through the Cloud Engineer track of Google Cloud Career Launchpad.",
    evidence: { label: "10 Google Skills badges and a track certificate, 2026", url: "#credentials" },
  },
];
