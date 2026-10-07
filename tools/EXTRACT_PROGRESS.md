# Turn block manuring & spraying text into progress bars

The dashboard shows field progress as bars (label · coloured bar · %). Do the same per block.

Input: <repo>/data/<slug>.json → blocks[].detail.manuring and blocks[].detail.spraying
(arrays of {k, v, src}). These were extracted from the PARAS reports. Work ONLY from this text —
do not open the reports, do not invent figures.

Output: <scratch>/prog/<slug>.json
{
 "<blockId>": {
   "manuring": [bar], "manuringPeriod": "to Jun 2026", "coveredManuring": ["k of rows fully shown by the bars"],
   "spraying": [bar], "sprayingPeriod": "Jan–Jun 2026", "coveredSpraying": ["k ..."]
 }, ...
}
bar = {"k": "short label, e.g. 'Mix B · round 1 (Feb)' or 'Circle spraying' or 'Inter-row weeding rd 1'",
       "pct": 100, "note": "very short, e.g. '103.3 t · 380 ha' or '664 of 566 ha' or 'not started'", "src": "PA 2/2026", "calc": false}

Rules
1. Only the LATEST year's progress (normally 2026). Older-year rounds stay as text (do not make bars for them,
   and do not list them in covered*). If a block only has 2025 data, make no bars.
2. pct = the % printed. If not printed but done and programme amounts are both printed, compute
   round(done/programme*100) and set "calc": true. "Not done"/"not started"/"pending" in the latest year = 0.
   "Completed"/"done"/"all completed" = 100. If you can't tell, no bar.
3. One bar per fertiliser round (manuring) and per spraying/weeding type or round (circle, selective, path,
   inter-row, weeding round...). Keep labels short (≤ 30 chars). Fertiliser doses don't go in the label.
4. coveredManuring / coveredSpraying: the exact "k" strings of rows whose content is FULLY represented by the
   bars (nothing else important in them). Rows with quality remarks, weeds, causes of delay, advice etc. are NOT covered.
5. Blocks with no latest-year progress: omit the block.
Finish with one line per estate: blocks with bars.
