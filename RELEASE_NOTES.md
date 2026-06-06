# Supered v0.2.1

Architecture deepening release.

## Highlights

- Added `CONTEXT.md` to define the project language for Skill Bundle, Host Install, Package Verification, Site Verification, Eval Pack, and Release Bundle.
- Moved supported host targets and skill ordering into shared policy so installers and verification speak from one source of truth.
- Added a structured Host Install module that copies only ordered Supered skills, preserves unrelated destination files, validates `SKILL.md` files, and rejects symlinked source or destination paths.
- Brought `install.sh` into Host Install parity by copying only ordered Supered skills and rejecting unsafe source or destination symlinks.
- Added structured Package Verification, Eval Pack, and Release Bundle modules so scripts, CLI, and tests can use the same interfaces.
- Kept the CLI and package verification script as thin adapters while allowing custom target labels when an explicit destination is provided.

## Verification

```bash
npm test
npm run validate
npm run smoke-install
npm run verify-package
npm run verify-site
npm audit --audit-level=high
```

# Supered v0.2.0

Skill hardening release.

## Highlights

- Rebuilt all seven bundled skills as operational playbooks with triggers, inputs, procedures, output contracts, guardrails, failure modes, and quality gates.
- Tightened skill descriptions so metadata stays trigger-only and the working instructions stay inside each skill body.
- Added `docs/skill-design-principles.md` with current primary guidance from OpenAI and Anthropic.
- Added automated skill-quality tests to prevent the library from drifting back into thin paragraph prompts.
- Updated examples to use version-agnostic `supered@latest` package checks.

## Verification

```bash
npm test
npm run validate
npm run smoke-install
npm run verify-package
npm run verify-site
```

# Supered v0.1.3

Npm package release.

## Highlights

- Added public npm package metadata for `supered`.
- Added `npx supered install --target codex` install path.
- Added `npm run verify-package` to pack and test the npm tarball locally.
- Added CI coverage for npm package verification.
- Added npm package file filtering to keep tests, artifacts, and local dependencies out of the published tarball.
- Extended the CLI default install target map to Codex, Claude, Cursor, Gemini, and OpenCode.

## Verification

```bash
npm test
npm run validate
npm run smoke-install
npm run verify-package
npm run verify-site
```

# Supered v0.1.2

Installer and submission-readiness release.

## Highlights

- Added `install.sh` for one-line installs.
- Added host-specific install docs for Codex, Claude, Cursor, Gemini, and OpenCode.
- Added marketplace readiness checklist.
- Added GitHub issue templates for bugs, skill requests, and compatibility reports.
- Added `CONTRIBUTING.md`.
- Added tests for installer behavior, host docs, and metadata version alignment.
- Aligned package and host manifest versions.

## Verification

```bash
npm test
npm run validate
npm run smoke-install
npm run verify-site
```

# Supered v0.1.1

Browser verification release.

## Highlights

- Added `npm run verify-site` with Playwright-powered desktop and mobile checks.
- Saved browser screenshots to ignored `artifacts/site/` output.
- Added CI coverage for Chromium site verification.
- Fixed mobile install command wrapping on the landing page.

## Verification

```bash
npm test
npm run validate
npm run smoke-install
npm run verify-site
```

# Supered v0.1.0

Initial public release of Supered.

## Highlights

- Added the seven-skill Supered workflow library.
- Added plugin metadata for Codex, Claude, Cursor, and Gemini.
- Added the `supered` CLI with skill listing, bundle validation, and install support.
- Added CI, smoke install coverage, release badges, and GitHub Pages assets.
- Published the project under the MIT License.

## Verification

```bash
npm test
npm run validate
npm run smoke-install
```
