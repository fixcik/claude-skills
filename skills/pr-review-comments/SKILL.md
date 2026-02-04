---
name: pr-review-comments
description: Use when user asks to process, extract, check, or analyze GitHub Pull Request review comments, feedback, or threads. Triggers on PR review workflows, reviewer feedback processing, comment extraction from GitHub PRs.
---

# PR Review Comments Handler

Process GitHub Pull Request review comments using `gh-pr-threads` CLI tool with automatic state tracking.

## Overview

Use `npx gh-pr-threads` to extract PR review threads, comments, and nitpicks. The tool automatically filters out items marked as done/skip in state file (`~/.cursor/reviews/{owner}-{repo}-{number}/pr-state.json`).

## When to Use

Use when user wants to:
- Extract PR review comments
- Check reviewer feedback
- Process CodeRabbit nitpicks
- Analyze unresolved threads
- Handle PR review feedback

**Don't use for:**
- Creating PRs
- Merging PRs
- General git operations

## Quick Reference

| Task | Command |
|------|---------|
| Get all unresolved | `npx gh-pr-threads <PR_URL>` |
| Auto-detect PR | `npx gh-pr-threads` |
| Only threads | `npx gh-pr-threads <PR_URL> --only=threads` |
| Exclude bots | `npx gh-pr-threads <PR_URL> --only=threads --ignore-bots` |
| Get nitpicks | `npx gh-pr-threads <PR_URL> --only=nitpicks` |
| Include resolved | `npx gh-pr-threads <PR_URL> --with-resolved` |
| Include done | `npx gh-pr-threads <PR_URL> --include-done` |
| Clear state | `npx gh-pr-threads clear` |

## Workflow

### 1. Extract Comments

```bash
# Auto-detect PR in current directory
npx gh-pr-threads

# Or specify PR URL
npx gh-pr-threads https://github.com/owner/repo/pull/123

# Get only user comments (exclude bots)
npx gh-pr-threads <PR_URL> --only=threads --ignore-bots

# Get CodeRabbit nitpicks
npx gh-pr-threads <PR_URL> --only=nitpicks

# Include resolved threads
npx gh-pr-threads <PR_URL> --with-resolved

# Include items marked as done/skip
npx gh-pr-threads <PR_URL> --include-done
```

### 2. Understand Data Types

**threads** - Review discussion threads
- Contains all comments from users and bots
- Fields: `id`, `path`, `line`, `isResolved`, `comments[]`
- Use `--ignore-bots` to exclude bot comments

**nitpicks** - CodeRabbit structured nitpicks
- Extracted from bot HTML `<details>` blocks
- Fields: `id`, `path`, `line`, `content`, `status`
- Useful for batch processing small issues

**summaries** - Full bot review summaries (CodeRabbit, GitHub Actions)

**files** - List of changed files in PR

### 3. Process One at a Time

**CRITICAL: Process only ONE thread or nitpick at a time.**

#### For User Comments (PRIORITY 1)

1. **Check code** - Is the issue fixed?
2. **Propose fix** if not fixed
3. **Draft reply** in English
4. **Get confirmation** before sending

**Reply format:**
```
Thread: [path]:[line]
Comment: [reviewer comment text]

Status: [Fixed/Needs fix/Unclear]

Proposed reply: "[Your English reply]"
```

#### For Fixed Issues

Reply using GitHub CLI:
```bash
gh pr comment <PR_URL> --body "Fixed in commit abc123"
```

#### For CodeRabbit Nitpicks (PRIORITY 2)

1. **Evaluate critically** - Is it valid?
2. **Propose fix** or mark invalid
3. **Get confirmation** before action

### 4. State Management

The tool automatically hides items marked as done/skip. To reset:

```bash
# Clear all marked items for current PR
npx gh-pr-threads clear

# Or for specific PR
npx gh-pr-threads clear https://github.com/owner/repo/pull/123
```

**Note:** Currently `gh-pr-threads` doesn't expose commands to mark individual items. Use `clear` to reset state.

## Rules

### General Rules

1. **One at a time** - Never batch process multiple threads
2. **Always confirm** before:
   - Changing code
   - Sending GitHub replies
   - Resolving threads
3. **English replies** - All GitHub responses in English
4. **Check code first** - Verify issue status before replying

### Bot Comments

- Use `--ignore-bots` to filter out all bot comments
- CodeRabbit nitpicks via `--only=nitpicks`
- Evaluate bot suggestions critically

### When Comment is Unclear

If reviewer comment is confusing or contradictory:

1. **Don't ignore** - Always ask user
2. **Present options**:
   - ✅ Reply asking for clarification
   - ⏭️ Skip for now
   - ❌ Mark invalid
   - 🔧 Custom action

3. **Format:**
   ```
   Thread: [path]:[line]
   Comment: "[text]"

   Status: This comment seems [unclear/contradictory/invalid] because [reason]

   Options:
   A) Reply asking for clarification
   B) Skip for now
   C) Mark as invalid
   D) Other
   ```

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Processing multiple threads at once | Process ONE, get confirmation, then next |
| Using `gh api graphql` directly | Use `gh-pr-threads` CLI instead |
| Writing custom parsing scripts | Library already handles parsing |
| Forgetting `--ignore-bots` | Use when you want only human comments |
| Not checking code before replying | Always verify fix status first |
| Replying in Russian | All GitHub replies in English |

## Rationalizations to Resist

| Rationalization | Reality |
|-----------------|---------|
| "I'll batch all 5 threads to save time" | Batching = mistakes. One at a time always. |
| "User is in a hurry, I should speed up" | Speed comes from correct process, not shortcuts. |
| "I'll write GraphQL query, it's more flexible" | `gh-pr-threads` exists. Use it. |
| "Old scripts might still work" | They're deprecated. Use `gh-pr-threads` CLI. |
| "This is simple, no need for CLI tool" | CLI tool is already tested. Don't reinvent. |

## Requirements

- **GitHub CLI (`gh`)** installed and authenticated
- **Node.js >= 18**
- Run `gh auth status` to verify authentication
- Install: `npx gh-pr-threads` (auto-installs on first use)

## Real-World Impact

**Before skill:** Agent writes custom GraphQL queries and parsing scripts, reinventing functionality.

**After skill:** Agent uses `gh-pr-threads` CLI directly - 10x faster, no custom code needed.
