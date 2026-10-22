# Make block detail easy to read (tables, stat cards, short bullets)

Directors read the Blocks tab on a phone. Long sentences packed with numbers don't get read.
This step restructures each block's `detail` rows (and the estate's `blockEstateWide`) so the page shows
**tables, stat cards or 2–4 short bullets** instead of paragraphs. It changes presentation only.

## Input / output
- Input: `data/<slug>.json` → `blocks[].detail` (sections: yield, manuring, spraying, pests, harvesting, pruning,
  nutrients, field, other) and `blockEstateWide`. Leave `progress`, `fertNow`, `fertPrev`, `fertNext` alone.
- Output (one file per estate): `{"blocks": {"<blockId>": {"<section>": [row, ...]}}, "estateWide": {"<section>": [row, ...]}}`
  containing the FULL new row list for every section you touch (sections you don't touch: omit).

## Row format
`{"k": "short label", "v": "plain text", "src": "...", ...one or more of:}`
- `"stats": [{"l": "Avg bunch weight", "v": "10.9 kg", "d": "Apr 2026 · 8.3 kg Apr 2025"}]` — 1–4 key numbers as cards.
  `v` short (number + unit), `d` optional comparison/period. Use for rows whose point is a few figures.
- `"tbl": {"cols": ["Sub-block", "Census", "Fresh damage", "Old damage", "Baiting"], "rows": [["BN42-12A1", "6 Dec 2025", "5.05%", "8.16%", "Needed"], ...]}`
  — for anything listing several sub-blocks/rounds/items with the same kind of figures. 2–5 columns, cells short
  (≤ 18 characters ideally), first column = the item. Put the shared period/unit in `k` or `note`, not in every cell.
- `"pts": ["...", "..."]` — 2–4 bullets, each ≤ 90 characters, for narrative remarks (cause, advice, observations).
- `"note": "one short line"` — optional caption (threshold, period, caveat).
- `"hide": true` — row stays in the Ask pack but isn't shown (e.g. yearly yields already in the block's yield
  history chart `yhist`, or exact duplicates of another row).

## Rules
1. **Never invent or change a figure.** Every number in stats/tbl/pts/note must appear in the original text of that
   block's rows (you may round 32.47→32.5 or reformat dates, nothing else). Missing → "–".
2. **Keep `v`** as the full original wording (the Ask pack uses it). When you MERGE several rows into one table
   row, set `v` to the original texts joined with " | " so nothing is lost.
3. **Merge repetition:** many rows of the same kind (e.g. "Spraying FY2025/26 · BM41-12A1", "· BM42-12A1", …) →
   ONE row with a table (Sub-block | Circle | Selective | Done by). Rows listing many sub-blocks in one sentence
   (rat census, compost, sub-block list, Ganoderma census) → table.
4. **Yield & crop:** if the block has `yhist`, hide rows that only restate full-year t/ha already in it. Keep and
   card-ify period comparisons (e.g. "Jan–May 2026 3.57 vs 7.08 t/ha"), bunch weight/number, crop losses.
5. **Harvesting/pruning/field:** rate/output/earnings → stats; observations → pts.
6. Short rows that are already clear (one fact, < ~90 chars) → leave unchanged.
7. Labels `k` ≤ 40 characters, period included where it matters ("Rat census Sep 2025–Mar 2026").
8. Keep `src` (merged rows: join distinct sources with " · ").
9. Output valid JSON only, UTF-8.
