import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Icon, type IconName } from "./Icon";

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mx-auto w-full max-w-[1160px] px-4 sm:px-6 lg:px-8", className)}>{children}</div>;
}

interface SectionProps {
  id: string;
  title: string;
  intro?: ReactNode;
  children: ReactNode;
  className?: string;
  /** Extra element aligned to the right of the heading on wide screens. */
  aside?: ReactNode;
}

export function Section({ id, title, intro, children, className, aside }: SectionProps) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={cn("border-t border-line py-16 sm:py-24", className)}>
      <Container>
        <div className="mb-10 flex flex-col gap-4 sm:mb-12 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <h2 id={`${id}-title`} className="text-[1.75rem] font-semibold leading-tight tracking-[-0.02em] sm:text-[2.125rem]">
              {title}
            </h2>
            {intro && <p className="mt-3 text-[1.0625rem] leading-relaxed text-muted">{intro}</p>}
          </div>
          {aside}
        </div>
        {children}
      </Container>
    </section>
  );
}

type ButtonVariant = "primary" | "secondary" | "ghost";

const buttonStyles: Record<ButtonVariant, string> = {
  primary: "bg-accent text-accent-ink hover:brightness-110",
  secondary: "border border-line-strong bg-surface text-ink hover:border-accent",
  ghost: "text-muted hover:text-ink",
};

interface ButtonLinkProps {
  href: string;
  children: ReactNode;
  variant?: ButtonVariant;
  icon?: IconName;
  external?: boolean;
  download?: string | boolean;
  className?: string;
}

/** A link styled as a button. Uses next/link for in-site routes. */
export function ButtonLink({ href, children, variant = "secondary", icon, external, download, className }: ButtonLinkProps) {
  const classes = cn(
    "inline-flex h-11 items-center justify-center gap-2 rounded-lg px-4 text-[0.9375rem] font-medium transition-colors",
    buttonStyles[variant],
    className,
  );
  const content = (
    <>
      {icon && <Icon name={icon} size={17} />}
      {children}
    </>
  );
  const isInternalRoute = href.startsWith("/") && !external && !download && !href.endsWith(".pdf");
  if (isInternalRoute) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }
  return (
    <a
      href={href}
      className={classes}
      download={download}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {content}
    </a>
  );
}

export function Tag({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-line px-2.5 py-0.5 text-[0.8125rem] leading-6 text-muted",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function ExternalTextLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 font-medium text-accent underline-offset-4 hover:underline"
    >
      {children}
      <Icon name="arrowUpRight" size={15} />
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  );
}
