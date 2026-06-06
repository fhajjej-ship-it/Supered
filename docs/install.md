# Installing Supered

Supered ships plain skill folders plus lightweight plugin manifests.

## Npx install

```bash
npx supered install --target codex
npx supered doctor --target codex
npx supered doctor --target codex --fix
npx supered upgrade --target codex
```

Choose another host:

```bash
npx supered install --target opencode
npx supered doctor --target opencode
npx supered doctor --target opencode --fix
npx supered upgrade --target opencode
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
node ./bin/supered.mjs doctor --target codex --fix
node ./bin/supered.mjs upgrade --target codex
```

## Claude

```bash
node ./bin/supered.mjs install --target claude
node ./bin/supered.mjs doctor --target claude
node ./bin/supered.mjs doctor --target claude --fix
node ./bin/supered.mjs upgrade --target claude
```

## Gemini

```bash
node ./bin/supered.mjs install --target gemini
node ./bin/supered.mjs doctor --target gemini
node ./bin/supered.mjs doctor --target gemini --fix
node ./bin/supered.mjs upgrade --target gemini
```

## Doctor

Doctor checks Install Health without changing files:

```bash
supered doctor --target codex
supered doctor --target codex --json
supered doctor --target codex --fix
supered doctor --target codex --fix --json
```

It reports missing skills, changed skill files, missing destinations, and unsafe symlinks. Without `--fix`, the fix it prints is a reinstall command for the same target and destination.

With `--fix`, Doctor repairs missing or changed Supered skill files and creates a missing destination. It refuses symlinked destinations and symlinks inside managed skill folders.

## Upgrade

Upgrade compares the running Supered package, npm latest, and Install Health:

```bash
supered upgrade --target codex
supered upgrade --target codex --apply
supered upgrade --all
supered upgrade --all --json
```

Without `--apply`, it reports the Upgrade Plan. With `--apply`, it repairs through the current package when already current, or delegates to `supered@latest` when a newer npm package exists.

## Manual

Copy each folder in `skills/` into the skill directory used by your agent host.
