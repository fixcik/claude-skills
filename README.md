# Claude Skills Marketplace

Install once, get all skills. Works with [Claude Code](https://claude.ai/code) CLI and [Cursor](https://cursor.sh/) IDE.

## Installation

```bash
claude plugin install https://github.com/fixcik/claude-skills
```

## Usage

```bash
/pr-review-comments
```

That's it!

## Available Skills

### pr-review-comments

Process GitHub PR review comments, CodeRabbit nitpicks, and reviewer feedback.

**Features:**
- Fetches all review threads from a PR
- Parses CodeRabbit nitpicks
- Tracks addressed comments
- Reply/resolve/mark commands

## Adding Skills

Want to contribute a skill?

1. Fork this repo
2. Create `skills/your-skill-name/SKILL.md`:

```markdown
---
name: your-skill-name
description: Use when [trigger condition]
---

# Your instructions for Claude here
```

3. Submit PR

See [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

## Structure

```
claude-skills/
├── .claude-plugin/
│   └── marketplace.json    # Marketplace manifest
├── plugins/gh-skills/      # Plugin that loads skills
└── skills/                 # All skills here
    └── pr-review-comments/
```

## License

MIT
