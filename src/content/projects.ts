import type { Project } from "@/types/content";

/**
 * Projects.
 *
 * Source of truth: the resume (October 2026). Dataset details and insights come
 * from the READMEs and code in each GitHub repository; MandiPulse insights are
 * read straight from its gold tables. Heart Disease and Bulldozer come from the
 * notebooks in your public repos — their metrics are the numbers printed there.
 *
 * To add a project: copy one object, give it a unique `slug`, and set
 * `status: "draft"` until it's ready. Drafts show in `npm run dev` only.
 */
export const projects: Project[] = [
  {
    slug: "mandipulse-crop-price-analytics",
    title: "MandiPulse — India Crop Price Analytics",
    shortTitle: "MandiPulse",
    tagline: "A PySpark and Spark SQL pipeline over 76 million government mandi price records, from raw CSVs to a five-page Streamlit dashboard.",
    categories: ["Data Engineering", "Data Analytics"],
    featured: true,
    status: "published",
    order: 1,
    problem:
      "India publishes daily wholesale prices from thousands of agricultural markets (mandis), but as 26 yearly CSVs totalling 6.5 GB. Which crops swing the most, when in the year each crop is cheapest, when prices spiked, and how much more one state pays than another are all buried in 76 million rows.",
    data: {
      description:
        "AGMARKNET daily mandi prices, 2001–2026: 76M rows across 26 yearly CSVs (~6.5 GB) with state, district, market, commodity, variety and min/max/modal price in ₹ per quintal. Published by the Ministry of Agriculture & Farmers Welfare under the Government Open Data License.",
      source: { label: "AGMARKNET via data.gov.in", url: "https://agmarknet.gov.in/" },
    },
    pipeline: [
      { stage: "collection", detail: "All 26 yearly CSVs read as one PySpark DataFrame, every column as text first so nothing is silently mis-typed." },
      { stage: "cleaning", detail: "Standardised names, parsed dates and prices, dropped impossible rows (missing dates, prices ≤ 0, min/modal/max out of order) → 74.2M valid rows in year-partitioned Parquet." },
      { stage: "features", detail: "Pre-aggregated 74M daily rows to one row per mandi × commodity × month, so medians never sort the raw data." },
      { stage: "eda", detail: "9 gold tables in Spark SQL: CTEs, window functions, LAG, RANK, rolling 12-month z-scores and approximate medians." },
      { stage: "evaluation", detail: "Flajolet–Martin distinct counts validated against exact COUNT(DISTINCT) and Spark's HyperLogLog++." },
      { stage: "insights", detail: "Five-page Streamlit + Plotly dashboard that reads only the small gold tables, so it loads instantly." },
    ],
    stack: [
      "pyspark", "spark-sql", "parquet", "medallion", "streaming-algorithms",
      "python", "sql", "pandas", "data-cleaning", "eda", "statistics", "streamlit", "plotly",
    ],
    methodology: [
      "Medallion layout: raw CSVs (bronze) → cleaned, typed Parquet partitioned by year (silver) → nine small summary tables (gold). Spark does the heavy work once, offline; the dashboard never touches the 76M rows.",
      "Prices are summarised with medians across mandis rather than means, so a single mis-keyed price in one market can't move the national figure.",
      "Seasonality is each month's price as a percentage of that year's average (100 = normal), averaged over every year with at least nine months of data.",
      "A price shock is a month at least 2.5 standard deviations and 30% away from the commodity's own rolling 12-month mean (ROWS BETWEEN 12 PRECEDING AND 1 PRECEDING), so ordinary seasonal swings aren't flagged.",
      "Flajolet–Martin: each key is hashed by 64 hash functions with xxhash64, and only the maximum trailing-zero count per hash is kept. Monthly sketches merge with MAX into yearly, all-time and running estimates.",
    ],
    contributions: [
      "Built a PySpark pipeline over 76M daily price records (6.5 GB, 26 years), cleaning them to 74.2M valid rows across 7,278 mandis and 397 commodities, stored as year-partitioned Parquet in bronze/silver/gold layers.",
      "Wrote Spark SQL (CTEs, window functions, LAG, RANK, rolling 12-month z-scores, approximate medians) to build 9 summary tables on volatility, seasonality, price shocks and state-vs-national price gaps.",
      "Implemented the Flajolet–Martin streaming algorithm in Spark SQL to estimate distinct mandis with 64-byte sketches, validated against exact counts and HyperLogLog, and presented everything in a 5-page Streamlit + Plotly dashboard.",
    ],
    results: [
      { label: "Records processed", value: "76M", context: "26 yearly CSVs, ~6.5 GB, cleaned to 74.2M valid rows" },
      { label: "Coverage", value: "7,278 mandis", context: "397 commodities, 2001–2026" },
      { label: "FM sketch size", value: "64 bytes", context: "Per distinct-count sketch, vs ~213 KB for the exact set of mandi keys" },
    ],
    insights: [
      "Onion is cheapest in May, at about 65% of its yearly average, and dearest in November at about 137% — a swing of more than 2× within a typical year.",
      "Tomato peaks in July (about 147% of its yearly average) and bottoms out in February (about 65%).",
      "Wheat and rice barely move with the seasons — their monthly index stays within about ±6% of the yearly average, the steadiest of the staples shown on this site.",
    ],
    links: [
      { kind: "github", label: "Code on GitHub", url: "https://github.com/MangirishSamant05/MandiPulse" },
    ],
  },
  {
    slug: "sansadlens-lok-sabha-nlp",
    title: "SansadLens — Lok Sabha Questions NLP Search & Analytics",
    shortTitle: "SansadLens",
    tagline: "A Flask app that searches 4,750 questions MPs asked ministers, predicts which ministry must answer, and summarises them in the MPs' own words.",
    categories: ["NLP", "Machine Learning"],
    featured: true,
    status: "published",
    order: 2,
    problem:
      "Parliamentary questions show what MPs are worried about, but the record is a long list of formal text. A citizen or researcher who wants everything asked about groundwater in Maharashtra, or which ministry handles a topic, has to read through thousands of entries.",
    data: {
      description:
        "4,750 questions listed for the Winter Session of the 17th Lok Sabha (29 November – 23 December 2021), parsed from loksabha.nic.in, with asking MPs, ministry, party, State and constituency.",
      source: { label: "Lok Sabha questions dataset (Sammit Jain)", url: "https://github.com/sammitjain/loksabha-questions" },
    },
    pipeline: [
      { stage: "cleaning", detail: "Stripped the fixed opening that names the ministry, split questions into their (a), (b), (c) clauses, merged spelling variants and lemmatised plurals." },
      { stage: "features", detail: "TF-IDF (1–2 grams, sublinear tf) and a 200-dimension LSA space for meaning-based matching." },
      { stage: "modeling", detail: "Logistic Regression over 51 ministries; NMF topic model with 14 themes; rule-based NER; TextRank + MMR summaries." },
      { stage: "evaluation", detail: "948 held-out questions: 78.1% accuracy, 91.0% top-3, 0.756 macro F1 against a 6% majority-class baseline." },
      { stage: "deployment", detail: "Flask web app with hand-written templates; models build on first run and are cached." },
      { stage: "insights", detail: "A 543-seat hemicycle shows which MPs asked related questions, by State and party." },
    ],
    stack: [
      "tfidf", "lsa", "text-classification", "topic-modelling", "flask",
      "ner", "summarisation", "text-preprocessing", "scikit-learn", "classification", "python", "pandas",
    ],
    methodology: [
      "Every question begins \"Will the Minister of RAILWAYS be pleased to state…\". Left in, that sentence gives the answer away and the classifier scores near 100% while learning nothing, so it is removed before training.",
      "Search scores each question as 55% LSA cosine similarity plus 45% TF-IDF cosine similarity: TF-IDF matches your words, LSA matches their meaning.",
      "If the query names a State, it boosts questions from that State instead of being treated as a topic word, so \"groundwater in Maharashtra\" returns groundwater questions first.",
      "Summaries use query-biased TextRank with Maximal Marginal Relevance, picking five clauses that don't repeat each other.",
    ],
    contributions: [
      "Built a Flask web app that searches 4,750 parliamentary questions (Winter Session 2021) using hybrid TF-IDF + LSA semantic search with State-aware ranking.",
      "Trained a ministry classifier (Logistic Regression) across 51 ministries: 78.1% accuracy, 91.0% top-3 and 0.756 macro F1 on 948 held-out questions vs a 6% baseline, after removing a label-leaking opening phrase.",
      "Added NMF topic modelling (14 themes), rule-based NER for States, constituencies and schemes, and TextRank + MMR summaries.",
    ],
    results: [
      { label: "Ministry accuracy", value: "78.1%", context: "51 classes, 948 held-out questions" },
      { label: "Top-3 accuracy", value: "91.0%", context: "Same held-out questions" },
      { label: "Macro F1", value: "0.756", context: "Same held-out questions" },
      { label: "Baseline", value: "6.0%", context: "Always guessing the most common ministry" },
    ],
    insights: [
      "Removing one leaking sentence turned a meaningless near-100% score into an honest 78.1% — the most important modelling decision in the project.",
      "Top-3 accuracy (91%) is well above top-1, which fits how many questions sit between ministries — paddy procurement, for example, could go to Consumer Affairs, Food and Public Distribution or to Agriculture.",
    ],
    links: [
      { kind: "github", label: "Code on GitHub", url: "https://github.com/MangirishSamant05/SansadLens" },
      { kind: "demo", label: "Try the classifier on this site", url: "/#lab" },
    ],
  },
  {
    slug: "credit-risk-loan-default",
    title: "Credit Risk & Loan Default Prediction System",
    shortTitle: "Credit risk",
    tagline: "A LightGBM default model built from seven related tables, threshold-tuned for an 8% default rate and served through FastAPI in Docker.",
    categories: ["Machine Learning", "Data Analytics", "Backend & MLOps"],
    featured: true,
    status: "published",
    order: 3,
    problem:
      "Home Credit lends to people with little or no credit history. It needs to approve those who will repay and reject those likely to default — when only about 8% of borrowers default, so a model that says \"no one defaults\" is 92% accurate and useless.",
    data: {
      description:
        "Home Credit Default Risk data: current and previous loan applications, monthly repayment behaviour and credit-bureau records, spread across seven related tables.",
      source: { label: "Kaggle — Home Credit Default Risk", url: "https://www.kaggle.com/c/home-credit-default-risk" },
    },
    pipeline: [
      { stage: "collection", detail: "Joined seven relational tables with SQL in DuckDB." },
      { stage: "features", detail: "Repayment-behaviour features aggregated with SQL and Featuretools, plus ratios such as goods price to credit amount." },
      { stage: "eda", detail: "EDA and statistical tests on the top features, including whether relationships with default are linear." },
      { stage: "modeling", detail: "Top 15 features chosen by LightGBM importance and statistical tests; Decision Tree and LightGBM tuned with Optuna." },
      { stage: "evaluation", detail: "Decision threshold tuned for precision at 50% recall on the imbalanced target." },
      { stage: "deployment", detail: "FastAPI /predict endpoint, containerised with Docker." },
      { stage: "insights", detail: "SHAP to explain which features drive default risk." },
    ],
    stack: [
      "lightgbm", "optuna", "shap", "fastapi", "docker",
      "sql", "duckdb", "polars", "python", "pandas", "eda", "statistics", "feature-engineering", "clustering",
      "hyperparameter-tuning", "imbalanced-learning", "classification", "rest-apis",
    ],
    methodology: [
      "Aggregated monthly bureau, cash, POS and instalment balances into per-customer features with SQL (DuckDB) and Featuretools, and tried K-Means clusters as features.",
      "Cut the feature set aggressively to the top 15 by LightGBM importance and statistical tests, which keeps the API input small.",
      "Tuned LightGBM and Decision Tree models with Optuna on ROC-AUC, then tuned the decision threshold on precision instead of using the default 0.5.",
      "Explained the model's drivers with SHAP and served it from a FastAPI endpoint in a Docker container.",
    ],
    contributions: [
      "Built a loan default model on the Home Credit dataset, joining 7 relational tables and engineering repayment-behaviour features with SQL (DuckDB) and Featuretools; selected the top 15 features via LightGBM importance and statistical tests.",
      "Tuned LightGBM and Decision Tree models with Optuna and tuned the decision threshold for a highly imbalanced target (~8% defaulters), raising precision from 0.17 to 0.21 at 50% recall.",
      "Explained drivers with SHAP and served the model via a FastAPI endpoint in Docker.",
    ],
    results: [
      { label: "Precision at 50% recall", value: "0.21", context: "Tuned LightGBM, up from 0.17 untuned" },
      { label: "Default rate", value: "~8%", context: "Share of defaulters in the target" },
      { label: "Features in final model", value: "15", context: "Selected from seven joined tables" },
    ],
    insights: [
      "Customers who borrow more than the price of the goods they're financing are one of the main high-risk groups — tying the credit amount to the goods price would cut that risk.",
      "Years of employment, age, gender and previous risk score are all related to default, but statistical testing showed the relationships aren't linear, which favours tree models.",
    ],
    links: [
      { kind: "github", label: "Code on GitHub", url: "https://github.com/MangirishSamant05/Credit-Risk-Loan-Default-Prediction-System" },
    ],
  },
  {
    slug: "customer-cross-sell-prediction",
    title: "Customer Cross-Sell Prediction (Vehicle Insurance)",
    shortTitle: "Cross-sell",
    tagline: "Predicting which of 381K insurance customers will buy vehicle insurance — and which ones a campaign can safely skip.",
    categories: ["Machine Learning", "Data Analytics"],
    featured: true,
    status: "published",
    order: 4,
    problem:
      "An insurer wants to offer vehicle insurance to its existing health-insurance customers. Calling everyone is expensive, so it needs to know who is likely to say yes and who is almost certain to say no.",
    data: {
      description:
        "381K customers with demographics, vehicle age and damage history, previous insurance and annual premium, labelled with whether they were interested. The target is heavily imbalanced.",
      source: {
        label: "Analytics Vidhya — JanataHack: Cross-sell Prediction",
        url: "https://datahack.analyticsvidhya.com/contest/janatahack-cross-sell-prediction/",
      },
    },
    pipeline: [
      { stage: "eda", detail: "Conversion rates by vehicle damage, previous insurance, age and premium." },
      { stage: "cleaning", detail: "Categorical encoding and scaling." },
      { stage: "modeling", detail: "Random Forest, XGBoost, CatBoost, LightGBM and a neural network compared." },
      { stage: "evaluation", detail: "Stratified K-fold so each fold keeps the same share of interested customers; ROC-AUC." },
      { stage: "insights", detail: "Which customer groups a campaign should target and which it can skip." },
    ],
    stack: [
      "lightgbm", "xgboost", "catboost", "scikit-learn", "imbalanced-learning",
      "python", "pandas", "numpy", "eda", "data-cleaning", "classification", "matplotlib", "seaborn", "jupyter",
    ],
    methodology: [
      "Explored the class balance and each feature's relationship with the target before modelling.",
      "Used stratified K-fold cross-validation so every fold kept the same share of interested customers.",
      "Compared Random Forest, XGBoost, CatBoost, LightGBM and a neural network on ROC-AUC, the competition's metric.",
    ],
    contributions: [
      "Predicted which of 381K insurance customers would buy vehicle insurance (Analytics Vidhya JanataHack).",
      "EDA showed customers with past vehicle damage convert at 23.8% vs 0.5%, and already-insured customers almost never do (0.1%), so campaigns can skip them.",
      "Compared Random Forest, XGBoost, CatBoost, LightGBM and a neural network with stratified K-fold; LightGBM scored 0.855 ROC-AUC on validation and 0.863 on the private leaderboard.",
    ],
    results: [
      { label: "Private leaderboard ROC-AUC", value: "0.863", context: "LightGBM, Analytics Vidhya JanataHack" },
      { label: "Validation ROC-AUC", value: "0.855", context: "Stratified K-fold, LightGBM" },
    ],
    insights: [
      "Customers whose vehicle had been damaged before convert at 23.8%, against 0.5% for those whose vehicle hadn't.",
      "Customers who already hold vehicle insurance convert at just 0.1% — leaving them out of campaigns saves almost all of that outreach effort.",
      "Interest is concentrated among customers aged roughly 20 to 40.",
    ],
    links: [
      { kind: "github", label: "Code on GitHub", url: "https://github.com/MangirishSamant05/Customer-Cross-Sell-Retention-Analytics-Platform" },
    ],
  },
  {
    slug: "heart-disease-classification",
    title: "Heart Disease Classification",
    shortTitle: "Heart disease",
    tagline: "Comparing and tuning three classifiers to predict heart disease from 13 clinical measurements.",
    categories: ["Machine Learning"],
    featured: false,
    status: "published",
    order: 5,
    problem: "Given a patient's clinical measurements, can a model predict whether they have heart disease?",
    data: {
      description:
        "UCI heart disease data: 303 patients, 13 clinical features (age, sex, chest-pain type, cholesterol, maximum heart rate, ST depression and more) and a binary target.",
      source: { label: "UCI Machine Learning Repository", url: "https://archive.ics.uci.edu/dataset/45/heart+disease" },
    },
    pipeline: [
      { stage: "eda", detail: "Disease frequency by sex and chest-pain type; age against maximum heart rate." },
      { stage: "modeling", detail: "Logistic Regression, K-Nearest Neighbours and Random Forest compared." },
      { stage: "evaluation", detail: "Tuned with RandomizedSearchCV and GridSearchCV; confusion matrix, classification report and ROC curve on a hold-out set." },
    ],
    stack: ["python", "pandas", "numpy", "eda", "scikit-learn", "classification", "hyperparameter-tuning", "matplotlib", "seaborn", "jupyter"],
    methodology: [
      "Explored how disease frequency varies with sex, chest-pain type, age and maximum heart rate.",
      "Compared Logistic Regression, KNN (k from 1 to 20) and Random Forest on a held-out test set.",
      "Tuned Logistic Regression and Random Forest with RandomizedSearchCV, then GridSearchCV.",
    ],
    contributions: [
      "Built the full notebook: data exploration, model comparison, hyperparameter tuning and evaluation.",
    ],
    results: [
      { label: "Test accuracy", value: "88.5%", context: "Tuned Logistic Regression, 61-patient hold-out set" },
      { label: "Random Forest accuracy", value: "83.6%", context: "After tuning, same 61-patient hold-out set" },
    ],
    insights: [],
    links: [
      { kind: "github", label: "Notebook on GitHub", url: "https://github.com/MangirishSamant05/Heart_Disease" },
    ],
  },
  {
    slug: "bulldozer-price-prediction",
    title: "Bulldozer Auction Price Prediction",
    shortTitle: "Bulldozer prices",
    tagline: "Predicting auction sale prices from 400k+ historical sales with a time-based validation split.",
    categories: ["Machine Learning"],
    featured: false,
    status: "published",
    order: 6,
    problem: "Predict the price a bulldozer will fetch at auction from its specification, usage and sale date.",
    data: {
      description:
        "Kaggle's Blue Book for Bulldozers: 412,698 historical auction sales with 53 columns, many of them sparse — usage band is missing for about 82% of rows.",
      source: { label: "Kaggle — Blue Book for Bulldozers", url: "https://www.kaggle.com/c/bluebook-for-bulldozers" },
    },
    pipeline: [
      { stage: "cleaning", detail: "Missing-value indicator columns, filled gaps, and categorical columns converted to numbers." },
      { stage: "features", detail: "Year, month, day, day-of-week and day-of-year extracted from the sale date." },
      { stage: "modeling", detail: "Random Forest and Histogram Gradient Boosting regressors; RandomizedSearchCV." },
      { stage: "evaluation", detail: "Time-based split: 2012 sales (11,573 rows) held out for validation; RMSLE, MAE and R²." },
    ],
    stack: ["python", "pandas", "numpy", "data-cleaning", "feature-engineering", "scikit-learn", "regression", "hyperparameter-tuning", "matplotlib", "jupyter"],
    methodology: [
      "Split by time rather than at random — trained on sales before 2012 and validated on 2012 — so the score reflects predicting future auctions.",
      "Added indicator columns for missing values before filling them, so the model can still use the fact that a value was missing.",
      "Engineered calendar features from the sale date and checked feature importance with permutation importance.",
    ],
    contributions: [
      "Built the full regression workflow: cleaning, feature engineering, modelling, tuning, and preparing the Kaggle test set in the same format.",
    ],
    results: [
      { label: "Validation R²", value: "0.882", context: "Random Forest, 2012 hold-out sales" },
      { label: "RMSLE", value: "0.246", context: "Same model and hold-out set" },
      { label: "MAE", value: "$5,963", context: "Mean absolute error on sale price" },
    ],
    insights: [],
    links: [
      { kind: "github", label: "Notebook on GitHub", url: "https://github.com/MangirishSamant05/bulldozer_price_prediction" },
    ],
  },


  /* ------------------------------------------------------------------ *
   * DRAFT — a deep learning project.
   * Appears in `npm run dev` with a Draft label and is left out of the
   * production build. Fill in the fields, then change status to "published".
   * ------------------------------------------------------------------ */
  {
    slug: "deep-learning-project",
    title: "Deep learning project — add title",
    shortTitle: "Deep learning",
    tagline: "Add a one-line description of what the model does.",
    categories: ["Deep Learning"],
    featured: false,
    status: "draft",
    order: 9,
    problem: "Add the problem this project solves.",
    data: { description: "Add the dataset: name, size, and where it came from." },
    pipeline: [],
    stack: ["python"],
    methodology: ["Add the architecture (e.g. CNN, LSTM, transformer) and framework you used."],
    contributions: ["Add what you built."],
    results: [],
    insights: [],
    links: [],
  },
];

/**
 * Smaller builds listed on the resume under "Other work", shown as one line
 * under the project grid. Add a `url` to make an item a link.
 */
export const otherWork: { title: string; stack: string; url?: string }[] = [
  { title: "Android quiz app", stack: "Java" },
  { title: "News aggregator web app", stack: "JavaScript, MySQL" },
];
