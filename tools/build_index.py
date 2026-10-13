"""Rebuild data/index.json (the portal's estate list) from data/*.json. Run from the repo root."""
import json, glob, datetime
S = json.load(open("site.json")); CUR = S["cur"]
E = []
def ffb(d):
    fp = d.get("ffbProd")
    if not fp: return None
    cum = {}
    m = (fp.get("monthly") or {}).get(str(CUR)) or []
    t = 0
    for i, v in enumerate(m):
        if v is None: break
        t += v; cum[i + 1] = round(t, 2)
    for x in fp.get("years", []):  # a printed full-year total runs to the last month of the year
        if x.get("year") == CUR and x.get("t") is not None: cum[12] = x["t"]
    y = fp.get("ytd")
    if y and y.get("year") == CUR and y.get("from", 1) == 1: cum[y["to"]] = y["t"]
    return {"years": {str(x["year"]): x["t"] for x in fp.get("years", [])}, "cum26": cum, "with": fp.get("combinedWith")}
for f in sorted(glob.glob("data/*.json")):
    if f.endswith("index.json"): continue
    d = json.load(open(f)); k = d.get("kpi") or {}; r = d.get("reports") or {}
    vis = [(x.get("visit"), x.get("title")) for x in (r.get("pa"), r.get("pa2"), r.get("agro")) if x and x.get("visit")]
    lt = max(vis) if vis else (None, None)
    E.append({"slug": d["slug"], "name": d["name"], "company": d.get("company"), "group": d.get("group") or S["group"],
              "href": d.get("page") or f"/estate.html?e={d['slug']}", "yph": k.get("yph"), "cop": k.get("cop"),
              "period": k.get("ffbPeriod"), "yphBudget": k.get("yphBudget"), "yphPrev": k.get("yphPrevSame"),
              "copBudget": k.get("copBudget"), "copPeriod": k.get("copPeriod"),
              "actions": [{"item": a.get("item"), "src": a.get("src"), "status": a.get("status"), "times": a.get("times")} for a in (d.get("actions") or [])], "latest": lt[0], "latestTitle": f"{lt[1]} · {lt[0]}" if lt[0] else None,
              "ffb": ffb(d), "area": {x: (d.get("area") or {}).get(x) for x in ("title", "planted", "mature", "immature", "replant")}})
json.dump({"generated": datetime.date.today().isoformat(), "estates": E}, open("data/index.json", "w"), ensure_ascii=False)
print(len(E), "estates in index")
