# gh-skills Plugin

Claude Code skills marketplace with curated skills for development workflows.

## Installation

```bash
claude plugin install https://github.com/fixcik/claude-skills
```

That's it! All skills are now available.

## Available Skills

### pr-review-comments

Process GitHub PR review comments using gh-pr-threads.

**Use:**
```
/pr-review-comments
```

**Features:**
- Fetches all review threads from a PR
- Parses CodeRabbit nitpicks and suggestions
- Tracks which comments have been addressed
- Supports reply, resolve, and mark commands

## Usage

After installing the plugin, all skills are automatically available:

```
/pr-review-comments
```

## Skills Directory

Skills are located in `../../skills/` relative to the plugin.

When you install this plugin, you get access to all marketplace skills.

## Adding More Skills

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for guidelines on adding new skills to the marketplace.

## License

MIT
