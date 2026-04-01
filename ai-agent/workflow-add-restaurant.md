# Workflow: Add a Restaurant

## Trigger

The user asks to add a restaurant. They may provide some or all of:
- Restaurant name (required — at minimum they'll give you this)
- Neighborhood
- Condition(s): foggy, sunny, night
- Cuisine type
- Website URL

## Step-by-Step Process

### 1. Research the Restaurant

Using the restaurant name (and any other details the user provided), research the restaurant:

- **Verify it exists** in the city this instance covers. If you find multiple matches, ask the user to clarify (e.g., "Did you mean the one on Main St or the one on 5th Ave?").
- **Find the website.** Look for the restaurant's official website. If no official website exists, use the Google Maps URL instead.
- **Identify the cuisine.** Based on the restaurant's menu and identity, determine the cuisine type.
- **Identify the neighborhood.** If the user didn't specify, determine which neighborhood the restaurant is in based on its address.

### 2. Match Cuisine to Existing List

Fetch the current cuisines:
```
GET /cuisines
```

Compare your researched cuisine against the list. Match by meaning, not exact string — for example, "Dim Sum" should match "Chinese", "Taqueria" should match "Mexican".

**If a match exists:** Use that cuisine's `id`.

**If no match exists:** Ask the user:
> "The cuisine '[X]' doesn't match any existing type. Current cuisines are: [list]. Should I add '[X]' as a new cuisine, or does it fit one of the existing ones?"

If the user approves adding it:
```
POST /cuisines
{"name": "New Cuisine Name"}
```

Use the returned `id`.

### 3. Match Neighborhood to Existing List

Fetch the current neighborhoods:
```
GET /neighborhoods
```

Match the restaurant's address to a neighborhood in the list. Neighborhood boundaries can be fuzzy — use your best judgment.

**If a match exists:** Use that neighborhood's `id`.

**If no match exists:** Ask the user:
> "The restaurant appears to be in '[X]', which isn't in the neighborhoods list. Current neighborhoods are: [list]. Should I add '[X]', or does it fall within one of the existing ones?"

If the user approves adding it:
```
POST /neighborhoods
{"name": "New Neighborhood"}
```

Use the returned `id`.

### 4. Determine Condition(s)

If the user specified condition(s), use those. Valid values: `"foggy"`, `"sunny"`, `"night"`.

If the user didn't specify, infer from context:
- **Foggy:** Comfort food, warm soups, cozy interiors, bakeries, hot drinks. Places you'd go when it's cold and gray outside.
- **Sunny:** Outdoor seating, patios, ice cream, light food, waterfront. Places that shine on a warm day.
- **Night:** Late night menus, bars with food, date spots, after-dark vibes. Places open late.

A restaurant can have multiple conditions. Most have 1-2.

### 5. Write a Description

Write a short, opinionated description (1-2 sentences) in the voice of the site. The tone should be:
- Specific and personal, not generic
- Opinionated — tell someone *why* they should go
- Fun but not corny
- Written like a local, not a tourist guide

### 6. Confirm with the User

Present a summary before creating:

> **Adding restaurant:**
> - Name: [name]
> - Website: [url]
> - Neighborhood: [neighborhood]
> - Cuisine: [cuisine]
> - Conditions: [conditions]
> - Description: "[description]"
>
> Should I add this?

Wait for explicit confirmation.

### 7. Create the Restaurant

```
POST /restaurants
Content-Type: application/json

{
  "name": "Restaurant Name",
  "link": "https://example.com",
  "neighborhood_id": 1,
  "cuisine_id": 1,
  "description": "What makes this place special.",
  "conditions": ["foggy", "night"]
}
```

Confirm success to the user with the created restaurant's details.

## Edge Cases

- **Restaurant doesn't exist or has closed:** Tell the user you couldn't verify the restaurant is open. Ask if they want to proceed anyway.
- **Multiple locations:** Ask the user which location they mean.
- **No website found:** Use the Google Maps URL. Tell the user: "I couldn't find an official website, so I'm using the Google Maps link."
- **User gives vague cuisine:** "It's like a fusion place" — ask for more detail or suggest the closest existing cuisine.
- **User gives vague neighborhood:** "It's near the park" — ask which park, then map to neighborhood.
