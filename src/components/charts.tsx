"use client";

import { useEffect, useRef, useState, type PointerEvent, type ReactNode, type RefObject } from "react";

/** Width of an element in CSS pixels, kept up to date as it resizes. */
export function useElementWidth<T extends HTMLElement>(fallback = 600): [RefObject<T | null>, number] {
  const ref = useRef<T | null>(null);
  const [width, setWidth] = useState(fallback);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setWidth(Math.max(240, Math.round(el.getBoundingClientRect().width)));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width];
}

function niceMax(value: number): number {
  if (value <= 0) return 1;
  const exp = 10 ** Math.floor(Math.log10(value));
  const n = value / exp;
  const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10;
  return step * exp;
}

export function ChartFrame({ title, subtitle, children, legend }: { title: string; subtitle?: string; children: ReactNode; legend?: ReactNode }) {
  return (
    <figure className="flex h-full min-w-0 flex-col rounded-xl border border-line bg-surface p-4 sm:p-5">
      <figcaption className="mb-3 flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
        <div>
          <p className="font-medium">{title}</p>
          {subtitle && <p className="text-sm text-faint">{subtitle}</p>}
        </div>
        {legend}
      </figcaption>
      <div className="min-w-0 flex-1">{children}</div>
    </figure>
  );
}

export function LegendItem({ swatch, label, dashed }: { swatch: string; label: string; dashed?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-muted">
      {dashed ? (
        <span aria-hidden className={`inline-block h-0 w-4 border-t-2 border-dashed ${swatch}`} />
      ) : (
        <span aria-hidden className={`inline-block h-2.5 w-2.5 rounded-full ${swatch}`} />
      )}
      {label}
    </span>
  );
}

function Tooltip({ x, y, width, children }: { x: number; y: number; width: number; children: ReactNode }) {
  const left = Math.min(Math.max(x, 70), width - 70);
  return (
    <div
      role="presentation"
      className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-lg border border-line bg-surface px-3 py-2 text-[0.8125rem] shadow-card"
      style={{ left, top: y - 10 }}
    >
      {children}
    </div>
  );
}

/* -------------------------------------------------------------------------- */

interface LineChartProps {
  labels: readonly string[];
  values: number[];
  format: (v: number) => string;
  ariaLabel: string;
  detail?: (index: number) => ReactNode;
}

export function LineChart({ labels, values, format, ariaLabel, detail }: LineChartProps) {
  const [ref, width] = useElementWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const height = 230;
  const pad = { l: 52, r: 12, t: 12, b: 26 };
  const w = width - pad.l - pad.r;
  const h = height - pad.t - pad.b;
  const max = niceMax(Math.max(...values, 0));
  const X = (i: number) => pad.l + (labels.length > 1 ? (i / (labels.length - 1)) * w : w / 2);
  const Y = (v: number) => pad.t + h - (v / max) * h;
  const path = values.map((v, i) => `${i ? "L" : "M"}${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join(" ");
  const area = `${path} L${X(values.length - 1)},${Y(0)} L${X(0)},${Y(0)} Z`;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * max);
  const showEvery = width < 420 ? 2 : 1;

  function onMove(e: PointerEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const i = Math.round(((px - pad.l) / w) * (labels.length - 1));
    setHover(Math.min(labels.length - 1, Math.max(0, i)));
  }

  return (
    <div ref={ref} className="relative w-full min-w-0">
      <svg width={width} height={height} role="img" aria-label={ariaLabel} onPointerMove={onMove} onPointerLeave={() => setHover(null)} className="block max-w-full touch-pan-y">
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={width - pad.r} y1={Y(t)} y2={Y(t)} className="stroke-grid" />
            <text x={pad.l - 8} y={Y(t)} dy="0.32em" textAnchor="end" className="fill-faint text-[11px] tabular">
              {format(t)}
            </text>
          </g>
        ))}
        {labels.map((label, i) =>
          i % showEvery === 0 ? (
            <text key={label} x={X(i)} y={height - 6} textAnchor="middle" className="fill-faint text-[11px]">
              {label}
            </text>
          ) : null,
        )}
        <path d={area} className="fill-viz-1 opacity-[0.12]" />
        <path d={path} fill="none" strokeWidth={2} strokeLinejoin="round" className="stroke-viz-1" />
        {hover !== null && (
          <>
            <line x1={X(hover)} x2={X(hover)} y1={pad.t} y2={pad.t + h} className="stroke-line-strong" strokeDasharray="3 3" />
            <circle cx={X(hover)} cy={Y(values[hover])} r={4.5} strokeWidth={2} className="fill-viz-1 stroke-surface" />
          </>
        )}
      </svg>
      {hover !== null && (
        <Tooltip x={X(hover)} y={Y(values[hover])} width={width}>
          <p className="font-medium">{labels[hover]}</p>
          <p className="text-muted tabular">{format(values[hover])}</p>
          {detail?.(hover)}
        </Tooltip>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */

interface BarChartProps {
  items: { label: string; value: number }[];
  format: (v: number) => string;
  ariaLabel: string;
}

export function BarChart({ items, format, ariaLabel }: BarChartProps) {
  // Bars carry their own value labels, so scale to the largest bar rather than a rounded axis.
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <ul aria-label={ariaLabel} className="space-y-3">
      {items.map((item) => (
        <li key={item.label} className="grid grid-cols-[5.5rem_1fr] items-center gap-3">
          <span className="text-sm text-muted">{item.label}</span>
          <span className="flex items-center gap-2">
            <span className="h-5 flex-1 overflow-hidden rounded-r-[4px] bg-surface-2">
              <span
                className="block h-full rounded-r-[4px] bg-viz-3 transition-[width] duration-500"
                style={{ width: `${(item.value / max) * 100}%` }}
              />
            </span>
            <span className="w-14 text-right text-sm tabular">{format(item.value)}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

/* -------------------------------------------------------------------------- */

interface ScatterPoint {
  x: number;
  y: number;
  group: "a" | "b";
  label: ReactNode;
}

interface ScatterProps {
  points: ScatterPoint[];
  fit: { slope: number; intercept: number };
  xLabel: string;
  yLabel: string;
  ariaLabel: string;
}

export function ScatterChart({ points, fit, xLabel, yLabel, ariaLabel }: ScatterProps) {
  const [ref, width] = useElementWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const height = 250;
  const pad = { l: 40, r: 12, t: 24, b: 34 };
  const w = width - pad.l - pad.r;
  const h = height - pad.t - pad.b;
  const xMax = niceMax(Math.max(...points.map((p) => p.x), 1));
  const yMax = niceMax(Math.max(...points.map((p) => p.y), 1));
  const X = (v: number) => pad.l + (v / xMax) * w;
  const Y = (v: number) => pad.t + h - (v / yMax) * h;
  const xTicks = Array.from({ length: 6 }, (_, i) => (i * xMax) / 5);
  const yTicks = [0, 0.5, 1].map((f) => f * yMax);
  const fy = (x: number) => Math.min(yMax, Math.max(0, fit.slope * x + fit.intercept));

  function onMove(e: PointerEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    let best = -1;
    let bestD = 18 * 18;
    points.forEach((p, i) => {
      const d = (X(p.x) - px) ** 2 + (Y(p.y) - py) ** 2;
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    });
    setHover(best >= 0 ? best : null);
  }

  const hp = hover !== null ? points[hover] : null;

  return (
    <div ref={ref} className="relative w-full min-w-0">
      <svg width={width} height={height} role="img" aria-label={ariaLabel} onPointerMove={onMove} onPointerLeave={() => setHover(null)} className="block max-w-full touch-pan-y">
        {yTicks.map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={width - pad.r} y1={Y(t)} y2={Y(t)} className="stroke-grid" />
            <text x={pad.l - 8} y={Y(t)} dy="0.32em" textAnchor="end" className="fill-faint text-[11px] tabular">
              {Math.round(t)}
            </text>
          </g>
        ))}
        {xTicks.map((t) => (
          <text key={t} x={X(t)} y={pad.t + h + 16} textAnchor="middle" className="fill-faint text-[11px] tabular">
            {Math.round(t)}%
          </text>
        ))}
        <text x={width - pad.r} y={height - 2} textAnchor="end" className="fill-faint text-[11px]">
          {xLabel}
        </text>
        <text x={pad.l} y={11} className="fill-faint text-[11px]">
          {yLabel}
        </text>
        {points.map((p, i) => (
          <circle
            key={i}
            cx={X(p.x)}
            cy={Y(p.y)}
            r={hover === i ? 5.5 : 3.6}
            strokeWidth={1}
            className={`${p.group === "a" ? "fill-viz-2" : "fill-viz-1"} stroke-surface`}
            opacity={hover === null || hover === i ? 0.9 : 0.45}
          />
        ))}
        <line
          x1={X(0)}
          y1={Y(fy(0))}
          x2={X(xMax)}
          y2={Y(fy(xMax))}
          strokeWidth={2}
          strokeDasharray="6 4"
          className="stroke-ink"
          opacity={0.75}
        />
      </svg>
      {hp && (
        <Tooltip x={X(hp.x)} y={Y(hp.y)} width={width}>
          {hp.label}
        </Tooltip>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */

export interface Series {
  name: string;
  values: (number | null)[];
  /** Tailwind stroke class, e.g. "stroke-viz-1". */
  stroke: string;
  /** Matching fill class for the hover dot, e.g. "fill-viz-1". */
  fill: string;
  dashed?: boolean;
  /** Shade the area under this series. */
  area?: boolean;
}

interface SeriesChartProps {
  labels: readonly string[];
  series: Series[];
  format: (v: number) => string;
  ariaLabel: string;
  /** Which x labels get a tick. */
  tick: (index: number, width: number) => boolean;
  /** Text for a tick (defaults to the x label). */
  tickText?: (index: number) => string;
  /** Label shown in the tooltip header (defaults to the x label). */
  tooltipLabel?: (index: number) => string;
  height?: number;
  /** Highlighted x positions (e.g. price shocks). */
  markers?: { index: number; label: string }[];
  /** Start the y axis at the data minimum instead of zero. */
  fitMin?: boolean;
}

/** Line chart for long, possibly gappy series. Gaps (null) break the line instead of being drawn as zero. */
export function SeriesChart({ labels, series, format, ariaLabel, tick, tickText, tooltipLabel, height = 250, markers = [], fitMin }: SeriesChartProps) {
  const [ref, width] = useElementWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const pad = { l: 56, r: 14, t: 14, b: 26 };
  const w = width - pad.l - pad.r;
  const h = height - pad.t - pad.b;
  const all = series.flatMap((s) => s.values.filter((v): v is number => v !== null));
  const rawMax = Math.max(...all, 0);
  const max = niceMax(rawMax);
  const min = fitMin ? Math.max(0, Math.floor((Math.min(...all) * 0.9) / niceMax(rawMax / 5)) * niceMax(rawMax / 5)) : 0;
  const n = labels.length;
  const X = (i: number) => pad.l + (n > 1 ? (i / (n - 1)) * w : w / 2);
  const Y = (v: number) => pad.t + h - ((v - min) / (max - min || 1)) * h;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => min + f * (max - min));

  const pathFor = (values: (number | null)[]) => {
    let d = "";
    let pen = false;
    values.forEach((v, i) => {
      if (v === null) {
        pen = false;
        return;
      }
      d += `${pen ? "L" : "M"}${X(i).toFixed(1)},${Y(v).toFixed(1)}`;
      pen = true;
    });
    return d;
  };
  const areaFor = (values: (number | null)[]) => {
    // One closed shape per unbroken run.
    const runs: [number, number][] = [];
    let s = -1;
    values.forEach((v, i) => {
      if (v !== null && s < 0) s = i;
      if ((v === null || i === values.length - 1) && s >= 0) {
        runs.push([s, v === null ? i - 1 : i]);
        s = -1;
      }
    });
    return runs
      .map(([a, b]) => {
        const seg = values.slice(a, b + 1).map((v, k) => `${k ? "L" : "M"}${X(a + k).toFixed(1)},${Y(v as number).toFixed(1)}`).join("");
        return `${seg}L${X(b).toFixed(1)},${Y(min)}L${X(a).toFixed(1)},${Y(min)}Z`;
      })
      .join("");
  };

  function onMove(e: PointerEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const i = Math.round(((px - pad.l) / w) * (n - 1));
    setHover(Math.min(n - 1, Math.max(0, i)));
  }

  const hv = hover !== null ? series.map((s) => s.values[hover]) : [];
  const anchor = hover !== null ? hv.find((v): v is number => v !== null) : undefined;

  return (
    <div ref={ref} className="relative w-full min-w-0">
      <svg width={width} height={height} role="img" aria-label={ariaLabel} onPointerMove={onMove} onPointerLeave={() => setHover(null)} className="block max-w-full touch-pan-y">
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={width - pad.r} y1={Y(t)} y2={Y(t)} className="stroke-grid" />
            <text x={pad.l - 8} y={Y(t)} dy="0.32em" textAnchor="end" className="fill-faint text-[11px] tabular">
              {format(t)}
            </text>
          </g>
        ))}
        {labels.map((label, i) =>
          tick(i, width) ? (
            <g key={i}>
              <line x1={X(i)} x2={X(i)} y1={pad.t + h} y2={pad.t + h + 4} className="stroke-line-strong" />
              <text x={X(i)} y={height - 6} textAnchor="middle" className="fill-faint text-[11px] tabular">
                {tickText ? tickText(i) : label}
              </text>
            </g>
          ) : null,
        )}
        {markers.map((m) => (
          <line key={m.index} x1={X(m.index)} x2={X(m.index)} y1={pad.t} y2={pad.t + h} className="stroke-viz-2" strokeOpacity={0.45} strokeDasharray="2 3" />
        ))}
        {series.map((s) =>
          s.area ? <path key={`${s.name}-area`} d={areaFor(s.values)} className={`${s.fill} opacity-[0.12]`} /> : null,
        )}
        {series.map((s) => (
          <path
            key={s.name}
            d={pathFor(s.values)}
            fill="none"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
            strokeDasharray={s.dashed ? "5 4" : undefined}
            className={s.stroke}
          />
        ))}
        {hover !== null && (
          <>
            <line x1={X(hover)} x2={X(hover)} y1={pad.t} y2={pad.t + h} className="stroke-line-strong" strokeDasharray="3 3" />
            {series.map((s, k) =>
              hv[k] !== null && hv[k] !== undefined ? (
                <circle key={s.name} cx={X(hover)} cy={Y(hv[k] as number)} r={4.5} strokeWidth={2} className={`${s.fill} stroke-surface`} />
              ) : null,
            )}
          </>
        )}
      </svg>
      {hover !== null && anchor !== undefined && (
        <Tooltip x={X(hover)} y={Y(anchor)} width={width}>
          <p className="font-medium">{tooltipLabel ? tooltipLabel(hover) : labels[hover]}</p>
          {series.map((s, k) => (
            <p key={s.name} className="flex items-center gap-1.5 text-muted tabular">
              {series.length > 1 && <span aria-hidden className={`inline-block h-2 w-2 rounded-full ${s.fill.replace("fill-", "bg-")}`} />}
              {series.length > 1 && <span>{s.name}:</span>}
              <span className="text-ink">{hv[k] === null || hv[k] === undefined ? "no data" : format(hv[k] as number)}</span>
            </p>
          ))}
          {markers.find((m) => m.index === hover) && <p className="text-viz-2">{markers.find((m) => m.index === hover)!.label}</p>}
        </Tooltip>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */

/** Twelve monthly columns around an index of 100 (= the year's average). */
export function IndexColumns({ values, labels, ariaLabel }: { values: (number | null)[]; labels: readonly string[]; ariaLabel: string }) {
  const [ref, width] = useElementWidth<HTMLDivElement>(360);
  const [hover, setHover] = useState<number | null>(null);
  const height = 200;
  const pad = { l: 34, r: 6, t: 14, b: 24 };
  const w = width - pad.l - pad.r;
  const h = height - pad.t - pad.b;
  const present = values.filter((v): v is number => v !== null);
  const spread = Math.max(10, ...present.map((v) => Math.abs(v - 100)));
  const lim = Math.ceil(spread / 10) * 10;
  const Y = (v: number) => pad.t + h / 2 - ((v - 100) / lim) * (h / 2);
  const slot = w / values.length;
  const bw = Math.max(6, Math.min(22, slot - 6));

  return (
    <div ref={ref} className="relative w-full min-w-0">
      <svg width={width} height={height} role="img" aria-label={ariaLabel} onPointerLeave={() => setHover(null)} className="block max-w-full">
        {[100 - lim, 100, 100 + lim].map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={width - pad.r} y1={Y(t)} y2={Y(t)} className={t === 100 ? "stroke-line-strong" : "stroke-grid"} />
            <text x={pad.l - 6} y={Y(t)} dy="0.32em" textAnchor="end" className="fill-faint text-[11px] tabular">
              {t}
            </text>
          </g>
        ))}
        {values.map((v, i) => {
          const cx = pad.l + slot * i + slot / 2;
          if (v === null) return null;
          const up = v >= 100;
          const y0 = Y(100);
          const y1 = Y(v);
          const top = Math.min(y0, y1);
          const hgt = Math.max(1, Math.abs(y1 - y0));
          return (
            <g key={i} onPointerEnter={() => setHover(i)}>
              <rect x={cx - slot / 2} y={pad.t} width={slot} height={h} fill="transparent" />
              <rect
                x={cx - bw / 2}
                y={top}
                width={bw}
                height={hgt}
                rx={3}
                className={up ? "fill-viz-2" : "fill-viz-3"}
                opacity={hover === null || hover === i ? 1 : 0.5}
              />
              <text x={cx} y={height - 6} textAnchor="middle" className="fill-faint text-[11px]">
                {width < 420 ? labels[i][0] : labels[i]}
              </text>
            </g>
          );
        })}
      </svg>
      {hover !== null && values[hover] !== null && (
        <Tooltip x={pad.l + slot * hover + slot / 2} y={Y(values[hover] as number)} width={width}>
          <p className="font-medium">{labels[hover]}</p>
          <p className="text-muted tabular">
            Index {(values[hover] as number).toFixed(0)}{" "}
            <span className="text-faint">
              ({(values[hover] as number) >= 100 ? "+" : "−"}
              {Math.abs((values[hover] as number) - 100).toFixed(0)}% vs. yearly average)
            </span>
          </p>
        </Tooltip>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */

/** Horizontal bars around 100: left = cheaper than the national price, right = dearer. */
export function DivergingBars({
  items,
  ariaLabel,
  detail,
}: {
  items: { label: string; value: number }[];
  ariaLabel: string;
  detail: (index: number) => string;
}) {
  const lim = Math.max(20, ...items.map((i) => Math.abs(i.value - 100)));
  return (
    <ul aria-label={ariaLabel} className="space-y-1.5">
      {items.map((item, idx) => {
        const d = item.value - 100;
        const pct = (Math.abs(d) / lim) * 50;
        return (
          <li key={item.label} className="group grid grid-cols-[7.5rem_1fr_3.25rem] items-center gap-2 text-sm" title={detail(idx)}>
            <span className="truncate text-muted group-hover:text-ink">{item.label}</span>
            <span className="relative h-4">
              <span aria-hidden className="absolute inset-y-[-3px] left-1/2 w-px bg-line-strong" />
              <span
                className={`absolute inset-y-0 ${d >= 0 ? "rounded-r-[3px] bg-viz-2" : "rounded-l-[3px] bg-viz-3"} transition-[width] duration-500`}
                style={d >= 0 ? { left: "50%", width: `${pct}%` } : { right: "50%", width: `${pct}%` }}
              />
            </span>
            <span className="text-right tabular text-ink">{item.value.toFixed(0)}</span>
          </li>
        );
      })}
    </ul>
  );
}
