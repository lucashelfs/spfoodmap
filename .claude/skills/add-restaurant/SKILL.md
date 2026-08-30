---
name: add-restaurant
description: Turn a free-text description of a São Paulo restaurant into a properly-formatted entry appended to data/restaurants.json. Use when the user describes a restaurant in prose (name, cuisine/country, neighborhood, address, any notes) and wants it added to the food map.
---

Add one restaurant entry to `data/restaurants.json` from the user's prose description.

## Steps

1. Read `docs/DATA_SCHEMA.md` for the exact field shape and `docs/COUNTRIES.md` for the valid `countryCode` list.
2. Read the current `data/restaurants.json` to see existing entries (for id collisions and to match formatting).
3. Extract from the user's prose:
   - `name` — required.
   - `countryCode` — infer from the cuisine or country mentioned, look up the matching row in `docs/COUNTRIES.md`. If the cuisine doesn't map cleanly to one country (e.g. "Middle Eastern"), ask the user which specific country code to use — don't guess.
   - `cuisine` — a short label (e.g. "Japanese", "Peruvian").
   - `neighborhood` — São Paulo neighborhood, if mentioned.
   - `address` — if the user didn't give one, ask for it rather than inventing one. Don't fabricate a street address.
   - `notes` — optional. If the user's prose has any color/description worth keeping, translate it into all three languages (`en`, `pt`, `es`) and put it in the `notes` object. Omit the whole field if there's nothing to say.
   - `tags` — optional, only if the user's description implies clear labels (e.g. "izakaya", "vegan-friendly"). Default `[]`.
4. Generate `id`: kebab-case slug of the name. If it collides with an existing `id` in the file, disambiguate (append the neighborhood or a number).
5. Append the new object to the JSON array, matching the existing file's 2-space indentation and key order (`id`, `name`, `countryCode`, `cuisine`, `neighborhood`, `address`, `notes`, `tags`).
6. Show the user the entry you're about to add before writing it, in case anything was misread from the prose.
7. Don't commit — leave that to the user, per this repo's normal workflow (see `CLAUDE.md` for commit conventions if they do ask to commit).
