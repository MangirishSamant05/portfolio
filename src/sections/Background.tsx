import { education, experience, learning } from "@/content/background";
import { Section } from "@/components/ui";
import { Icon } from "@/components/Icon";

const kindLabel = { leadership: "Leadership", internship: "Internship", job: "Full-time", freelance: "Freelance" } as const;

export function Background() {
  return (
    <Section id="background" title="Education and leadership">
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <h3 className="text-lg font-semibold">Education</h3>
          <ol className="mt-5 border-l border-line-strong">
            {education.map((e) => (
              <li key={e.qualification} className="relative pb-8 pl-6 last:pb-0">
                <span aria-hidden className="absolute -left-[5px] top-2 h-2.5 w-2.5 rounded-full border-2 border-accent bg-bg" />
                <p className="font-medium">{e.qualification}</p>
                <p className="mt-0.5 text-muted">{e.institution}</p>
                <p className="mt-1 flex flex-wrap gap-x-4 text-sm text-faint">
                  {e.period && <span className="tabular">{e.period}</span>}
                  {e.score && <span className="font-medium text-ink tabular">{e.score}</span>}
                </p>
                {e.detail && <p className="mt-2 text-[0.9375rem] text-muted">{e.detail}</p>}
              </li>
            ))}
          </ol>
        </div>

        <div className="space-y-12">
          <div>
            <h3 className="text-lg font-semibold">Experience and leadership</h3>
            <ol className="mt-5 border-l border-line-strong">
              {experience.map((x) => (
                <li key={x.organization + x.role} className="relative pb-8 pl-6 last:pb-0">
                  <span aria-hidden className="absolute -left-[5px] top-2 h-2.5 w-2.5 rounded-full border-2 border-accent bg-bg" />
                  <p className="font-medium">{x.role}</p>
                  <p className="mt-0.5 text-muted">{x.organization}</p>
                  <p className="mt-1 text-sm text-faint">
                    <span className="tabular">{x.period}</span>, {kindLabel[x.kind].toLowerCase()}
                  </p>
                  <ul className="mt-2 space-y-1 text-[0.9375rem] text-muted">
                    {x.points.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          </div>

          <div id="learning">
            <h3 className="text-lg font-semibold">Recent learning</h3>
            <ul className="mt-5 space-y-4">
              {learning.map((item) => (
                <li key={item.topic} className="rounded-xl border border-line bg-surface p-5">
                  <p className="font-medium">{item.topic}</p>
                  <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-muted">{item.focus}</p>
                  {item.evidence && (
                    <a
                      href={item.evidence.url}
                      className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-accent underline-offset-4 hover:underline"
                    >
                      <Icon name="award" size={15} />
                      {item.evidence.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Section>
  );
}
