# PARAS estate dashboard standard

This is the house standard for every PARAS client dashboard site. The reference build is Prosper
(https://prosper-paras.netlify.app, repo paraslz/paras-estates). Copy this repo's structure and code;
change only the data, the group name, the site address and the Drive folder.

Data rules are in tools/SCHEMA.md (estate JSON) and tools/COST.md (cost per tonne breakdown).

## 1. Principles (LZ's standing decisions)

1. Every figure comes from the PARAS PA or Agronomy report as printed. Never estimate, never compute
   tonnes from t/ha × area. Missing → null / "N/A".
2. Every yield or tonnage shows the period it covers (e.g. "Jan–Jun 2026"). Never a bare number.
3. The dashboard reflects what each report says, even when estates' periods differ. Report errors and
   PA-vs-Agronomy discrepancies are kept in `issues` (internal) but NOT shown to clients.
4. Phone first: LZ and directors read on phones (foldable). Large fonts (+18% on phones), no horizontal
   page scroll at 390px, narrow tables, short headers.
5. Simple and clean. No clutter on the front page.
6. Money in RM; fertiliser in grams per palm.

## 2. Site structure

- Static site, GitHub → Netlify auto-deploy on push. `netlify.toml`: publish ".", headers for /data/*,
  /kb/* (text/plain, CORS) and /assets/* with `Cache-Control: max-age=0, must-revalidate`.
  Data fetches use `{cache:"no-cache"}`.
- `index.html` portal, `estate.html?e=<slug>` shared template, `data/<slug>.json` one file per estate,
  `data/index.json` built list, `group.html` group summary, `kb/<slug>.txt` report packs,
  `offline/<slug>.html` self-contained downloads. Bespoke pages (`e/<slug>.html`) only if needed.
- Chart.js 4.4.1 self-hosted at `/assets/vendor/chart.umd.min.js` (no CDN, so offline copies work).
- Fonts: Archivo, Archivo Narrow, IBM Plex Mono.
- Build scripts (run from repo root after any data change):
  `python3 tools/build_index.py && python3 tools/build_kb.py && python3 tools/build_offline.py`

## 3. Front page (portal)

- Search box, link "Group summary, league table & actions →".
- One simple card per estate: name (strip "Ladang" / "Estate"), "Planted area: x ha",
  "Latest report: Mon YYYY", "View dashboard →". No yield or cost on the cards.

## 4. Estate page

Header: big "‹ All estates" button and a "Jump to estate" A–Z dropdown (top right), estate name,
meta line and "Download for offline ↓". The Drive report folder link lives only in the Reports tab.

**Ask box above the tabs.** Opens the viewer's own Claude: `https://claude.ai/new?q=<question + link to
/kb/<slug>.txt>`. Button "Ask in Claude ↗", note "Opens in your own Claude account." Claude only — no
built-in API Ask, no ChatGPT/Gemini.

Tabs: Overview · Blocks · Money · Field & people · Actions (with count) · Reports.

- **Overview (in this order):**
  1. Yield per hectare by full year (line) plus current year to date as a separate point, with a note
     naming the months covered and the same months last year.
  2. FFB production (bar): estate tonnes by full year plus this year to date in a different colour,
     labelled "2026 (Jan–May)". Note says the partial year isn't comparable and lists years with no
     printed full-year tonnage.
  3. Block yield vs estimate/last year, cost per tonne vs budget, field programme progress.
  4. Key takeaways, then "At a glance" tiles — at the BOTTOM.
- **Blocks:** no tiles. A block dropdown with ‹ › buttons, then the block card (area, SPH, planted,
  yield with period), then the block's YIELD HISTORY chart first (block t/ha by full year vs estate dashed line, last 5 years in a small table; `blocks[].yhist`), then the full report detail for that block (`blocks[].detail`) as simple two-column
  tables (item | finding), one fold per topic: Manuring progress, Spraying & weeding, Fertiliser
  programme (Month | Fertiliser | g/palm), Pests & diseases (these four open), then Yield & crop,
  Harvesting, Pruning, Leaf & soil nutrients, Field condition, Other (closed). Manuring and spraying
  show progress BARS (label · bar · %, green ≥90, amber ≥75, red below; "not due" grey for rounds
  after the report period; * when % is worked out from done ÷ programme), with leftover remarks under
  a closed "Notes" drop-down. Sources shown once per topic, not per line. Earlier-year records and the previous year's fertiliser programme sit in a
  "Earlier records" / "Previous year" drop-down, opened only on tap. Keep it decluttered.
  "Estate-wide field notes" fold below, then the "All blocks" yield table (collapsed).
- **Money:**
  - "Operating cost per tonne FFB" table (header "RM per t FFB"), full line-by-line breakdown from
    `costDetail` (Harvest & collection → harvesting, transport…; Upkeep & cultivation → weeding,
    manuring, roads…; General charges → salaries, quit rent…; Total). Groups expand/collapse (▾);
    items worked out from RM ÷ tonnes marked *. N/A where missing.
  - FFB price margin calculator (price minus total cost per tonne; illustrative; saved in
    localStorage "paras.ffbPrice").
  - Standard upkeep RM/ha table with N/A.
- **Field & people:** labour vs requirement, rainfall, harvesting & manuring list.
- **Actions:** every follow-up the reports raise; status pills "Raised before" (repeat, with times),
  "Open", "Done".
- **Reports:** latest PA and Agronomy titles, visit dates, links. (No discrepancy section.)

## 5. Group summary page (`group.html`)

1. Group at a glance: estates, planted, mature, immature & replant ha.
2. **Group FFB production** chart: full years (shown when ≥75% of estates have that year), each bar
   labelled with how many estates it includes; plus current year to date summed only to the month
   that the most estates can be matched to (an estate counts if its monthly figures run Jan→that month,
   or its printed cumulative total ends exactly that month). Note lists who is left out and why,
   grouped by reason. "Figures by estate" dropdown table with a total row.
3. Needs attention: red-flagged estates, worst 5 + "Show all".
4. League table: yield and cost/t vs budget with red/amber/green (≤5% green, ≤15% amber, else red),
   sortable, margin shown under cost when an FFB price is entered.
5. Action tracker: estate summary table (raised before / open, clickable), filters (estate, status
   default "Raised before", search), list limited to 25 with "Show more".

## 6. Data fields beyond the basics (see tools/SCHEMA.md)

`folder`, `reports`, `kpi` (incl. ffb, ffbBudget, ffbPeriod), `blockPeriod`, `blockSrc`,
`yieldHistory`, `ytdCurrent`, `costParts`, `costDetail`, `upkeep`, `labour`, `actions`,
`ffbProd` (years / monthly / ytd / combinedWith), `kb` (plain-text extract for the Ask pack).

## 7. Extraction workflow

- Block detail: helper agents follow tools/EXTRACT_BLOCKS.md (one or a few estates each), then
  tools/EXTRACT_PROGRESS.md turns manuring/spraying text into progress bars. Merge into blocks[].detail.

- Reports live in Google Drive (one folder per estate, often year subfolders) and arrive by Gmail.
- Use parallel helper agents (one or two estates each) to extract; then verify planted area, FFB,
  yield, cost per tonne and harvesters against the report yourself.
- Watch for known traps: "last year" columns that are really budget; "12 months" figures that are
  really 9; Jan–Nov totals labelled as full year; combined divisions (sum them, say so); estates whose
  PA prints combined figures for two estates (put the figure on one estate with `combinedWith`).
- Weekly scheduled task re-checks Drive and Gmail, rebuilds changed estates, runs the three build
  scripts, commits and pushes, and sends LZ a short numbered summary.

## 8. Testing before every push

Playwright at 390px wide: every estate page and group page load with no JS errors and
`scrollWidth ≤ 390`; charts render; offline file opens without network.
