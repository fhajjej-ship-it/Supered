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

Install Supered as a public Codex plugin:

```bash
codex plugin marketplace add fhajjej-ship-it/Supered --ref v0.6.2
codex plugin add supered@supered
```

This installs the public GitHub release. The global OpenAI Codex directory review packet lives in [docs/codex-global-listing-submission.md](docs/codex-global-listing-submission.md), and reusable launch copy lives in [docs/launch-post.md](docs/launch-post.md).

Beta testers can use [BETA_INSTALL.md](BETA_INSTALL.md) for a 60-second install test and [docs/examples.md](docs/examples.md) for real workflow examples. Reviewers can use [docs/reviewer-faq.md](docs/reviewer-faq.md), [docs/demo-script.md](docs/demo-script.md), and [docs/feedback-log.md](docs/feedback-log.md) as the proof pack.

Or install with npx:

```bash
npx supered install --target codex
```

Check the install:

```bash
npx supered doctor --target codex
```

Repair an install after reviewing the Doctor output:

```bash
npx supered doctor --target codex --fix
```

Check whether your package and install are current:

```bash
npx supered upgrade --target codex
npx supered upgrade --target codex --apply
```

Or install the default Codex skill set with curl:

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
node ./bin/supered.mjs doctor --target codex
node ./bin/supered.mjs doctor --target codex --fix
node ./bin/supered.mjs upgrade --target codex
```

For Claude or Gemini, replace `codex` with `claude` or `gemini`.

Host-specific notes:
[Codex](docs/hosts/codex.md),
[Claude](docs/hosts/claude.md),
[Cursor](docs/hosts/cursor.md),
[Gemini](docs/hosts/gemini.md),
[OpenCode](docs/hosts/opencode.md).

Marketplace readiness lives in [docs/marketplace-checklist.md](docs/marketplace-checklist.md).
Codex plugin listing notes live in [docs/codex-plugin-listing.md](docs/codex-plugin-listing.md).
Global Codex directory submission packet lives in [docs/codex-global-listing-submission.md](docs/codex-global-listing-submission.md).

## Which Skill Should I Use?

Use [docs/which-skill.md](docs/which-skill.md) as the quick router:

- unclear task: `shape-the-task`
- clear but large task: `make-a-map`
- planned implementation: `build-in-slices`
- broken or flaky behavior: `trace-the-fault`
- completion claim: `prove-the-change`
- commit, publish, or handoff: `ship-the-work`

## Eval Pack

Supered includes a public eval pack so the skills can be judged against realistic work instead of vibes.

- [Scenario catalog](docs/evals/scenarios.json): 10 realistic coding-agent scenarios.
- [Baseline results](docs/evals/baseline-results.json): scores across clarity, actionability, guardrails, evidence, and outcome.
- [Eval report](docs/evals/README.md): how to use the scenarios to improve the skills.
- [Beta install test](BETA_INSTALL.md): a fast install proof for outside testers.
- [Examples](docs/examples.md): first prompts for debugging, shipping, and review workflows.
- [Reviewer FAQ](docs/reviewer-faq.md): security, privacy, install, and listing questions.
- [Demo script](docs/demo-script.md): a 5-minute reviewer walkthrough.
- [Feedback log](docs/feedback-log.md): beta install and first-use evidence.

## CLI

```bash
npm run skills
npm run validate
npm run smoke-install
npm run verify-site
npm run verify-package
npm run verify-codex-plugin
node ./bin/supered.mjs skills --json
node ./bin/supered.mjs doctor --target codex --json
node ./bin/supered.mjs doctor --target codex --fix --json
node ./bin/supered.mjs upgrade --all --json
```

The validator checks package metadata, plugin metadata, and skill frontmatter so the public repo does not drift into a half-installable state.

`npm run verify-site` opens the landing page in Chromium at desktop and mobile sizes, checks the logo and workflow text, and writes screenshots to `artifacts/site/`.

`npm run verify-package` builds the npm tarball and verifies `npx`-style installs, Doctor checks, Doctor repairs, and Upgrade applies for every supported host target.

`npm run verify-codex-plugin` checks that the Codex plugin manifest, listing assets, docs, and bundled skills are aligned for Codex plugin submission.

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
