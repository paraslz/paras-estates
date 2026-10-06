"""Build offline/<slug>.html: one self-contained file per estate (styles, charts library, scripts and data inside),
so it can be downloaded and opened without internet. Run from the repo root after data changes:
    python3 tools/build_offline.py"""
import json, glob, os, re

SITE = "https://prosper-paras.netlify.app"
read = lambda p: open(p, encoding="utf-8").read()
CSS, CHART, COST, EST, BYO = (read(p) for p in ("assets/style.css", "assets/vendor/chart.umd.min.js",
                                                  "assets/cost.js", "assets/estate.js", "assets/byoai.js"))
safe = lambda js: js.replace("</script", "<\\/script")
tag = lambda js: f"<script>{safe(js)}</script>"

def common(h):
    h = h.replace('<link rel="stylesheet" href="/assets/style.css">', f"<style>{CSS}</style>")
    h = h.replace('<script src="/assets/vendor/chart.umd.min.js"></script>', tag(CHART))
    h = h.replace('<script src="/assets/cost.js"></script>', tag(COST))
    h = h.replace('<script src="/assets/byoai.js"></script>', tag(BYO))
    h = re.sub(r'<a class="fld" id="offl"[^>]*>.*?</a>', "", h, flags=re.S)
    h = h.replace('href="/"', f'href="{SITE}/"').replace('href="/group.html"', f'href="{SITE}/group.html"')
    return h

os.makedirs("offline", exist_ok=True)
tpl = read("estate.html")
n = 0
for f in sorted(glob.glob("data/*.json")):
    if f.endswith("index.json"): continue
    d = json.load(open(f, encoding="utf-8"))
    s = d["slug"]
    if d.get("page"):  # bespoke page (Cheekah Kemayan)
        h = common(read(d["page"].lstrip("/")))
        h = h.replace("<head>", f'<head>\n<script>window.__SITE__="{SITE}";window.__SLUG__="{s}";</script>', 1)
    else:
        boot = f'<script>window.__SITE__="{SITE}";window.__SLUG__="{s}";window.__DATA__={json.dumps(d, ensure_ascii=False)};</script>'
        h = common(tpl).replace('<script src="/assets/estate.js"></script>', boot + tag(EST))
        h = re.sub(r"<title>.*?</title>", f"<title>{d['name']} · PARAS</title>", h)
    h = h.replace("</footer>", f'</footer><p style="text-align:center;font-size:13px;color:#777;margin:0 0 24px">Offline copy saved from {SITE}. Open the site for the latest figures.</p>', 1)
    open(f"offline/{s}.html", "w", encoding="utf-8").write(h); n += 1
print(n, "offline pages written")
