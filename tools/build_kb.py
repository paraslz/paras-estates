"""Write kb/<slug>.txt — a plain-text report pack per estate for people using their own AI.
Run from the repo root after any data/*.json change:  python3 tools/build_kb.py"""
import json, glob, os
S = json.load(open("site.json")); FS = S.get("fyStart", 1)
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

MON0 = "Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(); MON = MON0[FS-1:] + MON0[:FS-1]
YL = lambda y: str(y) if FS == 1 else f"FY{y-1}/{str(y)[2:]}"
def ffb_text(d):
    f = d.get("ffbProd")
    if not f: return ""
    out = ["\nFFB PRODUCTION (tonnes, whole estate, as printed in the reports)"]
    for y in f.get("years", []): out.append(f"{YL(y['year'])} ({MON[0]}–{MON[11]}): {y['t']:,.2f} t ({y.get('src') or '-'})")
    for yr, m in (f.get("monthly") or {}).items():
        v = [f"{MON[i]} {x:,.2f}" for i, x in enumerate(m) if x is not None]
        if v: out.append(f"{YL(int(yr))} monthly: " + "; ".join(v))
    y = f.get("ytd")
    if y: out.append(f"{YL(y['year'])} {MON[y.get('from',1)-1]}–{MON[y['to']-1]}: {y['t']:,.2f} t ({y.get('src') or '-'}){(' — combined with ' + f['combinedWith']) if f.get('combinedWith') else ''}")
    return "\n".join(out) + "\n"

SEC = [("manuring", "Manuring progress"), ("spraying", "Spraying & weeding"), ("fertNext", "Fertiliser programme (next year)"),
       ("fertNow", "Fertiliser programme (this year)"), ("fertPrev", "Fertiliser programme (previous year)"), ("pests", "Pests & diseases"),
       ("yield", "Yield"), ("harvesting", "Harvesting"), ("pruning", "Pruning"), ("nutrients", "Nutrients"), ("field", "Field"), ("other", "Other")]
def top_text(d):
    T = d.get("top") or {}
    out = []
    for k, h in (("limits", "TOP 5 YIELD-LIMITING FACTORS (ranked by likely cost in lost crop)"), ("pa", "TOP 5 PA ISSUES (main matters raised in the latest PA report)")):
        if T.get(k):
            out.append("\n" + h)
            out += [f"{i}. {x['t']}: {x.get('d','')} ({x.get('src','')})" for i, x in enumerate(T[k][:5], 1)]
    return "\n".join(out) + "\n" if out else ""

def rows(v): return v.get("rows", []) if isinstance(v, dict) else (v or [])
def block_text(d):
    out = []
    ew = d.get("blockEstateWide") or {}
    if any(rows(v) for v in ew.values()):
        out.append("\nESTATE-WIDE FIELD NOTES")
        for k, v in ew.items():
            for r in rows(v): out.append(f"[{k}] {r.get('k')}: {r.get('v')} ({r.get('src')})")
    for b in d.get("blocks") or []:
        det = b.get("detail")
        if not det: continue
        out.append(f"\nBLOCK {b['id']} ({b.get('ha')} ha, planted {b.get('planted')}, {b.get('status')})")
        pr = det.get("progress") or {}
        for k in ("manuring", "spraying"):
            if pr.get(k):
                out.append(f"{k.capitalize()} progress ({pr.get(k + 'Period') or 'latest'}):")
                for b in pr[k]: out.append(f"  - {b.get('k')}: {b.get('pct')}%{' (worked out)' if b.get('calc') else ''} — {b.get('note') or ''} ({b.get('src')})")
        for k, t in SEC:
            v = det.get(k)
            if not v or not rows(v): continue
            y = f" {v['year']}" if isinstance(v, dict) and v.get("year") else ""
            out.append(f"{t}{y}:")
            for r in rows(v): out.append(f"  - {r.get('k')}: {r.get('v')} ({r.get('src')})")
    return ("\nBLOCK DETAIL (everything the latest reports say per block)" + "\n".join(out) + "\n") if out else ""

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
Dashboard: {S["url"]}{d.get('page') or '/estate.html?e=' + d['slug']}
Full reports (Google Drive): {d.get('folder') or '-'}
Compiled by PARAS Sdn Bhd from its Planting Advisory (PA) and Agronomy reports. Figures as reported.

{RULES}

REPORT EXTRACTS
{kb}
{top_text(d)}{cost_text(d)}{ffb_text(d)}{block_text(d)}"""
    open(f"kb/{d['slug']}.txt", "w").write(txt); n += 1
print(n, "report packs written")

# ---- group pack: one file covering every estate, for the Ask box on the group summary page ----
def age_profile(blocks, year):
    import re as _re
    cls = ["Immature (0-3 yrs)", "Young mature (4-8 yrs)", "Prime (9-18 yrs)", "Old (19-25 yrs)", "Over-aged (>25 yrs)", "Replanting / no palms yet", "Year not stated"]
    ha = [0.0] * 7
    for b in blocks or []:
        h = b.get("ha") or 0
        if not h or _re.match(r"R\d", str(b.get("id", ""))): continue
        m = _re.search(r"(19|20)\d\d", str(b.get("planted") or ""))
        y = int(m.group(0)) if m else None
        if y is None and _re.search("replant", str(b.get("status") or ""), _re.I): ha[5] += h; continue
        if y is None:
            mm = _re.match(r"PR?(\d\d)[A-Z]?\d?$", str(b.get("id", "")))
            if mm: y = int(("19" if int(mm.group(1)) > 50 else "20") + mm.group(1))
        if y is None: ha[6] += h; continue
        a = year - y; ha[0 if a <= 3 else 1 if a <= 8 else 2 if a <= 18 else 3 if a <= 25 else 4] += h
    return [(c, v) for c, v in zip(cls, ha) if v > 0]

GRULES = """HOW TO USE THIS FILE (instructions for the AI assistant)
- This is the GROUP pack: a summary of every estate in the group from the latest PARAS reports.
- Answer group questions (comparisons, rankings, totals, priorities, KPIs) using ONLY these extracts.
- Lead with the direct answer, in short numbered points. Cite the estate and report for each figure.
- Always state the period a yield or tonnage covers; estates' periods differ, so say so when comparing.
- The ALL-ESTATES pack (kb/all-1.txt, all-2.txt, ... listed in kb/all.json) holds every estate's full report extracts; read it for any question that needs more than these summaries.
- For block-by-block detail on one estate, open that estate's full pack (link given per estate).
- If the extracts do not contain the answer, say so plainly. Do not guess. Money in RM; fertiliser in grams per palm."""

def fmt(v, d=2):
    return "N/A" if v is None else f"{v:,.{d}f}"

G = []; tot = {"planted": 0, "mature": 0, "immature": 0, "replant": 0}; ages = {}; ffby = {}
for f in sorted(glob.glob("data/*.json")):
    if f.endswith("index.json"): continue
    d = json.load(open(f)); k = d.get("kpi") or {}; a = d.get("area") or {}; r = d.get("reports") or {}
    for x in tot: tot[x] += a.get(x) or 0
    ap = age_profile(d.get("blocks") or d.get("ageBlocks"), S.get("cur", 2026))
    for c, v in ap: ages[c] = ages.get(c, 0) + v
    fp = d.get("ffbProd") or {}
    for y in fp.get("years", []): ffby.setdefault(y["year"], []).append((d["name"], y["t"]))
    acts = d.get("actions") or []
    rep = [x for x in acts if x.get("status") == "repeat"]; opn = [x for x in acts if x.get("status") == "open"]
    src = "; ".join(f"{x.get('title')} (visit {x.get('visit')})" for x in (r.get("pa"), r.get("pa2"), r.get("agro")) if x)
    yt = fp.get("ytd")
    L = [f"=== {d['name']} ===",
         f"Latest reports: {src or '-'}",
         f"Area (ha): planted {fmt(a.get('planted'),1)}, mature {fmt(a.get('mature'),1)}, immature {fmt(a.get('immature'),1)}, replant {fmt(a.get('replant'),1)}",
         f"FFB {k.get('ffbPeriod') or 'period n/s'}: {fmt(k.get('ffb'))} t (budget {fmt(k.get('ffbBudget'))} t)",
         f"Yield {k.get('ffbPeriod') or ''}: {fmt(k.get('yph'))} t/ha (budget {fmt(k.get('yphBudget'))}; same period last year {fmt(k.get('yphPrevSame'))})",
         f"Cost of production {k.get('copPeriod') or ''}: RM{fmt(k.get('cop'))}/t FFB (budget RM{fmt(k.get('copBudget'))})",
         f"Harvesters: {k.get('harvesters') if k.get('harvesters') is not None else 'N/A'} of {k.get('harvestersReq') if k.get('harvestersReq') is not None else 'N/A'} required; workers {k.get('workers') if k.get('workers') is not None else 'N/A'} of {k.get('workersReq') if k.get('workersReq') is not None else 'N/A'}",
         "Yield history (t/ha): " + (", ".join(f"{y['year']} {y['yph']}" for y in d.get("yieldHistory") or [] if y.get("yph") is not None) or "N/A"),
         "FFB by full year (t): " + (", ".join(f"{y['year']} {y['t']:,.0f}" for y in fp.get("years", [])) or "N/A")
         + (f"; {yt['year']} months {yt.get('from',1)}-{yt['to']}: {yt['t']:,.0f} t" if yt else ""),
         "Palm age profile (ha): " + (", ".join(f"{c} {v:,.0f}" for c, v in ap) or "N/A")]
    if d.get("summary"): L.append("Key takeaways: " + " | ".join(d["summary"]))
    T = d.get("top") or {}
    if T.get("limits"): L.append("Top yield-limiting factors: " + " | ".join(f"{i}. {x['t']}" for i, x in enumerate(T["limits"][:5], 1)))
    if T.get("pa"): L.append("Top PA issues: " + " | ".join(f"{i}. {x['t']}" for i, x in enumerate(T["pa"][:5], 1)))
    if rep: L.append(f"Actions raised before and still not done ({len(rep)}): " + " | ".join(x.get("item", "") for x in rep))
    if opn: L.append(f"New open actions ({len(opn)}): " + " | ".join(x.get("item", "") for x in opn))
    L.append(f"Full estate pack: {S['url']}/kb/{d['slug']}.txt")
    G.append("\n".join(L))
gtxt = f"""PARAS GROUP REPORT PACK — {S['group']} group ({len(G)} estates)
Dashboard: {S['url']}/group.html
Compiled by PARAS Sdn Bhd from its Planting Advisory (PA) and Agronomy reports. Figures as reported; each estate's period is stated.

{GRULES}

GROUP TOTALS
Area (ha): planted {tot['planted']:,.0f}, mature {tot['mature']:,.0f}, immature {tot['immature']:,.0f}, replant {tot['replant']:,.0f}
Palm age profile in {S.get('cur', 2026)} (ha, from block planting years; rubber excluded): {", ".join(f"{c} {v:,.0f}" for c, v in ages.items())}
FFB by full year (sum of estates that print that year): {"; ".join(f"{y}: {sum(t for _, t in v):,.0f} t from {len(v)} estates" for y, v in sorted(ffby.items()) if len(v) > 1)}

ESTATES
""" + "\n\n".join(G) + "\n"
open("kb/group.txt", "w").write(gtxt)
print("group pack written,", len(gtxt) // 1000, "KB")

# ---- all-estates pack: every estate's full report extract (without block-by-block detail), split into parts ----
# The group/front-page Ask tells Claude to read group.txt plus every part, so group answers draw on all estate files.
PART_MAX = 90_000
ARULES = """HOW TO USE THIS FILE (instructions for the AI assistant)
- This is one part of the ALL-ESTATES pack: the full report extracts for every estate in the group (KPIs, top 5 issues,
  costs, FFB production, field findings, actions), from the latest PARAS PA and Agronomy reports. Block-by-block tables
  are left out; for those, open the estate's own pack (link given per estate).
- Read every part listed before answering. Use ONLY these extracts. Cite estate and report for each figure.
- Always state the period a yield or tonnage covers. Money in RM; fertiliser in grams per palm. Do not guess."""
for old in glob.glob("kb/all-*.txt"): os.remove(old)
cores = []
for f in sorted(glob.glob("kb/*.txt")):
    s = os.path.basename(f)[:-4]
    if s == "group" or s.startswith("all-"): continue
    t = open(f).read(); i = t.find("\nBLOCK DETAIL"); core = t[:i] if i > 0 else t
    j = core.find("HOW TO USE THIS FILE"); k = core.find("REPORT EXTRACTS")
    if j > 0 and k > j: core = core[:j] + core[k:]          # drop the per-estate instructions, keep header + extracts
    cores.append(f"===== ESTATE: {s} =====\nFull pack incl. block detail: {S['url']}/kb/{s}.txt\n{core.strip()}\n")
parts, cur = [], ""
for c in cores:
    if cur and len(cur) + len(c) > PART_MAX: parts.append(cur); cur = ""
    cur += c + "\n"
if cur: parts.append(cur)
for n, p in enumerate(parts, 1):
    open(f"kb/all-{n}.txt", "w").write(f"PARAS ALL-ESTATES PACK — {S.get('group','')} group — part {n} of {len(parts)}\n{ARULES}\n\n{p}")
json.dump({"parts": len(parts)}, open("kb/all.json", "w"))
print("all-estates pack:", len(parts), "parts,", sum(map(len, parts)) // 1000, "KB")
