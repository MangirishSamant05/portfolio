/**
 * A browser port of SansadLens's ministry classifier.
 *
 * The tokenizer mirrors sansad/preprocess.py in the SansadLens repo (stopwords,
 * spelling merges, plural lemmatiser), and scoring mirrors scikit-learn's
 * TfidfVectorizer (1–2 grams, sublinear tf, L2 norm) + LogisticRegression.
 * The weights file is a compact version of the model (8,000-term vocabulary,
 * small weights pruned) exported by a script, then fetched only when needed.
 */

export interface SansadModel {
  classes: string[];
  bias: number[];
  /** term → [idf, classIndex, weight, classIndex, weight, ...] */
  terms: Record<string, number[]>;
  stopwords: string[];
  metrics: {
    accuracy: number;
    top3: number;
    macroF1: number;
    test: number;
    classes: number;
    baseline: number;
    weights: number;
    vocab: number;
  };
}

export interface Prediction {
  ministry: string;
  probability: number;
}

export interface Explained {
  predictions: Prediction[];
  /** Words that pushed the top prediction up the most, strongest first. */
  drivers: { term: string; weight: number }[];
  /** Tokens the model recognised (in its vocabulary). */
  known: number;
  tokens: string[];
}

const OPENING_RE = /^\s*will\s+the\s+minister\s+of\s+[\s\S]*?\s+be\s+pleased\s+to\s+state\s*[:;,.]?\s*/i;
const TOKEN_RE = /[a-z][a-z-]+/g;

const COMPOUNDS: [RegExp, string][] = [
  [/\bground[\s-]+water\b/g, "groundwater"],
  [/\brain[\s-]+water\b/g, "rainwater"],
  [/\bhealth[\s-]+care\b/g, "healthcare"],
  [/\bwater[\s-]+logging\b/g, "waterlogging"],
  [/\bover[\s-]+bridge/g, "overbridge"],
  [/\bunder[\s-]+bridge/g, "underbridge"],
  [/\bcovid[\s-]*19\b/g, "covid"],
  [/\bmgnrega?s?\b/g, "mgnrega"],
  [/\bvaccinations?\b/g, "vaccination"],
  [/fertilis/g, "fertiliz"],
  [/organis/g, "organiz"],
  [/utilis/g, "utiliz"],
  [/moderni[sz]/g, "moderniz"],
  [/digitis/g, "digitiz"],
  [/privatis/g, "privatiz"],
  [/urbanis/g, "urbaniz"],
  [/electrifi/g, "electrifi"],
];

function lemma(word: string): string {
  if (word.length <= 4) return word;
  if (word.endsWith("ies") && word.length > 5) return word.slice(0, -3) + "y";
  if (["sses", "shes", "ches", "xes"].some((s) => word.endsWith(s))) return word.slice(0, -2);
  if (word.endsWith("s") && !["ss", "us", "is", "ous", "ics"].some((s) => word.endsWith(s))) return word.slice(0, -1);
  return word;
}

function stripDashes(w: string): string {
  return w.replace(/^-+|-+$/g, "");
}

export function tokenize(text: string, stopwords: Set<string>): string[] {
  let t = text.replace(OPENING_RE, "").toLowerCase();
  for (const [re, rep] of COMPOUNDS) t = t.replace(re, rep);
  const out: string[] = [];
  for (const m of t.matchAll(TOKEN_RE)) {
    const raw = stripDashes(m[0]);
    if (raw.length < 3 || stopwords.has(raw) || raw.endsWith("wise")) continue;
    const word = lemma(raw);
    if (stopwords.has(word)) continue;
    out.push(word);
  }
  return out;
}

const stopCache = new WeakMap<SansadModel, Set<string>>();

export function classify(model: SansadModel, text: string, k = 3): Explained {
  let stop = stopCache.get(model);
  if (!stop) {
    stop = new Set(model.stopwords);
    stopCache.set(model, stop);
  }
  const tokens = tokenize(text, stop);
  const grams = [...tokens];
  for (let i = 0; i + 1 < tokens.length; i++) grams.push(`${tokens[i]} ${tokens[i + 1]}`);

  // Term counts → sublinear tf × idf, for terms the model knows.
  const counts = new Map<string, number>();
  for (const g of grams) if (model.terms[g]) counts.set(g, (counts.get(g) ?? 0) + 1);
  const feats: [string, number][] = [];
  let norm = 0;
  for (const [term, c] of counts) {
    const v = (1 + Math.log(c)) * model.terms[term][0];
    feats.push([term, v]);
    norm += v * v;
  }
  norm = Math.sqrt(norm) || 1;

  const scores = [...model.bias];
  const contrib = new Map<string, number[]>();
  for (const [term, v] of feats) {
    const row = model.terms[term];
    const x = v / norm;
    for (let i = 1; i < row.length; i += 2) {
      scores[row[i]] += row[i + 1] * x;
      let arr = contrib.get(term);
      if (!arr) contrib.set(term, (arr = []));
      arr[row[i]] = row[i + 1] * x;
    }
  }
  const max = Math.max(...scores);
  const exp = scores.map((s) => Math.exp(s - max));
  const sum = exp.reduce((a, b) => a + b, 0);
  const ranked = exp
    .map((e, i) => ({ ministry: model.classes[i], probability: e / sum, i }))
    .sort((a, b) => b.probability - a.probability);

  const top = ranked[0].i;
  const drivers = [...contrib.entries()]
    .map(([term, arr]) => ({ term, weight: arr[top] ?? 0 }))
    .filter((d) => d.weight > 0)
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 5);

  return {
    predictions: ranked.slice(0, k).map(({ ministry, probability }) => ({ ministry, probability })),
    drivers,
    known: feats.length,
    tokens,
  };
}
