---
name: using-supered
description: Use when a coding request is broad, ambiguous, multi-part, risky, or likely to benefit from a repeatable Supered skill.
---

# Using Supered

Supered is a lightweight operating system for coding-agent work. Its job is to choose the smallest useful discipline for the situation, keep the user oriented, and prevent vague confidence from replacing evidence.

## Trigger

Use this when a request involves new code, debugging, repo changes, publishing, unclear scope, multiple files, user-visible behavior, or any claim that will need proof. Also use it when the user explicitly mentions Supered, skills, workflow, process, hardening, launch, publish, ship, verify, or debug.

## Do Not Use When

Do not use Supered to slow down a tiny factual answer, a pure status report, or a harmless single-command lookup. Do not force every request through every skill. Never announce a skill and then ignore it; if the body is loaded, follow it.

## Required Inputs

- User request, including any newest correction or interruption.
- Current repo or task context.
- Known constraints: deadline, target host, test commands, publish target, or user preference.
- Any evidence already gathered.

If these are missing, inspect local context first. Ask the user only when guessing would change the outcome or risk unwanted work.

## Operating Procedure

1. Restate the outcome in one concrete sentence: "We are trying to..."
2. Classify the request by risk and ambiguity:
   - unclear idea: use `shape-the-task`
   - approved direction needing a plan: use `make-a-map`
   - implementation work: use `build-in-slices`
   - failing or confusing behavior: use `trace-the-fault`
   - completion or correctness claim: use `prove-the-change`
   - commit, release, publish, or public handoff: use `ship-the-work`
3. Pick the narrowest skill that covers the next move. Chain skills only when the task naturally advances.
4. Tell the user the skill choice in one short sentence when the work is substantial.
5. Keep updates factual: what you are inspecting, what you learned, and what you will change next.
6. Before final response, use `prove-the-change` if you will claim success, and `ship-the-work` if anything was pushed, released, or published.

## Output Contract

When routing work, produce:

```text
Outcome:
Selected skill:
Why this skill:
Next action:
Evidence needed:
```

For tiny tasks, compress this into a sentence. For larger tasks, maintain a visible checklist and update it as work changes.

## Guardrails

- Stop if the newest user message contradicts the current direction; re-route from the newest request.
- Do not choose a heavyweight path because it feels impressive. Pick the least process that controls the real risk.
- Do not hide uncertainty. Name it, gather evidence, or ask.
- Never treat tests, builds, browser checks, or publishes as implied by code changes.
- Do not copy other skill libraries. Use original procedures and local repo patterns.

## Failure Modes

- **Over-routing:** The agent invokes every skill and burns time. Fix by selecting only the next needed skill.
- **Under-routing:** The agent jumps into code on ambiguous work. Fix by using `shape-the-task`.
- **Ceremonial updates:** The agent says "using X" but does not follow the steps. Fix by rereading the chosen skill.
- **Stale objective:** The agent continues an older plan after the user redirects. Fix by restating the newest outcome.

## Quality Gates

- The chosen skill matches the current risk.
- The next action is concrete and local.
- The user can see what is happening without reading hidden reasoning.
- Any final claim is backed by fresh evidence.

## Example

Good:

```text
Outcome: Harden the skill library.
Selected skill: shape-the-task, then build-in-slices.
Why this skill: the user is asking for product-quality behavior, not just packaging.
Next action: add tests that define a robust skill.
Evidence needed: failing tests before rewrite, passing tests after rewrite.
```

Bad: "I'll improve the skills" followed by a large untested rewrite with no criteria.

- `shape-the-task`: rough idea, unclear scope, or multiple possible products.
- `make-a-map`: approved direction that needs an execution plan.
- `build-in-slices`: implementation work that should stay incremental.
- `trace-the-fault`: broken behavior with an unknown cause.
- `prove-the-change`: completion, test, or deployment claims.
- `ship-the-work`: commit, push, release, or public GitHub handoff.
