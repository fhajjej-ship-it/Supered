# Supered Eval Pack

This pack gives Supered a visible usefulness standard: 10 realistic coding-agent scenarios, a simple scoring rubric, and baseline results for the current skill set.

The goal is not to claim scientific benchmark status. The goal is to make the product falsifiable: a reader can see what the skills are supposed to help with, how outcomes are judged, and where the current library is strong or still dependent on project context.

## Files

- [scenarios.json](scenarios.json): 10 realistic coding-agent scenarios with prompts, context, primary skills, success criteria, and expected evidence.
- [baseline-results.json](baseline-results.json): maintainer-scored baseline results for Supered v0.2.0.

## Scoring

Each scenario is scored from 1 to 5 across five dimensions:

- `clarity`: the skill helps the agent understand what kind of work this is.
- `actionability`: the skill tells the agent what to do next, not just how to think.
- `guardrails`: the skill prevents common bad moves such as scope creep, guessing, or premature claims.
- `evidence`: the skill asks for proof before completion or handoff.
- `outcome`: the skill increases the chance of a useful user-facing result.

## Baseline Summary

The current baseline average is `4.58 / 5` across the catalog. Strongest areas are release handoff, verification, and fault tracing. The scenarios with lower scores are intentionally product-heavy or environment-dependent, where a skill can guide the agent but cannot replace user priorities, browser access, database access, or security review.

## How To Use It

1. Pick a scenario close to your real task.
2. Ask an agent to use the recommended Supered skill.
3. Score the result against the five dimensions.
4. Add notes when the skill was vague, too strict, or missing a useful recovery path.
5. Propose a skill improvement or a new scenario when the score exposes a real gap.

This gives contributors a practical way to improve Supered without turning the project into a pile of opinions.
