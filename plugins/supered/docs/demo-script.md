# Supered 5-Minute Demo Script

Use this 5-minute demo to show what Supered does after installation.

## 1. Confirm install

Run:

```bash
codex plugin list | grep 'supered@supered'
```

Expected behavior:

```text
supered@supered  installed, enabled  0.7.0
```

## 2. Start with a fuzzy task

Prompt:

```text
Use Supered to help me shape and ship a small README improvement.
```

Expected behavior:

- Supered routes through `using-supered`.
- The agent chooses `shape-the-task` if the request is still ambiguous.
- The agent turns the request into a short brief, likely files, and evidence needed.

## 3. Ask for implementation

Prompt:

```text
Let's do the smallest useful slice and prove it.
```

Expected behavior:

- The agent uses `build-in-slices`.
- It names one behavior to change.
- It identifies a check before or alongside the change.
- It keeps unrelated refactors out of scope.

## 4. Ask for verification

Prompt:

```text
Use Supered to prove this change is ready.
```

Expected behavior:

- The agent uses `prove-the-change`.
- It maps claims to commands or observations.
- It reports what passed and what was not checked.

## 5. Ask for handoff

Prompt:

```text
Use Supered to prepare the handoff, but do not publish anything.
```

Expected behavior:

- The agent uses `ship-the-work` only for handoff preparation.
- It distinguishes local readiness from pushed, released, or published state.
- It does not claim a remote result unless a remote action actually happened.

## Demo success criteria

- The response feels procedural and useful, not like a paragraph of advice.
- The agent keeps the task small.
- The agent names evidence before making completion claims.
- The agent avoids publishing or changing remote state unless asked.
