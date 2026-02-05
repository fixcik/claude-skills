---
name: pr-review-comments
description: Use when user asks to process, extract, check, or analyze GitHub Pull Request review comments, feedback, or threads. Triggers on PR review workflows, reviewer feedback processing, comment extraction from GitHub PRs.
---

# PR Review Comments Handler

Process GitHub Pull Request review comments using `gh-pr-threads` CLI tool.

## When to Use

Trigger when user wants to:
- Extract PR review comments
- Check reviewer feedback
- Process CodeRabbit nitpicks
- Analyze unresolved threads
- Handle PR review feedback

## Setup

```bash
# Verify GitHub CLI is authenticated
gh auth status

# Fetch PR threads (auto-detects PR in current dir)
npx gh-pr-threads

# Or specify PR URL
npx gh-pr-threads https://github.com/owner/repo/pull/123

# View specific thread by ID
npx gh-pr-threads --thread <id>
```

## Decision Flow

**CRITICAL: Process ONE item at a time. Never batch process.**

For each thread/nitpick, identify the source and follow the appropriate workflow:

### 1. Nitpicks (CodeRabbit suggestions)

```bash
# Get nitpicks
npx gh-pr-threads --only=nitpicks
```

**Flow:**
1. **Review suggestion** - Is it valid?
2. **If valid** → Apply fix
3. **Mark as processed:**
   ```bash
   npx gh-pr-threads mark <id> done
   # or
   npx gh-pr-threads mark <id> skip
   ```

**No need to reply or resolve** - just mark.

### 2. Bot Comments (non-nitpick)

```bash
# Get bot threads
npx gh-pr-threads --only=threads
```

**Flow:**
1. **Analyze carefully** - Bot suggestions may be incorrect
2. **If invalid** → Explain why to user, mark as skip
3. **If valid:**
   - Apply fix
   - Resolve thread with optional reply:
     ```bash
     npx gh-pr-threads resolve <id> --reply "Fixed in commit abc123"
     # or just resolve without reply
     npx gh-pr-threads resolve <id>
     ```

### 3. User Comments

```bash
# Get only user threads (exclude bots)
npx gh-pr-threads --only=threads --ignore-bots
```

**Flow:**
1. **Check code** - Is issue already fixed?
2. **Analyze validity** - Is the comment correct?
3. **If needs fix:**
   - Apply fix
   - Draft **meaningful reply** explaining what was changed
   - Get user confirmation
   - Send reply and resolve:
     ```bash
     npx gh-pr-threads resolve <id> --reply "Your detailed explanation of changes"
     ```
4. **If already fixed:**
   - Draft reply confirming fix with specifics
   - Get user confirmation
   - Send and resolve:
     ```bash
     npx gh-pr-threads resolve <id> --reply "Your explanation of existing fix"
     ```
5. **If unclear/invalid:**
   - Ask user for clarification
   - Present options: reply for clarification / skip / mark invalid

## Commands Reference

```bash
# Get specific thread by ID
npx gh-pr-threads --thread <id>

# Reply to thread
npx gh-pr-threads reply <id> "Your message"

# Resolve thread (optionally with reply)
npx gh-pr-threads resolve <id>
npx gh-pr-threads resolve <id> --reply "Fixed in abc123"

# Mark without changing thread state
npx gh-pr-threads mark <id> done
npx gh-pr-threads mark <id> skip
npx gh-pr-threads mark <id> later --note "Need to discuss"

# Clear all marked items
npx gh-pr-threads clear
```

## Reply Format Template

When drafting replies, present this to user:

```
Thread: <file>:<line>
Comment: "<original comment text>"

Status: [Fixed/Already fixed/Needs discussion]

Proposed reply: "<meaningful explanation of what was done, in same language>"

Example: "Changed validation logic to check for null values before
processing, as suggested. The issue is now fixed."

Actions:
[ ] Apply code changes (if needed)
[ ] Send reply: npx gh-pr-threads resolve <id> --reply "..."
```

**IMPORTANT:** Reply must explain what was actually done, not generic text.

## Key Rules

1. **One at a time** - Process only ONE thread per interaction
2. **Always confirm** - Get user approval before:
   - Changing code
   - Sending replies
   - Resolving threads
3. **Match language** - Reply in same language as comment
4. **Check code first** - Verify issue status before replying
5. **Use the tool** - Don't use `gh api` or write custom scripts
6. **Bot skepticism** - Validate bot suggestions carefully

## Common Patterns

**Nitpick fixed:**
```bash
npx gh-pr-threads mark <id> done
```

**Bot suggestion fixed:**
```bash
# Explain WHAT was changed, not just "applied suggestion"
npx gh-pr-threads resolve <id> --reply "Added type annotation to makeRequest function parameters"
```

**User comment fixed:**
```bash
# Describe the actual change made
npx gh-pr-threads resolve <id> --reply "Refactored error handling to throw custom exceptions instead of returning error codes, as suggested"
```

**Need clarification:**
```bash
npx gh-pr-threads reply <id> "Could you clarify what you mean by X?"
# Don't resolve - leave open for discussion
```

## Requirements

- **GitHub CLI (`gh`)** authenticated
- **Node.js >= 18**
- Tool installs automatically: `npx gh-pr-threads`
