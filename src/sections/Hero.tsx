import { profile } from "@/content/profile";
import { ButtonLink, Container } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { HeroFigure } from "./HeroFigure";
import { HeroHighlights } from "./HeroHighlights";

export function Hero() {
  return (
    <section id="top" aria-labelledby="hero-title" className="pb-16 pt-10 sm:pb-24 sm:pt-16">
      <Container className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
        <div>
          <div className="mb-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-[0.9375rem] text-muted">
            {profile.availability && (
              <span className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent-soft px-3 py-1 text-[0.875rem] text-ink">
                <span className="relative flex h-2 w-2" aria-hidden>
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
                </span>
                {profile.availability}
              </span>
            )}
            <span className="flex items-center gap-2">
              <Icon name="mapPin" size={16} />
              {profile.location}
            </span>
          </div>
          <h1
            id="hero-title"
            className="text-[2.75rem] font-semibold leading-[1.02] tracking-[-0.035em] sm:text-[3.75rem] lg:text-[4.25rem]"
          >
            {profile.name}
          </h1>
          {/* Phones: a plain comma list that wraps cleanly. Wider screens: dot-separated on one line. */}
          <p className="mt-5 text-[1.0625rem] font-medium sm:hidden">{profile.roles.join(", ")}</p>
          <p className="mt-5 hidden items-center gap-3 text-xl font-medium sm:flex">
            {profile.roles.map((role, i) => (
              <span key={role} className="flex items-center gap-3">
                {i > 0 && <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-line-strong" />}
                {role}
              </span>
            ))}
          </p>
          <p className="mt-5 max-w-[34rem] text-[1.0625rem] leading-relaxed text-muted sm:text-lg">{profile.headline}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="#projects" variant="primary">
              View projects
            </ButtonLink>
            <ButtonLink href={profile.resume.path} download={profile.resume.fileName} icon="download">
              Download resume
            </ButtonLink>
            <ButtonLink href="#contact" variant="ghost">
              Contact me
            </ButtonLink>
          </div>

          <ul className="mt-8 flex items-center gap-1 text-muted" aria-label="Profiles">
            <li>
              <a
                href={profile.links.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 items-center gap-2 rounded-lg px-2 text-[0.9375rem] hover:text-ink"
              >
                <Icon name="github" size={18} />
                GitHub
              </a>
            </li>
            <li>
              <a
                href={profile.links.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 items-center gap-2 rounded-lg px-2 text-[0.9375rem] hover:text-ink"
              >
                <Icon name="linkedin" size={17} />
                LinkedIn
              </a>
            </li>
            <li>
              <a
                href={`mailto:${profile.email}`}
                className="inline-flex h-10 items-center gap-2 rounded-lg px-2 text-[0.9375rem] hover:text-ink"
              >
                <Icon name="mail" size={18} />
                Email
              </a>
            </li>
          </ul>
        </div>

        <HeroFigure />
      </Container>
      <Container>
        <HeroHighlights />
      </Container>
    </section>
  );
}
