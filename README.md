# Claude Skills Marketplace

Install once, get all skills. Works with [Claude Code](https://claude.ai/code) CLI and [Cursor](https://cursor.sh/) IDE.

## Installation

### Option 1: Direct Install (Recommended)

Add the marketplace and install the plugin in one command:

```bash
/plugin marketplace add fixcik/claude-skills
/plugin install gh-skills@claude-skills
```

### Option 2: Interactive Install

Use the interactive plugin manager:

```bash
/plugin
```

Then:
1. Go to **Marketplaces** tab
2. Select **Add marketplace**
3. Enter: `fixcik/claude-skills`
4. Go to **Discover** tab
5. Find `gh-skills` and install

## Usage

After installation, all skills are immediately available:

```bash
/pr-review-comments
```

That's it! No additional setup needed.

## Available Skills

### pr-review-comments

Process GitHub PR review comments, CodeRabbit nitpicks, and reviewer feedback.

**Features:**
- Fetches all review threads from a PR
- Parses CodeRabbit nitpicks
- Tracks addressed comments
- Reply/resolve/mark commands

**Usage:**
```bash
/pr-review-comments
```

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
│   └── marketplace.json         # Marketplace manifest
└── plugins/gh-skills/           # Plugin with skills
    ├── .claude-plugin/plugin.json
    └── skills/
        └── pr-review-comments/  # Skills inside plugin
```

## Uninstall

To remove the plugin:

```bash
/plugin uninstall gh-skills@claude-skills
```

To remove the marketplace:

```bash
/plugin marketplace remove claude-skills
```

## License

MIT
