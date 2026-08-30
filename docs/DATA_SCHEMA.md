# Restaurant data schema

File: `data/restaurants.json` — a JSON array of restaurant objects.

```json
{
  "id": "unique-slug",
  "name": "Display name",
  "countryCode": "JP",
  "cuisine": "Japanese",
  "neighborhood": "Liberdade",
  "address": "Street, number - Neighborhood, São Paulo",
  "notes": { "en": "...", "pt": "...", "es": "..." },
  "tags": ["optional", "labels"]
}
```

Field notes:
- `id`: unique, kebab-case, used as React/DOM key.
- `countryCode`: ISO 3166-1 alpha-2 (e.g. `JP`, `BR`, `IT`). Must match the `iso_a2` property in `data/countries-110m.geojson` — that's how the map links a country click to its restaurants. Full reference list: `docs/COUNTRIES.md`.
- `name`, `cuisine`, `neighborhood`, `address`: single value, curator's choice of language — not translated per the site's language toggle.
- `notes`: optional, per-language object (`en`/`pt`/`es`). Missing a language falls back to `en`. Omit the whole field if there's nothing to say.
- `tags`: optional, defaults to `[]`.

## Country borders file

`data/countries-110m.geojson` — Natural Earth 110m admin-0 countries, trimmed to four properties per feature: `name` (English), `name_pt`, `name_es`, `iso_a2`. Source: nvkelso/natural-earth-vector (public domain). `iso_a2` prefers the `ISO_A2_EH` field over `ISO_A2` — Natural Earth's plain `ISO_A2` is `-99` for a few countries (notably France, Norway) due to a disputed-territory quirk; `ISO_A2_EH` has the correct code for those. Two entries (Northern Cyprus, Somaliland) have no real ISO code and stay `-99` — they can't be used as a `countryCode`.

To add a restaurant: append an object to the array in `data/restaurants.json` with a valid `countryCode`. No build step, no restart needed beyond a page refresh.
