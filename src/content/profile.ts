/**
 * Who you are and how people reach you.
 * Everything here comes from your resume. Edit freely — no UI code to touch.
 */
export const profile = {
  name: "Mangirish Samant",
  roles: ["Data Analyst", "Data Engineer", "Data Scientist"],
  location: "Mumbai, India",

  /** One or two sentences under your name in the hero. */
  headline:
    "Final-year computer engineering student who builds end-to-end data projects in Python and SQL — a PySpark pipeline over 76 million government price records, an NLP search engine for Parliament, and tuned models served through FastAPI and Docker.",

  /** Shown as a small status pill above your name. Set to "" to hide it. */
  availability: "Open to data analyst and data scientist roles",

  /** About section. Each string is one paragraph. */
  about: [
    "I like data that starts out messy and ends up useful. My projects begin with large public datasets — government price records, parliamentary questions, loan applications — and end with something a person can use: a dashboard, a search app or a model behind an API.",
    "On the data engineering side, MandiPulse cleans 76 million AGMARKNET mandi price records (6.5 GB, 26 years) with PySpark into a bronze/silver/gold Parquet layout, then answers questions about volatility, seasonality and price shocks in Spark SQL. It also estimates distinct counts with a Flajolet–Martin sketch I implemented in Spark SQL.",
    "On the modelling side, SansadLens classifies Lok Sabha questions across 51 ministries at 78.1% accuracy (against a 6% baseline) after I removed a phrase that was leaking the label. My credit-risk model uses LightGBM tuned with Optuna, a decision threshold chosen for an 8% default rate, SHAP to explain it and FastAPI to serve it; my cross-sell model compares five algorithms and scores 0.863 ROC-AUC on a private leaderboard.",
  ],

  /** Short facts shown beside the About text. */
  facts: [
    { label: "Studying", value: "B.E. Computer Engineering, RGIT Mumbai (2023–2027)" },
    { label: "CGPA", value: "8.76 / 10" },
    { label: "Based in", value: "Mumbai, India" },
    { label: "Core stack", value: "Python, SQL, PySpark, Scikit-learn, LightGBM, FastAPI" },
    { label: "Looking for", value: "Data analyst and data scientist roles and internships" },
  ],

  /** Headline numbers in the hero. Every one is on the resume. */
  highlights: [
    { value: 76, suffix: "M", label: "price records processed with PySpark", href: "/projects/mandipulse-crop-price-analytics" },
    { value: 78.1, suffix: "%", decimals: 1, label: "ministry accuracy across 51 classes (baseline 6%)", href: "/projects/sansadlens-lok-sabha-nlp" },
    { value: 0.863, decimals: 3, label: "ROC-AUC on a private hackathon leaderboard", href: "/projects/customer-cross-sell-prediction" },
    { value: 8.76, decimals: 2, label: "CGPA in B.E. Computer Engineering", href: "#background" },
  ],

  email: "mangirishsamant4@gmail.com",
  links: {
    github: "https://github.com/MangirishSamant05",
    linkedin: "https://www.linkedin.com/in/mangirish-samant-862075353",
  },
  githubUsername: "MangirishSamant05",

  /** Replace the PDF at this path to update your resume. Keep the same file name. */
  resume: {
    path: "/resume/Mangirish-Samant-Resume.pdf",
    fileName: "Mangirish-Samant-Resume.pdf",
  },
} as const;

/**
 * Site-level settings.
 * Set NEXT_PUBLIC_SITE_URL in your hosting dashboard once you know your domain.
 */
export const site = {
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://mangirish-samant.vercel.app").replace(/\/$/, ""),
  title: "Mangirish Samant — Data Analyst, Data Engineer & Data Scientist",
  description:
    "Portfolio of Mangirish Samant: a PySpark and Spark SQL pipeline over 76M Indian crop price records, NLP search and classification of Lok Sabha questions, and tuned LightGBM models served with FastAPI and Docker.",
  keywords: [
    "Data Analyst portfolio",
    "Data Engineer portfolio",
    "Data Scientist portfolio",
    "Mangirish Samant",
    "Python",
    "SQL",
    "PySpark",
    "Spark SQL",
    "NLP",
    "Machine Learning",
    "LightGBM",
    "FastAPI",
    "Streamlit",
    "Mumbai",
  ],
  /**
   * Optional contact form. Create a free form at formspree.io (or any service
   * that accepts a JSON POST) and set NEXT_PUBLIC_CONTACT_FORM_ENDPOINT.
   * When it's not set, the site shows email and social links only — it never
   * shows a form that can't send.
   */
  contactFormEndpoint: process.env.NEXT_PUBLIC_CONTACT_FORM_ENDPOINT ?? "",
  /** Shows your latest public repositories under Projects. Falls back silently if GitHub is unreachable. */
  showGitHubRepos: true,
} as const;
