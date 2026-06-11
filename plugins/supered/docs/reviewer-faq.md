# Supered Reviewer FAQ

This FAQ is for OpenAI, Codex plugin reviewers, and early users evaluating whether Supered is useful and safe to install.

## What is Supered?

Supered is a compact workflow kit for coding agents. It gives agents seven small skills for clarifying work, making an execution map, building in slices, tracing faults, proving claims, and shipping changes with evidence.

## What problem does it solve?

Coding agents can move quickly but still lose the thread: vague requirements, oversized changes, unverified claims, and unclear handoffs. Supered gives the agent a repeatable operating procedure so the work stays scoped, testable, and easier to review.

## Why is it skills-only?

Supered is skills-only because the product value is in local workflow guidance, not a remote service. It does not need OAuth, a connector, an MCP server, or access to a third-party account.

## What data does it touch?

Supered skills are plain local Markdown instructions. Supered does not collect plugin usage data, does not run a hosted service, and does not request credentials, tokens, or account connections.

The npm CLI writes only to the selected local skill destination. The installer and Doctor flows reject unsafe symlink situations in managed install and repair paths.

## What capabilities does the Codex plugin declare?

The Codex plugin declares `Interactive`, `Read`, and `Write` capabilities because the skills are intended for coding-agent work in repositories. It does not declare an app, connector, or MCP server.

## How can reviewers install it?

```bash
codex plugin marketplace add fhajjej-ship-it/Supered --ref v0.7.0
codex plugin add supered@supered
codex plugin list | grep 'supered@supered'
```

Expected result:

```text
supered@supered  installed, enabled  0.7.0
```

Npm fallback:

```bash
npx supered@latest install --target codex
npx supered@latest doctor --target codex
```

## How can reviewers demo it?

Use the 5-minute demo script:

https://github.com/fhajjej-ship-it/Supered/blob/main/docs/demo-script.md

## What should reviewers look for?

- Does the agent choose a useful workflow instead of producing a generic paragraph?
- Does it ask clarifying questions only when ambiguity changes the outcome?
- Does it map implementation work into small, reviewable slices?
- Does it run or ask for evidence before claiming completion?
- Does it separate local proof from remote publish or deployment proof?

## Why should it belong in Codex plugins?

Supered is small, public, installable, and focused on coding-agent reliability. It improves common Codex workflows without requiring a separate service or sensitive integration. It is useful for users who want agents to work with clearer intent, smaller implementation steps, and stronger verification habits.

## Where is the submission packet?

Global directory submission packet:

https://github.com/fhajjej-ship-it/Supered/blob/main/docs/codex-global-listing-submission.md

OpenAI submission tracker:

https://github.com/fhajjej-ship-it/Supered/issues/1

Beta feedback tracker:

https://github.com/fhajjej-ship-it/Supered/issues/2
