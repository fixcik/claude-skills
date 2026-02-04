# Claude Skills Marketplace

A centralized marketplace for [Claude Code](https://claude.ai/code) skills with a GitHub CLI extension for easy management.

## What are Claude Code Skills?

Claude Code skills are specialized prompts that extend Claude's capabilities with domain-specific knowledge, workflows, and tool integrations. They help Claude provide more focused and effective assistance for specific tasks.

## Installation

### Prerequisites

- [GitHub CLI (`gh`)](https://cli.github.com/) (optional, for `gh skills` command)
- `jq` for JSON parsing: `brew install jq` (macOS) or `apt-get install jq` (Linux)

### Install the Marketplace

```bash
# Clone the marketplace
git clone https://github.com/YOUR_USERNAME/claude-skills.git ~/projects/ai/claude-skills

# Test the CLI
cd ~/projects/ai/claude-skills
./gh-skills help
```

### Link as GitHub CLI Extension (Optional)

```bash
# Create symlink in PATH
sudo ln -s ~/projects/ai/claude-skills/gh-skills /usr/local/bin/gh-skills

# Now you can use: gh skills <command>
gh skills search
```

Or install as a proper gh extension:

```bash
gh extension install YOUR_USERNAME/gh-skills
```

## Usage

### Search Available Skills

```bash
./gh-skills search
# or with a query
./gh-skills search review
```

### Install a Skill

```bash
./gh-skills install pr-review-comments
```

Skills are installed to `~/.claude/skills/` and automatically discovered by Claude Code.

### List Installed Skills

```bash
./gh-skills list
```

### Get Skill Info

```bash
./gh-skills info pr-review-comments
```

### Uninstall a Skill

```bash
./gh-skills uninstall pr-review-comments
```

### Update a Skill

```bash
./gh-skills update pr-review-comments
```

(Currently redirects to uninstall/reinstall workflow)

## Available Skills

### pr-review-comments

Process GitHub PR review comments using gh-pr-threads. Extracts review threads, bot summaries (especially CodeRabbit nitpicks), and user comments for efficient PR review workflows.

**Use when:**
- Processing GitHub Pull Request review comments
- Extracting reviewer feedback
- Analyzing PR threads and discussions

**Features:**
- Fetches all review threads from a PR
- Parses CodeRabbit nitpicks and suggestions
- Tracks which comments have been addressed
- Supports reply, resolve, and mark commands

[More details](./skills/pr-review-comments/SKILL.md)

## Contributing

We welcome contributions! See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines on:

- Submitting new skills
- Naming conventions
- Skill structure requirements
- Testing and validation

## Skill Structure

Each skill in the marketplace has the following structure:

```
skills/
└── skill-name/
    ├── SKILL.md              # Required: Skill metadata and content
    ├── README.md             # Optional: Additional documentation
    ├── scripts/              # Optional: Helper scripts
    └── examples/             # Optional: Example usage
```

### SKILL.md Format

```markdown
---
name: skill-name
description: Use when [trigger condition]. Brief description of what this skill does.
---

[Skill content - detailed instructions for Claude]
```

## Registry

The marketplace maintains a `registry.json` with two types of skills:

1. **Builtin skills** - Hosted in this repository under `skills/`
2. **External skills** - Referenced from other GitHub repositories

### registry.json Structure

```json
{
  "version": "1.0.0",
  "skills": {
    "skill-name": {
      "source": "builtin",
      "version": "1.0.0",
      "path": "skills/skill-name",
      "description": "Brief description"
    }
  },
  "external": {
    "external-skill": {
      "repo": "https://github.com/user/repo",
      "path": "skills/external-skill",
      "description": "Brief description"
    }
  }
}
```

## How It Works

1. **Discovery**: `gh-skills search` reads `registry.json` to show available skills
2. **Installation**: `gh-skills install <name>` copies skill from marketplace to `~/.claude/skills/`
3. **Usage**: Claude Code automatically discovers skills in `~/.claude/skills/`
4. **Invocation**: Use `/skill-name` in Claude Code to activate the skill

## Roadmap

- [x] Basic install/uninstall/list/search commands
- [x] Builtin skills support
- [ ] External skills installation from GitHub repos
- [ ] Skill versioning and updates
- [ ] Dependency management
- [ ] Skill categories and tags
- [ ] Community ratings and reviews
- [ ] Auto-update notifications
- [ ] `gh skills publish` for skill authors

## FAQ

### Where are skills installed?

Skills are installed to `~/.claude/skills/` by default.

### How do I use an installed skill?

In Claude Code, use `/skill-name` to invoke the skill. For example: `/pr-review-comments`

### Can I create my own skills?

Yes! See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines. You can:
1. Add skills to your local `~/.claude/skills/` for personal use
2. Submit a PR to add them to this marketplace for the community

### What's the difference between builtin and external skills?

- **Builtin skills**: Hosted in this repo, versioned with the marketplace
- **External skills**: Referenced from other repos, maintained independently

### How do I update a skill?

Currently: `gh skills uninstall <name> && gh skills install <name>`

Full update support with versioning is planned for a future release.

## License

MIT

## Links

- [Claude Code Documentation](https://docs.anthropic.com/claude/docs)
- [GitHub CLI](https://cli.github.com/)
- [Submit an Issue](https://github.com/YOUR_USERNAME/claude-skills/issues)
