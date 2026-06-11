# Codex Plugin Listing

Supered is ready to be used as a Codex plugin bundle, but appearing in the public Codex plugin directory is not automatic from GitHub or npm. Codex exposes plugins through the plugin UI, and public or workspace availability is controlled by the Codex/OpenAI plugin flow.

Official references:

- Codex Academy says users can open Plugins from the top-left of Codex, browse the plugin library, or Create a new plugin: https://openai.com/academy/codex-plugins-and-skills/
- The Codex plugin help article describes app/plugin setup through Workspace settings, Apps, access assignment, testing, and publishing: https://help.openai.com/hu-hu/articles/20001256-plugins-in-codex
- OpenAI describes plugins as installable from the Codex plugin directory: https://openai.com/index/codex-for-every-role-tool-workflow/

## Listing Metadata

- Name: `supered`
- Display name: `Supered`
- Category: `Coding`
- Repository: https://github.com/fhajjej-ship-it/Supered
- Npm package: https://www.npmjs.com/package/supered
- Website: https://fhajjej-ship-it.github.io/Supered/
- Manifest: `.codex-plugin/plugin.json`
- Skills path: `./skills/`
- Logo: `assets/supered-plugin-logo.svg`
- Composer icon: `assets/supered-mark.svg`
- Screenshot: `docs/preview.svg`

## Public Directory Path

Use this checklist before submitting or creating the plugin in Codex:

- Use `docs/codex-global-listing-submission.md` as the review packet.
- Confirm the GitHub repo is public: https://github.com/fhajjej-ship-it/Supered
- Confirm npm is public: https://www.npmjs.com/package/supered
- Run `npm run verify-codex-plugin`.
- Run the full release checks: `npm test`, `npm run validate`, `npm run smoke-install`, `npm run verify-package`, `npm run verify-codex-plugin`, `npm run verify-site`.
- In Codex, open Plugins from the top-left menu and choose Create a new plugin if the workspace exposes that flow.
- For a workspace plugin, use Workspace settings, then Apps, then test and publish according to the current Codex plugin help flow.
- Use `.codex-plugin/plugin.json` as the source of truth for listing copy and assets.

## Public Git Marketplace

The public GitHub repo also contains a Codex marketplace manifest at `.agents/plugins/marketplace.json` and a plugin bundle at `plugins/supered`. That gives reviewers and early users a public install path while the official directory listing is pending:

```bash
codex plugin marketplace add fhajjej-ship-it/Supered --ref v0.7.0
codex plugin add supered@supered
codex plugin list | grep 'supered@supered'
```

The marketplace name is `supered`; the plugin name is also `supered`.

## Local Codex Visibility

For local testing, put Supered into the personal marketplace and install it through the Codex CLI:

```bash
mkdir -p ~/.agents/plugins ~/plugins
node <<'JS'
const fs = require("node:fs");
const path = require("node:path");
const marketplacePath = path.join(process.env.HOME, ".agents/plugins/marketplace.json");
const payload = fs.existsSync(marketplacePath)
  ? JSON.parse(fs.readFileSync(marketplacePath, "utf8"))
  : { name: "personal", interface: { displayName: "Personal" }, plugins: [] };
payload.plugins = Array.isArray(payload.plugins) ? payload.plugins : [];
const entry = {
  name: "supered",
  source: { source: "local", path: "./plugins/supered" },
  policy: { installation: "AVAILABLE", authentication: "ON_INSTALL" },
  category: "Coding"
};
const index = payload.plugins.findIndex((plugin) => plugin && plugin.name === "supered");
if (index === -1) payload.plugins.push(entry);
else payload.plugins[index] = entry;
fs.writeFileSync(marketplacePath, JSON.stringify(payload, null, 2) + "\n");
JS
rsync -a --delete \
  --exclude .git \
  --exclude node_modules \
  --exclude artifacts \
  ./ ~/plugins/supered/
codex plugin add supered@personal
codex plugin list | grep 'supered@personal'
```

The expected personal marketplace entry is:

```json
{
  "name": "supered",
  "source": {
    "source": "local",
    "path": "./plugins/supered"
  },
  "policy": {
    "installation": "AVAILABLE",
    "authentication": "ON_INSTALL"
  },
  "category": "Coding"
}
```

After installing or reinstalling a local plugin, start a new Codex thread so the app can pick up the plugin's skills and metadata.

## Skill Install Fallback

If plugin creation is unavailable in a workspace, install the Codex skills directly:

```bash
npx supered@latest install --target codex
npx supered@latest doctor --target codex
npx supered@latest upgrade --target codex
```
