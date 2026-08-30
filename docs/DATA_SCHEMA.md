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
  "notes": "Optional free text.",
  "tags": ["optional", "labels"]
}
```

Field notes:
- `id`: unique, kebab-case, used as React/DOM key.
- `countryCode`: ISO 3166-1 alpha-2 (e.g. `JP`, `BR`, `IT`). Must match the `iso_a2` property in `data/countries-110m.geojson` — that's how the map links a country click to its restaurants.
- `notes`, `tags`: optional, default to `""` / `[]`.

## Country borders file

`data/countries-110m.geojson` — Natural Earth 110m admin-0 countries, trimmed to two properties per feature: `name` and `iso_a2`. Source: nvkelso/natural-earth-vector (public domain).

To add a restaurant: append an object to the array in `data/restaurants.json` with a valid `countryCode`. No build step, no restart needed beyond a page refresh.
