# Top 5 yield-limiting factors and Top 5 PA issues (`top`)

Shown at the top of each estate's Overview as two rows of short tags. Tapping a tag opens a pop-up with the
detail. Written after the estate JSON and block detail are rebuilt, from the estate's report pack
(`kb/<slug>.txt`, built by tools/build_kb.py) and the JSON (`actions`, `summary`, `kpi`). Read the original
report only if the pack is unclear.

```json
"top": {
  "limits": [ {"t": "Slow harvesting rounds", "s": "Slow harvesting",
               "d": "15.0 rounds in 2025 vs 24 target (Agro; PA says 18.5); intervals up to 28 days in Jan–Mar 2026.",
               "src": "Agro 1/2026 · PA 1/2026"} ],
  "pa":     [ {"t": "Cost per tonne well over budget", "s": "Cost/t over budget",
               "d": "RM261.78/t FFB vs RM201.00/t budget, Jan–Dec 2025, mainly because the crop budget was missed.",
               "src": "PA 1/2026 s.9", "rep": true} ]
}
```

## The two lists

1. **limits — Top 5 yield-limiting factors.** The field causes holding the estate's yield back (agronomy and
   field operations), ranked by likely crop lost, biggest first. Typical candidates: harvesting rounds and
   intervals, crop recovery or loose fruit, manuring late or short, nutrient deficiency, old or low-density
   palms, vacant points, pests (rats, bagworm, beetles), Ganoderma, weeds, drainage or waterlogging, drought,
   road access, labour shortage in the field.
   Rank by how much crop each costs: weigh the area affected, how far below target it is, and what the report
   says about yield impact. Something that touches the whole estate usually outranks one block.
2. **pa — Top 5 PA issues.** The main matters the latest **PA report** itself raises, ranked by importance to
   the estate's results: crop vs budget, cost per tonne vs budget, overspends, labour, harvesting
   productivity, equipment, field standards, security or encroachment, repeated unfinished instructions.
   Use only the PA report (latest one; `pa2` if it is the same year and the latest says little).
   If the estate has no PA report, leave `pa` empty.

Overlap is allowed (harvesting can be both), but word each one for its own list: limits = the field cause,
PA issue = what the PA report says about it.

## Fields

- `t` title, ≤ 40 characters, plain words ("2026 manuring running late"). Shown in the pop-up.
- `s` tag, ≤ 22 characters, 2–3 words ("Late manuring"). Shown on the Overview. No figures except a
  % when it is the point ("Crop 15.5% short").
- `d` detail, 1–2 sentences, ≤ 220 characters: the printed figures that prove it, each with its period
  (e.g. "Jan–Mar 2026"), and the block names when it is block-specific.
- `src` the report(s), e.g. "PA 1/2026 s.7" or "Agro 1/2026" (add the section when the pack gives it).
- `rep` true only when the reports or `actions` (status "repeat") say it was raised before and not done.

## Rules

- Every number exactly as printed in the reports (the pack). Never estimate, never compute crop lost,
  RM lost or tonnes from t/ha × area. A difference or % the report prints is fine; your own arithmetic is not
  (except a plain "x of y" restating two printed figures).
- Fewer than 5 is fine if the reports do not support 5. Never pad.
- No report errors or PA-vs-Agronomy discrepancies as items (those stay in `issues`, internal). If two
  reports give different figures for the same thing, give both briefly ("15.0 rounds (Agro; PA says 18.5)").
- Money in RM, fertiliser in grams per palm.
- UMB years are financial years May–Apr; write periods as the report does (e.g. "FY2025/26" or "May 2025–Apr 2026").
