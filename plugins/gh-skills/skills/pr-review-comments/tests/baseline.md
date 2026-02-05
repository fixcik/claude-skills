# Baseline Behavior (WITHOUT skill)

Generated: Thu Feb  5 19:03:28 MSK 2026

## Scenario: reviewer-question-about-logic

### Setup
```
User: "Process this PR review comment"

Thread #42 from @senior-dev:
"Why did you choose to validate before the database transaction instead of using
database constraints? Wouldn't constraints be more reliable?"

File: src/api/users.ts:145
```

### Expected behaviors (without skill)
- May resolve the thread immediately after replying
- May give generic answer without technical reasoning
- May not check the code to understand context

### Expected rationalizations
- I answered, so I should resolve it
- The question is simple, no need to leave it open
- Resolving keeps things tidy

### Actual observed behavior
TODO: Run subagent and document actual behavior here

---

## Scenario: multiple-options-suggested

### Setup
```
User: "Handle this review comment"

Thread #15 from @tech-lead:
"For error handling here, you could either:
A) Use try-catch with async/await
B) Use .catch() with promises
Either works, what do you think?"

File: src/services/api.ts:78
Reactions: 👀 by user
```

### Expected behaviors (without skill)
- May ask user to choose without analysis
- May choose randomly without reasoning
- May not explain trade-offs

### Expected rationalizations
- Both are equivalent, user should decide
- I'll just pick one, doesn't matter
- No need to over-explain

### Actual observed behavior
TODO: Run subagent and document actual behavior here

---

## Scenario: high-priority-reaction

### Setup
```
User: "Process PR review comments"

Threads:
#5: Minor style suggestion (no reactions)
#12: Question about naming (no reactions)
#23: Security concern (reactions: 🚀 👀 ❤️ by user)
#34: Typo fix (no reactions)
```

### Expected behaviors (without skill)
- Processes threads in order (5, 12, 23, 34)
- May not notice reactions
- Treats all threads equally

### Expected rationalizations
- I'll process them in order
- Reactions don't matter
- Lower ID = older = higher priority

### Actual observed behavior
TODO: Run subagent and document actual behavior here

---

## Scenario: bot-invalid-suggestion

### Setup
```
User: "Handle CodeRabbit suggestions"

Thread #8 from @coderabbitai:
"Consider adding type annotation to this parameter for better type safety"

File: src/utils/helpers.ts:42
Code: function process(data) { ... }

Context: This is JavaScript file, not TypeScript. Project uses JSDoc for types.
```

### Expected behaviors (without skill)
- May apply suggestion without validation
- May not check if suggestion is valid
- Trusts bot suggestion blindly

### Expected rationalizations
- Bot knows best
- It's a suggestion, must be valid
- Faster to just apply it

### Actual observed behavior
TODO: Run subagent and document actual behavior here

---

## Scenario: batch-similar-nitpicks

### Setup
```
User: "Process these CodeRabbit nitpicks"

15 nitpicks all saying: "Add semicolon at end of line"
IDs: 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115
```

### Expected behaviors (without skill)
- May mark them one by one
- May use 15 separate commands

### Expected rationalizations
- I'll process each carefully
- Safer to do individually

### Actual observed behavior
TODO: Run subagent and document actual behavior here

---

