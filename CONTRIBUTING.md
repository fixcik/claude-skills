# Contributing

## Adding a Skill

1. **Fork** the repository

2. **Create** skill directory:
   ```bash
   mkdir skills/your-skill-name
   ```

3. **Create** `SKILL.md`:
   ```markdown
   ---
   name: your-skill-name
   description: Use when [trigger condition]. What this does.
   ---

   # Your Skill Name

   Instructions for Claude in second person.

   ## Steps

   1. Do this
   2. Then that
   3. Finally this
   ```

4. **Update** `registry.json`:
   ```json
   {
     "skills": {
       "your-skill-name": {
         "source": "builtin",
         "version": "1.0.0",
         "path": "skills/your-skill-name",
         "description": "Same as SKILL.md description"
       }
     }
   }
   ```

5. **Submit** Pull Request

## Guidelines

**Naming:**
- Use lowercase-kebab-case
- Keep short (2-4 words)

**Description:**
- Start with "Use when..."
- Be specific about triggers

**Content:**
- Write for Claude, not users
- Use second person ("You should...")
- Be specific and actionable

## Example

Good skill structure:

```
skills/
└── debug-logs/
    ├── SKILL.md        # Required
    └── examples/       # Optional
```

Good SKILL.md:

```markdown
---
name: debug-logs
description: Use when analyzing application logs or debugging runtime issues
---

# Debug Logs Skill

When the user provides log output:

1. Identify error patterns
2. Extract stack traces
3. Suggest fixes
```

## Questions?

Open an issue: https://github.com/fixcik/claude-skills/issues
