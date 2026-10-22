"use client";

import { useMemo, useState } from "react";
import raw from "@/content/data/mandipulse.json";
import { cn } from "@/lib/utils";
import { ChartFrame, DivergingBars, IndexColumns, LegendItem, SeriesChart } from "@/components/charts";

/**
 * MandiPulse explorer. Every number here is read from the gold tables that the
 * MandiPulse Spark pipeline wrote (exported to src/content/data/mandipulse.json).
 */

interface Commodity {
  id: string;
  name: string;
  source: string;
  records: number;
  markets: number;
  states: number;
  /** Monthly national median modal price (₹/quintal) from `start`, null where fewer than 8 mandis reported. */
  series: (number | null)[];
  seasonal: (number | null)[];
  volatility: [number, number, number][];
  shocks: { month: string; price: number; normal: number; pct: number; z: number; type: string }[];
  shockCounts: { spikes: number; crashes: number };
  gapYear: number | null;
  stateGaps: { state: string; index: number; price: number }[];
}

interface MandiData {
  commodities: Commodity[];
  kpis: { records: number; markets: number; commodities: number; states: number; districts: number; firstDate: string; lastDate: string };
  start: string;
  fm: [number, number, number, number][];
  fmAll: Record<string, { exact: number; fm: number; hll: number; exactBytes: number; fmErr: number; hllErr: number }>;
}

const data = raw as unknown as MandiData;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const [START_Y, START_M] = data.start.split("-").map(Number);

const inr = (v: number) => `₹${Math.round(v).toLocaleString("en-IN")}`;
const inrShort = (v: number) => (v >= 1000 ? `₹${(v / 1000).toFixed(v >= 10000 ? 0 : 1)}k` : `₹${Math.round(v)}`);
const monthLabel = (i: number) => {
  const m = START_M - 1 + i;
  return `${MONTHS[m % 12]} ${START_Y + Math.floor(m / 12)}`;
};
const yearOf = (i: number) => START_Y + Math.floor((START_M - 1 + i) / 12);
const fmtMonth = (ym: string) => {
  const [y, m] = ym.split("-").map(Number);
  return `${MONTHS[m - 1]} ${y}`;
};

type Range = "all" | "10y" | "3y";
const RANGES: { id: Range; label: string; months: number }[] = [
  { id: "all", label: "All years", months: Infinity },
  { id: "10y", label: "10 years", months: 120 },
  { id: "3y", label: "3 years", months: 36 },
];

/** Yearly average of monthly medians, for years with at least 9 months reported. */
function yearly(series: (number | null)[]) {
  const by = new Map<number, number[]>();
  series.forEach((v, i) => {
    if (v === null) return;
    const y = yearOf(i);
    by.set(y, [...(by.get(y) ?? []), v]);
  });
  return [...by.entries()]
    .filter(([, vs]) => vs.length >= 9)
    .map(([year, vs]) => ({ year, avg: vs.reduce((a, b) => a + b, 0) / vs.length, months: vs.length }));
}

function findings(c: Commodity, years: ReturnType<typeof yearly>): string[] {
  const out: string[] = [];
  const s = c.seasonal.map((v, i) => ({ v, i })).filter((x): x is { v: number; i: number } => x.v !== null);
  if (s.length) {
    const lo = s.reduce((a, b) => (b.v < a.v ? b : a));
    const hi = s.reduce((a, b) => (b.v > a.v ? b : a));
    const swing = hi.v - lo.v;
    out.push(
      swing < 12
        ? `${c.name} barely changes with the seasons: every month stays within ${Math.max(100 - lo.v, hi.v - 100).toFixed(0)}% of the yearly average.`
        : `${c.name} is cheapest in ${MONTH_NAMES[lo.i]} (${lo.v.toFixed(0)}% of the yearly average) and dearest in ${MONTH_NAMES[hi.i]} (${hi.v.toFixed(0)}%).`,
    );
  }
  if (years.length >= 2) {
    const first = years[0];
    const last = years[years.length - 1];
    const ratio = last.avg / first.avg;
    const span = last.year - first.year;
    const cagr = (Math.pow(ratio, 1 / span) - 1) * 100;
    out.push(
      `From ${first.year} to ${last.year} the typical price went from ${inr(first.avg)} to ${inr(last.avg)} per quintal — ${ratio.toFixed(1)}× overall, about ${cagr.toFixed(1)}% a year.`,
    );
  }
  const spike = c.shocks[0];
  if (spike) {
    out.push(
      `The biggest shock was ${fmtMonth(spike.month)}: ${inr(spike.price)}, ${Math.abs(spike.pct).toFixed(0)}% ${spike.pct > 0 ? "above" : "below"} its rolling 12-month normal (z = ${spike.z.toFixed(1)}).`,
    );
  } else {
    out.push(`No month in 26 years moved far enough from its rolling normal to count as a price shock.`);
  }
  if (c.stateGaps.length >= 2 && c.gapYear) {
    const cheap = c.stateGaps[0];
    const dear = c.stateGaps[c.stateGaps.length - 1];
    out.push(
      `In ${c.gapYear}, mandis in ${cheap.state} were ${(100 - cheap.index).toFixed(0)}% below the national price, while ${dear.state} was ${(dear.index - 100).toFixed(0)}% above it.`,
    );
  }
  return out;
}

export function CropExplorer() {
  const [id, setId] = useState(data.commodities[0].id);
  const [range, setRange] = useState<Range>("all");
  const [showTable, setShowTable] = useState(false);
  const c = data.commodities.find((x) => x.id === id) ?? data.commodities[0];

  const view = useMemo(() => {
    // Trim to the last month with data, then to the selected range.
    let end = c.series.length;
    while (end > 0 && c.series[end - 1] === null) end--;
    const months = RANGES.find((r) => r.id === range)!.months;
    const from = Math.max(0, end - months);
    const idx = Array.from({ length: end - from }, (_, k) => from + k);
    return { from, idx, values: idx.map((i) => c.series[i]), labels: idx.map(monthLabel) };
  }, [c, range]);

  const years = useMemo(() => yearly(c.series), [c]);
  const insights = useMemo(() => findings(c, years), [c, years]);
  const lastYear = years[years.length - 1];
  const tenBack = years.find((y) => y.year === lastYear.year - 10);
  const s = c.seasonal.filter((v): v is number => v !== null);
  const swing = s.length ? Math.max(...s) - Math.min(...s) : 0;

  const markers = c.shocks
    .map((sh) => {
      const [y, m] = sh.month.split("-").map(Number);
      const i = (y - START_Y) * 12 + (m - START_M) - view.from;
      return { index: i, label: `${sh.type}: ${sh.pct > 0 ? "+" : ""}${sh.pct.toFixed(0)}% vs normal` };
    })
    .filter((m) => m.index >= 0 && m.index < view.idx.length);

  const gaps = c.stateGaps.length > 12 ? [...c.stateGaps.slice(0, 6), ...c.stateGaps.slice(-6)] : c.stateGaps;

  return (
    <div>
      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-4">
        {[
          ["Valid daily records", `${(data.kpis.records / 1e6).toFixed(1)}M`],
          ["Mandis (markets)", data.kpis.markets.toLocaleString("en-IN")],
          ["Commodities", String(data.kpis.commodities)],
          ["Years covered", `${data.kpis.firstDate.slice(0, 4)}–${data.kpis.lastDate.slice(0, 4)}`],
        ].map(([label, value]) => (
          <div key={label} className="bg-surface px-4 py-3">
            <dt className="text-[0.8125rem] text-faint">{label}</dt>
            <dd className="font-mono text-lg font-medium tabular">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-5 rounded-xl border border-line bg-surface p-4 sm:p-5">
        <div role="group" aria-label="Commodity" className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-sm text-faint">Commodity</span>
          {data.commodities.map((x) => (
            <button
              key={x.id}
              type="button"
              aria-pressed={x.id === id}
              onClick={() => setId(x.id)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm transition-colors",
                x.id === id ? "border-accent bg-accent-soft text-ink" : "border-line text-muted hover:border-line-strong hover:text-ink",
              )}
            >
              {x.name}
            </button>
          ))}
        </div>
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label={`Typical price, ${lastYear.year}`} value={inr(lastYear.avg)} hint="Per quintal (100 kg), median across mandis" />
        <Kpi
          label={tenBack ? `Change since ${tenBack.year}` : "Change"}
          value={tenBack ? `${lastYear.avg >= tenBack.avg ? "+" : "−"}${Math.abs((lastYear.avg / tenBack.avg - 1) * 100).toFixed(0)}%` : "—"}
          hint="Yearly average of monthly medians"
        />
        <Kpi label="Seasonal swing" value={`${swing.toFixed(0)} pts`} hint="Dearest month minus cheapest, as % of the yearly average" />
        <Kpi
          label="Price shocks, 2001–2026"
          value={String(c.shockCounts.spikes + c.shockCounts.crashes)}
          hint={`${c.shockCounts.spikes} spikes, ${c.shockCounts.crashes} crashes (|z| ≥ 2.5 and ≥ 30% off normal)`}
        />
      </dl>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <div className="min-w-0 lg:col-span-2">
          <ChartFrame
            title={`${c.name}: national median price`}
            subtitle="₹ per quintal, monthly. Dotted lines mark the five largest price shocks."
            legend={
              <div role="group" aria-label="Time range" className="flex gap-1">
                {RANGES.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    aria-pressed={range === r.id}
                    onClick={() => setRange(r.id)}
                    className={cn(
                      "rounded-md px-2.5 py-1 text-[0.8125rem] transition-colors",
                      range === r.id ? "bg-accent-soft text-ink" : "text-muted hover:text-ink",
                    )}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            }
          >
            <SeriesChart
              labels={view.labels}
              series={[{ name: c.name, values: view.values, stroke: "stroke-viz-1", fill: "fill-viz-1", area: true }]}
              format={inrShort}
              markers={markers}
              ariaLabel={`Monthly national median price of ${c.name}, ${view.labels[0]} to ${view.labels[view.labels.length - 1]}.`}
              tickText={(i) => (range === "3y" ? view.labels[i] : view.labels[i].slice(4))}
              tick={(i, width) => {
                const lbl = view.labels[i];
                if (range === "3y") return lbl.startsWith("Jan") || lbl.startsWith("Jul");
                if (!lbl.startsWith("Jan")) return false;
                const y = Number(lbl.slice(4));
                const every = range === "10y" ? (width < 520 ? 2 : 1) : width < 520 ? 10 : 5;
                return y % every === 0;
              }}
            />
          </ChartFrame>
        </div>
        <ChartFrame
          title="Seasonal pattern"
          subtitle="Each month as % of its year's average (100 = normal)"
          legend={
            <span className="flex flex-wrap gap-x-3 gap-y-1">
              <LegendItem swatch="bg-viz-3" label="Cheaper" />
              <LegendItem swatch="bg-viz-2" label="Dearer" />
            </span>
          }
        >
          <IndexColumns values={c.seasonal} labels={MONTHS} ariaLabel={`Seasonal price index of ${c.name} by month.`} />
        </ChartFrame>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_1.15fr]">
        <ChartFrame
          title={`State vs. national price, ${c.gapYear ?? ""}`}
          subtitle={c.stateGaps.length > 12 ? "100 = national median. Six cheapest and six dearest states." : "100 = national median."}
          legend={
            <span className="flex flex-wrap gap-x-3 gap-y-1">
              <LegendItem swatch="bg-viz-3" label="Below national" />
              <LegendItem swatch="bg-viz-2" label="Above" />
            </span>
          }
        >
          <DivergingBars
            items={gaps.map((g) => ({ label: g.state, value: g.index }))}
            ariaLabel={`Price index by state for ${c.name}`}
            detail={(i) => `${gaps[i].state}: ${inr(gaps[i].price)} per quintal`}
          />
        </ChartFrame>

        <section aria-labelledby="crop-findings" className="rounded-xl border border-line bg-surface p-5">
          <h3 id="crop-findings" className="font-medium">
            What the data says
          </h3>
          <p className="text-sm text-faint">
            Computed in your browser from MandiPulse&apos;s gold tables · {c.records.toLocaleString("en-IN")} records for {c.name}
          </p>
          <ul className="mt-4 space-y-3" aria-live="polite">
            {insights.map((text) => (
              <li key={text} className="flex gap-3 leading-relaxed">
                <span aria-hidden className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="mt-5">
        <button
          type="button"
          aria-expanded={showTable}
          aria-controls="crop-table"
          onClick={() => setShowTable((v) => !v)}
          className="text-[0.9375rem] font-medium text-accent underline-offset-4 hover:underline"
        >
          {showTable ? "Hide the yearly table" : `Show ${c.name} by year as a table`}
        </button>
        <div id="crop-table" hidden={!showTable} className="mt-4 max-h-[22rem] overflow-auto rounded-xl border border-line bg-surface">
          <table className="w-full min-w-[460px] border-collapse text-left text-[0.9375rem]">
            <caption className="sr-only">Yearly average price and volatility for {c.name}</caption>
            <thead className="sticky top-0 bg-surface">
              <tr className="border-b border-line text-faint">
                <th scope="col" className="px-4 py-2.5 font-normal">Year</th>
                <th scope="col" className="px-4 py-2.5 text-right font-normal">Typical price (₹/qtl)</th>
                <th scope="col" className="px-4 py-2.5 text-right font-normal">Volatility (CV)</th>
                <th scope="col" className="px-4 py-2.5 text-right font-normal">Peak-to-trough</th>
              </tr>
            </thead>
            <tbody>
              {[...years].reverse().map((y) => {
                const v = c.volatility.find((r) => r[0] === y.year);
                return (
                  <tr key={y.year} className="border-b border-line last:border-0">
                    <th scope="row" className="px-4 py-2 font-medium tabular">{y.year}</th>
                    <td className="px-4 py-2 text-right tabular">{inr(y.avg)}</td>
                    <td className="px-4 py-2 text-right tabular">{v ? `${v[1].toFixed(1)}%` : "—"}</td>
                    <td className="px-4 py-2 text-right tabular">{v ? `${v[2].toFixed(0)}%` : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <FmPanel />
    </div>
  );
}

/** Flajolet–Martin vs exact vs HyperLogLog, per year. */
function FmPanel() {
  const all = data.fmAll.mandis;
  const labels = data.fm.map((r) => String(r[0]));
  const worst = data.fm.reduce((a, r) => Math.max(a, Math.abs(r[2] / r[1] - 1)), 0);
  const median = [...data.fm.map((r) => Math.abs(r[2] / r[1] - 1))].sort((a, b) => a - b)[Math.floor(data.fm.length / 2)];
  return (
    <div className="mt-10 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
      <ChartFrame
        title="Counting distinct mandis with 64 bytes"
        subtitle="Mandis active each year: exact count vs. my Flajolet–Martin sketch vs. Spark's HyperLogLog++"
        legend={
          <span className="flex flex-wrap gap-x-3 gap-y-1">
            <LegendItem swatch="bg-ink" label="Exact" />
            <LegendItem swatch="bg-viz-1" label="Flajolet–Martin" />
            <LegendItem swatch="border-viz-3" label="HyperLogLog++" dashed />
          </span>
        }
      >
        <SeriesChart
          labels={labels}
          height={220}
          series={[
            { name: "Exact", values: data.fm.map((r) => r[1]), stroke: "stroke-ink", fill: "fill-ink" },
            { name: "Flajolet–Martin", values: data.fm.map((r) => r[2]), stroke: "stroke-viz-1", fill: "fill-viz-1" },
            { name: "HyperLogLog++", values: data.fm.map((r) => r[3]), stroke: "stroke-viz-3", fill: "fill-viz-3", dashed: true },
          ]}
          format={(v) => Math.round(v).toLocaleString("en-IN")}
          tick={(i, width) => Number(labels[i]) % (width < 520 ? 10 : 5) === 0}
          ariaLabel="Distinct mandis per year: exact, Flajolet–Martin estimate and HyperLogLog estimate."
        />
      </ChartFrame>
      <section aria-labelledby="fm-notes" className="rounded-xl border border-line bg-surface p-5">
        <h3 id="fm-notes" className="font-medium">
          Why a sketch?
        </h3>
        <p className="mt-2 leading-relaxed text-muted">
          An exact distinct count has to remember every key it has seen — about {Math.round(all.exactBytes / 1024)} KB for
          the set of mandi keys. A Flajolet–Martin sketch keeps one small number per hash function: 64 bytes, no matter how
          many rows stream past.
        </p>
        <dl className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-surface-2 px-3.5 py-3">
            <dt className="text-[0.8125rem] text-faint">Median yearly error</dt>
            <dd className="mt-0.5 font-mono text-lg font-medium tabular">{(median * 100).toFixed(1)}%</dd>
          </div>
          <div className="rounded-lg bg-surface-2 px-3.5 py-3">
            <dt className="text-[0.8125rem] text-faint">Worst year</dt>
            <dd className="mt-0.5 font-mono text-lg font-medium tabular">{(worst * 100).toFixed(1)}%</dd>
          </div>
        </dl>
        <p className="mt-4 text-sm leading-relaxed text-faint">
          The trade-off is accuracy: HyperLogLog++ uses more registers and stays closer to exact. FM is implemented in pure Spark
          SQL with xxhash64 and bit tricks, in one parallel pass.
        </p>
      </section>
    </div>
  );
}

function Kpi({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-line bg-surface px-4 py-3.5">
      <dt className="text-sm text-faint">{label}</dt>
      <dd className="mt-1 font-mono text-[1.375rem] font-medium tabular sm:text-2xl">{value}</dd>
      {hint && <dd className="mt-1 text-[0.8125rem] leading-snug text-faint">{hint}</dd>}
    </div>
  );
}
