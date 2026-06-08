# Supered Examples

These examples show what a user can ask for after Supered is installed. They are intentionally small so beta testers can tell whether the workflows are useful in real work.

## Use Supered to debug a failing test

Prompt:

```text
Use Supered to debug why this test fails and prove the fix.
```

Expected route:

- `trace-the-fault` to reproduce the failure and compare expected versus actual behavior.
- `build-in-slices` for the smallest fix.
- `prove-the-change` before claiming the test is fixed.

Useful output should include the failing command, the suspected cause, the changed files, and the passing command.

## Use Supered to ship a small feature

Prompt:

```text
Use Supered to ship this small feature with tests and a clean handoff.
```

Expected route:

- `shape-the-task` if the request is still fuzzy.
- `make-a-map` for the file and check sequence.
- `build-in-slices` while implementing.
- `ship-the-work` if the user asks to commit, push, release, or publish.

Useful output should keep the change scoped, name the verification commands, and avoid claiming remote work until it is actually pushed or published.

## Use Supered to review a risky change

Prompt:

```text
Use Supered to verify whether this change is ready to merge.
```

Expected route:

- `prove-the-change` to map claims to evidence.
- `trace-the-fault` only if a check fails or behavior is confusing.
- `ship-the-work` only when the merge, release, or public handoff is requested.

Useful output should separate proven facts from remaining risk and list any checks that were not run.

## Beta Notes

If a workflow feels like a paragraph instead of a useful operating procedure, file install feedback or a skill request with the exact prompt you tried and the output you expected.
