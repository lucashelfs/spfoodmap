# System spec — São Paulo Food Map (v1, as implemented)

## Purpose

Interactive world map. User clicks a country, side panel shows curated São Paulo restaurants serving that country's cuisine. Manual curation, static site, no backend.

## Architecture

Fully static, client-side only. No build step, no bundler, no framework, no npm.

```
spfoodmap/
  pyproject.toml          # uv-managed, zero deps, only for local dev server
  data/
    restaurants.json      # curated restaurant list
    countries-110m.geojson # world country polygons
  src/
    index.html
    style.css
    app.js
  docs/
    DATA_SCHEMA.md
    SPEC.md              # this file
```

Runtime deps: D3.js v7 (`d3.min.js`), loaded from unpkg CDN with a Subresource Integrity hash pinned in `index.html`. No API keys, no server-side code, no database.

## Data layer

**`data/restaurants.json`** — JSON array. Each entry:
```json
{
  "id": "unique-slug",
  "name": "Display name",
  "countryCode": "JP",
  "cuisine": "Japanese",
  "neighborhood": "Liberdade",
  "address": "...",
  "notes": "optional",
  "tags": ["optional"]
}
```
`countryCode` (ISO 3166-1 alpha-2) is the join key to the map. Full field reference: `docs/DATA_SCHEMA.md`. Currently 3 entries, 2 of them placeholders.

**`data/countries-110m.geojson`** — Natural Earth 110m admin-0 country polygons, sourced from nvkelso/natural-earth-vector (public domain), trimmed down to two properties per feature: `name` and `iso_a2`. ~250KB.

Both files are fetched client-side at page load via `d3.json()`, in parallel (`Promise.all`), with relative paths (`../data/...`) so it works regardless of what directory the static server's root is, and under a GitHub Pages subpath.

## Rendering (`src/app.js`)

1. Loads both JSON files, indexes restaurants by `countryCode` into an object (`byCountry`).
2. Builds a D3 geo projection (`d3.geoNaturalEarth1()`) fit to the `#map` container's size, and a `d3.geoPath` generator from it.
3. Draws one SVG `<path>` per GeoJSON feature inside a `<g>` (all appended to an `<svg>` sized to the container).
4. **No basemap tiles.** Ocean/background is a flat CSS color (`#cfe8f3`) on `#map`; only country shapes are drawn. This is deliberate — raster tile providers (tried: OSM direct, CARTO) either blocked hotlinking or required auth; SVG-only avoids that whole class of dependency.
5. Countries with restaurant data fill green (`#5cb87a`), others gray (`#ccc`); hover darkens the fill (`#3f9c62`) only for countries with data; cursor is `pointer` only over countries with data.
6. Click on a country calls `renderPanel(name, restaurants)`, which rebuilds the `#panel` DOM: country name as heading, one `.restaurant-card` per restaurant, or an empty-state message if none curated.
7. Zoom/pan: `d3.zoom()` attached to the `<svg>`, scale range 1–8, drag to pan, scroll/pinch to zoom. Stroke width is rescaled inversely to zoom level (`0.5 / k`) so borders stay visually constant thickness at any zoom.

## Styling (`src/style.css`)

Flex layout: header bar, then a row of `#map` (flex: 1) + `#panel` (fixed 320px side panel, scrollable). No CSS framework.

## Local dev

`uv run python -m http.server` from the repo root (uv only manages the Python version/venv; zero project dependencies — stdlib `http.server` is the whole "backend"). Must run from repo root, not `src/`, so relative data paths resolve. Open `http://localhost:<port>/src/`.

## Deploy target

GitHub Pages (not yet wired up). Static assets only, so no adaptation needed beyond confirming Pages' serving path (repo root vs `src/` vs `/docs`) matches the relative path assumptions above — open discussion, not yet decided/implemented.

## Known gaps / not built

- No search/filter in the panel.
- No automated tests.
- Restaurant list is almost entirely placeholder data.
- No GitHub Pages deploy config yet.
- No zoom-reset control.
