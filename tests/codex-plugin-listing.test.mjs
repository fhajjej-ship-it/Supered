import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import {
  CODEX_GLOBAL_SUBMISSION_DOC,
  CODEX_PLUGIN_BUNDLE_FILES,
  CODEX_PLUGIN_LISTING_DOC,
  CODEX_PUBLIC_MARKETPLACE_FILE,
  CODEX_PUBLIC_PLUGIN_ROOT,
  validateCodexPluginListing
} from "../lib/codex-plugin-listing.js";

const root = resolve(import.meta.dirname, "..");

test("Codex plugin listing metadata is complete and source-backed", async () => {
  const result = await validateCodexPluginListing(root);

  assert.deepEqual(result.errors, []);
  assert.equal(result.listing.name, "supered");
  assert.equal(result.listing.displayName, "Supered");
  assert.equal(result.listing.skillsPath, "./skills/");
  assert.equal(result.skills.length, 7);
  assert.deepEqual(result.bundleFiles, CODEX_PLUGIN_BUNDLE_FILES);

  for (const path of [
    ".codex-plugin/plugin.json",
    CODEX_PUBLIC_MARKETPLACE_FILE,
    `${CODEX_PUBLIC_PLUGIN_ROOT}/.codex-plugin/plugin.json`,
    "assets/supered-plugin-logo.svg",
    "assets/supered-mark.svg",
    "docs/preview.svg",
    CODEX_PLUGIN_LISTING_DOC,
    CODEX_GLOBAL_SUBMISSION_DOC,
    "docs/privacy.html",
    "docs/terms.html",
    "README.md"
  ]) {
    assert.ok(result.checked.includes(path), `${path} should be checked`);
  }
});

test("Codex plugin listing docs explain public and local plugin paths", async () => {
  const docs = await readFile(resolve(root, CODEX_PLUGIN_LISTING_DOC), "utf8");

  assert.match(docs, /Codex plugin directory/);
  assert.match(docs, /Create a new plugin/);
  assert.match(docs, /Workspace settings/);
  assert.match(docs, /codex plugin marketplace add fhajjej-ship-it\/Supered/);
  assert.match(docs, /codex plugin add supered@supered/);
  assert.match(docs, /codex plugin add supered@personal/);
  assert.match(docs, /npx supered@latest install --target codex/);
});

test("global Codex submission packet includes review and compliance details", async () => {
  const docs = await readFile(resolve(root, CODEX_GLOBAL_SUBMISSION_DOC), "utf8");
  const plugin = JSON.parse(await readFile(resolve(root, ".codex-plugin/plugin.json"), "utf8"));

  assert.equal(plugin.interface.privacyPolicyURL, "https://fhajjej-ship-it.github.io/Supered/privacy.html");
  assert.equal(plugin.interface.termsOfServiceURL, "https://fhajjej-ship-it.github.io/Supered/terms.html");
  assert.match(docs, /Codex Global Plugin Directory Submission/);
  assert.match(docs, /supered@supered  installed, enabled  0\.6\.2/);
  assert.match(docs, /Supered is skills-only/);
  assert.match(docs, /does not request credentials/);
  assert.match(docs, /does not include an MCP server/);
});
