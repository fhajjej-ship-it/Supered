# Supered Context

Supered is a small workflow product: a packaged set of agent skills, host installers, verification checks, and release artifacts that help coding agents clarify work, build in slices, prove changes, and ship cleanly.

## Domain Terms

**Skill Bundle** is the ordered set of Supered skills under `skills/`. The bundle is intentionally curated; install and package paths should copy the known Supered skills instead of every directory that happens to exist nearby.

**Host Install** is the operation that maps a host label to an install destination, validates the source skill tree, copies the Supered skill folders into the destination, and returns a structured install result. Command-line and shell installers are adapters around this behavior.

**Package Verification** is the npm-facing check that proves the published tarball contains the CLI, plugin metadata, docs, logo, and skill bundle while excluding local-only test and artifact files.

**Site Verification** is the browser-facing check that proves the documentation site renders, links to the install paths, and stays usable at desktop and mobile sizes.

**Eval Pack** is the scenario set under `docs/evals/` used to judge whether the skills produce operationally useful agent behavior instead of thin prompt paragraphs.

**Release Bundle** is the complete shippable state for a version: package metadata, host manifests, documentation, install paths, verification scripts, release notes, and the public repository commit.

## Host Install Invariants

- Default destinations are policy-owned for supported hosts: Codex, Claude, Cursor, Gemini, and OpenCode.
- A custom destination may use a custom target label, but the target label must still be present for reporting.
- The installer owns only Supered skill folders and leaves unrelated destination files alone.
- Source skill directories must contain `SKILL.md` and must not include symlinks.
- Existing symlinked destination paths are rejected before copying.
