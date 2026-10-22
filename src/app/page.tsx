import { profile, site } from "@/content/profile";
import { skills } from "@/content/skills";
import { journey } from "@/content/journey";
import { badgeProfileUrl, badges, certifications } from "@/content/credentials";
import { education } from "@/content/background";
import { getCategories, getProjects, getSkillEvidence, validateContent } from "@/lib/content";
import { dateKey } from "@/lib/utils";
import { Section, ExternalTextLink } from "@/components/ui";
import { Hero } from "@/sections/Hero";
import { About } from "@/sections/About";
import { JourneyExplorer } from "@/sections/JourneyExplorer";
import { SkillsMatrix } from "@/sections/SkillsMatrix";
import { ProjectExplorer } from "@/sections/ProjectExplorer";
import { otherWork } from "@/content/projects";
import { GitHubRepos } from "@/sections/GitHubRepos";
import { MlLab } from "@/sections/MlLab";
import { CropExplorer } from "@/sections/CropExplorer";
import { MinistryDemo } from "@/sections/MinistryDemo";
import { PipelineDiagram } from "@/sections/PipelineDiagram";
import { BadgeGrid, CertificateGallery } from "@/sections/Credentials";
import { Background } from "@/sections/Background";
import { Contact } from "@/sections/Contact";

export default function HomePage() {
  validateContent();

  const projects = getProjects();
  const skillNames = Object.fromEntries(skills.map((s) => [s.id, s.name]));
  const skillRecord = Object.fromEntries(skills.map((s) => [s.id, s]));
  const projectTitles = Object.fromEntries(projects.map((p) => [p.slug, p.title]));
  const sortedCerts = [...certifications].sort((a, b) => dateKey(b.date).localeCompare(dateKey(a.date)));
  const sortedBadges = [...badges].sort((a, b) => b.date.localeCompare(a.date));
  const skillCount = skills.length;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    jobTitle: profile.roles.join(", "),
    url: site.url,
    email: `mailto:${profile.email}`,
    address: { "@type": "PostalAddress", addressLocality: "Mumbai", addressCountry: "IN" },
    sameAs: [profile.links.github, profile.links.linkedin],
    alumniOf: { "@type": "CollegeOrUniversity", name: education[0].institution },
    knowsAbout: skills.filter((s) => s.track !== "tools").map((s) => s.name),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Hero />
      <About />

      <Section
        id="workflow"
        title="How I work"
        intro="The same eight stages run through every project. Select a stage to see the tools I use there and where I've done it."
      >
        <JourneyExplorer stages={journey} skills={skillRecord} projectTitles={projectTitles} />
      </Section>

      <Section
        id="skills"
        title="Skills, with evidence"
        intro={`All ${skillCount} skills from my resume, grouped by area. A dot means the project used it — counted, not self-rated.`}
      >
        <SkillsMatrix
          tracks={getSkillEvidence(projects)}
          projects={projects.map((p) => ({ slug: p.slug, shortTitle: p.shortTitle }))}
        />
      </Section>

      <Section
        id="projects"
        title="Projects"
        intro="Case studies covering the problem, the data, the pipeline and the results. Filter by area, or open one for the full write-up."
      >
        <ProjectExplorer projects={projects} categories={getCategories(projects)} skillNames={skillNames} />
        {otherWork.length > 0 && (
          <p className="mt-6 text-[0.9375rem] text-muted">
            <span className="text-faint">Also built: </span>
            {otherWork.map((w, i) => (
              <span key={w.title}>
                {i > 0 && " · "}
                {w.url ? (
                  <a href={w.url} target="_blank" rel="noopener noreferrer" className="text-ink underline-offset-4 hover:underline">
                    {w.title}
                  </a>
                ) : (
                  <span className="text-ink">{w.title}</span>
                )}{" "}
                ({w.stack})
              </span>
            ))}
          </p>
        )}
        {site.showGitHubRepos && <GitHubRepos username={profile.githubUsername} profileUrl={profile.links.github} />}
      </Section>

      <Section
        id="results"
        title="Results"
        intro="Every number on this site in one place, with what it was measured on. All come from my resume, my project repositories or the notebooks in them."
      >
        <MlLab projects={projects} />
      </Section>

      <Section
        id="lab"
        title="Live demos"
        intro="Two of my projects, running in your browser. Nothing here is mock data: the crop prices come from the gold tables my Spark pipeline produced, and the classifier is a compact copy of the SansadLens model."
      >
        <h3 className="mb-1 text-lg font-semibold">NLP: which ministry answers this question?</h3>
        <p className="mb-5 max-w-2xl text-muted">From SansadLens, trained on 4,750 questions MPs asked in the Lok Sabha.</p>
        <MinistryDemo />

        <h3 className="mb-1 mt-16 text-lg font-semibold">Big data: 26 years of Indian crop prices</h3>
        <p className="mb-5 max-w-2xl text-muted">
          From MandiPulse. Pick a crop to see its price history, seasonal cycle, price shocks and state-by-state gaps.
        </p>
        <CropExplorer />
      </Section>

      <Section
        id="pipeline"
        title="Data pipeline"
        intro="How the tools from my projects fit together, from source data to the dashboard or API someone acts on."
      >
        <PipelineDiagram />
      </Section>

      <Section
        id="credentials"
        title="Certifications and badges"
        intro="Select a certificate to see it full size and verify it where the issuer provides a link."
      >
        <CertificateGallery items={sortedCerts} />
        <div id="badges" className="mt-14 scroll-mt-24">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <h3 className="text-lg font-semibold">
              Google Skills badges <span className="font-normal text-faint tabular">({sortedBadges.length})</span>
            </h3>
            <ExternalTextLink href={badgeProfileUrl}>Public badge profile</ExternalTextLink>
          </div>
          <BadgeGrid badges={sortedBadges} />
        </div>
      </Section>

      <Background />
      <Contact />
    </>
  );
}
