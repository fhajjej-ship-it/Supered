# Supered Beta Outreach Kit

Use this kit to recruit beta testers and collect install evidence for Supered v0.7.0.

## Target

- Reach 5 testers who use coding agents or review agent-generated code.
- Get 3 successful external installs.
- Collect 2 useful improvement notes.
- Capture 1 short quote that can be reused in the README, site, or OpenAI submission thread.

## Message For Developers

```text
I shipped Supered, a small workflow kit for coding agents. It adds local skills for shaping tasks, building in slices, proving changes, and shipping with evidence.

Could you run a 5-minute beta install and tell me whether it is useful or confusing?

Install:
codex plugin marketplace add fhajjej-ship-it/Supered --ref v0.7.0
codex plugin add supered@supered

Then try:
Use Supered to help me shape and ship a small change.

Feedback issue:
https://github.com/fhajjej-ship-it/Supered/issues/2
```

## Public Reply Template

```text
I am collecting beta install feedback for Supered v0.7.0.

It is a skills-only Codex plugin for small, evidence-first coding-agent workflows.

Install:
codex plugin marketplace add fhajjej-ship-it/Supered --ref v0.7.0
codex plugin add supered@supered

Feedback:
https://github.com/fhajjej-ship-it/Supered/issues/2
```

## Tester Checklist

Ask each tester to run:

```bash
codex plugin marketplace add fhajjej-ship-it/Supered --ref v0.7.0
codex plugin add supered@supered
codex plugin list | grep 'supered@supered'
```

Expected result:

```text
supered@supered  installed, enabled  0.7.0
```

Then ask them to try one prompt:

```text
Use Supered to help me shape and ship a small change.
```

Npm fallback:

```bash
npx supered@latest install --target codex
npx supered@latest doctor --target codex
```

## Tester scorecard

Record one row per tester in `docs/feedback-log.md`:

| Field | What to capture |
| --- | --- |
| Tester | Name, handle, or anonymous label. |
| Host | Codex CLI/app version if available. |
| Install path | Codex plugin or npm fallback. |
| Install result | Success, failed, or blocked. |
| First prompt | The first Supered prompt they tried. |
| Useful | Yes, no, or unsure. |
| Confusing | Any wording, install, or workflow friction. |
| Quote | One sentence we can reuse with permission. |
| Follow-up | Bug, docs fix, skill improvement, or none. |

## Follow-Up Rules

- If install fails twice with the same symptom, open a bug.
- If a tester succeeds but cannot explain what Supered helped with, improve docs or examples.
- If two testers ask for the same workflow, consider it for the v0.7.0 roadmap.
- If feedback is unclear, ask for command output and the first prompt they tried.

## Tracking Links

- Beta issue: https://github.com/fhajjej-ship-it/Supered/issues/2
- Install test: https://github.com/fhajjej-ship-it/Supered/blob/main/BETA_INSTALL.md
- Feedback log: https://github.com/fhajjej-ship-it/Supered/blob/main/docs/feedback-log.md
- Demo script: https://github.com/fhajjej-ship-it/Supered/blob/main/docs/demo-script.md
