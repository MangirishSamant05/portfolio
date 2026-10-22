"""Export a compact SansadLens ministry classifier to public/demo/sansadlens-model.json.

Trains on the same 80/20 split as SansadLens (random_state=42), keeps an 8,000-term
vocabulary and drops weights smaller than 0.6, then reports held-out metrics.

Usage (from this portfolio folder):
    python scripts/export_sansadlens_model.py ../SansadLens
"""
from pathlib import Path
OUT = Path(__file__).resolve().parent.parent / 'public' / 'demo' / 'sansadlens-model.json'
import sys, json, numpy as np, pandas as pd
REPO = sys.argv[1] if len(sys.argv) > 1 else '../SansadLens'
sys.path.insert(0, REPO)
from sansad import preprocess as pp
from sansad.engine import load_questions, _vectorizer, MIN_CLASS_SIZE
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, f1_score, top_k_accuracy_score
from sklearn.pipeline import make_pipeline

df = load_questions(__import__('pathlib').Path(REPO) / 'data' / 'questions.csv')
counts = df.ministry.value_counts()
data = df[df.ministry.isin(counts[counts >= MIN_CLASS_SIZE].index)]
X_tr, X_te, y_tr, y_te = train_test_split(data.doc, data.ministry, test_size=0.2, random_state=42, stratify=data.ministry)
print("baseline", y_te.value_counts(normalize=True).iloc[0], len(X_te), data.ministry.nunique())

def evaluate(vec, clf, W=None, b=None):
    Xt = vec.transform(X_te)
    if W is None:
        P = clf.predict_proba(Xt)
    else:
        S = Xt @ W.T + b; S = S - S.max(1, keepdims=True); P = np.exp(S); P /= P.sum(1, keepdims=True)
    pred = clf.classes_[P.argmax(1)]
    return accuracy_score(y_te, pred), top_k_accuracy_score(y_te, P, k=3, labels=clf.classes_), f1_score(y_te, pred, average='macro')


vec = _vectorizer(max_df=0.5, max_features=8000); clf = LogisticRegression(C=12, max_iter=4000)
clf.fit(vec.fit_transform(X_tr), y_tr)
W = np.where(np.abs(clf.coef_) >= 0.6, clf.coef_, 0)
acc, top3, f1 = evaluate(vec, clf, np.round(W, 2), np.round(clf.intercept_, 3))
print("rounded", acc, top3, f1)
inv = {i: t for t, i in vec.vocabulary_.items()}
terms = {}
for j in range(W.shape[1]):
    nz = np.nonzero(W[:, j])[0]
    if len(nz) == 0: continue
    row = [round(float(vec.idf_[j]), 3)]
    for k in nz: row += [int(k), round(float(W[k, j]), 2)]
    terms[inv[j]] = row
model = {"classes": [str(c) for c in clf.classes_], "bias": [round(float(x), 3) for x in clf.intercept_], "terms": terms,
         "stopwords": sorted(pp.STOPWORDS),
         "metrics": {"accuracy": round(acc, 3), "top3": round(top3, 3), "macroF1": round(f1, 3), "test": int(len(X_te)), "classes": int(len(clf.classes_)), "baseline": round(float(y_te.value_counts(normalize=True).iloc[0]), 3), "weights": int((W != 0).sum()), "vocab": len(terms)}}
json.dump(model, open(OUT, 'w'), separators=(',', ':'), ensure_ascii=False)
print(model['metrics'])
