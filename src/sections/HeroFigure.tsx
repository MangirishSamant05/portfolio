"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks";
import { cn } from "@/lib/utils";

/**
 * The hero figure: one small dataset shown at four stages of a data workflow.
 * Raw data → cleaning → a fitted model → banded predictions. It autoplays
 * while visible, pauses off-screen, and each stage can be selected directly.
 * With reduced motion it shows the final stage and only changes on request.
 */

const STAGES = [
  { id: "raw", label: "Raw data" },
  { id: "clean", label: "Cleaning" },
  { id: "model", label: "Modelling" },
  { id: "insight", label: "Insight" },
] as const;

const STAGE_MS = 3400;
const FADE_MS = 700;

interface Point {
  x: number;
  y: number;
  kind: "ok" | "outlier" | "missing";
  delay: number;
}

function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function makeData() {
  const rand = seeded(424242);
  const gauss = () => {
    const u = Math.max(rand(), 1e-9);
    const v = rand();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };
  const points: Point[] = [];
  for (let i = 0; i < 104; i++) {
    const x = 0.04 + rand() * 0.92;
    const y = Math.min(0.97, Math.max(0.03, 0.16 + 0.62 * x + gauss() * 0.065));
    points.push({ x, y, kind: "ok", delay: rand() });
  }
  for (let i = 0; i < 9; i++) {
    const x = 0.1 + rand() * 0.8;
    const y = rand() < 0.5 ? 0.88 + rand() * 0.08 : 0.04 + rand() * 0.08;
    points.push({ x, y: Math.abs(y - (0.16 + 0.62 * x)) < 0.25 ? 0.93 : y, kind: "outlier", delay: rand() });
  }
  for (let i = 0; i < 7; i++) {
    points.push({ x: 0.06 + rand() * 0.88, y: 0, kind: "missing", delay: rand() });
  }

  const clean = points.filter((p) => p.kind === "ok");
  const n = clean.length;
  const mx = clean.reduce((s, p) => s + p.x, 0) / n;
  const my = clean.reduce((s, p) => s + p.y, 0) / n;
  let sxy = 0;
  let sxx = 0;
  let sst = 0;
  for (const p of clean) {
    sxy += (p.x - mx) * (p.y - my);
    sxx += (p.x - mx) ** 2;
    sst += (p.y - my) ** 2;
  }
  const slope = sxy / sxx;
  const intercept = my - slope * mx;
  let sse = 0;
  for (const p of clean) sse += (p.y - (slope * p.x + intercept)) ** 2;
  const r2 = 1 - sse / sst;
  const sd = Math.sqrt(sse / (n - 2));

  return {
    points,
    fit: { slope, intercept, r2, sd },
    counts: {
      total: points.length,
      outliers: points.filter((p) => p.kind === "outlier").length,
      missing: points.filter((p) => p.kind === "missing").length,
      clean: n,
    },
  };
}

function readColors() {
  const css = getComputedStyle(document.documentElement);
  const v = (name: string) => css.getPropertyValue(name).trim();
  return {
    ink: v("--ink"),
    muted: v("--muted"),
    faint: v("--faint"),
    grid: v("--grid"),
    line: v("--line-strong"),
    surface: v("--surface"),
    accent: v("--accent"),
    viz1: v("--viz-1"),
    viz2: v("--viz-2"),
    viz3: v("--viz-3"),
    viz4: v("--viz-4"),
  };
}

const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

export function HeroFigure() {
  const data = useMemo(makeData, []);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();
  const [stage, setStage] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const playing = autoplay && !reduced;

  // The animation loop lives outside React state; it reads these refs.
  const stageRef = useRef(0);
  const stageStart = useRef(0);
  const elapsedRef = useRef(0);
  const visibleRef = useRef(true);
  const playingRef = useRef(playing);
  const drawRef = useRef<(now: number) => void>(() => {});

  // Reduced motion: show the finished picture.
  useEffect(() => {
    if (reduced) {
      setStage(3);
      stageRef.current = 3;
    }
  }, [reduced]);

  const selectStage = useCallback((i: number) => {
    setAutoplay(false);
    setStage(i);
    stageRef.current = i;
    stageStart.current = performance.now();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let colors = readColors();
    let width = 0;
    let height = 0;
    let frame = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(() => {
      resize();
      if (!frame) draw(performance.now());
    });
    ro.observe(canvas);

    const themeObserver = new MutationObserver(() => {
      colors = readColors();
      if (!frame) draw(performance.now());
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    const io = new IntersectionObserver(([entry]) => {
      visibleRef.current = entry.isIntersecting;
      if (entry.isIntersecting && playingRef.current && !frame) {
        stageStart.current = performance.now() - elapsedRef.current;
        frame = requestAnimationFrame(loop);
      }
    });
    io.observe(wrap);

    function draw(now: number) {
      if (!ctx) return;
      const s = stageRef.current;
      const t = playingRef.current ? clamp01((now - stageStart.current) / FADE_MS) : 1;
      const k = ease(t);

      const padL = 34;
      const padR = 12;
      const padT = 12;
      const padB = 30;
      const w = width - padL - padR;
      const h = height - padT - padB;
      const X = (x: number) => padL + x * w;
      const Y = (y: number) => padT + (1 - y) * h;

      ctx.clearRect(0, 0, width, height);

      // Grid and axes
      ctx.lineWidth = 1;
      ctx.strokeStyle = colors.grid;
      for (let i = 1; i <= 4; i++) {
        const gy = Math.round(Y(i / 4)) + 0.5;
        ctx.beginPath();
        ctx.moveTo(padL, gy);
        ctx.lineTo(width - padR, gy);
        ctx.stroke();
      }
      ctx.strokeStyle = colors.line;
      ctx.beginPath();
      ctx.moveTo(padL + 0.5, padT);
      ctx.lineTo(padL + 0.5, height - padB + 0.5);
      ctx.lineTo(width - padR, height - padB + 0.5);
      ctx.stroke();

      ctx.fillStyle = colors.faint;
      ctx.font = "11px ui-sans-serif, system-ui, sans-serif";
      ctx.textBaseline = "top";
      ctx.textAlign = "right";
      ctx.fillText("feature", width - padR, height - padB + 9);
      ctx.save();
      ctx.translate(padL - 14, padT);
      ctx.rotate(-Math.PI / 2);
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillText("target", 0, 0);
      ctx.restore();

      const { slope, intercept, sd } = data.fit;
      const yhat = (x: number) => slope * x + intercept;
      const lo = yhat(0.04);
      const hi = yhat(0.96);
      const cut1 = lo + (hi - lo) / 3;
      const cut2 = lo + (2 * (hi - lo)) / 3;
      const xAt = (y: number) => (y - intercept) / slope;

      // Model band + line (stages 2 and 3)
      if (s >= 2) {
        const lineK = s === 2 ? k : 1;
        const x0 = 0.02;
        const x1 = x0 + (0.98 - x0) * lineK;
        ctx.globalAlpha = 0.16 * lineK;
        ctx.fillStyle = colors.accent;
        ctx.beginPath();
        ctx.moveTo(X(x0), Y(yhat(x0) + 1.96 * sd));
        ctx.lineTo(X(x1), Y(yhat(x1) + 1.96 * sd));
        ctx.lineTo(X(x1), Y(yhat(x1) - 1.96 * sd));
        ctx.lineTo(X(x0), Y(yhat(x0) - 1.96 * sd));
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.strokeStyle = colors.accent;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(X(x0), Y(yhat(x0)));
        ctx.lineTo(X(x1), Y(yhat(x1)));
        ctx.stroke();
      }

      // Band separators (stage 3)
      if (s === 3) {
        ctx.globalAlpha = k;
        ctx.setLineDash([3, 4]);
        ctx.strokeStyle = colors.line;
        ctx.lineWidth = 1;
        for (const c of [cut1, cut2]) {
          const bx = Math.round(X(xAt(c))) + 0.5;
          ctx.beginPath();
          ctx.moveTo(bx, padT);
          ctx.lineTo(bx, height - padB);
          ctx.stroke();
        }
        ctx.setLineDash([]);
        ctx.fillStyle = colors.muted;
        ctx.font = "12px ui-sans-serif, system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        const mid = (a: number, b: number) => X((xAt(a) + xAt(b)) / 2);
        ctx.fillText("Low", mid(lo, cut1), padT + 4);
        ctx.fillText("Medium", mid(cut1, cut2), padT + 4);
        ctx.fillText("High", mid(cut2, hi), padT + 4);
        ctx.globalAlpha = 1;
      }

      // Points
      for (const p of data.points) {
        let alpha = 1;
        let radius = 3.4;
        let fill = colors.muted;
        let hollow = false;
        let y = p.y;

        if (p.kind === "missing") {
          y = 0;
          hollow = true;
          fill = colors.viz4;
          if (s >= 1) {
            alpha = s === 1 ? 1 - k : 0;
          }
        } else if (p.kind === "outlier") {
          fill = colors.viz2;
          radius = 3.8;
          if (s >= 1) {
            alpha = s === 1 ? 1 - k : 0;
          }
        } else if (s === 3) {
          const pred = yhat(p.x);
          const band = pred < cut1 ? colors.viz3 : pred < cut2 ? colors.viz2 : colors.viz1;
          fill = k > 0.5 ? band : colors.muted;
        }

        if (s === 0 && playingRef.current) {
          const enter = clamp01(((now - stageStart.current) / 900 - p.delay * 0.6) / 0.4);
          alpha *= ease(enter);
        }
        if (alpha <= 0.01) continue;

        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(X(p.x), Y(y), radius, 0, Math.PI * 2);
        if (hollow) {
          ctx.lineWidth = 1.5;
          ctx.strokeStyle = fill;
          ctx.stroke();
        } else {
          ctx.fillStyle = fill;
          ctx.fill();
          ctx.lineWidth = 1;
          ctx.strokeStyle = colors.surface;
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
    }

    function loop(now: number) {
      frame = 0;
      if (!visibleRef.current || document.hidden) return;
      elapsedRef.current = now - stageStart.current;
      if (playingRef.current && elapsedRef.current > STAGE_MS) {
        const next = (stageRef.current + 1) % STAGES.length;
        stageRef.current = next;
        stageStart.current = now;
        elapsedRef.current = 0;
        setStage(next);
      }
      draw(now);
      if (playingRef.current) frame = requestAnimationFrame(loop);
    }

    drawRef.current = (now: number) => {
      if (playingRef.current) {
        if (!frame) frame = requestAnimationFrame(loop);
      } else {
        draw(now);
      }
    };

    const onVisibility = () => {
      if (!document.hidden && playingRef.current && !frame) {
        stageStart.current = performance.now() - elapsedRef.current;
        frame = requestAnimationFrame(loop);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    stageStart.current = performance.now();
    drawRef.current(performance.now());

    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      io.disconnect();
      themeObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
    // The loop reads changing values through refs; it only needs to start once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  useEffect(() => {
    playingRef.current = playing;
    drawRef.current(performance.now());
  }, [playing, stage]);

  const { counts, fit } = data;
  const captions = [
    `${counts.total} records, including ${counts.outliers} outliers and ${counts.missing} rows with a missing target.`,
    `Outliers and incomplete rows removed. ${counts.clean} records remain.`,
    `Least-squares fit: y = ${fit.slope.toFixed(2)}x + ${fit.intercept.toFixed(2)}, R² = ${fit.r2.toFixed(2)}. Shaded band is the 95% interval.`,
    "Predictions grouped into low, medium and high bands — a form someone can act on.",
  ];

  return (
    <figure ref={wrapRef} className="rounded-2xl border border-line bg-surface p-4 shadow-card sm:p-5">
      <canvas
        ref={canvasRef}
        className="block aspect-[4/3] w-full"
        role="img"
        aria-label={`Scatter plot at the "${STAGES[stage].label}" stage. ${captions[stage]}`}
      />
      <figcaption className="mt-4">
        <div role="group" aria-label="Workflow stage" className="grid grid-cols-4 gap-1 rounded-lg bg-surface-2 p-1">
          {STAGES.map((s, i) => (
            <button
              key={s.id}
              type="button"
              aria-pressed={stage === i}
              onClick={() => selectStage(i)}
              className={cn(
                "relative overflow-hidden rounded-md px-1 py-1.5 text-[0.8125rem] transition-colors sm:text-sm",
                stage === i ? "bg-surface font-medium text-ink shadow-sm" : "text-muted hover:text-ink",
              )}
            >
              {s.label}
              {stage === i && playing && (
                <span
                  aria-hidden
                  key={`${stage}-progress`}
                  className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-accent"
                  style={{ animation: `stage-progress ${STAGE_MS}ms linear forwards` }}
                />
              )}
            </button>
          ))}
        </div>
        <p className="mt-3 min-h-[3em] text-sm leading-relaxed text-muted" aria-live="polite">
          {captions[stage]}
        </p>
        {!playing && !reduced && (
          <button
            type="button"
            onClick={() => {
              stageStart.current = performance.now();
              setAutoplay(true);
            }}
            className="text-sm font-medium text-accent underline-offset-4 hover:underline"
          >
            Resume animation
          </button>
        )}
      </figcaption>
    </figure>
  );
}
