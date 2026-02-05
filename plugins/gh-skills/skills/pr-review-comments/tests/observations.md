# Test Observations

## Scenario 1: reviewer-question-about-logic

### Without Skill (Baseline)
**Observed behavior:**
- Provided detailed technical answer ✓
- Explained reasoning thoroughly ✓
- **Did NOT mention CLI tool** ❌
- **Did NOT say "don't resolve"** ❌
- Suggested action items (adding constraints)
- Asked user for next steps

**Rationalizations:**
- Implicitly assumed answering meant the conversation is resolved
- Focused on solving the problem rather than just answering the question

### With Skill
**Observed behavior:**
- Provided detailed technical answer ✓
- Explained reasoning thoroughly ✓
- **Did NOT use `npx gh-pr-threads reply` command** ❌
- **Did NOT explicitly say "let reviewer close thread"** ❌
- Suggested follow-up actions
- Asked user if they want help with next steps

**Skill effectiveness: PARTIAL**
- Skill didn't enforce CLI usage
- Skill didn't make "don't resolve" explicit enough
- Both agents gave good answers but ignored the workflow

### Key Finding
**The skill needs to be more prescriptive:**
1. MUST use CLI commands (not just draft text)
2. MUST explicitly state "don't resolve - let reviewer close"
3. Should distinguish between "answering question" vs "proposing changes"

---

## Scenario 2: high-priority-reaction

### With Skill
**Observed behavior:**
- ✓ Correctly identified Thread #23 with priority reactions (🚀 👀 ❤️)
- ✓ Explained prioritization reasoning
- ✓ Mentioned Rule #11 explicitly
- ✓ Combined reaction priority + security severity
- ✓ Used CLI command in example workflow

**Skill effectiveness: EXCELLENT**
- Agent followed prioritization rules correctly
- Referenced specific skill sections
- Used proper CLI commands

---

## Scenario 3: batch-similar-nitpicks

### With Skill
**Observed behavior:**
- ✓ Used batch command: `npx gh-pr-threads mark done 101 102 103 104 105`
- ✓ Explained why batch (efficiency for similar items)
- ✓ Understood nitpicks don't need reply/resolve
- ✓ Single command instead of 5 separate ones

**Skill effectiveness: EXCELLENT**
- Perfect execution of batch workflow
- Correct understanding of nitpick handling

---

## Summary of Findings

### What Works Well ✓
1. **Prioritization by reactions** - Agent correctly identifies and handles high-priority threads first
2. **Batch operations** - Agent uses batch commands efficiently
3. **Nitpick handling** - Agent understands mark-only workflow

### Critical Gaps ❌
1. **Question handling** - Agent doesn't use CLI for questions, drafts text instead
2. **Resolve discipline** - Agent doesn't explicitly say "don't resolve questions"
3. **CLI enforcement** - Skill should REQUIRE using commands, not just suggest

### Rationalizations Observed
- "I'll draft a response" instead of "I'll use npx gh-pr-threads reply"
- Mixing answer with proposed code changes
- Implicitly treating answered question as resolved

### Required Skill Changes
1. Make CLI usage MANDATORY (not optional)
2. Add explicit "DON'T RESOLVE QUESTIONS" rule with bold/caps
3. Separate "answering question" from "proposing changes"
4. Add rationalization table with counters
