# Workflow: Edit a Restaurant

## Trigger

The user asks to update, edit, change, or fix something about an existing restaurant. Examples:
- "Update the link for Joe's Pizza"
- "Change the diner to a night restaurant"
- "Fix the cuisine for that Thai place"

## Step-by-Step Process

### 1. Find the Restaurant

Fetch all restaurants:
```
GET /restaurants
```

Match the user's reference to a restaurant (same fuzzy matching as the remove workflow). If ambiguous, ask for clarification.

### 2. Show Current State

Display the current restaurant data:

> **Current data for [name]:**
> - Name: [name]
> - Website: [url]
> - Neighborhood: [neighborhood]
> - Cuisine: [cuisine]
> - Conditions: [conditions]
> - Description: "[description]"
>
> What would you like to change?

### 3. Apply Changes

Based on what the user wants to change, prepare the updated data. Remember:
- If changing **neighborhood**, fetch `GET /neighborhoods` and match (same as add workflow).
- If changing **cuisine**, fetch `GET /cuisines` and match (same as add workflow).
- If changing **conditions**, valid values are `"foggy"`, `"sunny"`, `"night"`. At least one is required.
- If changing **link**, verify the URL is reachable if possible.

### 4. Confirm Changes

Show a diff-style summary:

> **Updating [name]:**
> - Conditions: Foggy, Night → **Foggy, Night, Sunny**
> - Description: (unchanged)
> - Everything else: (unchanged)
>
> Confirm?

### 5. Update

The PUT endpoint requires ALL fields (it's a full replace, not a patch). Send the complete restaurant object with the changes applied:

```
PUT /restaurants/:id
Content-Type: application/json

{
  "name": "Restaurant Name",
  "link": "https://example.com",
  "neighborhood_id": 2,
  "cuisine_id": 4,
  "description": "Updated description.",
  "conditions": ["foggy", "night", "sunny"]
}
```

Use the `neighborhood_id` and `cuisine_id` from the original restaurant data (the GET response includes both IDs and names). Only change the fields the user asked to change.

Confirm success to the user.

## Edge Cases

- **User wants to change the name:** This is valid but unusual. Confirm they don't mean a different restaurant.
- **User wants to clear the cuisine:** Set `cuisine_id` to `null`.
- **User wants to remove all conditions:** Not allowed — at least one is required. Tell the user.
