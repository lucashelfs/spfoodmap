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
    COUNTRIES.md          # reference table of valid countryCode values
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
  "notes": { "en": "...", "pt": "...", "es": "..." },
  "tags": ["optional"]
}
```
`countryCode` (ISO 3166-1 alpha-2) is the join key to the map — full valid list in `docs/COUNTRIES.md`. `notes` is the only per-language field (site UI has 3 languages, see below); `name`/`cuisine`/`neighborhood`/`address` stay in whatever language the curator wrote them. Full field reference: `docs/DATA_SCHEMA.md`. Currently 3 entries, 2 of them placeholders.

**`data/countries-110m.geojson`** — Natural Earth 110m admin-0 country polygons, sourced from nvkelso/natural-earth-vector (public domain), trimmed down to four properties per feature: `name` (English), `name_pt`, `name_es`, `iso_a2`. ~260KB. `iso_a2` is taken from Natural Earth's `ISO_A2_EH` field, not `ISO_A2` — the latter is `-99` for France, Norway, and a few others due to a disputed-territory data quirk in the source dataset.

Both files are fetched client-side at page load via `d3.json()`, in parallel (`Promise.all`), with relative paths (`../data/...`) so it works regardless of what directory the static server's root is, and under a GitHub Pages subpath.

## Rendering (`src/app.js`)

1. Loads both JSON files, indexes restaurants by `countryCode` into an object (`byCountry`).
2. Builds a D3 geo projection (`d3.geoNaturalEarth1()`) fit to the `#map` container's size, and a `d3.geoPath` generator from it.
3. Draws one SVG `<path>` per GeoJSON feature inside a `<g>` (all appended to an `<svg>` sized to the container).
4. **No basemap tiles.** Ocean/background is a flat CSS color (`#cfe8f3`) on `#map`; only country shapes are drawn. This is deliberate — raster tile providers (tried: OSM direct, CARTO) either blocked hotlinking or required auth; SVG-only avoids that whole class of dependency.
5. Countries with restaurant data fill green (`#5cb87a`), others gray (`#ccc`); hover darkens the fill (`#3f9c62`) only for countries with data; cursor is `pointer` only over countries with data.
6. Click on a country stores it as `selectedFeature` and calls `renderPanel()`, which rebuilds the `#panel` DOM: localized country name as heading, one `.restaurant-card` per restaurant, or an empty-state message if none curated.
7. Zoom/pan: `d3.zoom()` attached to the `<svg>`, scale range 1–8, drag to pan, scroll/pinch to zoom. Stroke width is rescaled inversely to zoom level (`0.5 / k`) so borders stay visually constant thickness at any zoom. On window resize, only the SVG's width/height are updated — the projection is *not* re-fit and zoom/pan state is *not* reset, so the view stays put (Google Maps-style) instead of snapping back on every resize.

## Internationalization

Three languages: `pt`, `en`, `es`. `STRINGS` object in `app.js` holds UI chrome text (title, subtitle, hint, empty state, load error). Language resolution order: `localStorage["spfoodmap-lang"]` override → `navigator.language` prefix if it's one of the 3 → `en` fallback. Toggle buttons in the header (`#lang-switcher`) call `setLang()`, which persists the choice and re-renders both the static chrome and the panel.

Country names are localized via `name`/`name_pt`/`name_es` on each GeoJSON feature (sourced from Natural Earth's multilingual name fields). Restaurant `notes` is a per-language object, falling back to `en` if the current language is missing. Other restaurant fields (`name`, `cuisine`, `neighborhood`, `address`) are not translated — single value as curated.

## Styling (`src/style.css`)

Flex layout: header bar (with the language switcher absolutely positioned top-right), then a row of `#map` (flex: 1, `min-width: 0` so it can shrink below the sidebar's width instead of forcing horizontal scroll) + `#panel` (fixed 320px side panel, scrollable). Below 700px width, `#layout` switches to a column: map on top (60dvh), panel below (35dvh). Uses `100dvh` (dynamic viewport height, mobile-safe) with a `100vh` fallback for older browsers. No CSS framework.

## Local dev

`uv run python -m http.server` from the repo root (uv only manages the Python version/venv; zero project dependencies — stdlib `http.server` is the whole "backend"). Must run from repo root, not `src/`, so relative data paths resolve. Open `http://localhost:<port>/src/`.

## Deploy target

Live on GitHub Pages: `https://lucashelfs.github.io/spfoodmap/` (redirects to `src/index.html` via a root `index.html`), also reachable at `https://helfs.me/spfoodmap/` since that custom domain auto-extends to project sites. Separate repo from the `lucashelfs.github.io` user-site repo, deployed via GitHub's "Deploy from a branch" (branch `main`, folder `/ root`). `.nojekyll` at repo root disables Jekyll processing (it was auto-rendering `README.md` as the homepage before this was added).

## Known gaps / not built

- No search/filter in the panel.
- No automated tests.
- Restaurant list is almost entirely placeholder data.
- No zoom-reset control.
- Restaurant `name`/`cuisine`/`neighborhood`/`address` aren't translatable, only `notes` is.
