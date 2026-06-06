# Marketplace Checklist

Use this before submitting Supered to a host marketplace or plugin index.

## Core Assets

- [x] Public GitHub repository.
- [x] MIT license.
- [x] Product logo at `1.svg`.
- [x] Preview image at `docs/preview.svg`.
- [x] Landing page at `https://fhajjej-ship-it.github.io/Supered/`.
- [x] CI workflow with tests, validation, smoke install, and browser site verification.

## Host Metadata

- [x] Codex metadata in `.codex-plugin/plugin.json`.
- [x] Claude metadata in `.claude-plugin/plugin.json`.
- [x] Cursor metadata in `.cursor-plugin/plugin.json`.
- [x] Gemini metadata in `gemini-extension.json`.
- [x] OpenCode install notes in `.opencode/INSTALL.md`.

## Install Documentation

- [x] One-line installer in `install.sh`.
- [x] Codex host docs in `docs/hosts/codex.md`.
- [x] Claude host docs in `docs/hosts/claude.md`.
- [x] Cursor host docs in `docs/hosts/cursor.md`.
- [x] Gemini host docs in `docs/hosts/gemini.md`.
- [x] OpenCode host docs in `docs/hosts/opencode.md`.

## Submission Notes

- Confirm marketplace-specific directory naming before submission.
- Confirm each host's current skill or plugin packaging rules.
- Keep screenshots and descriptions aligned with the shipped skill list.
- Run `npm test`, `npm run validate`, `npm run smoke-install`, and `npm run verify-site` before submission.
