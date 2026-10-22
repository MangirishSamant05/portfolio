import { ButtonLink, Container } from "@/components/ui";

export default function NotFound() {
  return (
    <Container className="py-32">
      <p className="font-mono text-sm text-faint">404</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-[-0.02em]">This page doesn&apos;t exist</h1>
      <p className="mt-3 max-w-md text-muted">The link may be out of date. Everything on the site starts from the home page.</p>
      <div className="mt-8">
        <ButtonLink href="/" variant="primary">
          Go to the home page
        </ButtonLink>
      </div>
    </Container>
  );
}
