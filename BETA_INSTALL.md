# Supered Beta Install Test

Use this 60-second install test when asking someone to try Supered from a clean Codex setup.

## Codex Plugin Test

Run:

```bash
codex plugin marketplace add fhajjej-ship-it/Supered --ref v0.7.0
codex plugin add supered@supered
codex plugin list | grep 'supered@supered'
```

Expected result:

```text
supered@supered  installed, enabled  0.7.0
```

Then start a Codex task and try:

```text
Use Supered to help me shape and ship this feature.
```

## Npm Fallback Test

Run:

```bash
npx supered@latest install --target codex
npx supered@latest doctor --target codex
```

Expected result:

```text
Supered install is healthy
```

The exact Doctor wording can vary by host and destination, but it should report a healthy install or give a specific repair command.

## Report Format

Open an install feedback issue and include:

- Host and version, such as Codex CLI version.
- Install path used: Codex plugin or npm fallback.
- The full command output.
- Whether `supered@supered` appears in `codex plugin list`.
- The first prompt you tried after installation.
- Any confusing wording, missing docs, or broken steps.

Feedback issue template:
https://github.com/fhajjej-ship-it/Supered/issues/new?template=install_feedback.md
