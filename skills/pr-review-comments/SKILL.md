---
name: pr-review-comments
description: Use when user asks to process, extract, check, or analyze GitHub Pull Request review comments, feedback, or threads. Triggers on PR review workflows, reviewer feedback processing, comment extraction from GitHub PRs.
---

# PR Review Comments Handler

Process GitHub Pull Request review comments using `gh-pr-threads` CLI tool.

## When to Use

Trigger this skill when user wants to:
- Extract PR review comments
- Check reviewer feedback
- Process CodeRabbit nitpicks
- Analyze unresolved threads
- Handle PR review feedback

## Workflow

### 1. Extract Comments

```bash
# Auto-detect PR in current directory
npx gh-pr-threads

# Or specify PR URL
npx gh-pr-threads https://github.com/owner/repo/pull/123

# Only user comments (exclude bots)
npx gh-pr-threads <PR_URL> --only=threads --ignore-bots

# CodeRabbit nitpicks
npx gh-pr-threads <PR_URL> --only=nitpicks
```

### 2. Process One at a Time

**CRITICAL: Process only ONE thread or nitpick at a time.**

For each comment:

1. **Check code** - Is the issue fixed?
2. **Propose fix** if needed
3. **Draft reply** in the same language as the comment
4. **Get user confirmation** before sending

Reply format:
```
Thread: [path]:[line]
Comment: [reviewer comment text]

Status: [Fixed/Needs fix/Unclear]

Proposed reply: "[Your reply in same language]"
```

### 3. Reply via GitHub CLI

```bash
gh pr comment <PR_URL> --body "Fixed in commit abc123"
```

### 4. Clear State (if needed)

```bash
# Clear marked items for current PR
npx gh-pr-threads clear
```

## Key Rules

1. **One at a time** - Never batch process multiple threads
2. **Always confirm** before changing code or sending replies
3. **Match language** - Reply in the same language as the comment
4. **Check code first** - Verify issue status before replying
5. **Use the CLI** - Don't write custom GraphQL queries

## When Comment is Unclear

If reviewer comment is confusing:

1. Present options to user:
   - Reply asking for clarification
   - Skip for now
   - Mark as invalid
   - Custom action

2. Get user's decision before proceeding

## Requirements

- **GitHub CLI (`gh`)** installed and authenticated
- **Node.js >= 18**
- Verify: `gh auth status`
- Install: `npx gh-pr-threads` (auto-installs)

## Common Commands

| Task | Command |
|------|---------|
| Get unresolved | `npx gh-pr-threads <PR_URL>` |
| Auto-detect PR | `npx gh-pr-threads` |
| Only threads | `npx gh-pr-threads <PR_URL> --only=threads` |
| Exclude bots | `npx gh-pr-threads <PR_URL> --ignore-bots` |
| Get nitpicks | `npx gh-pr-threads <PR_URL> --only=nitpicks` |
| Clear state | `npx gh-pr-threads clear` |
