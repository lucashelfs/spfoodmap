# CLAUDE.md — São Paulo Food Map

Project: interactive world map, click a country → see curated São Paulo restaurants serving that cuisine.

## Stack (deliberate, keep it this way until there's a real reason not to)

- Plain HTML/CSS/JS in `src/`, no framework, no bundler, no npm. Deployed on GitHub Pages at https://lucashelfs.github.io/spfoodmap/ (also https://helfs.me/spfoodmap/) — separate repo from the `lucashelfs.github.io` user-site repo, see `docs/SPEC.md` for the deploy setup.
- D3.js (v7, `d3-geo` + `d3-selection`) loaded from CDN with SRI hash (`src/index.html`) — draws the world map as SVG paths from the GeoJSON, no basemap tiles. Chosen over Leaflet: no tile server/API-key dependency, pure SVG fits a static GH Pages deploy.
- Data loaded client-side via `d3.json()` (also plain `fetch()` under the hood) from static files in `data/`, using relative paths (`../data/...`) so it works regardless of server root or GH Pages subpath.
- Run locally with `uv run python -m http.server` from the repo root — `file://` won't work because loading local JSON is blocked. `pyproject.toml` has zero dependencies (stdlib `http.server` is enough); don't add deps unless the project actually needs a Python package.

Don't introduce React/Vite/webpack/etc. for this project unless the scope genuinely outgrows plain JS (e.g. real component state complexity). Don't add a backend/database until curation volume or multi-user editing actually requires it. Don't add basemap tiles back without checking the provider's usage policy allows unauthenticated hotlinking (OSM's own tile server blocks it, CARTO's free tier isn't guaranteed either) — SVG-only has worked fine so far.

## Files

- `data/restaurants.json` — the curated restaurant list. Schema in `docs/DATA_SCHEMA.md`. Use the `add-restaurant` skill (`.claude/skills/add-restaurant/`) to add an entry from a prose description instead of hand-editing the JSON.
- `data/countries-110m.geojson` — world country borders, trimmed to four properties per feature: `name` (English), `name_pt`, `name_es`, `iso_a2` (ISO 3166-1 alpha-2, from Natural Earth's `ISO_A2_EH` field — see Conventions). Source: Natural Earth 110m via nvkelso/natural-earth-vector, public domain.
- `docs/COUNTRIES.md` — generated reference table of every valid `countryCode`. Regenerate from `countries-110m.geojson` if that file changes.
- `src/app.js` — loads both JSON files, renders the D3 SVG map, highlights countries present in `restaurants.json`, click handler highlights the clicked country's border and renders the side panel, handles PT/EN/ES language switching (`STRINGS`, `setLang()`), preserves pan/zoom across window resize.
- `src/index.html` / `src/style.css` — page shell + styling.

## Conventions

- Commits: no "Co-Authored-By: Claude" line, no Claude signing.
- Commits follow [Conventional Commits](https://www.conventionalcommits.org/): `<type>[optional scope]: <description>`. Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`. Breaking change: `!` after type/scope (`feat!: ...`) or a `BREAKING CHANGE:` footer.
- `restaurants.json` entries' `countryCode` must be a valid ISO alpha-2 code matching a feature's `iso_a2` in `countries-110m.geojson`. If you add a restaurant for a country that isn't highlighting, check the code matches exactly (case-sensitive, uppercase). See `docs/COUNTRIES.md` for the valid list.
- Site supports 3 languages (`pt`/`en`/`es`, see `STRINGS` in `app.js`). Only `restaurants.json`'s `notes` field is per-language (object with `en`/`pt`/`es` keys, falls back to `en`); `name`/`cuisine`/`neighborhood`/`address` stay single-language as curated. If you add a new UI string, add it to `STRINGS` for all 3 languages, don't hardcode English.
- Keep `countries-110m.geojson` trimmed — only `name`, `name_pt`, `name_es`, `iso_a2` properties. If you regenerate/replace this file, use `ISO_A2_EH` (not `ISO_A2`) for `iso_a2` — Natural Earth's plain `ISO_A2` is `-99` for France, Norway, and a couple others, `ISO_A2_EH` fixes that.
- No secrets, no API keys — this project has none yet, keep it that way for as long as possible (v1 is fully static/local).

## Roadmap / next steps (update this as work progresses)

- [ ] Replace placeholder restaurant entries in `data/restaurants.json` with real curated picks (in all 3 languages for `notes`).
- [ ] Search/filter UI in the panel.
- [ ] If curation grows past a few dozen entries or needs multi-user editing, revisit the "no database" decision above.
