import { profile } from "@/content/profile";
import { Section } from "@/components/ui";

export function About() {
  return (
    <Section id="about" title="About">
      <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr] lg:gap-16">
        <div className="max-w-[38rem] space-y-5 text-[1.0625rem] leading-[1.7]">
          {profile.about.map((paragraph) => (
            <p key={paragraph.slice(0, 32)}>{paragraph}</p>
          ))}
        </div>
        <dl className="divide-y divide-line self-start rounded-xl border border-line bg-surface">
          {profile.facts.map((fact) => (
            <div key={fact.label} className="grid grid-cols-[7rem_1fr] gap-4 px-5 py-4">
              <dt className="text-sm text-faint">{fact.label}</dt>
              <dd className="text-[0.9375rem]">{fact.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </Section>
  );
}
