---
name: make-a-map
description: Use when a direction is approved but the implementation path, sequencing, files, or checks are not yet clear.
---

# Make A Map

Make a map after the task is shaped and before broad edits begin. A good map is short, sequenced by risk, and specific enough that the next command is obvious.

## Trigger

Use this when the work spans multiple files, needs tests, has ordering dependencies, touches packaging or release behavior, or could be done in several plausible ways. Also use it when the user asks for a plan after approving a direction.

## Do Not Use When

Do not write a plan before inspecting the repo. Do not create a plan for a single obvious edit unless risk is high. Do not keep planning after implementation evidence has invalidated the map; update it.

## Required Inputs

- Approved brief or clearly understood request.
- Repo structure and relevant files.
- Available commands: tests, validation, build, lint, browser checks, publish checks.
- Known risks and dependencies.
- User constraints on scope, timing, or release.

## Operating Procedure

1. Inspect before planning: list files, read package scripts, check git status, and identify existing patterns.
2. Write a small set of steps, usually three to seven. Each step should change behavior or reduce risk.
3. Put the highest-risk unknown first: failing tests, package metadata, browser rendering, auth, external API, migration, or destructive operation.
4. For each step, name the file area and the check that proves it.
5. Keep only one step `in_progress`. Update the map when a fact changes.
6. Prefer vertical slices: test plus implementation plus verification. Avoid "edit all docs" followed by "hope it works".
7. Mark deferred work explicitly so it does not leak into the current task.

## Output Contract

```text
Plan:
1. Step:
   Files:
   Check:
   Risk reduced:
2. ...
Deferred:
Stop conditions:
```

Use compact bullets in chat. Use a formal checklist only for multi-step work.

## Guardrails

- Stop if the plan contains a step that cannot be verified.
- Do not include unrelated refactors, dependency upgrades, or formatting churn.
- Do not plan a push, release, or publish before naming the authentication and verification requirements.
- Do not let tests be a final cleanup step. Put the first meaningful test before implementation when practical.

## Failure Modes

- **Inventory plan:** "Read files, edit files, test" adds no value. Fix by naming specific files and proof.
- **Risk-last sequencing:** The hardest unknown appears at the end. Fix by moving it first.
- **No stop condition:** The agent keeps going after a failed check. Fix by saying what blocks progress.
- **Unowned dependencies:** The plan assumes tools or credentials exist. Fix by checking them early.

## Quality Gates

- Every step has a check.
- The plan can survive interruption because status is explicit.
- The plan honors the user's scope.
- The first step produces useful evidence, even if the implementation fails.

## Activation Prompts

```text
Use Supered to make a short implementation map before editing.
```

```text
Use Supered to sequence this approved change by risk and verification.
```

```text
Use Supered to identify files, checks, stop conditions, and deferred work.
```

## Output Examples

Useful output:

```text
Plan:
1. Step: Add a failing test for the missing beta outreach link.
   Files: tests/readiness.test.mjs, tests/launch.test.mjs
   Check: focused node --test command fails.
   Risk reduced: defines the shipped surface before docs are written.
2. Step: Add the doc and public links.
   Files: docs/beta-outreach.md, README.md, docs/index.html
   Check: focused tests pass.
3. Step: Verify package and site.
   Files: release bundle and mirrored plugin docs
   Check: npm test, validate, verify-codex-plugin, verify-site.
Deferred: npm publish until a release version is explicitly prepared.
Stop conditions: dirty unrelated files, failed package verification, or missing auth.
```

Weak output:

```text
Plan: update docs, run tests, push.
```

The weak output hides file areas, skips risk ordering, and does not define a meaningful stop condition.

## Example

Good:

```text
1. Add failing quality tests for skill structure.
   Files: tests/skill-quality.test.mjs
   Check: npm test fails on current thin skills.
   Risk reduced: defines "robust" before rewriting.
2. Rewrite skills against the tested structure.
   Files: skills/*/SKILL.md
   Check: npm test passes.
3. Verify package and site.
   Files: package metadata, docs if changed
   Check: npm run verify-package && npm run verify-site.
```

Bad: "Improve all skills, update docs, run tests" with no file boundaries or proof.
