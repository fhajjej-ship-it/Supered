# Installing Supered

Supered ships plain skill folders plus lightweight plugin manifests.

## Npx install

```bash
npx supered install --target codex
```

Choose another host:

```bash
npx supered install --target opencode
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
```

## Claude

```bash
node ./bin/supered.mjs install --target claude
```

## Gemini

```bash
node ./bin/supered.mjs install --target gemini
```

## Manual

Copy each folder in `skills/` into the skill directory used by your agent host.
