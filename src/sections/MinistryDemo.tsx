"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { classify, type SansadModel } from "@/lib/sansad";
import { useInViewOnce } from "@/hooks";
import { cn } from "@/lib/utils";

const MODEL_URL = "/demo/sansadlens-model.json";

const EXAMPLES = [
  "Groundwater depletion in villages of Maharashtra",
  "Vacancies of teachers in Kendriya Vidyalayas",
  "Construction of a railway overbridge in Kerala",
  "COVID vaccination for children",
  "Price of LPG cylinders for poor households",
  "Procurement of paddy at MSP from farmers",
];

/**
 * Live SansadLens ministry classifier. The model (~250 KB) is fetched only when
 * this block scrolls into view, then every keystroke is classified locally.
 */
export function MinistryDemo() {
  const [ref, seen] = useInViewOnce<HTMLDivElement>("0px 0px 200px 0px");
  const [model, setModel] = useState<SansadModel | null>(null);
  const [failed, setFailed] = useState(false);
  const [text, setText] = useState(EXAMPLES[0]);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Also warm the model up a few seconds after load, so it's ready before anyone scrolls down.
  const [idle, setIdle] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setIdle(true), 4000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!(seen || idle) || model) return;
    let cancelled = false;
    fetch(MODEL_URL)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((m: SansadModel) => !cancelled && setModel(m))
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, [seen, idle, model]);

  const result = useMemo(() => (model && text.trim() ? classify(model, text) : null), [model, text]);
  const confident = result && result.known > 0;

  return (
    <div ref={ref} className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">
      <div className="rounded-xl border border-line bg-surface p-5">
        <label htmlFor="mq" className="font-medium">
          Ask a question an MP might ask
        </label>
        <p className="text-sm text-faint">The model guesses which ministry would have to answer it.</p>
        <textarea
          id="mq"
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          maxLength={400}
          spellCheck
          className="mt-4 w-full resize-none rounded-lg border border-line-strong bg-bg px-3.5 py-3 text-[1.0625rem] leading-relaxed outline-none transition-colors placeholder:text-faint focus:border-accent"
          placeholder="e.g. Shortage of doctors in rural hospitals"
        />
        <p className="mt-4 text-sm text-faint">Or try one:</p>
        <ul className="mt-2 flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <li key={ex}>
              <button
                type="button"
                onClick={() => {
                  setText(ex);
                  inputRef.current?.focus();
                }}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-left text-sm transition-colors",
                  text === ex ? "border-accent bg-accent-soft text-ink" : "border-line text-muted hover:border-line-strong hover:text-ink",
                )}
              >
                {ex}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col rounded-xl border border-line bg-surface p-5" aria-live="polite">
        <p className="font-medium">Predicted ministry</p>
        {!model && !failed && <p className="mt-3 text-muted">Loading the model…</p>}
        {failed && <p className="mt-3 text-muted">The model couldn&apos;t be loaded. Try refreshing the page.</p>}
        {model && result && !confident && (
          <p className="mt-3 text-muted">
            None of those words are in the model&apos;s vocabulary yet. Try naming a topic — railways, schools, water, farmers.
          </p>
        )}
        {model && confident && (
          <>
            <ol className="mt-4 space-y-3">
              {result.predictions.map((p, i) => (
                <li key={p.ministry}>
                  <div className="flex items-baseline justify-between gap-3">
                    <span className={cn("leading-snug", i === 0 ? "font-semibold" : "text-muted")}>
                      <span className="mr-2 font-mono text-sm text-faint">{i + 1}</span>
                      {p.ministry}
                    </span>
                    <span className="font-mono text-sm tabular">{(p.probability * 100).toFixed(0)}%</span>
                  </div>
                  <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-surface-2">
                    <span
                      className={cn("block h-full rounded-full transition-[width] duration-300", i === 0 ? "bg-accent" : "bg-line-strong")}
                      style={{ width: `${Math.max(2, p.probability * 100)}%` }}
                    />
                  </span>
                </li>
              ))}
            </ol>
            {result.drivers.length > 0 && (
              <p className="mt-5 text-sm text-muted">
                Words that pushed it there:{" "}
                {result.drivers.map((d, i) => (
                  <span key={d.term}>
                    {i > 0 && ", "}
                    <mark className="rounded bg-accent-soft px-1 text-ink">{d.term}</mark>
                  </span>
                ))}
              </p>
            )}
          </>
        )}
        {model && (
          <p className="mt-auto border-t border-line pt-4 text-[0.8125rem] leading-relaxed text-faint">
            Runs entirely in your browser: TF-IDF + logistic regression, {model.metrics.classes} ministries. This compact copy
            scores {(model.metrics.accuracy * 100).toFixed(1)}% (top-3 {(model.metrics.top3 * 100).toFixed(1)}%) on the same{" "}
            {model.metrics.test} held-out questions where the full model scores 78.1%.{" "}
            <Link href="/projects/sansadlens-lok-sabha-nlp" className="text-accent underline-offset-4 hover:underline">
              How it was built
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
