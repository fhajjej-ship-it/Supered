# Supered v0.6.3

Reviewer proof pack release.

## Highlights

- Added a reviewer FAQ that explains Supered's skills-only design, privacy posture, capabilities, and review path.
- Added a 5-minute demo script for showing the Supered workflow after installation.
- Added a beta feedback log for tracking install results, user notes, and follow-up actions.
- Mirrored the reviewer docs into the public Codex plugin bundle.
- Updated README and site links so reviewers can reach the proof pack from the public surfaces.

## Verification

```bash
npm test
npm run validate
npm run smoke-install
npm run verify-package
npm run verify-codex-plugin
npm run verify-site
npm audit --audit-level=high
```

# Supered v0.6.2

Plugin logo sizing release.

## Highlights

- Added `assets/supered-plugin-logo.svg`, a tight-cropped plugin logo that fills the Codex marketplace tile more clearly.
- Updated the Codex plugin manifest and public marketplace mirror to use the new logo asset.
- Kept `1.svg` unchanged for the website and source logo.
- Extended Codex plugin verification to require the dedicated plugin logo asset.

## Verification

```bash
npm test
npm run validate
npm run smoke-install
npm run verify-package
npm run verify-codex-plugin
npm run verify-site
npm audit --audit-level=high
```

# Supered v0.6.1

Global Codex submission packet release.

## Highlights

- Added `docs/codex-global-listing-submission.md` with reviewer-ready listing copy, install steps, verification evidence, security notes, and privacy details.
- Added Supered-owned privacy and terms pages under the public site.
- Updated Codex plugin metadata to point at the Supered privacy and terms pages.
- Extended Codex plugin verification to check the global submission packet and compliance URLs.
- Extended site verification to load the privacy and terms pages in Chromium.

## Verification

```bash
npm test
npm run validate
npm run smoke-install
npm run verify-package
npm run verify-codex-plugin
npm run verify-site
npm audit --audit-level=high
```

# Supered v0.6.0

Public Codex marketplace release.

## Highlights

- Added a public Codex marketplace manifest at `.agents/plugins/marketplace.json`.
- Added a public Codex plugin bundle at `plugins/supered` so users can add the GitHub repo as a Codex marketplace.
- Added `npm run verify-codex-plugin` to prove the Codex manifest, public marketplace entry, mirrored plugin bundle, listing docs, assets, and shipped skills stay aligned.
- Added CI coverage for Codex plugin listing readiness.
- Documented the public Git marketplace path: `codex plugin marketplace add fhajjej-ship-it/Supered --ref main`.

## Verification

```bash
npm test
npm run validate
npm run smoke-install
npm run verify-package
npm run verify-codex-plugin
npm run verify-site
npm audit --audit-level=high
```

# Supered v0.5.0

Upgrade Plan release.

## Highlights

- Added `supered upgrade --target <host>` to compare the running package, npm latest, and Install Health.
- Added `supered upgrade --all` to inspect every supported host target from the current home directory.
- Added `supered upgrade --apply` to repair local installs or delegate to `supered@latest` when a newer package exists.
- Added JSON output for Upgrade Plans and apply results.
- Extended Package Verification so the npm tarball proves `install`, `doctor`, `doctor --fix`, and `upgrade --apply` for every supported host target.

## Verification

```bash
npm test
npm run validate
npm run smoke-install
npm run verify-package
npm run verify-site
npm audit --audit-level=high
```

# Supered v0.4.0

Install Repair release.

## Highlights

- Added `supered doctor --fix` to repair missing or changed Supered skill files after an Install Health check.
- Preserves unrelated destination files while restoring managed Supered skill folders from the current package.
- Refuses unsafe symlink situations instead of repairing through them.
- Supports `--json` for repair results, including fixed skills and refused issues.
- Extended Package Verification so the npm tarball proves `install`, `doctor`, and `doctor --fix` for every supported host target.

## Verification

```bash
npm test
npm run validate
npm run smoke-install
npm run verify-package
npm run verify-site
npm audit --audit-level=high
```

# Supered v0.3.0

Install Health release.

## Highlights

- Added `supered doctor --target <host>` to inspect installed Supered skills without modifying files.
- Added JSON doctor output for automation with `supered doctor --target codex --json`.
- Detects missing skill files, changed or outdated skill files, missing destinations, symlinked destinations, and symlinks inside managed skill folders.
- Added Doctor coverage to Package Verification so the npm tarball proves both `install` and `doctor` for every supported host target.
- Documented Install Health in `CONTEXT.md`, README, and install docs.

## Verification

```bash
npm test
npm run validate
npm run smoke-install
npm run verify-package
npm run verify-site
npm audit --audit-level=high
```

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
