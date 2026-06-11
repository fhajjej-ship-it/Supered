# Codex Global Plugin Directory Submission

This packet is for requesting a global Codex plugin directory listing for Supered.

## Submission Summary

- Plugin name: `supered`
- Display name: `Supered`
- Category: `Coding`
- Developer: Farouk Hajjej
- Repository: https://github.com/fhajjej-ship-it/Supered
- Release: https://github.com/fhajjej-ship-it/Supered/releases/tag/v0.7.0
- Npm: https://www.npmjs.com/package/supered
- Website: https://fhajjej-ship-it.github.io/Supered/
- Privacy policy: https://fhajjej-ship-it.github.io/Supered/privacy.html
- Terms: https://fhajjej-ship-it.github.io/Supered/terms.html
- Public Codex marketplace install: `codex plugin marketplace add fhajjej-ship-it/Supered --ref v0.7.0`
- Public plugin install: `codex plugin add supered@supered`

## Directory Listing Copy

Short description:

> Small, evidence-first workflows for coding agents.

Long description:

> Supered guides coding agents through intent shaping, small execution maps, sliced implementation, fault tracing, proof-based verification, and shipping.

Default prompts:

- Use Supered to help me shape and ship this feature.
- Run the Supered verification flow on this change.

## Why Supered Belongs In The Directory

Supered packages a lightweight, public workflow library for coding agents. It helps users move from vague requests to tested, shipped code with a predictable sequence: shape the task, make a map, build in slices, trace faults, prove the change, and ship the work.

Supered is intentionally skills-only. It does not need a connector, OAuth app, MCP server, external account, or third-party data source to be useful.

## Assets

- Main manifest: `.codex-plugin/plugin.json`
- Public marketplace manifest: `.agents/plugins/marketplace.json`
- Public marketplace plugin bundle: `plugins/supered`
- Logo: `assets/supered-plugin-logo.svg`
- Composer icon: `assets/supered-mark.svg`
- Screenshot: `docs/preview.svg`

## Reviewer Install Steps

Install from the public GitHub release:

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

## Verification Evidence

Latest release checks:

```bash
npm test
npm run validate
npm run smoke-install
npm run verify-package
npm run verify-codex-plugin
npm run verify-site
npm audit --audit-level=high
```

Additional public marketplace proof:

- Clean temporary Codex home can add `fhajjej-ship-it/Supered --ref v0.7.0`.
- Clean temporary Codex home can install `supered@supered`.
- Installed plugin reports version `0.7.0`.

## Security And Privacy Notes

- Supered is skills-only and does not include app-backed capabilities.
- Supered does not request credentials, tokens, OAuth, or third-party account connections.
- Supered does not include an MCP server.
- Supered does not run a hosted service.
- Supered does not collect plugin usage data.
- The CLI writes only to the selected local skill destination and preserves unrelated files.
- The CLI rejects unsafe symlink situations in managed install and repair paths.
- npm package verification proves install, doctor, repair, and upgrade flows for Codex, Claude, Cursor, Gemini, and OpenCode targets.

## Official Codex Context

OpenAI's Codex plugin guidance says users can open Plugins in Codex, browse the plugin library, or create a new plugin: https://openai.com/academy/codex-plugins-and-skills/

The Codex plugin help article says workspace availability can depend on workspace settings, enabled apps, access assignment, testing, and publishing: https://help.openai.com/hu-hu/articles/20001256-plugins-in-codex

OpenAI describes Codex plugins as installable from the Codex plugin directory: https://openai.com/index/codex-for-every-role-tool-workflow/

## Requested Review Outcome

Please review Supered for inclusion in the global Codex plugin directory as a skills-only coding workflow plugin.
