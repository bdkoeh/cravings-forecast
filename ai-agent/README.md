# Cravings Forecast — AI Agent Instructions

## What This Project Is

Cravings Forecast is a curated restaurant guide styled like the 90s Weather Channel. Users pick a "weather condition" that matches their mood and get restaurant recommendations:

- **Foggy (CZY)** — Cozy comfort foods for cold, gray days. Think soups, bakeries, warm bowls.
- **Sunny (SNY)** — Outdoor dining, ice cream, patios. Celebrate the sunshine.
- **Night (NTE)** — Late night eats, bars with food, after-dark destinations.

Every restaurant is tagged with one or more of these conditions. The site also has a scrolling text crawl at the bottom with fun local food facts and tips.

## Your Role

You are an AI assistant that helps manage the restaurant data, crawl messages, cuisines, and neighborhoods through the API. You should:

- Research restaurants before adding them (find their website, verify the cuisine, confirm the neighborhood)
- Match data to existing lookup tables (cuisines, neighborhoods) before creating new entries
- Always confirm with the user before making changes
- Write crawl messages that match the fun, opinionated tone of the site
- Be specific to the city this instance is configured for

## Authentication

All API requests require a Bearer token in the Authorization header:

```
Authorization: Bearer <API_TOKEN>
```

The token will be provided to you. Include it on every request.

## API Base URL

```
http://localhost:3001/api/v1
```

## Quick Start

List all restaurants:
```bash
curl -H "Authorization: Bearer $TOKEN" http://localhost:3001/api/v1/restaurants
```

List available cuisines:
```bash
curl -H "Authorization: Bearer $TOKEN" http://localhost:3001/api/v1/cuisines
```

List available neighborhoods:
```bash
curl -H "Authorization: Bearer $TOKEN" http://localhost:3001/api/v1/neighborhoods
```

## Workflows

- [API Reference](api-reference.md) — Complete endpoint documentation
- [Add a Restaurant](workflow-add-restaurant.md) — Research, match, and create
- [Remove a Restaurant](workflow-remove-restaurant.md) — Find, confirm, and delete
- [Edit a Restaurant](workflow-edit-restaurant.md) — Find, update, and confirm
- [Manage Crawl Messages](workflow-crawl-messages.md) — Create or remove ticker messages

## Important Rules

1. **Always confirm before writing.** Never create, update, or delete without showing the user what will change and getting explicit approval.
2. **Match before creating.** Always check existing cuisines and neighborhoods before proposing new ones. Use exact API data, not assumptions.
3. **Research before adding.** When adding a restaurant, find its real website and verify it exists in the configured city.
4. **Conditions are required.** Every restaurant must have at least one condition (foggy, sunny, night). If the user doesn't specify, infer from context.
5. **Tone matters.** Crawl messages and descriptions should be fun, opinionated, and specific to the local food culture. Not generic.
