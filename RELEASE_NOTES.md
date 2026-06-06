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
