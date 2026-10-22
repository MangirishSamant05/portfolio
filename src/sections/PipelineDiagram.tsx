import type { CSSProperties } from "react";
import { pipelineSteps } from "@/content/journey";
import { skillName } from "@/lib/content";

const PACKETS = [0, 2.6, 5.2];
const DURATION = 7.8;

/** Reference data platform, built only from tools on the resume. Packets drift along the track. */
export function PipelineDiagram() {
  return (
    <div className="relative">
      {/* Horizontal layout (large screens) */}
      <div className="hidden lg:block">
        <div className="relative mx-[calc(100%/14)] h-6">
          <span aria-hidden className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-line-strong" />
          {PACKETS.map((delay) => (
            <span
              key={delay}
              aria-hidden
              className="absolute top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent shadow-[0_0_0_4px_var(--accent-soft)]"
              style={{ animation: `packet-x ${DURATION}s linear ${delay}s infinite`, left: 0, opacity: 0 } as CSSProperties}
            />
          ))}
          <ol className="absolute inset-x-[calc(-100%/12)] top-0 grid grid-cols-7" aria-hidden>
            {pipelineSteps.map((step) => (
              <li key={step.id} className="flex justify-center">
                <span className="mt-[5px] h-3.5 w-3.5 rounded-full border-2 border-accent bg-bg" />
              </li>
            ))}
          </ol>
        </div>
        <ol className="mt-4 grid grid-cols-7 gap-3">
          {pipelineSteps.map((step, i) => (
            <li key={step.id} className="text-center">
              <StepBody index={i} title={step.title} description={step.description} skills={step.skills} />
            </li>
          ))}
        </ol>
      </div>

      {/* Vertical layout (phones and tablets) */}
      <div className="relative lg:hidden">
        <span aria-hidden className="absolute bottom-6 left-[11px] top-3 w-px bg-line-strong" />
        <div aria-hidden className="absolute bottom-6 left-[11px] top-3 w-0">
          {PACKETS.map((delay) => (
            <span
              key={delay}
              className="absolute left-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent"
              style={{ animation: `packet-y ${DURATION}s linear ${delay}s infinite`, top: 0, opacity: 0 }}
            />
          ))}
        </div>
        <ol className="space-y-6">
          {pipelineSteps.map((step, i) => (
            <li key={step.id} className="relative pl-10">
              <span aria-hidden className="absolute left-[4px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-accent bg-bg" />
              <StepBody index={i} title={step.title} description={step.description} skills={step.skills} align="left" />
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function StepBody({
  index,
  title,
  description,
  skills,
  align = "center",
}: {
  index: number;
  title: string;
  description: string;
  skills: string[];
  align?: "center" | "left";
}) {
  return (
    <div>
      <p className="font-medium">
        <span className="sr-only">Step {index + 1}: </span>
        {title}
      </p>
      <p className="mt-1 text-sm leading-relaxed text-muted">{description}</p>
      <ul className={`mt-3 flex flex-wrap gap-1.5 ${align === "center" ? "justify-center" : ""}`} aria-label={`${title} tools`}>
        {skills.map((id) => (
          <li key={id} className="rounded-md bg-surface-2 px-2 py-0.5 text-[0.8125rem] text-ink">
            {skillName(id)}
          </li>
        ))}
      </ul>
    </div>
  );
}
