# Which Skill Should I Use?

Start with the shape of the work, not the name of the tool.

| Situation | Use this skill | Why |
| --- | --- | --- |
| The request is broad, mixed, or risky and you are not sure where to begin. | `using-supered` | Routes the session to the right next workflow. |
| The user asks for something vague, underspecified, or easy to overbuild. | `shape-the-task` | Produces a short brief, assumptions, non-goals, and acceptance signals. |
| The direction is approved but the files, order, or checks are unclear. | `make-a-map` | Turns intent into an execution map with checkpoints and verification. |
| You are implementing code, docs, packaging, or site changes. | `build-in-slices` | Keeps work small, reviewable, and easier to recover from. |
| Something is broken, flaky, confusing, or explained only by guesses. | `trace-the-fault` | Forces symptom capture, hypotheses, probes, and evidence before patches. |
| You are about to say work is done, fixed, published, or ready. | `prove-the-change` | Requires fresh proof before any completion claim. |
| The work needs commit, push, release, deploy, publish, or public handoff. | `ship-the-work` | Makes shipping part of the work and preserves evidence for readers. |

## Fast Routing

- If the task is unclear: start with `shape-the-task`.
- If the task is clear but large: start with `make-a-map`.
- If the task is already planned: start with `build-in-slices`.
- If behavior is broken: start with `trace-the-fault`.
- If you are making a claim: start with `prove-the-change`.
- If the work leaves your machine: start with `ship-the-work`.

## Combining Skills

Good sessions often use two or three skills in order:

- New feature: `shape-the-task` -> `make-a-map` -> `build-in-slices` -> `prove-the-change`.
- Bug fix: `trace-the-fault` -> `build-in-slices` -> `prove-the-change`.
- Public release: `prove-the-change` -> `ship-the-work`.
- Messy request: `using-supered` -> whichever skill the routing decision selects.

Do not load every skill just because they exist. Use the smallest workflow that changes the outcome.
