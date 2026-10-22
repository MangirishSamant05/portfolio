"""Export MandiPulse gold tables to src/content/data/mandipulse.json for the Live demos section.

Usage (from this portfolio folder):
    pip install pandas pyarrow
    python scripts/export_mandipulse.py ../MandiPulse/gold
"""
import sys, json
from pathlib import Path
import pandas as pd

G = sys.argv[1].rstrip('/') + '/' if len(sys.argv) > 1 else '../MandiPulse/gold/'
OUT = Path(__file__).resolve().parent.parent / 'src' / 'content' / 'data' / 'mandipulse.json'
T = {t: pd.read_parquet(G + t) for t in ['kpis','commodity_summary','national_monthly','seasonality','volatility','price_shocks','state_gaps','fm_summary','top_markets']}
PICK = [("Onion","Onion"),("Tomato","Tomato"),("Potato","Potato"),("Wheat","Wheat"),("Rice","Rice"),
        ("Arhar (tur/red Gram)(whole)","Tur (arhar)"),("Bengal Gram (gram)(whole)","Chana (Bengal gram)"),
        ("Garlic","Garlic"),("Green Chilli","Green chilli"),("Apple","Apple"),("Banana","Banana"),("Cotton","Cotton")]
START = (2001, 1); END = (2026, 4)
nmon = (END[0]-START[0])*12 + END[1]-START[1] + 1
out = {"commodities": []}
for raw, label in PICK:
    nm = T['national_monthly'][T['national_monthly'].commodity == raw]
    series = [None]*nmon
    for r in nm.itertuples():
        if r.markets < 8: continue
        i = (r.year-START[0])*12 + r.month-1
        if 0 <= i < nmon: series[i] = round(r.median_modal)
    se = T['seasonality'][T['seasonality'].commodity == raw].set_index('month')
    seasonal = [float(se.seasonal_index.get(m)) if m in se.index else None for m in range(1,13)]
    vo = T['volatility'][(T['volatility'].commodity == raw) & (T['volatility'].months >= 10)].sort_values('year')
    vol = [[int(r.year), float(r.volatility_pct), float(r.peak_to_trough_pct)] for r in vo.itertuples()]
    sh = T['price_shocks'][T['price_shocks'].commodity == raw].copy()
    nshocks = {"spikes": int((sh.shock_type=='Spike').sum()), "crashes": int((sh.shock_type=='Crash').sum())}
    sh = sh.reindex(sh.z_score.abs().sort_values(ascending=False).index).head(5)
    shocks = [{"month": str(r.month_start)[:7], "price": round(r.price), "normal": round(r.normal_price), "pct": float(r.pct_vs_normal), "z": float(r.z_score), "type": r.shock_type} for r in sh.itertuples()]
    sg = T['state_gaps'][T['state_gaps'].commodity == raw]
    yrs = sg.groupby('year').state.count()
    full = [y for y in yrs.index if yrs[y] >= 6 and y <= 2025]
    gy = max(full) if full else None
    gaps = sg[sg.year == gy].sort_values('price_index')
    states = [{"state": r.state, "index": float(r.price_index), "price": round(r.state_price)} for r in gaps.itertuples()]
    cs = T['commodity_summary'][T['commodity_summary'].commodity == raw].iloc[0]
    out["commodities"].append({"id": label.lower().split(' ')[0], "name": label, "source": raw,
        "records": int(cs.records), "markets": int(cs.markets), "states": int(cs.states),
        "series": series, "seasonal": seasonal, "volatility": vol, "shocks": shocks, "shockCounts": nshocks,
        "gapYear": int(gy) if gy else None, "stateGaps": states})
k = T['kpis'].iloc[0]
out["kpis"] = {"records": int(k.total_records), "markets": int(k.markets), "commodities": int(k.commodities), "states": int(k.states), "districts": int(k.districts), "firstDate": str(k.first_date), "lastDate": str(k.last_date)}
out["start"] = "2001-01"
fm = T['fm_summary'][(T['fm_summary'].metric=='mandis') & (T['fm_summary'].scope=='year')].sort_values('year')
out["fm"] = [[int(r.year), int(r.exact), round(r.fm), int(r.hll)] for r in fm.itertuples()]
fa = T['fm_summary'][T['fm_summary'].scope=='all']
out["fmAll"] = {r.metric: {"exact": int(r.exact), "fm": round(r.fm), "hll": int(r.hll), "exactBytes": int(r.exact_bytes), "fmErr": round(r.fm_err_pct,1), "hllErr": round(r.hll_err_pct,1)} for r in fa.itertuples()}
json.dump(out, open(OUT, 'w'), separators=(',', ':'))
for c in out['commodities']:
    s=[v for v in c['series'] if v]; print(c['name'], len(s), c['gapYear'], len(c['stateGaps']), c['shockCounts'], [round(x) if x else None for x in c['seasonal']])
