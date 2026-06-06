import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import {
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
    "1.svg",
    "assets/supered-mark.svg",
    "docs/preview.svg",
    CODEX_PLUGIN_LISTING_DOC,
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
