import type { Skill, SkillTrack } from "@/types/content";

/** Display names and order for the skill tracks. These follow the resume's skill groups. */
export const skillTracks: { id: SkillTrack; name: string; description: string }[] = [
  { id: "analysis", name: "Data analysis", description: "Querying, cleaning and understanding data" },
  { id: "bigdata", name: "Big data", description: "Processing data that doesn't fit in memory" },
  { id: "nlp", name: "NLP", description: "Search, classification and structure from text" },
  { id: "ml", name: "Machine learning", description: "Predictive models, tuning and explanation" },
  { id: "bi", name: "Visualisation & BI", description: "Turning results into something people use" },
  { id: "deployment", name: "Deployment", description: "Serving models and apps" },
  { id: "tools", name: "Languages & tools", description: "Day-to-day environment" },
];

/**
 * Every skill listed on the resume. Projects, the data journey and the
 * pipeline reference these by id, and the skills matrix counts the evidence.
 * Add a skill here first, then reference its id from a project's `stack`.
 */
export const skills: Skill[] = [
  // Data analysis
  { id: "python", name: "Python", track: "analysis" },
  { id: "sql", name: "SQL", track: "analysis" },
  { id: "pandas", name: "Pandas", track: "analysis" },
  { id: "numpy", name: "NumPy", track: "analysis" },
  { id: "polars", name: "Polars", track: "analysis" },
  { id: "duckdb", name: "DuckDB", track: "analysis" },
  { id: "data-cleaning", name: "Data cleaning", track: "analysis" },
  { id: "eda", name: "Exploratory data analysis", track: "analysis" },
  { id: "feature-engineering", name: "Feature engineering", track: "analysis" },
  { id: "statistics", name: "Statistical testing", track: "analysis" },

  // Big data
  { id: "pyspark", name: "PySpark", track: "bigdata" },
  { id: "spark-sql", name: "Spark SQL", track: "bigdata" },
  { id: "parquet", name: "Parquet", track: "bigdata" },
  { id: "medallion", name: "Medallion architecture", track: "bigdata" },
  { id: "streaming-algorithms", name: "Streaming algorithms (Flajolet–Martin)", track: "bigdata" },

  // NLP
  { id: "text-preprocessing", name: "Text preprocessing", track: "nlp" },
  { id: "tfidf", name: "TF-IDF", track: "nlp" },
  { id: "lsa", name: "Latent semantic analysis (LSA)", track: "nlp" },
  { id: "topic-modelling", name: "Topic modelling (NMF)", track: "nlp" },
  { id: "ner", name: "Named entity recognition", track: "nlp" },
  { id: "text-classification", name: "Text classification", track: "nlp" },
  { id: "summarisation", name: "Extractive summarisation (TextRank)", track: "nlp" },

  // Machine learning
  { id: "scikit-learn", name: "Scikit-learn", track: "ml" },
  { id: "lightgbm", name: "LightGBM", track: "ml" },
  { id: "xgboost", name: "XGBoost", track: "ml" },
  { id: "catboost", name: "CatBoost", track: "ml" },
  { id: "optuna", name: "Optuna", track: "ml" },
  { id: "shap", name: "SHAP", track: "ml" },
  { id: "classification", name: "Classification", track: "ml" },
  { id: "regression", name: "Regression", track: "ml" },
  { id: "clustering", name: "Clustering (K-Means)", track: "ml" },
  { id: "imbalanced-learning", name: "Imbalanced learning", track: "ml" },
  { id: "hyperparameter-tuning", name: "Hyperparameter tuning", track: "ml" },

  // Visualisation & BI
  { id: "streamlit", name: "Streamlit", track: "bi" },
  { id: "plotly", name: "Plotly", track: "bi" },
  { id: "matplotlib", name: "Matplotlib", track: "bi" },
  { id: "seaborn", name: "Seaborn", track: "bi" },
  { id: "power-bi", name: "Power BI", track: "bi" },
  { id: "excel", name: "Excel", track: "bi" },

  // Deployment
  { id: "fastapi", name: "FastAPI", track: "deployment" },
  { id: "flask", name: "Flask", track: "deployment" },
  { id: "rest-apis", name: "REST APIs", track: "deployment" },
  { id: "docker", name: "Docker", track: "deployment" },

  // Languages & tools
  { id: "java", name: "Java", track: "tools" },
  { id: "javascript", name: "JavaScript", track: "tools" },
  { id: "mysql", name: "MySQL", track: "tools" },
  { id: "git", name: "Git & GitHub", track: "tools" },
  { id: "jupyter", name: "Jupyter Notebook", track: "tools" },
  { id: "linux", name: "Linux", track: "tools" },
];
