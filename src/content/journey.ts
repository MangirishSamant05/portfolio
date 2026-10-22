import type { JourneyStage, PipelineStep } from "@/types/content";

/**
 * The eight-stage workflow shown in "How I work".
 * `evidence` points at project slugs, so each stage links to real work.
 */
export const journey: JourneyStage[] = [
  {
    id: "collection",
    title: "Data collection",
    summary: "Pull data from its sources into a form that can be queried and checked.",
    skills: ["pyspark", "sql", "duckdb", "python"],
    evidence: [
      { project: "mandipulse-crop-price-analytics", note: "26 yearly CSVs (6.5 GB) read as one PySpark DataFrame" },
      { project: "credit-risk-loan-default", note: "Seven relational tables joined with SQL in DuckDB" },
      { project: "sansadlens-lok-sabha-nlp", note: "4,750 questions parsed from loksabha.nic.in" },
    ],
  },
  {
    id: "cleaning",
    title: "Data cleaning",
    summary: "Validate, fix and remove what can't be trusted, so later numbers can be.",
    skills: ["data-cleaning", "pyspark", "text-preprocessing", "pandas"],
    evidence: [
      { project: "mandipulse-crop-price-analytics", note: "76M rows → 74.2M valid after dropping impossible prices" },
      { project: "sansadlens-lok-sabha-nlp", note: "Removed a label-leaking phrase; merged spelling variants" },
      { project: "bulldozer-price-prediction", note: "Missing-value indicators across 412K rows" },
    ],
  },
  {
    id: "eda",
    title: "Exploratory analysis",
    summary: "Find the patterns, skews and relationships that shape the model or the answer.",
    skills: ["eda", "spark-sql", "statistics", "matplotlib", "seaborn"],
    evidence: [
      { project: "mandipulse-crop-price-analytics", note: "Window functions for seasonality, volatility and price shocks" },
      { project: "customer-cross-sell-prediction", note: "Past vehicle damage: 23.8% vs 0.5% conversion" },
      { project: "credit-risk-loan-default", note: "Statistical tests showed non-linear default drivers" },
    ],
  },
  {
    id: "features",
    title: "Feature engineering",
    summary: "Turn raw columns and text into signals a model can learn from.",
    skills: ["feature-engineering", "tfidf", "lsa", "sql"],
    evidence: [
      { project: "credit-risk-loan-default", note: "Repayment-behaviour aggregates; top 15 kept by LightGBM importance" },
      { project: "sansadlens-lok-sabha-nlp", note: "TF-IDF 1–2 grams and a 200-dimension LSA space" },
      { project: "bulldozer-price-prediction", note: "Calendar features from sale date" },
    ],
  },
  {
    id: "modeling",
    title: "Modelling",
    summary: "Fit and compare models suited to the question and the data.",
    skills: ["lightgbm", "xgboost", "catboost", "optuna", "scikit-learn", "text-classification", "topic-modelling"],
    evidence: [
      { project: "customer-cross-sell-prediction", note: "RF, XGBoost, CatBoost, LightGBM and a neural network" },
      { project: "credit-risk-loan-default", note: "LightGBM tuned with Optuna" },
      { project: "sansadlens-lok-sabha-nlp", note: "51-ministry classifier and 14-theme NMF topic model" },
    ],
  },
  {
    id: "evaluation",
    title: "Evaluation",
    summary: "Measure against the right metric and an honest baseline.",
    skills: ["imbalanced-learning", "statistics", "shap"],
    evidence: [
      { project: "sansadlens-lok-sabha-nlp", note: "78.1% on 948 held-out questions vs a 6% baseline" },
      { project: "credit-risk-loan-default", note: "Threshold tuned: precision 0.17 → 0.21 at 50% recall" },
      { project: "mandipulse-crop-price-analytics", note: "FM sketch checked against exact counts and HyperLogLog" },
    ],
  },
  {
    id: "deployment",
    title: "Deployment",
    summary: "Ship the result as something people can run or call.",
    skills: ["fastapi", "docker", "flask", "streamlit", "rest-apis"],
    evidence: [
      { project: "credit-risk-loan-default", note: "FastAPI /predict endpoint in a Docker container" },
      { project: "sansadlens-lok-sabha-nlp", note: "Flask search app; models cached on first run" },
      { project: "mandipulse-crop-price-analytics", note: "Streamlit app that reads only the gold tables" },
    ],
  },
  {
    id: "insights",
    title: "Business insights",
    summary: "Put the result in front of the people who decide.",
    skills: ["streamlit", "plotly", "shap", "summarisation"],
    evidence: [
      { project: "mandipulse-crop-price-analytics", note: "Five-page dashboard: prices, shocks, state gaps" },
      { project: "customer-cross-sell-prediction", note: "Already-insured customers (0.1%) can be skipped" },
      { project: "credit-risk-loan-default", note: "SHAP explains which features drive default" },
    ],
  },
];

/**
 * The reference data platform shown in "Data pipeline".
 * Only tools from the resume — add a step or a skill id when you learn a new one.
 * Keep exactly seven steps: the wide layout is a seven-column grid.
 */
export const pipelineSteps: PipelineStep[] = [
  {
    id: "sources",
    title: "Sources",
    description: "Government open data, competition datasets and relational tables.",
    skills: ["excel", "sql"],
  },
  {
    id: "ingest",
    title: "Ingest & clean",
    description: "Read everything as text, then type, validate and drop what's impossible.",
    skills: ["pyspark", "pandas", "polars", "data-cleaning"],
  },
  {
    id: "store",
    title: "Store",
    description: "Bronze/silver/gold Parquet, partitioned by year.",
    skills: ["parquet", "medallion", "duckdb", "mysql"],
  },
  {
    id: "transform",
    title: "Transform",
    description: "CTEs, window functions and sketches in Spark SQL.",
    skills: ["spark-sql", "sql", "streaming-algorithms"],
  },
  {
    id: "model",
    title: "Model",
    description: "Train, tune and explain models — tabular and text.",
    skills: ["lightgbm", "optuna", "shap", "tfidf"],
  },
  {
    id: "serve",
    title: "Serve",
    description: "APIs and web apps in containers.",
    skills: ["fastapi", "flask", "docker"],
  },
  {
    id: "consume",
    title: "Decide",
    description: "Dashboards and answers people act on.",
    skills: ["streamlit", "plotly", "power-bi"],
  },
];
