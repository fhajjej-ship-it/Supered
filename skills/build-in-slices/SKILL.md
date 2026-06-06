---
name: build-in-slices
description: Use when implementing code, docs, package, site, or repo changes that can regress if done as one large edit.
---

# Build In Slices

Build in slices so progress remains reviewable and mistakes stay small. The unit of work is not "a file"; it is a behavior plus the evidence that behavior changed.

## Trigger

Use this for feature work, skill rewrites, docs that affect installation, CLI behavior, package metadata, release automation, browser-visible pages, tests, or any change where a broad edit could hide a broken assumption.

## Do Not Use When

Do not use this as an excuse to create dozens of microscopic commits. Do not slice by activity only, such as "edit files" then "test later". Do not keep code that was written before the test when test-first proof is feasible.

## Required Inputs

- Current plan or shaped task.
- Existing test and validation commands.
- Files likely to change.
- Definition of done for the current slice.
- Known user constraints and any dirty worktree state.

## Operating Procedure

1. Choose one behavior to change.
2. Add or update the smallest automated check that would fail without the change. If automation is not practical, define a manual proof such as screenshot, HTTP response, or CLI transcript.
3. Run the check and read the failure. If it passes before implementation, the check is weak or the behavior already exists.
4. Implement the minimum change that makes the check pass.
5. Run the targeted check again. Fix the implementation, not the test, unless the test is demonstrably wrong.
6. Refactor only after the check is green.
7. Run a broader verification set before moving to a new risk area.
8. Update the user with the evidence, not just the intent.

## Output Contract

For each meaningful slice, record:

```text
Slice:
Expected red check:
Change:
Green check:
Files touched:
Next risk:
```

## Guardrails

- Stop if the worktree contains unrelated changes that could be staged accidentally.
- Do not batch unrelated behavior under one "cleanup" slice.
- Do not update docs to claim a feature before the feature or command exists.
- Never say a slice is done without a fresh check.
- Keep generated artifacts out of git unless they are intentional release assets.

## Failure Modes

- **Test-after bias:** The agent writes code first, then a test that mirrors the code. Fix by deleting or ignoring the implementation and writing the test from desired behavior.
- **Mega-slice:** Many files change before any check runs. Fix by backing up to the smallest failing check.
- **Doc drift:** README changes before CLI behavior exists. Fix by implementing and verifying command behavior first.
- **Green but irrelevant:** The check passes but does not cover the new behavior. Fix by making the assertion user-visible.

## Quality Gates

- The slice has one primary behavior.
- The proof would have caught the old state.
- The diff is small enough to review.
- Broader verification still passes before handoff.

## Example

Good:

```text
Slice: npm install path.
Expected red check: package test fails because publishConfig/files are missing.
Change: add package metadata and verify-package script.
Green check: npm test and npm run verify-package pass.
```

Bad: "Rewrite the package, docs, CLI, release notes, and site" followed by one final test run.
