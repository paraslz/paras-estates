"""Rebuild data/index.json (the portal's estate list) from data/*.json. Run from the repo root."""
import json, glob, datetime
E = []
for f in sorted(glob.glob("data/*.json")):
    if f.endswith("index.json"): continue
    d = json.load(open(f)); k = d.get("kpi") or {}; r = d.get("reports") or {}
    vis = [(x.get("visit"), x.get("title")) for x in (r.get("pa"), r.get("pa2"), r.get("agro")) if x and x.get("visit")]
    lt = max(vis) if vis else (None, None)
    E.append({"slug": d["slug"], "name": d["name"], "company": d.get("company"), "group": d.get("group") or "Prosper",
              "href": d.get("page") or f"/estate.html?e={d['slug']}", "yph": k.get("yph"), "cop": k.get("cop"),
              "period": k.get("ffbPeriod"), "latest": lt[0], "latestTitle": f"{lt[1]} · {lt[0]}" if lt[0] else None,
              "area": {x: (d.get("area") or {}).get(x) for x in ("title", "planted", "mature", "immature", "replant")}})
json.dump({"generated": datetime.date.today().isoformat(), "estates": E}, open("data/index.json", "w"), ensure_ascii=False)
print(len(E), "estates in index")
