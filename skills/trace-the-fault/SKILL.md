---
name: trace-the-fault
description: Use when behavior is broken, flaky, surprising, failing, inconsistent, or explained only by guesses.
---

# Trace The Fault

Trace from symptom to cause. The goal is not to make the error disappear; it is to understand the responsible boundary well enough that the fix is small and the original symptom is rechecked.

## Trigger

Use this for failing tests, broken CLI commands, deployment failures, browser rendering bugs, package publishing errors, auth failures, flaky behavior, unexpected output, or any moment where the agent is tempted to say "probably".

## Do Not Use When

Do not use this for known, mechanical edits where cause and fix are already proven. Do not skip reproduction because the fix looks obvious. Do not treat third-party service errors as solved until the service response changes.

## Required Inputs

- Exact symptom: command, error, screenshot, log, failing assertion, or user report.
- Recent changes and relevant environment details.
- A way to reproduce or observe the symptom.
- Boundaries to inspect: code, config, package, network, auth, docs, browser, CI.
- A verification command for the original symptom.

## Operating Procedure

1. Reproduce the symptom as directly as possible. Capture the exact command and output.
2. Classify the failure: missing file, wrong assumption, dependency, environment, auth, network, syntax, behavior, test design, or service state.
3. List what is known, what is unknown, and what changed recently.
4. Form one narrow hypothesis at a time. Prefer observations that split possibilities, such as checking published tarball contents before editing package code.
5. Add instrumentation or targeted commands only where they reduce uncertainty.
6. Fix the cause at the responsible boundary. Avoid broad rewrites.
7. Re-run the original reproduction. Then run nearby regression checks.
8. If the root cause was a missing guard, add a test or validator so it stays fixed.

## Output Contract

```text
Symptom:
Reproduction:
Known facts:
Hypothesis tested:
Root cause:
Fix:
Original symptom check:
Regression check:
```

## Guardrails

- Stop if you cannot reproduce and the issue is not urgent; gather more evidence before patching.
- Do not make multiple unrelated fixes in one debug pass.
- Do not delete logs or screenshots until the final check passes.
- Do not call an auth, publish, or deploy issue fixed until the remote system confirms it.
- Never change tests just to make them pass unless the test itself is proven wrong.

## Failure Modes

- **Guess patching:** The agent edits likely files without proving the boundary. Fix by running a discriminating observation.
- **Symptom swap:** The original error disappears but a new unexamined error appears. Fix by tracing the new symptom.
- **Local-only proof:** The local check passes but CI/npm/GitHub still fails. Fix by verifying the actual remote target.
- **Overbroad fix:** The agent rewrites architecture for a config typo. Fix at the smallest responsible boundary.

## Quality Gates

- Original symptom was reproduced or explicitly could not be reproduced.
- Root cause is stated as a boundary, not a vibe.
- The fix is narrower than the investigation.
- Original symptom and at least one regression check pass.

## Example

Good:

```text
Symptom: npx supered@latest fails with "command not found" in repo.
Observation: published tarball has correct bin.
Hypothesis: npm exec inside same-named checkout shadows registry bin.
Check: run npx from empty temp directory.
Result: registry install works.
```

Bad: changing `package.json` repeatedly without inspecting the actual published tarball or execution directory.
