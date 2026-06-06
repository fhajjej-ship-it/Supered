# Supered

[![Release](https://img.shields.io/github/v/release/fhajjej-ship-it/Supered?label=release)](https://github.com/fhajjej-ship-it/Supered/releases)
[![CI](https://github.com/fhajjej-ship-it/Supered/actions/workflows/ci.yml/badge.svg)](https://github.com/fhajjej-ship-it/Supered/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-0ea5a3.svg)](LICENSE)

Supered is a compact workflow kit for coding agents. It gives an agent a small set of repeatable skills for shaping a task, mapping the work, building in slices, tracing bugs, proving results, and shipping cleanly.

It is inspired by obra/superpowers, but Supered is intentionally smaller and written as a fresh, original toolkit with a tighter bias toward lightweight public repos and evidence-first handoffs.

![Supered logo](1.svg)

Website: https://fhajjej-ship-it.github.io/Supered/

## What Is Inside

- `using-supered`: entrypoint for choosing the right workflow.
- `shape-the-task`: turns a rough request into a short, testable brief.
- `make-a-map`: breaks approved work into small execution steps.
- `build-in-slices`: keeps implementation incremental and reviewable.
- `trace-the-fault`: diagnoses bugs from symptoms to root cause.
- `prove-the-change`: verifies claims before completion.
- `ship-the-work`: prepares a repo for public GitHub delivery.

## Quickstart

Install the default Codex skill set with one command:

```bash
curl -fsSL https://raw.githubusercontent.com/fhajjej-ship-it/Supered/main/install.sh | sh
```

Pick another host with `SUPERED_TARGET`:

```bash
curl -fsSL https://raw.githubusercontent.com/fhajjej-ship-it/Supered/main/install.sh | SUPERED_TARGET=claude sh
```

Or clone the repo, validate the bundle, then install the skills into the agent host you use.

```bash
git clone https://github.com/fhajjej-ship-it/Supered.git
cd Supered
npm test
npm run validate
node ./bin/supered.mjs install --target codex
```

For Claude or Gemini, replace `codex` with `claude` or `gemini`.

Host-specific notes:
[Codex](docs/hosts/codex.md),
[Claude](docs/hosts/claude.md),
[Cursor](docs/hosts/cursor.md),
[Gemini](docs/hosts/gemini.md),
[OpenCode](docs/hosts/opencode.md).

Marketplace readiness lives in [docs/marketplace-checklist.md](docs/marketplace-checklist.md).

## CLI

```bash
npm run skills
npm run validate
npm run smoke-install
npm run verify-site
node ./bin/supered.mjs skills --json
```

The validator checks package metadata, plugin metadata, and skill frontmatter so the public repo does not drift into a half-installable state.

`npm run verify-site` opens the landing page in Chromium at desktop and mobile sizes, checks the logo and workflow text, and writes screenshots to `artifacts/site/`.

## Design Principles

- Small workflows beat sprawling doctrine.
- Ask only when uncertainty changes the outcome.
- Build in slices that can be reviewed, tested, and reverted.
- Every success claim needs fresh evidence.
- Shipping is part of the work, not an afterthought.

## Plugin Manifests

Supered includes starter manifests for Codex, Claude, Cursor, and Gemini:

- `.codex-plugin/plugin.json`
- `.claude-plugin/plugin.json`
- `.cursor-plugin/plugin.json`
- `gemini-extension.json`

## License

MIT License. See [LICENSE](LICENSE).
