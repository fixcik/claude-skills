# Contributing to Claude Skills Marketplace

Thank you for your interest in contributing! This guide will help you add skills to the marketplace.

## Quick Start

1. Fork this repository
2. Create a new skill directory under `skills/`
3. Add your skill following the structure below
4. Update `registry.json`
5. Submit a Pull Request

## Skill Requirements

### Naming Conventions

- Use **lowercase-kebab-case** for skill names (e.g., `pr-review-comments`, `debug-logs-analyzer`)
- Keep names short but descriptive (2-4 words)
- Names should indicate the skill's primary purpose

### Directory Structure

```
skills/
└── your-skill-name/
    ├── SKILL.md              # Required
    ├── README.md             # Optional but recommended
    ├── scripts/              # Optional
    │   └── helper.ts
    └── examples/             # Optional
        └── example.json
```

### SKILL.md Format

This is the **most important file**. Claude Code reads this to understand the skill.

```markdown
---
name: your-skill-name
description: Use when [trigger condition]. Brief description of what this skill does.
---

# Your Skill Name

[Detailed instructions for Claude, written in second person]

## When to Use This Skill

[List specific scenarios when this skill should be activated]

## What This Skill Does

[Step-by-step workflow that Claude should follow]

## Examples

[Optional: Show example inputs/outputs]

## Notes

[Optional: Additional context, limitations, or tips]
```

#### Frontmatter Requirements

- **name**: Must match directory name exactly
- **description**: Should follow the pattern "Use when [trigger]..." to help Claude know when to activate the skill

#### Description Pattern

Good descriptions start with **"Use when"** to indicate activation triggers:

✅ **Good:**
- "Use when processing GitHub PR review comments, feedback, or threads"
- "Use when analyzing error logs or debugging production issues"
- "Use when creating or updating Grafana dashboards with Prometheus metrics"

❌ **Bad:**
- "A tool for PR review" (no trigger condition)
- "Helps with debugging" (too vague)
- "This skill processes comments" (doesn't indicate when to use)

### README.md (Optional)

Add a README.md for more detailed documentation:

- Installation instructions (if skill has dependencies)
- Usage examples
- Configuration options
- Troubleshooting tips

## Adding Your Skill

### 1. Create Skill Directory

```bash
cd skills
mkdir your-skill-name
cd your-skill-name
```

### 2. Create SKILL.md

```bash
cat > SKILL.md << 'EOF'
---
name: your-skill-name
description: Use when [trigger condition]. What this skill does.
---

# Your Skill Name

[Instructions for Claude...]
EOF
```

### 3. Update registry.json

Add an entry to the `skills` object:

```json
{
  "version": "1.0.0",
  "skills": {
    "your-skill-name": {
      "source": "builtin",
      "version": "1.0.0",
      "path": "skills/your-skill-name",
      "description": "Use when [trigger]. Brief description."
    }
  }
}
```

**Note:** The `description` in registry.json should match the one in SKILL.md frontmatter.

### 4. Test Your Skill

```bash
# Install locally
./gh-skills install your-skill-name

# Verify installation
ls ~/.claude/skills/your-skill-name

# Test in Claude Code
# Start a new session and use: /your-skill-name
```

### 5. Submit Pull Request

1. Commit your changes:
   ```bash
   git add skills/your-skill-name registry.json
   git commit -m "Add your-skill-name skill"
   ```

2. Push to your fork:
   ```bash
   git push origin main
   ```

3. Open a Pull Request with:
   - Clear title: "Add [skill-name] skill"
   - Description of what the skill does
   - Example usage (screenshots welcome!)

## Skill Writing Tips

### Writing for Claude

Skills are instructions **for Claude**, not for end users. Write in second person:

✅ **Good:**
```markdown
When the user asks to process PR comments:
1. First, verify that `gh-pr-threads` is installed
2. Run the fetch command to get all threads
3. Parse the output and present it to the user
```

❌ **Bad:**
```markdown
This skill processes PR comments. It uses gh-pr-threads.
```

### Be Specific

Provide **clear, actionable steps** that Claude can follow:

✅ **Good:**
```markdown
1. Run `gh-pr-threads <PR_URL> --format json`
2. Parse the JSON output
3. For each thread with status "pending":
   - Show the comment content
   - Ask user if they want to reply or mark as done
```

❌ **Bad:**
```markdown
Process the PR comments somehow.
```

### Include Context

Help Claude understand **when** to use the skill:

```markdown
## When to Use This Skill

Trigger this skill when the user:
- Says "process PR comments" or "check review feedback"
- Provides a GitHub PR URL and mentions reviews/comments
- Asks about pending CodeRabbit nitpicks
```

### Provide Examples

If your skill processes data in a specific format, include examples:

```markdown
## Example Input

\`\`\`json
{
  "threads": [
    {
      "id": "abc123",
      "status": "pending",
      "comment": "Consider using const instead of let"
    }
  ]
}
\`\`\`

## Expected Output

For each pending thread, present:
- The comment text
- The file and line number
- Options to reply, resolve, or skip
```

## External Skills

If your skill is maintained in a separate repository, you can add it to the **external** registry:

```json
{
  "external": {
    "your-skill-name": {
      "repo": "https://github.com/your-username/your-repo",
      "path": "skills/your-skill-name",
      "version": "1.0.0",
      "description": "Use when [trigger]. Brief description."
    }
  }
}
```

**Benefits:**
- Maintain your skill in your own repo
- Version independently from the marketplace
- Get listed in `gh skills search`

**Requirements:**
- Public GitHub repository
- Same SKILL.md structure
- Specify `path` to the skill directory within your repo

## Validation

Before submitting, ensure:

- [ ] Skill name is lowercase-kebab-case
- [ ] SKILL.md has valid frontmatter (name + description)
- [ ] `name` matches directory name exactly
- [ ] Description follows "Use when..." pattern
- [ ] registry.json is valid JSON
- [ ] Skill installs successfully with `./gh-skills install`
- [ ] Skill works in Claude Code (test with `/skill-name`)

## CI Validation

Pull requests automatically run validation checks:

1. **JSON validation**: Ensures registry.json is valid
2. **Frontmatter validation**: Checks all SKILL.md files have required fields
3. **Name consistency**: Verifies name matches directory name
4. **Description pattern**: Ensures description follows best practices

## Need Help?

- [Open an issue](https://github.com/fixcik/claude-skills/issues) with questions
- Check existing skills in `skills/` for examples
- Read the [Claude Code documentation](https://docs.anthropic.com/claude/docs)

## Code of Conduct

- Be respectful and constructive
- Skills should be generally useful, not overly specific to your use case
- Don't submit skills that violate GitHub's Terms of Service
- Keep skill descriptions accurate and honest

## License

By contributing, you agree that your contributions will be licensed under the same license as this project (MIT).
