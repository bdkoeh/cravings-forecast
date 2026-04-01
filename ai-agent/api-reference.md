# API Reference

Base URL: `http://localhost:3001/api/v1`
Auth: `Authorization: Bearer <API_TOKEN>` on every request

---

## Restaurants

### List All Restaurants

```
GET /restaurants
GET /restaurants?condition=foggy
GET /restaurants?neighborhood=Downtown
GET /restaurants?condition=sunny&neighborhood=Midtown
```

Response: Array of restaurant objects.

```json
[
  {
    "id": 1,
    "name": "Example Bakery",
    "link": "https://example.com",
    "neighborhood_id": 1,
    "cuisine_id": 1,
    "description": "The croissants are a religious experience. Go early or suffer.",
    "highlighted": 1,
    "neighborhood": "Downtown",
    "cuisine_type": "Bakery",
    "conditions": ["foggy", "night"]
  }
]
```

### Get Single Restaurant

```
GET /restaurants/:id
```

Response: Single restaurant object (same shape as above). Returns 404 if not found.

### Create Restaurant

```
POST /restaurants
Content-Type: application/json

{
  "name": "Restaurant Name",
  "link": "https://example.com",
  "neighborhood_id": 1,
  "cuisine_id": 3,
  "description": "What makes this place special.",
  "conditions": ["foggy", "night"]
}
```

Required fields: `name`, `neighborhood_id`, `conditions` (at least one).
Optional fields: `link`, `cuisine_id`, `description`.
Valid conditions: `"foggy"`, `"sunny"`, `"night"`.

Response: 201 with the created restaurant object.

### Update Restaurant

```
PUT /restaurants/:id
Content-Type: application/json

{
  "name": "Updated Name",
  "link": "https://newsite.com",
  "neighborhood_id": 2,
  "cuisine_id": 5,
  "description": "Updated description.",
  "conditions": ["sunny"]
}
```

All fields from create are required (this is a full replace, not a patch).
Response: Updated restaurant object. Returns 404 if not found.

### Delete Restaurant

```
DELETE /restaurants/:id
```

Response: `{"success": true}`. Returns 404 if not found.

---

## Cuisines

### List All Cuisines

```
GET /cuisines
```

Response:
```json
[
  {"id": 7, "name": "American"},
  {"id": 1, "name": "Bakery"},
  {"id": 3, "name": "Chinese"}
]
```

Sorted alphabetically by name.

### Create Cuisine

```
POST /cuisines
Content-Type: application/json

{"name": "Ethiopian"}
```

Response: 201 with `{"id": 15, "name": "Ethiopian"}`.
Returns 409 if name already exists.

### Update Cuisine

```
PUT /cuisines/:id
Content-Type: application/json

{"name": "Dim Sum"}
```

Response: Updated cuisine object. Returns 404 if not found, 409 if name already exists.

### Delete Cuisine

```
DELETE /cuisines/:id
```

Response: `{"success": true}`.
Returns 404 if not found.
Returns 409 with `{"error": "Cannot delete: cuisine is in use by restaurants"}` if any restaurant uses this cuisine.

---

## Neighborhoods

### List All Neighborhoods

```
GET /neighborhoods
```

Response:
```json
[
  {"id": 1, "name": "Downtown"},
  {"id": 2, "name": "Midtown"},
  {"id": 3, "name": "Uptown"}
]
```

Sorted alphabetically by name.

### Create Neighborhood

```
POST /neighborhoods
Content-Type: application/json

{"name": "Waterfront"}
```

Response: 201 with `{"id": 4, "name": "Waterfront"}`.
Returns 409 if name already exists.

### Update Neighborhood

```
PUT /neighborhoods/:id
Content-Type: application/json

{"name": "Updated Name"}
```

Response: Updated neighborhood object. Returns 404/409.

### Delete Neighborhood

```
DELETE /neighborhoods/:id
```

Response: `{"success": true}`.
Returns 409 if in use by restaurants.

---

## Crawl Messages

These are the scrolling text messages at the bottom of the site.

### List All Crawl Messages

```
GET /crawl-messages
```

Response:
```json
[
  {
    "id": 1,
    "message": "Pro tip: The best tacos are always at the place with no sign.",
    "sort_order": 1,
    "active": 1
  }
]
```

### Create Crawl Message

```
POST /crawl-messages
Content-Type: application/json

{
  "message": "The best restaurant in the city is wherever you had your first meal.",
  "sort_order": 6
}
```

Response: 201 with created message object. `sort_order` is optional (defaults to 0).

### Update Crawl Message

```
PUT /crawl-messages/:id
Content-Type: application/json

{"message": "Updated text", "sort_order": 2, "active": 0}
```

All fields are optional (this is a patch, not a replace). Set `active` to `0` to hide, `1` to show.
Response: Updated message object.

### Delete Crawl Message

```
DELETE /crawl-messages/:id
```

Response: `{"success": true}`.

---

## Condition Meta

Metadata for the three conditions (foggy, sunny, night). Controls the display tag and description on the landing page.

### List Condition Meta

```
GET /condition-meta
```

Response:
```json
[
  {"condition": "foggy", "tag": "CZY", "description": "Fog-proof Comfort Foods"},
  {"condition": "night", "tag": "NTE", "description": "Evening Out in the City"},
  {"condition": "sunny", "tag": "SNY", "description": "Grab a Spot in the Sun"}
]
```

### Update Condition Meta

```
PUT /condition-meta/:condition
Content-Type: application/json

{"tag": "FOG", "description": "Wrap Up in Comfort Food"}
```

Both `tag` and `description` are optional (patch). `:condition` must be `foggy`, `sunny`, or `night`.

---

## Error Responses

| Status | Meaning | Example |
|--------|---------|---------|
| 400 | Bad request / missing fields | `{"error": "Name and neighborhood_id are required"}` |
| 401 | Missing or invalid token | `{"error": "Missing Authorization: Bearer <token> header"}` |
| 404 | Resource not found | `{"error": "Not found"}` |
| 409 | Conflict (duplicate or in use) | `{"error": "Cannot delete: cuisine is in use by restaurants"}` |
| 500 | Server error / misconfigured | `{"error": "API token not configured"}` |
