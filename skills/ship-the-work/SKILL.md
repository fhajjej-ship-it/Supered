---
name: ship-the-work
description: Use when work may be committed, pushed, tagged, released, published, deployed, or handed off publicly.
---

# Ship The Work

Shipping is product behavior. A commit, tag, package, release, or public URL is not done until the intended remote target confirms it.

## Trigger

Use this for staging, committing, pushing, creating GitHub repos, creating tags or releases, publishing npm packages, enabling Pages, deploying sites, or giving the user a public link.

## Do Not Use When

Do not ship uncommitted exploratory work. Do not publish a package or release because local tests pass. Do not push if the worktree contains unrelated user changes unless the user explicitly includes them.

## Required Inputs

- Intended remote target: repository, branch, registry, package, release, or site.
- Clean understanding of changed files.
- Verification commands for the changed surface.
- Auth status for GitHub, npm, deploy provider, or other remote.
- Version/tag strategy.
- Rollback or correction path when possible.

## Operating Procedure

1. Inspect `git status --short --branch`.
2. Review the diff and staged scope. Separate unrelated local changes.
3. Run relevant checks before staging or publishing:
   - code/package: `npm test`, `npm run validate`, `npm run verify-package`
   - website: `npm run verify-site`
   - shell installer: `sh -n install.sh` and install smoke checks
4. Scan for obvious secrets in intended files.
5. Stage only intended files. Check `git diff --cached --stat` and `git diff --cached --check`.
6. Commit with a concise message that names the user-visible change.
7. Push and verify remote branch state.
8. For releases, create the release/tag only after the matching commit is pushed.
9. For npm, verify name/version availability, run dry-run publish, publish, then verify `npm view` and real `npx` install from a clean temp directory.
10. For sites, poll deployment until the public URL returns expected content.

## Output Contract

```text
Changed:
Checks before ship:
Commit:
Remote:
Release/package/site:
Post-ship verification:
Blocked or follow-up:
```

## Guardrails

- Stop if auth is missing; do not fake a publish with dry-run output.
- Never paste or request secrets, OTPs, passwords, or tokens in chat.
- Do not tag or announce a release before the remote artifact exists.
- Do not stage ignored generated output unless it is intentionally shipped.
- Do not call a repository public until the hosting service says it is not private.

## Failure Modes

- **Premature announcement:** README advertises `npx` before npm publish succeeds. Fix by publishing first or holding the push.
- **Mixed worktree:** Unrelated files get staged. Fix by explicit path staging.
- **Local-only release:** A tag exists locally but not remotely. Fix by checking remote release metadata.
- **Unverified install:** Package publishes but CLI bin fails. Fix by testing from a clean temp directory.

## Quality Gates

- Local and remote states match.
- Public artifacts are reachable.
- The final answer includes commit/release/package URLs when relevant.
- The user knows exactly what, if anything, remains blocked.

## Activation Prompts

```text
Use Supered to ship this work with a clean public handoff.
```

```text
Use Supered to commit, push, and verify the remote result.
```

```text
Use Supered to publish this release only after the matching commit and checks are proven.
```

## Output Examples

Useful output:

```text
Changed:
- Added docs/beta-outreach.md and public links.
Checks before ship:
- npm test, validate, verify-codex-plugin, verify-site.
Commit:
- 507291d Add beta outreach kit.
Remote:
- main pushed to GitHub and CI passed.
Release/package/site:
- Pages deployment passed and live site shows the new link.
Post-ship verification:
- raw GitHub doc and public site both return expected text.
Blocked or follow-up:
- No npm release was created for this docs-only change.
```

Weak output:

```text
Pushed. Done.
```

The weak output omits staged scope, verification, remote status, public URLs, and remaining release state.

## Example

Good:

```text
Checks: npm test, validate, smoke-install, verify-package, verify-site.
Commit: 89f9a8a Prepare npm package install path.
Package: npm view supered@latest confirms bin.
Post-ship: npx install from empty temp dir succeeds.
```

Bad: pushing a tag after `npm publish` failed on OTP, then telling the user `npx` is ready.
