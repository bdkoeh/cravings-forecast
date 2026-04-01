# Workflow: Remove a Restaurant

## Trigger

The user asks to delete or remove a restaurant. They'll give a name (possibly informal or abbreviated).

## Step-by-Step Process

### 1. Find the Restaurant

Fetch all restaurants:
```
GET /restaurants
```

Search the results for the best match against what the user said. Match strategies:
- **Exact match:** User says "Joe's Pizza", you find "Joe's Pizza" — direct hit.
- **Partial match:** User says "Joe's", you find "Joe's Pizza" — likely match.
- **Fuzzy match:** User says "that pizza place downtown", you find "Joe's Pizza" in Downtown with cuisine "Pizza" — probable match.

**If you find exactly one match:** Proceed to step 2.

**If you find multiple possible matches:** Ask the user:
> "I found a few restaurants that could match. Did you mean:
> 1. Joe's Pizza (Downtown, Pizza)
> 2. Joe's Diner (Midtown, American)
>
> Which one?"

**If you find no match:** Tell the user:
> "I couldn't find a restaurant matching '[X]'. Here are all current restaurants: [list names]. Could you clarify which one?"

### 2. Confirm Deletion

Show the full restaurant details before deleting:

> **Delete this restaurant?**
> - Name: [name]
> - Neighborhood: [neighborhood]
> - Cuisine: [cuisine]
> - Website: [url]
> - Conditions: [conditions]
> - Description: "[description]"
>
> This cannot be undone. Confirm?

Wait for explicit confirmation.

### 3. Delete

```
DELETE /restaurants/:id
```

Confirm to the user that the restaurant has been removed.

## Edge Cases

- **User says "remove all Chinese restaurants":** Do NOT bulk delete. List the Chinese restaurants and ask the user to confirm each one individually.
- **User gives a name that doesn't exist at all:** List 3-5 similarly named restaurants as suggestions.
- **Restaurant has been highlighted (picked):** Mention this: "Note: this restaurant is currently marked as a Pick (highlighted). Still want to delete?"
