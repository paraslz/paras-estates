# Estate dashboard data schema (one JSON file per estate)

Write UTF-8 JSON. Use numbers (not strings) for figures. Use null when a figure is not in the reports. NEVER invent or estimate a number; every figure must come from the report text. Money in RM. Fertiliser doses in GRAMS per palm (2.25 kg -> 2250).

{
 "slug": "sungai-pertang",               // lowercase-hyphen
 "name": "Ladang Sungai Pertang",         // as titled in the report
 "company": "…Sdn Bhd",                   // owning company per report cover, or null
 "group": "Prosper",
 "manager": "Estate Manager name",
 "advisors": {"pa": "Planting Advisor name", "agro": "Agronomist name"},
 "reports": {
   "pa":   {"title": "PA Report 2/2026", "visit": "2026-08-12", "period": "Jan–Jul 2026", "costTo": "Jun 2026", "url": "https://drive.google.com/file/d/<id>/view"},
   "agro": {"title": "Agronomy Report 1/2026", "visit": "2026-07-30", "url": "https://drive.google.com/file/d/<id>/view"}
 },                                        // either may be null if not found
 "area": {"title": 0, "planted": 0, "mature": 0, "immature": 0, "replant": 0, "nursery": 0},
 "kpi": {
   "ffb": 0, "ffbBudget": 0, "ffbPeriod": "Jan–Jul 2026",
   "yph": 0, "yphBudget": 0, "yphPrevSame": null,     // yield t/ha to date, budget, same period last year
   "cop": 0, "copBudget": 0, "copPeriod": "Jan–Jun 2026",  // RM per tonne FFB ex-estate
   "gcHa": null, "gcHaBudget": null, "ucHa": null, "ucHaBudget": null, "hcT": null, "hcTBudget": null,
   "workers": 0, "workersReq": 0, "harvesters": 0, "harvestersReq": 0,
   "harvestInterval": "14–17 days", "manuringPct": 0, "manuringNote": "346 of 546 mt (PA, to May)",
   "circlePct": null, "selectivePct": null, "pruningPct": null
 },
 "costParts": [{"name": "General charges", "actual": 0, "budget": 0}, {"name": "Upkeep & cultivation", "actual": 0, "budget": 0}, {"name": "Harvest & collection", "actual": 0, "budget": 0}],   // RM/t
 "upkeep": [{"item": "Weeding", "actual": 0, "budget": 0}],     // RM/ha, from the upkeep & cultivation table
 "labour": [{"cat": "Harvester", "actual": 0, "req": 0}],
 "blocks": [
   {"id": "P98C", "ha": 0, "sph": 0, "planted": "1998", "status": "Mature | Young mature | Immature | Replant",
    "ytd": 0, "est": 0, "prevYtd": null,                 // t/ha this period, estimate, same period last year (null if absent)
    "fert": "Mix B 2000 g + NK2 1500 g",                 // latest programme for the block, grams per palm, or null
    "notes": [{"src": "PA 2/2026" | "Agro 1/2026", "text": "one short sentence"}]}
 ],
 "yieldHistory": [{"year": 2021, "yph": 0}],             // estate t/ha by full year, usually from the Agronomy report yield table
 "rainfall": [{"year": 2025, "mm": 0, "days": 0}],
 "summary": ["3 to 5 one-line takeaways, plain English, latest position first"],
 "issues": [{"sev": "bad" | "warn", "title": "short", "detail": "what differs, with both figures and sources"}],
     // discrepancies BETWEEN the PA and Agronomy reports, or arithmetic/typo errors inside a report. Only real ones you can show.
 "actions": [{"item": "short action", "src": "Agro 1/2026", "status": "open | repeat | done"}],
     // follow-ups the reports raise; mark "repeat" if the report says it was raised before and not done
 "kb": "Plain-text fact pack (8,000–14,000 characters) covering every important figure and comment from BOTH reports, with the source report named in each section, for an AI to answer directors' questions. No backticks, no '${'."
}

## Extra fields (required as of Oct 2026)
 "folder": "https://drive.google.com/drive/folders/<estate folder id>",
 "blockPeriod": "Jan–May 2026",     // the months the block-level ytd/prevYtd figures cover (may differ from kpi.ffbPeriod!)
 "blockSrc": "Agronomy Report 1/2026 Table 17",   // which report/table the block yields come from
 "ytdCurrent": {"year": 2026, "period": "Jan–Jun 2026", "yph": 0, "prevSame": 0, "src": "Agronomy Report 1/2026 Table 13"}
     // ONLY when the latest full-year in kpi is e.g. Jan–Dec 2025 but a report also gives current-year-to-date estate yield. Otherwise omit.
Every yield figure must have its period. Every period must be exactly what the report says.

## ffbProd (FFB production tonnes — drives the estate "FFB production" chart and the group chart)
```
"ffbProd": {
  "years": [{"year": 2025, "t": 28187.68, "src": "PA Report 1/2026 Section 8"}],   // full calendar years only, whole estate, as printed
  "monthly": {"2025": [Jan..Dec or null], "2026": [Jan..Dec or null]},             // printed monthly tonnes
  "monthlySrc": "...",
  "ytd": {"year": 2026, "from": 1, "to": 5, "t": 7375.22, "src": "..."},           // latest printed cumulative tonnage this year
  "combinedWith": "juasa-b",   // only when the ytd figure covers two estates (Juasa A+B); put it on one estate only
  "notes": "conflicts, partial years (not shown to clients)"
}
```
Never compute tonnes from t/ha × area. The group page sums 2026 to the month that the most estates can be matched to (monthly series up to that month, or a cumulative total ending exactly that month).

## blocks[].detail and blockEstateWide (full per-block report content)
```
"detail": {
  "manuring":  [row], "spraying": [row], "pests": [row], "yield": [row], "harvesting": [row],
  "pruning": [row], "nutrients": [row], "field": [row], "other": [row],
  "fertNow":  {"year": 2026, "rows": [row]},   // current programme, g/palm, by month
  "fertPrev": {"year": 2025, "rows": [row]},   // previous year's programme (from the previous Agronomy report)
  "fertNext": {"year": 2027, "rows": [row]}    // only if a report already gives next year's programme
}
row = {"k": "short label", "v": "finding with figures and the period", "src": "PA 2/2026" | "Agro 1/2026"}
"blockEstateWide": {"manuring": [row], "spraying": [row], "pests": [row], ...}   // estate-level facts, not repeated per block
"blockGaps", "blockMap": internal notes (not shown)
```
Be exhaustive: everything the latest PA and Agronomy reports say about the block. Programmes for year N
sit in the Agronomy report of the visit before (e.g. 2025 programme in Agro 1/2025; Agro 2/YYYY holds next year's).
