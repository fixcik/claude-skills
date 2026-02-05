# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a Claude Code skills marketplace repository. It provides a plugin-based system for distributing skills that can be used in Claude Code CLI and Cursor IDE.

## Repository Architecture

### Two-Level Structure

The repository has a unique two-level plugin architecture:

1. **Marketplace level** (root): `.claude-plugin/marketplace.json` defines the marketplace
2. **Plugin level** (`plugins/gh-skills/`): `.claude-plugin/plugin.json` defines the plugin that contains skills
3. **Skills level** (`plugins/gh-skills/skills/`): Individual skill directories with `SKILL.md` files

**Key insight**: Skills are located INSIDE the plugin directory (`plugins/gh-skills/skills/`), not at the root `skills/` directory. This is intentional - the plugin packages and distributes the skills.

### Installation Flow

Users install in two steps:
```bash
/plugin marketplace add fixcik/claude-skills  # Adds marketplace
/plugin install gh-skills@claude-skills        # Installs plugin from marketplace
```

The plugin then makes all skills available under `plugins/gh-skills/skills/` accessible to Claude Code.

## Skill Structure

Each skill must have:

```
plugins/gh-skills/skills/your-skill-name/
└── SKILL.md                    # Required, contains frontmatter + instructions
```

### SKILL.md Format

```markdown
---
name: your-skill-name           # Must match directory name
description: Use when [trigger condition]. What this does.
---

# Skill Title

Instructions for Claude in second person...
```

**Critical requirements**:
- `name` field must exactly match directory name
- `description` should start with "Use when..."
- Content written for Claude (second person), not users

## Adding New Skills

1. Create skill directory inside plugin:
   ```bash
   mkdir -p plugins/gh-skills/skills/your-skill-name
   ```

2. Create `SKILL.md` with proper frontmatter

3. **REQUIRED: Test skill with RED-GREEN-REFACTOR:**
   ```bash
   # Create test scenarios
   mkdir plugins/gh-skills/skills/your-skill-name/tests
   # Edit tests/scenarios.yml with test cases

   # Run testing infrastructure
   ./test-skill.sh plugins/gh-skills/skills/your-skill-name

   # RED: Test without skill, document baseline behavior
   # GREEN: Test with skill, verify compliance
   # REFACTOR: Close rationalizations, re-test
   ```
   See `test-skill.sh` and existing `tests/` directories for examples.

4. Make all necessary changes based on test results

5. **Before committing**, update plugin version in `plugins/gh-skills/.claude-plugin/plugin.json` (increment version number)

6. Update marketplace version in `.claude-plugin/marketplace.json` to match plugin version

7. Skills are automatically discovered via `plugin.json`'s `"skills": "./skills/"` configuration

**Important:**
- Version should be updated ONCE per commit, not after each file change
- **Testing is mandatory** - no skill should be committed without RED-GREEN-REFACTOR testing
- Document test results in `tests/observations.md`

Note: There is NO registry.json in this repository (the validation workflow references it but it doesn't exist - this appears to be from a template).

## Commit Guidelines

**All commits must follow Semantic Commit format:**

```
<type>: <short description>

<optional detailed description>

<optional footer>
```

### Commit Types

- **feat**: New skill or major feature addition
- **fix**: Bug fix in existing skill
- **refactor**: Code/skill restructuring without changing behavior
- **docs**: Documentation updates (README, CONTRIBUTING, CLAUDE.md)
- **test**: Adding or updating tests
- **chore**: Maintenance tasks (version bumps, dependencies)

### Examples

```bash
# Adding new skill
git commit -m "feat: add github-actions-debug skill"

# Fixing existing skill
git commit -m "fix: correct CLI command in pr-review-comments skill"

# Refactoring
git commit -m "refactor: reduce pr-review-comments from 1658 to 739 words

Added testing infrastructure and rationalization counters.
Improved clarity with Decision Flow diagram and Quick Reference table."

# Documentation
git commit -m "docs: update CLAUDE.md with testing requirements"

# Version bump
git commit -m "chore: bump version to 1.1.0"
```

### Rules

- First line must be ≤72 characters
- Use imperative mood ("add" not "added" or "adds")
- For breaking changes, add `BREAKING CHANGE:` in footer

## Testing

### Automated Validation

The GitHub Actions workflow (`.github/workflows/validate-skills.yml`) validates:
- Frontmatter presence and format
- `name` field matches directory name
- `description` field exists

To test locally, validate SKILL.md frontmatter manually using grep:
```bash
grep -A 5 "^---$" plugins/gh-skills/skills/your-skill/SKILL.md
```

### Skill Behavior Testing (Required)

**All skills MUST be tested** using RED-GREEN-REFACTOR methodology before committing:

1. **Create test scenarios** in `skills/your-skill/tests/scenarios.yml`:
   - Define pressure scenarios (time, authority, sunk-cost)
   - Document expected behaviors with and without skill
   - Include success criteria

2. **Run testing infrastructure:**
   ```bash
   ./test-skill.sh plugins/gh-skills/skills/your-skill
   ```

3. **RED Phase** - Test without skill:
   - Use Task tool with subagents
   - Document baseline behaviors and rationalizations
   - Identify patterns in how agents violate rules

4. **GREEN Phase** - Test with skill:
   - Load skill and re-run scenarios
   - Verify agents now comply
   - Document any remaining issues

5. **REFACTOR Phase** - Close loopholes:
   - Add explicit counters for observed rationalizations
   - Add rationalization table to skill
   - Re-test until bulletproof

6. **Document results** in `tests/observations.md`

**See `plugins/gh-skills/skills/pr-review-comments/tests/` for example test structure.**

**Word count target:** Aim for <500 words for regular skills. Use `wc -w` to check:
```bash
wc -w plugins/gh-skills/skills/your-skill/SKILL.md
```

## Key Principles

**Plugin-First Architecture**: Skills are packaged inside plugins, not standalone. The plugin (`gh-skills`) is the distribution unit, containing multiple skills.

**Frontmatter Strictness**: The validation workflow enforces strict frontmatter rules. Name mismatches will fail CI.

**Version Management**: When modifying skills, update the plugin version ONCE before committing changes. Don't increment version after each file edit in the same session - only update version numbers in `plugins/gh-skills/.claude-plugin/plugin.json` and `.claude-plugin/marketplace.json` when you're ready to commit. This ensures users get the updated skills when they update the plugin, without unnecessary version bumps.

**External Tool Integration**: Skills can leverage external tools (e.g., `pr-review-comments` skill uses `npx gh-pr-threads`). Include tool requirements in the skill documentation.
