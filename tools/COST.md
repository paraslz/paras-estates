# Cost breakdown extraction (RM per tonne FFB)

Goal: for each estate, a full breakdown of operating cost per tonne FFB from the LATEST PA (Planting Advisory) report's cost section,
grouped under the three standard lines. Store it as the "costDetail" field of data/<slug>.json (without the "slug" key).

{
 "slug": "darabif",
 "period": "Jan–Dec 2025",                  // exactly as the cost tables state it
 "src": "PA Report 1/2026, section 9 (Tables 24–29)",
 "ffb": 34195.12,                            // FFB tonnes the report uses for per-tonne costs in that period (null if not stated)
 "groups": [
  {"name": "Harvest & collection", "actual": 82.29, "budget": 79.40, "items": [
     {"item": "Harvesting", "actual": 0, "budget": 0},
     {"item": "FFB transport to mill", "actual": 0, "budget": 0},
     {"item": "Collection / in-field evacuation", "actual": 0, "budget": 0}
  ]},
  {"name": "Upkeep & cultivation", "actual": 0, "budget": 0, "items": [
     {"item": "Weeding", ...}, {"item": "Manuring", ...}, {"item": "Pest & disease", ...}, {"item": "Pruning", ...},
     {"item": "Roads", ...}, {"item": "Drains", ...}, {"item": "Bridges & culverts", ...} ...
  ]},
  {"name": "General charges", "actual": 0, "budget": 0, "items": [
     {"item": "Staff salaries & allowances", ...}, {"item": "Workers' amenities / housing", ...}, {"item": "Bonus", ...}, {"item": "EPF / SOCSO", ...},
     {"item": "Vehicles", ...}, {"item": "Electricity & water", ...}, {"item": "Quit rent & assessment", ...}, {"item": "Insurance", ...} ...
  ]}
 ],
 "total": {"actual": 219.41, "budget": 229.15},
 "notes": ["short notes on any inconsistency, e.g. sub-items don't add to the printed group total"]
}

RULES
- Every number is RM per tonne FFB for the stated period.
- Use the per-tonne figure exactly as printed when the report prints one.
- If the report prints only an RM amount (or RM/ha) for an item, you may compute RM/t = RM amount ÷ the report's FFB tonnes for the SAME period
  (for RM/ha items: RM/ha × the hectare basis the report states ÷ FFB tonnes). Then add "calc": true to that item. Never use estimates or other periods.
- Budget: same rules; null if the report gives none. Actual null if not given.
- Item names: short, as the report names them (tidy capitalisation). Keep the report's order. Include every line item the report gives
  (if a group has more than 14 lines, keep the 13 largest and add "Other (n items)" as their sum with "calc": true).
- Group "actual"/"budget" = the report's printed group per-tonne totals (they should match the dashboard's existing costParts; if not, note it).
- If a group has no item-level detail in the report, give the group totals and "items": [].
- If the PA report has no cost section at all, write {"slug": "...", "none": true}.

