# Installing Supered

Supered ships plain skill folders plus lightweight plugin manifests.

## Npx install

```bash
npx supered install --target codex
npx supered doctor --target codex
```

Choose another host:

```bash
npx supered install --target opencode
npx supered doctor --target opencode
```

## One-line install

```bash
curl -fsSL https://raw.githubusercontent.com/fhajjej-ship-it/Supered/main/install.sh | sh
```

Set a host target:

```bash
curl -fsSL https://raw.githubusercontent.com/fhajjej-ship-it/Supered/main/install.sh | SUPERED_TARGET=gemini sh
```

## Codex

```bash
node ./bin/supered.mjs install --target codex
node ./bin/supered.mjs doctor --target codex
```

## Claude

```bash
node ./bin/supered.mjs install --target claude
node ./bin/supered.mjs doctor --target claude
```

## Gemini

```bash
node ./bin/supered.mjs install --target gemini
node ./bin/supered.mjs doctor --target gemini
```

## Doctor

Doctor checks Install Health without changing files:

```bash
supered doctor --target codex
supered doctor --target codex --json
```

It reports missing skills, changed skill files, missing destinations, and unsafe symlinks. The fix it prints is a reinstall command for the same target and destination.

## Manual

Copy each folder in `skills/` into the skill directory used by your agent host.
