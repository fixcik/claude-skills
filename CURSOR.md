# Using Claude Skills with Cursor IDE

[Cursor](https://cursor.sh/) is an AI-powered code editor that also supports Claude Code skills. Here's how to use skills from this marketplace with Cursor.

## Skills Directory in Cursor

Cursor stores skills in the same directory as Claude Code:

```
~/.claude/skills/
```

This means **skills installed via `gh-skills` automatically work in Cursor** without any additional configuration!

## Installation

### Option 1: Use gh-skills (Recommended)

Install skills using the marketplace CLI:

```bash
# Clone marketplace
git clone https://github.com/YOUR_USERNAME/claude-skills.git ~/projects/ai/claude-skills

# Install a skill
cd ~/projects/ai/claude-skills
./gh-skills install pr-review-comments

# The skill is now available in both Claude Code and Cursor!
```

### Option 2: Manual Installation

Copy skill directories directly to `~/.claude/skills/`:

```bash
# From marketplace
cp -r ~/projects/ai/claude-skills/skills/pr-review-comments ~/.claude/skills/

# Verify installation
ls ~/.claude/skills/pr-review-comments
```

## Using Skills in Cursor

### Invoke a Skill

In Cursor's AI chat, use the skill with a slash command:

```
/pr-review-comments
```

Or simply mention the skill by name:

```
Use the pr-review-comments skill to process this PR
```

### List Available Skills

Check `~/.claude/skills/` to see installed skills:

```bash
ls ~/.claude/skills/
```

Or use the marketplace CLI:

```bash
./gh-skills list
```

## Cursor-Specific Considerations

### State Directory

Some skills (like `pr-review-comments`) store state in `~/.cursor/reviews/`. This is separate from Claude Code's state, allowing you to use the same skill in both editors without conflicts.

### Terminal Integration

Cursor has a built-in terminal. You can run skill-related commands directly:

```bash
# Run gh-pr-threads from Cursor terminal
gh-pr-threads <PR_URL> --format json
```

### Composer Mode

In Cursor's Composer mode (Cmd+I), skills work the same way:

1. Open Composer (Cmd+I)
2. Type `/skill-name` or describe the task
3. The skill activates automatically

## Troubleshooting

### Skill not recognized

1. Check if skill is installed:
   ```bash
   ls ~/.claude/skills/
   ```

2. Verify SKILL.md exists:
   ```bash
   cat ~/.claude/skills/pr-review-comments/SKILL.md
   ```

3. Restart Cursor to refresh skill cache

### Different behavior than Claude Code

This is expected! Cursor and Claude Code are different environments:

- **Cursor**: Full IDE integration, file system access, LSP support
- **Claude Code**: CLI-focused, terminal-first workflow

Skills should adapt to the context automatically, but some behaviors may differ.

## Creating Cursor-Optimized Skills

When creating skills for Cursor, consider:

### 1. File System Operations

Cursor has direct file system access. Use this in your skill:

```markdown
You can read, write, and modify files directly.
Use the Read tool to examine code, Edit tool to make changes.
```

### 2. LSP Integration

Cursor provides Language Server Protocol support:

```markdown
Use the Find References feature to locate all usages.
Use Go to Definition to navigate code.
```

### 3. Visual Feedback

Cursor has a GUI. Skills can suggest visual actions:

```markdown
Open the file at [path] and navigate to line [number].
Highlight the relevant code section.
```

### 4. Multi-File Workflows

Cursor excels at multi-file operations:

```markdown
1. Read all TypeScript files in src/
2. Identify common patterns
3. Suggest refactoring across multiple files
```

## Example: Using pr-review-comments in Cursor

1. **Install the skill:**
   ```bash
   ./gh-skills install pr-review-comments
   ```

2. **Open a PR in browser** and copy URL

3. **In Cursor, invoke the skill:**
   ```
   /pr-review-comments
   ```

4. **Paste PR URL** when prompted

5. **Claude processes the PR:**
   - Fetches all review threads
   - Extracts CodeRabbit nitpicks
   - Shows pending comments
   - Offers to reply/resolve

6. **Make changes in Cursor:**
   - Navigate to referenced files
   - Apply suggestions
   - Mark as resolved

7. **Commit changes:**
   ```bash
   git add -A
   git commit -m "Address PR feedback"
   ```

## Sharing Skills Between Cursor and Claude Code

Since both use `~/.claude/skills/`, skills are automatically shared:

```
~/.claude/skills/
├── pr-review-comments/     # Available in both!
├── grafana-dashboards/     # Available in both!
└── your-custom-skill/      # Available in both!
```

**Benefits:**
- Install once, use everywhere
- Consistent behavior across environments
- Shared skill updates

## Advanced: Environment Detection

Skills can detect which environment they're running in:

```markdown
## Environment Detection

Check the environment:
- If in Cursor: Use file system tools, LSP features
- If in Claude Code CLI: Use terminal-focused workflow
```

Example logic in a skill:

```markdown
1. Determine environment (Cursor vs CLI)
2. If Cursor:
   - Use Read/Edit tools for files
   - Suggest visual navigation
3. If CLI:
   - Use bash commands
   - Output formatted text
```

## Resources

- [Cursor Documentation](https://cursor.sh/docs)
- [Claude Code Skills Guide](CONTRIBUTING.md)
- [Example Skills](./skills/)

## FAQ

### Can I use gh-skills in Cursor's terminal?

Yes! Cursor has a built-in terminal. All bash commands work:

```bash
./gh-skills search
./gh-skills install pr-review-comments
```

### Do skills need internet access?

Depends on the skill:
- **pr-review-comments**: Yes (fetches from GitHub)
- **Most skills**: No (work offline)

### Can I create Cursor-specific skills?

Yes! Create skills in `~/.claude/skills/` that leverage Cursor features:
- File system access
- LSP integration
- Multi-file editing
- Visual feedback

### What about Cursor Rules?

Cursor Rules (`.cursorrules`) and Claude Skills are complementary:
- **Rules**: Project-specific conventions, always active
- **Skills**: Task-specific workflows, invoked on demand

Use both together for best results!

## Next Steps

1. **Install skills** using gh-skills
2. **Try skills in Cursor** with `/skill-name`
3. **Create custom skills** for your Cursor workflow
4. **Share skills** with the community

Happy coding in Cursor! 🚀
