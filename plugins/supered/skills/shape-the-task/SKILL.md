---
name: shape-the-task
description: Use when a request is ambiguous, broad, underspecified, exploratory, or has multiple plausible interpretations.
---

# Shape The Task

Shape the task before building. The goal is not a long spec; it is a compact, testable brief that prevents the agent from solving the wrong problem with confidence.

## Trigger

Use this when the user gives a rough product idea, asks for "similar to X", says "make it better", asks for "best in market", names an outcome without acceptance criteria, or mixes product, design, code, and publishing concerns in one request.

## Do Not Use When

Do not use this when the user provided a precise bug, file, command, and expected result. Do not ask broad discovery questions if the repo or provided artifact can answer them. Do not turn a small implementation request into a product strategy exercise.

## Required Inputs

- User's literal request and any attached files or links.
- Current repo state, if this is a local project.
- Reference products or competitors, if named.
- Constraints: platform, audience, deadline, budget, target quality, or release channel.
- Evidence required for "done".

## Operating Procedure

1. Capture the request in the user's words, then rewrite it as a concrete outcome.
2. Identify the audience and job-to-be-done. If the audience is unknown, infer from the product context and mark it as an assumption.
3. Separate must-have outcomes from nice-to-have ideas. Keep the first build small enough to verify.
4. Find constraints from local context before asking: package type, framework, assets, existing tests, publish target, branch state.
5. Name risks that could change implementation: legal/copyright, auth, payments, external accounts, destructive operations, user data, or brand assets.
6. Define acceptance criteria that can be checked by commands, screenshots, API responses, docs review, or user inspection.
7. Ask at most one focused question only if the answer would materially change the work. Otherwise proceed with stated assumptions.

## Output Contract

Use this shape when helpful:

```text
Outcome:
Audience:
Must have:
Can defer:
Assumptions:
Risks:
Acceptance checks:
First slice:
```

## Guardrails

- Stop if the brief contains vague adjectives without observable checks, such as "premium", "robust", or "world class". Translate them into criteria.
- Do not overfit to a reference product. Preserve inspiration, avoid copying text, assets, or protected expression.
- Do not ask the user to restate information available in the repo, issue, file, or link.
- Never proceed if the task implies publishing, payment, credentials, or destructive actions without a clear target and proof path.

## Failure Modes

- **Question flood:** The agent asks five questions before inspecting context. Fix by reading the repo/artifact first.
- **Spec bloat:** The brief becomes a roadmap. Fix by naming the smallest useful version.
- **False certainty:** The agent hides assumptions. Fix by listing assumptions explicitly.
- **Aesthetic-only criteria:** The brief says "looks good." Fix by adding viewport, accessibility, content, and screenshot checks.

## Quality Gates

- The brief can be read in under one minute.
- Every must-have has a verification method.
- The first slice is small enough to complete and test.
- The user can correct the direction before major work begins.

## Example

Good:

```text
Outcome: Create a public installable agent-skill kit named Supered.
Audience: developers using coding agents.
Must have: installable skills, docs, validation, public repo.
Can defer: marketplace submission.
Acceptance checks: npm test, package validation, public URL, install smoke test.
First slice: create manifest tests and package skeleton.
```

Bad: "Build something like Superpowers but better" with no audience, checks, or boundaries.
