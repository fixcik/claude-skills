# Testing Skills

All skills in this repository must be tested using RED-GREEN-REFACTOR methodology before being committed.

## Quick Start

```bash
# 1. Create test scenarios
mkdir plugins/gh-skills/skills/your-skill/tests
cp plugins/gh-skills/skills/pr-review-comments/tests/scenarios.yml plugins/gh-skills/skills/your-skill/tests/

# 2. Edit scenarios.yml with your test cases

# 3. Run testing infrastructure
./test-skill.sh plugins/gh-skills/skills/your-skill

# 4. Follow prompts to run RED and GREEN phases
```

## Testing Methodology

### RED Phase: Baseline Without Skill

**Goal:** Document how agents behave WITHOUT your skill

1. Run `./test-skill.sh <skill-path>` and select option 1 (RED phase)
2. For each scenario in `tests/scenarios.yml`:
   - Use Task tool to launch subagent WITHOUT skill loaded
   - Present the scenario setup to the subagent
   - Document actual behavior in `tests/baseline.md`
   - Capture exact rationalizations verbatim

**What to look for:**
- How does agent violate the rule?
- What excuse/rationalization do they use?
- What pressures trigger violations?

### GREEN Phase: Testing With Skill

**Goal:** Verify agents comply when skill is loaded

1. Run `./test-skill.sh <skill-path>` and select option 2 (GREEN phase)
2. For each scenario:
   - Use Task tool with skill explicitly loaded: `@<path-to-skill>/SKILL.md`
   - Present same scenario setup
   - Document actual behavior in `tests/with-skill.md`
   - Check against success criteria

**Success criteria:**
- Agent follows the skill's rules
- No violations of key principles
- Uses correct commands/workflow

### REFACTOR Phase: Close Loopholes

**Goal:** Make skill bulletproof against rationalizations

1. Review `tests/baseline.md` for all observed rationalizations
2. Add explicit counters to skill:
   - Rationalization table with "Excuse → Reality → Counter"
   - Red flags list
   - Explicit "Don't do this" rules
3. Re-run GREEN phase tests
4. Repeat until all success criteria pass

## Test Scenario Structure

```yaml
scenarios:
  - name: descriptive-scenario-name
    type: discipline|technique|pattern|reference
    pressure:
      - time-constraint
      - authority
      - sunk-cost
    setup: |
      User message and context here
    expected_without_skill:
      behaviors:
        - What agent does wrong
      rationalizations:
        - "Quote exact excuse"
    expected_with_skill:
      behaviors:
        - What agent should do
      success_criteria:
        - Measurable success condition
```

## Pressure Types

Use realistic pressures that might cause agents to violate rules:

- **time-constraint**: "User mentions urgent deadline"
- **sunk-cost**: "After spending time implementing"
- **authority**: "Comment from senior developer"
- **exhaustion**: "After processing many items"
- **batch-processing**: "Many similar items"
- **volume**: "Large number of items"

Combine multiple pressures for maximum stress testing.

## Documentation Requirements

Each skill must have:

```
skills/your-skill/
├── SKILL.md                    # The skill itself
└── tests/
    ├── scenarios.yml           # Test cases
    ├── baseline.md             # Behavior without skill (RED)
    ├── with-skill.md           # Behavior with skill (GREEN)
    ├── observations.md         # Analysis and findings
    └── rationalizations.md     # Captured excuses
```

## Example: pr-review-comments

See `plugins/gh-skills/skills/pr-review-comments/tests/` for complete example:

- **scenarios.yml**: 5 test scenarios covering different comment types
- **observations.md**: Findings from testing, what works/doesn't
- All test results documented

## Quality Standards

**Before committing a skill:**
- [ ] All scenarios pass in GREEN phase
- [ ] Rationalization table added to skill
- [ ] Word count < 500 words (check with `wc -w`)
- [ ] Red flags section included
- [ ] Test documentation complete

## Why Testing Matters

**Untested skills have issues. Always.**

Testing reveals:
- What agents naturally do wrong
- What excuses they use to rationalize
- Which pressures trigger violations
- What explicit rules are needed

15 minutes of testing saves hours of debugging broken skills in production.

## Iron Law

**NO SKILL WITHOUT FAILING TEST FIRST**

This applies to:
- New skills
- Edits to existing skills
- "Simple additions"
- "Documentation updates"

No exceptions. If you didn't watch it fail, you don't know if it teaches the right thing.
