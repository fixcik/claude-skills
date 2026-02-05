# Behavior WITH skill

Generated: Thu Feb  5 19:03:29 MSK 2026

## Scenario: reviewer-question-about-logic

### Setup
```
User: "Process this PR review comment"

Thread #42 from @senior-dev:
"Why did you choose to validate before the database transaction instead of using
database constraints? Wouldn't constraints be more reliable?"

File: src/api/users.ts:145
```

### Expected behaviors (with skill)
- Reads the code to understand validation logic
- Drafts answer with technical reasoning
- Shows draft to user for confirmation
- Uses reply (not resolve)
- Explicitly states "let reviewer close thread"

### Success criteria
- Does NOT resolve the thread
- Provides technical justification
- Gets user confirmation before sending

### Actual observed behavior
TODO: Run subagent WITH skill loaded and document actual behavior here

### Result
- [ ] PASS - Meets all success criteria
- [ ] FAIL - Document which criteria failed

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

### Expected behaviors (with skill)
- Checks existing codebase patterns
- Analyzes both options (performance, maintainability, consistency)
- Recommends option with technical reasoning
- Shows analysis to user
- Explains WHY chosen option is better
- Mentions the reaction (👀 = high priority)

### Success criteria
- Provides technical justification
- References existing codebase patterns
- Explains trade-offs

### Actual observed behavior
TODO: Run subagent WITH skill loaded and document actual behavior here

### Result
- [ ] PASS - Meets all success criteria
- [ ] FAIL - Document which criteria failed

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

### Expected behaviors (with skill)
- Identifies thread
- Processes
- Explicitly mentions reactions when presenting
- Shows priority analysis to user

### Success criteria
- Handles
- Mentions "🚀 👀 ❤️ reactions indicate high priority"
- Asks user if this priority is correct

### Actual observed behavior
TODO: Run subagent WITH skill loaded and document actual behavior here

### Result
- [ ] PASS - Meets all success criteria
- [ ] FAIL - Document which criteria failed

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

### Expected behaviors (with skill)
- Checks file type (.js vs .ts)
- Recognizes suggestion doesn't apply
- Explains to user WHY invalid
- Drafts reply explaining reasoning
- Marks as skip (not done)

### Success criteria
- Does NOT blindly apply suggestion
- Explains technical reason for rejection
- Uses appropriate command (mark skip, not done)

### Actual observed behavior
TODO: Run subagent WITH skill loaded and document actual behavior here

### Result
- [ ] PASS - Meets all success criteria
- [ ] FAIL - Document which criteria failed

---

## Scenario: batch-similar-nitpicks

### Setup
```
User: "Process these CodeRabbit nitpicks"

15 nitpicks all saying: "Add semicolon at end of line"
IDs: 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115
```

### Expected behaviors (with skill)
- Recognizes they're all similar
- Uses single batch command
- Mentions batch efficiency to user

### Success criteria
- Uses: npx gh-pr-threads mark done 101 102 103 104 105 106 107 108 109 110 111 112 113 114 115
- Not 15 separate commands

### Actual observed behavior
TODO: Run subagent WITH skill loaded and document actual behavior here

### Result
- [ ] PASS - Meets all success criteria
- [ ] FAIL - Document which criteria failed

---

