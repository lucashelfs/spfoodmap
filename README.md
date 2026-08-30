# São Paulo Food Map

Interactive world map: click a country, see curated São Paulo restaurants that serve that country's cuisine.

## Status: v1 (local-only)

No backend, no build step, no framework. Data is hand-curated in a JSON file.

## Run it locally

`fetch()` of local files doesn't work when opening `index.html` directly (`file://`), so serve it:

```bash
uv run python -m http.server 8000
```

Run from the repo root (works from any subdirectory too, since data paths are relative). Then open http://localhost:8000/src/.

## Stack

- D3.js (via CDN) — renders the world map as SVG paths, no basemap tiles
- `data/countries-110m.geojson` — world country borders (Natural Earth 110m, trimmed to `name` + `iso_a2` properties)
- `data/restaurants.json` — the curated restaurant list, loaded client-side with `fetch()`

## Add a restaurant

Edit `data/restaurants.json`. See `docs/DATA_SCHEMA.md` for the field reference and how `countryCode` links to the map.

## Roadmap ideas (not built yet)

- Search / filter restaurants by cuisine or neighborhood
- Photos per restaurant
- Support more cities beyond São Paulo
- Move data to a real database + admin UI for curation
- Deploy to GitHub Pages (planned first release target, no backend needed for current scope)

See `CLAUDE.md` for conventions to follow when picking up any of these.
