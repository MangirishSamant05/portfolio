import type { Badge, Certification } from "@/types/content";

/**
 * Certificates.
 *
 * To add one:
 *   1. Put the image in /public/credentials/ (PNG, JPG or WebP; ~1200px wide is plenty).
 *      Optionally put the original PDF next to it.
 *   2. Copy an entry below and fill it in. Leave out any field you don't have.
 * Newest first is automatic — order here doesn't matter.
 */
export const certifications: Certification[] = [
  {
    id: "elements-of-ai",
    title: "Elements of AI",
    issuer: "University of Helsinki & MinnaLearn",
    date: "2026-09-07",
    verifyUrl: "https://certificates.mooc.fi/validate/5setikto2jw",
    image: "/credentials/elements-of-ai.webp",
    skills: ["AI fundamentals", "Machine learning concepts"],
    note: "2 ECTS credit online course.",
  },
  {
    id: "google-cloud-career-launchpad",
    title: "Google Cloud Career Launchpad — Cloud Engineer track",
    issuer: "Google Cloud",
    date: "2026-02-12",
    credentialId: "kdmxiB6F",
    image: "/credentials/google-cloud-career-launchpad-cloud-engineer.webp",
    file: "/credentials/google-cloud-career-launchpad-cloud-engineer.pdf",
    skills: ["Google Cloud", "Cloud infrastructure"],
    note: "Completed all courses and labs in the track. Does not expire.",
  },
  {
    id: "anthropic-ai-fluency",
    title: "AI Fluency: Framework & Foundations",
    issuer: "Anthropic",
    image: "/credentials/anthropic-ai-fluency.webp",
    file: "/credentials/anthropic-ai-fluency.pdf",
    skills: ["Working with AI systems"],
  },
  {
    id: "anthropic-claude-code-101",
    title: "Claude Code 101",
    issuer: "Anthropic",
    image: "/credentials/anthropic-claude-code-101.webp",
    file: "/credentials/anthropic-claude-code-101.pdf",
    skills: ["AI-assisted development"],
  },
];

const PROFILE = "https://www.skills.google/public_profiles/8242b235-7042-47f9-80d3-ca35926ec32a/badges";
const CDN = "https://cdn.qwiklabs.com";

/**
 * Google Skills badges (duplicates removed). Images load from Google's CDN;
 * if one fails, a neutral placeholder is shown instead.
 *
 * To add one: open the badge on your public profile, copy its URL into
 * `verifyUrl`, right-click the badge image → "Copy image address" into `image`.
 * `topic` groups badges on the page — reuse an existing topic or add a new one.
 */
export const badges: Badge[] = [
  { id: "28017126", title: "Build Real World AI Applications with Gemini and Imagen", issuer: "Google Skills", date: "2026-09-16", topic: "Generative AI & LLMs", image: `${CDN}/TfEhrDmVX2ZeRu37sA7Xglm%2B3HIeoGQHlTPPQtFIVLQ%3D`, verifyUrl: `${PROFILE}/28017126` },
  { id: "28015627", title: "Responsible AI: Applying AI Principles with Google Cloud", issuer: "Google Skills", date: "2026-09-16", topic: "Generative AI & LLMs", image: `${CDN}/jGsicHpF%2FzbV4WMrt%2BvIhU%2FDmBCO%2BrYwnBz01ok0R5s%3D`, verifyUrl: `${PROFILE}/28015627` },
  { id: "28015536", title: "Introduction to Generative AI", issuer: "Google Skills", date: "2026-09-16", topic: "Generative AI & LLMs", image: `${CDN}/z2y6RtTCM6P9ABcrBEk4oGL9iQtcxrMRQfn3vH%2FCWMo%3D`, verifyUrl: `${PROFILE}/28015536` },
  { id: "27904249", title: "Google DeepMind: 01 Build Your Own Small Language Model", issuer: "Google Skills", date: "2026-09-12", topic: "Generative AI & LLMs", image: `${CDN}/7BVm0KpcAQysTGGQgGa84RLalTuvBKshbtw%2FYjbnc%2BA%3D`, verifyUrl: `${PROFILE}/27904249` },
  { id: "26464360", title: "Introduction to Large Language Models", issuer: "Google Skills", date: "2026-08-09", topic: "Generative AI & LLMs", image: `${CDN}/hnOtl9pWXF3CfJK998eXZfhYm9wpSEo2%2FBnj29l6BEE%3D`, verifyUrl: `${PROFILE}/26464360` },
  { id: "21813539", title: "Elastic Google Cloud Infrastructure: Scaling and Automation", issuer: "Google Skills", date: "2026-01-28", topic: "Google Cloud infrastructure", image: `${CDN}/oXE6tGOC%2BjXO0gH2rCybiHbr7UOJ8zKrjOzLzxT9wiA%3D`, verifyUrl: `${PROFILE}/21813539` },
  { id: "21783587", title: "Getting Started with Google Kubernetes Engine", issuer: "Google Skills", date: "2026-01-27", topic: "Google Cloud infrastructure", image: `${CDN}/HPtjPjHuWp197QQiSmfshQL2uNxmxDCHjWps43o10Cg%3D`, verifyUrl: `${PROFILE}/21783587` },
  { id: "21727623", title: "Essential Google Cloud Infrastructure: Core Services", issuer: "Google Skills", date: "2026-01-25", topic: "Google Cloud infrastructure", image: `${CDN}/vEdK4bTRKwgNOlf8ey69JKlKZnKc%2BuDIggKQ204r1Ss%3D`, verifyUrl: `${PROFILE}/21727623` },
  { id: "21727200", title: "Google Cloud Fundamentals: Core Infrastructure", issuer: "Google Skills", date: "2026-01-25", topic: "Google Cloud infrastructure", image: `${CDN}/V%2FuXlPOWQoaDTrhNB3K%2Ba2p2wGiQZT7%2BODtWIPHmON4%3D`, verifyUrl: `${PROFILE}/21727200` },
  { id: "21720004", title: "Develop Your Google Cloud Network", issuer: "Google Skills", date: "2026-01-24", topic: "Google Cloud infrastructure", image: `${CDN}/1W491MLsCade2Tehi6mQSwcQz3XfbGpJNTGHAhlvHdU%3D`, verifyUrl: `${PROFILE}/21720004` },
  { id: "21718978", title: "Build Infrastructure with Terraform on Google Cloud", issuer: "Google Skills", date: "2026-01-24", topic: "Google Cloud infrastructure", image: `${CDN}/V5hy7oPDiKov68Q4kTcuuA%2BMHNMX3Z0my4mncKPPGvY%3D`, verifyUrl: `${PROFILE}/21718978` },
  { id: "21700350", title: "Implementing Cloud Load Balancing for Compute Engine", issuer: "Google Skills", date: "2026-01-23", topic: "Google Cloud infrastructure", image: `${CDN}/65Pd0zpjzRHMv49XZZhvHJkbQK2xACKFY1ldTPWsJL8%3D`, verifyUrl: `${PROFILE}/21700350` },
  { id: "21643458", title: "Set Up an App Dev Environment on Google Cloud", issuer: "Google Skills", date: "2026-01-21", topic: "Google Cloud infrastructure", image: `${CDN}/Je38dFSeXh1I3XpoWJYmQ7%2BRKX6ChB2GaGQweuw0kQI%3D`, verifyUrl: `${PROFILE}/21643458` },
  { id: "21580476", title: "Essential Google Cloud Infrastructure: Foundation", issuer: "Google Skills", date: "2026-01-18", topic: "Google Cloud infrastructure", image: `${CDN}/hKI2ls27kceMyQqOn%2F%2BqTkzmlFER5bTjckH9zo847sI%3D`, verifyUrl: `${PROFILE}/21580476` },
  { id: "21495821", title: "Build a Certification Study Guide: ACE Exam Prep", issuer: "Google Skills", date: "2026-01-13", topic: "Google Cloud infrastructure", image: `${CDN}/h%2BPMYMQF6Z39Z9u74W0NPiTRq%2Bh43WZbJl98%2Br1S3Ek%3D`, verifyUrl: `${PROFILE}/21495821` },
];

/** Link shown under the badge grid. */
export const badgeProfileUrl = "https://www.skills.google/public_profiles/8242b235-7042-47f9-80d3-ca35926ec32a";
