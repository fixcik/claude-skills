# Repository Structure

This repository is organized as a Claude Code plugin marketplace.

## Directory Layout

```
claude-skills/
├── plugins/
│   └── gh-skills/                    ← Claude Code plugin
│       ├── .claude-plugin/
│       │   └── plugin.json           ← Plugin manifest
│       └── README.md
│
├── skills/                           ← All skills live here
│   └── pr-review-comments/
│       ├── SKILL.md                  ← Skill definition
│       ├── QUICKSTART.md
│       ├── SCRIPTS.md
│       ├── scripts/
│       │   ├── fetch-pr-comments.ts
│       │   ├── mark-reviewed.ts
│       │   └── reply-or-mark.ts
│       └── examples/
│
├── registry.json                     ← Skills catalog
├── gh-skills                         ← Optional bash CLI tool
├── README.md
├── CONTRIBUTING.md
├── CURSOR.md
├── TESTING.md
└── .github/workflows/
    └── validate-skills.yml           ← CI validation
```

## Key Concepts

### Plugin

- Located in `plugins/gh-skills/`
- Contains `plugin.json` manifest
- Points to skills via `"skills": "../../skills/"`
- When installed, makes all skills available

### Skills

- Located in `skills/` directory
- Each skill has its own subdirectory
- Must contain `SKILL.md` with frontmatter
- Auto-discovered by the plugin

### Registry

- `registry.json` catalogs all available skills
- Used by validation and documentation
- Contains metadata: version, description, path

## Installation Flow

1. User runs: `claude plugin install https://github.com/fixcik/claude-skills`
2. Claude clones repo to `~/.claude/plugins/marketplaces/claude-skills/`
3. Plugin reads `plugins/gh-skills/plugin.json`
4. Plugin loads all skills from `../../skills/`
5. Skills become available as `/skill-name`

## Adding Skills

To add a new skill:

1. Create directory: `skills/your-skill-name/`
2. Add `SKILL.md` with proper frontmatter
3. Update `registry.json`
4. Submit PR

The plugin automatically discovers new skills - no plugin.json changes needed!

## Alternative Installation

The `gh-skills` bash script provides an alternative installation method:

```bash
./gh-skills install pr-review-comments
```

This copies skills to `~/.claude/skills/` manually.

But using the plugin is simpler - one command installs everything!
