"""Write kb/<slug>.txt — a plain-text report pack per estate for people using their own AI.
Run from the repo root after any data/*.json change:  python3 tools/build_kb.py"""
import json, glob, os
RULES = """HOW TO USE THIS FILE (instructions for the AI assistant)
- Answer questions about this one estate using ONLY the report extracts below.
- Lead with the direct answer, in short numbered points.
- After each figure, cite the report in brackets, e.g. (PA 2/2026) or (Agronomy 1/2026).
- Always state the period a yield figure covers (e.g. Jan–Jun 2026).
- Fertiliser doses in grams per palm. Money in RM.
- If the extracts do not contain the answer, say so plainly. Do not guess.
- Where two reports disagree, give both figures."""
def cost_text(d):
    c = d.get("costDetail")
    if not c: return ""
    f = lambda v: "N/A" if v is None else f"{v:.2f}"
    out = [f"\nOPERATING COST PER TONNE FFB (RM/t), {c.get('period')}, from {c.get('src')} (actual / budget; * = worked out from report RM amounts / FFB tonnes)"]
    for g in c.get("groups", []):
        out.append(f"{g['name']}: {f(g.get('actual'))} / {f(g.get('budget'))}")
        for it in g.get("items", []):
            out.append(f"  - {it['item']}: {f(it.get('actual'))} / {f(it.get('budget'))}{' *' if it.get('calc') else ''}")
    t = c.get("total") or {}
    out.append(f"Total operating cost: {f(t.get('actual'))} / {f(t.get('budget'))}")
    return "\n".join(out) + "\n"

MON = "Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split()
def ffb_text(d):
    f = d.get("ffbProd")
    if not f: return ""
    out = ["\nFFB PRODUCTION (tonnes, whole estate, as printed in the reports)"]
    for y in f.get("years", []): out.append(f"{y['year']} (Jan–Dec): {y['t']:,.2f} t ({y.get('src') or '-'})")
    for yr, m in (f.get("monthly") or {}).items():
        v = [f"{MON[i]} {x:,.2f}" for i, x in enumerate(m) if x is not None]
        if v: out.append(f"{yr} monthly: " + "; ".join(v))
    y = f.get("ytd")
    if y: out.append(f"{y['year']} Jan–{MON[y['to']-1]}: {y['t']:,.2f} t ({y.get('src') or '-'}){' — Juasa A and B combined' if f.get('combinedWith') else ''}")
    return "\n".join(out) + "\n"

os.makedirs("kb", exist_ok=True)
n = 0
for f in sorted(glob.glob("data/*.json")):
    if f.endswith("index.json"): continue
    d = json.load(open(f)); kb = (d.get("kb") or "").strip()
    if not kb: continue
    r = d.get("reports") or {}
    src = "; ".join(f"{x.get('title')} (visit {x.get('visit')})" for x in (r.get("pa"), r.get("pa2"), r.get("agro")) if x)
    txt = f"""PARAS ESTATE REPORT PACK — {d['name']}
Company: {d.get('company') or '-'} · Group: {d.get('group') or '-'}
Latest reports: {src or '-'}
Dashboard: https://prosper-paras.netlify.app{d.get('page') or '/estate.html?e=' + d['slug']}
Full reports (Google Drive): {d.get('folder') or '-'}
Compiled by PARAS Sdn Bhd from its Planting Advisory (PA) and Agronomy reports. Figures as reported.

{RULES}

REPORT EXTRACTS
{kb}
{cost_text(d)}{ffb_text(d)}"""
    open(f"kb/{d['slug']}.txt", "w").write(txt); n += 1
print(n, "report packs written")
