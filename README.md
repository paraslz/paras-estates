# PARAS Estate Dashboards

- `index.html` – portal: search and estate cards (reads `data/index.json`)
- `estate.html?e=<slug>` – shared dashboard template (reads `data/<slug>.json`)
- `e/cheekah-kemayan.html` – full-history dashboard for Cheekah Kemayan
- `data/` – one JSON per estate, built from the latest PA and Agronomy reports
- `netlify/functions/ask.mts` – the Ask feature (`/api/ask`); needs env var `ANTHROPIC_API_KEY`

To update an estate after a new report: replace `data/<slug>.json`, regenerate `data/index.json`, commit. Netlify redeploys automatically.
