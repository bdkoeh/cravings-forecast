# Workflow: Manage Crawl Messages

Crawl messages are the scrolling text at the bottom of the site. They're fun, opinionated local food facts and tips.

## Creating a New Message

### Trigger

User asks to add a crawl message. Two sub-flows:

### Flow A: User Has a Message in Mind

1. **Polish it.** Ask the user if they want help refining the message. If yes, suggest a tighter version that matches the site's tone.

2. **Confirm.** Show the final text:
   > **New crawl message:**
   > "The best restaurant in the city is wherever you had your first meal."
   >
   > Add this?

3. **Create:**
   ```
   POST /crawl-messages
   {"message": "The best restaurant in the city is wherever you had your first meal.", "sort_order": 6}
   ```
   Set `sort_order` to one higher than the current max (fetch `GET /crawl-messages` first to check).

### Flow B: User Wants to Brainstorm

1. **Ask for a topic or idea.** Examples: "something about the weather", "a tip about the food scene", "something about late night food".

2. **Generate 5 options.** Each should be:
   - One sentence (max two)
   - Opinionated and specific to the local food scene
   - Fun but not corny
   - Written like a local, not a tourist guide

   Example options for "something about comfort food":
   > 1. "The worse the weather, the better the food tastes. That's just science."
   > 2. "Comfort food isn't a genre. It's whatever you eat when you need a hug."
   > 3. "If the menu is laminated and the portions are huge, you're in the right place."
   > 4. "A bowl of soup on a cold day is worth more than a Michelin star."
   > 5. "The best comfort food spot in any city is the one your friend's mom showed you."

3. **User picks one** (or asks for more options, or modifies one).

4. **Confirm and create** (same as Flow A step 2-3).

### Tone Guide

Good crawl messages sound like:
- "Pro tip: If there's a line, it's worth the wait. If there's no line, you found a secret."
- "Rainy days and dumplings. Name a better duo."
- "The best meal you'll have this week is the one you didn't plan."

Bad crawl messages sound like:
- "This city has many great restaurants to choose from." (too generic)
- "Visit our website for more information!" (not the vibe)
- "Restaurant recommendations updated weekly." (operational, not fun)

---

## Removing a Message

### Trigger

User asks to delete a crawl message. They'll paraphrase it, not give the exact text.

### Step-by-Step

1. **Fetch all messages:**
   ```
   GET /crawl-messages
   ```

2. **Find the match.** Compare the user's paraphrase against message text. Examples:
   - User says "the one about dumplings" → matches "Rainy days and dumplings. Name a better duo."
   - User says "the comfort food one" → matches "Comfort food isn't a genre..."

   **If ambiguous**, show the candidates:
   > "I found a few that could match:
   > 1. 'Comfort food isn't a genre. It's whatever you eat when you need a hug.'
   > 2. 'The worse the weather, the better the food tastes.'
   >
   > Which one?"

3. **Confirm deletion.** Show the full text:
   > **Delete this crawl message?**
   > "Rainy days and dumplings. Name a better duo."
   >
   > Confirm?

4. **Delete:**
   ```
   DELETE /crawl-messages/:id
   ```

   Confirm to the user.

---

## Toggling Active/Inactive

Instead of deleting, the user might want to temporarily hide a message. Use:

```
PUT /crawl-messages/:id
{"active": 0}
```

To re-enable:
```
PUT /crawl-messages/:id
{"active": 1}
```

If the user says "hide" or "disable" instead of "delete", use this instead of DELETE.
