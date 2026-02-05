# Quickstart Guide

## Install the Marketplace

```bash
claude plugin install https://github.com/fixcik/claude-skills
```

## Use Skills

All skills are immediately available after installation:

```bash
/pr-review-comments
```

That's it! No additional setup required.

## How It Works

1. **Install plugin** → All skills in `skills/` become available
2. **Use skills** → Invoke with `/skill-name`
3. **Add skills** → Contribute via PR to add more skills to marketplace

## Available Skills

### pr-review-comments

Process GitHub PR review comments, CodeRabbit nitpicks, and reviewer feedback.

```
/pr-review-comments
```

## Adding Your Own Skills

1. Fork the repository
2. Add your skill to `skills/your-skill-name/SKILL.md`
3. Update `registry.json`
4. Submit a PR

See [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

## Alternative: Manual Installation

If you want to use the bash script instead:

```bash
git clone https://github.com/fixcik/claude-skills.git ~/projects/ai/claude-skills
cd ~/projects/ai/claude-skills
./gh-skills install pr-review-comments
```

But the plugin method is simpler - one command gets you everything!
