"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/Icon";

interface Repo {
  name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  pushed_at: string;
  fork: boolean;
}

/**
 * Latest public repositories, fetched in the visitor's browser.
 * Optional by design: if GitHub is slow, rate-limited or down, the list is
 * simply not shown and the profile link remains.
 */
export function GitHubRepos({ username, profileUrl }: { username: string; profileUrl: string }) {
  const [repos, setRepos] = useState<Repo[] | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 6000);
    fetch(`https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=pushed&per_page=12`, {
      signal: controller.signal,
      headers: { Accept: "application/vnd.github+json" },
    })
      .then((res) => (res.ok ? (res.json() as Promise<Repo[]>) : Promise.reject(new Error(String(res.status)))))
      .then((data) => setRepos(data.filter((r) => !r.fork).slice(0, 6)))
      .catch(() => setRepos([]))
      .finally(() => window.clearTimeout(timeout));
    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [username]);

  const allLink = (
    <a
      href={profileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-[0.9375rem] font-medium text-accent underline-offset-4 hover:underline"
    >
      <Icon name="github" size={16} />
      All repositories on GitHub
    </a>
  );

  // Not loaded yet, or GitHub unavailable: just the profile link, no empty heading.
  if (!repos || repos.length === 0) {
    return <div className="mt-10">{allLink}</div>;
  }

  return (
    <div className="mt-12">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <h3 className="text-lg font-semibold">Recently updated on GitHub</h3>
        {allLink}
      </div>
      <ul className="mt-4 grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
        {repos.map((repo) => (
          <li key={repo.name} className="bg-surface">
            <a
              href={repo.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-full flex-col gap-1 p-4 transition-colors hover:bg-surface-2"
            >
              <span className="font-medium">{repo.name.replace(/[-_]/g, " ")}</span>
              {repo.description && <span className="text-sm text-muted">{repo.description}</span>}
              <span className="mt-auto pt-2 text-[0.8125rem] text-faint">
                {[repo.language, `updated ${new Date(repo.pushed_at).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}`]
                  .filter(Boolean)
                  .join(", ")}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
