import { profile } from "@/content/profile";
import { Container } from "./ui";
import { Icon } from "./Icon";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-line py-10">
      <Container className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold">{profile.name}</p>
          <p className="mt-1 text-sm text-muted">{profile.roles.join(" | ")}</p>
        </div>
        <div className="flex flex-col gap-4 sm:items-end">
          <ul className="flex items-center gap-1">
            <FooterLink href={profile.links.github} label="GitHub" icon="github" />
            <FooterLink href={profile.links.linkedin} label="LinkedIn" icon="linkedin" />
            <FooterLink href={`mailto:${profile.email}`} label="Email" icon="mail" />
          </ul>
          <p className="text-sm text-faint">© {year} {profile.name}</p>
        </div>
      </Container>
    </footer>
  );
}

function FooterLink({ href, label, icon }: { href: string; label: string; icon: "github" | "linkedin" | "mail" }) {
  const external = !href.startsWith("mailto:");
  return (
    <li>
      <a
        href={href}
        aria-label={label}
        title={label}
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-ink"
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        <Icon name={icon} size={19} />
      </a>
    </li>
  );
}
