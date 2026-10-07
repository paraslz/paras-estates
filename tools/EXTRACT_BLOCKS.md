# Block detail extraction (PARAS estate dashboards)

Goal: when a director taps a block on the estate dashboard, they should see EVERYTHING the latest PARAS
reports say about that block. Be exhaustive. Every figure as printed; never estimate. Money RM,
fertiliser in GRAMS per palm (2.25 kg -> 2,250 g). Always state the period/date a figure covers.

## Inputs
- Estate data: <repo>/data/<slug>.json — its "blocks" array gives the block ids
  used on the dashboard (use EXACTLY these ids as keys; if the reports use finer or coarser ids, map
  them and say how in "_map"). "reports" gives the latest PA and Agronomy report titles + Drive URLs,
  and "folder" the estate's Drive folder.
- Reports: Google Drive (load tools with ToolSearch "select:mcp__Google_Drive__search_files,
  mcp__Google_Drive__read_file_content,mcp__Google_Drive__download_file_content,
  mcp__Google_Drive__get_file_metadata"). Read the latest PA report AND the latest Agronomy report in
  FULL, including appendices and tables. For the previous year's fertiliser programme, also open the
  previous Agronomy report (the one before the latest) in the estate folder (subfolders by year are common).
  If read_file_content text is garbled for a table, download the PDF and use pdfplumber/pdftotext
  (pip install --break-system-packages pdfplumber if needed).

## Output
Write <scratch>/blk/<slug>.json :
{
 "slug": "...",
 "_map": "optional: how report block ids map to dashboard ids",
 "estateWide": {   // estate-level items that apply to all blocks, used when a report gives no block split
   "manuring": [rows], "spraying": [rows], "pests": [rows]
 },
 "blocks": {
  "P00A": {
   "yield":      [rows],  // block yield history and comparisons: each year printed, YTD vs same period/estimate, bunch weight, bunch count, crop loss notes
   "manuring":   [rows],  // LATEST manuring progress for this block: each round/fertiliser, planned vs applied (kg or g/palm, % done), dates, delays, method, quality issues
   "spraying":   [rows],  // circle / path / inter-row / selective spraying and weeding rounds done vs planned, % done, dates, weed problems (e.g. Asystasia, Mikania, ferns, Clidemia), chemicals if named
   "fertNow":    {"year": 2026, "rows": [rows]},   // fertiliser programme recommended for the current year: each application month, fertiliser, g/palm, method; total per palm per year if printed
   "fertPrev":   {"year": 2025, "rows": [rows]},   // the previous year's programme for this block (from the previous Agronomy report), same format; omit if not found and say so in "_gaps"
   "pests":      [rows],  // pests & diseases: Ganoderma (census date, % infected / number of palms, trend vs earlier census, treatment, isolation/sanitation, supplying), basal/upper stem rot, bagworm/nettle caterpillar (census counts, threshold, treatment), rats (damage %, baiting rounds, barn owls), rhinoceros beetle, porcupines, elephants, etc. Include status AND progress (what was done since last visit)
   "pruning":    [rows],  // pruning status, frond counts, under/over pruning, backlog ha
   "harvesting": [rows],  // harvesting rounds/interval, over-ripe/unripe %, loose fruit, harvester output, crop recovery
   "nutrients":  [rows],  // leaf/soil analysis results and deficiencies for this block (N, P, K, Mg, B…), with sampling date
   "field":      [rows],  // palm condition, census/SPH, vacant points, drains, terraces, roads, flooding, cover crop, EFB/POME application, replanting plans
   "other":      [rows]   // anything else the reports say about this block
  }
 },
 "_gaps": "what you looked for and could not find (e.g. no block-level spraying data in either report)"
}
A row is {"k": "short label", "v": "value / finding, with the numbers and the period", "src": "PA 2/2026" | "Agro 1/2026" | "Agro 1/2025"}.
- k is short (e.g. "Mix B, 1st round", "Circle spray", "Ganoderma census Mar 2026"); v holds the detail.
- Put block-specific facts under the block. Estate-wide facts (e.g. "manuring 63% done for the estate")
  go in estateWide, NOT copied into every block. If a report gives a table by block, every block gets its row.
- Omit empty sections. Do not pad. Do not copy the same row into two sections.
- Keep the existing dashboard notes in mind (data/<slug>.json blocks[].notes and kb) but VERIFY against the reports;
  the reports are the authority.
Finish with a 3-line summary per estate: blocks covered, sections found, main gaps.
