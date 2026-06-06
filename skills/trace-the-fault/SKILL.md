---
name: trace-the-fault
description: Use when debugging broken behavior, failing tests, confusing output, or deployment failures with an unknown cause.
---

# Trace The Fault

Debug from symptom to cause. Do not patch randomly.

## Steps

1. Reproduce the symptom.
2. State what changed, what stayed the same, and what is unknown.
3. Add the smallest observation that distinguishes likely causes.
4. Follow the evidence to the responsible boundary.
5. Fix the cause and keep the reproduction as a check when possible.

## Guardrails

- Do not make multiple unrelated fixes at once.
- Do not explain a failure before reproducing it.
- Do not delete evidence until the fix is verified.

## Evidence

Completion requires the original symptom to be checked again after the fix.
