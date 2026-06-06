import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { validateReleaseBundle } from "../lib/release-bundle.js";
import { HOST_TARGETS } from "../lib/supered-policy.js";

const root = resolve(import.meta.dirname, "..");

test("Release Bundle validation owns ship-readiness checks", async () => {
  const packageJson = JSON.parse(await readFile(resolve(root, "package.json"), "utf8"));
  const result = await validateReleaseBundle(root);

  assert.deepEqual(result.errors, []);
  assert.equal(result.version, packageJson.version);
  assert.deepEqual(result.hostTargets, Object.keys(HOST_TARGETS));
  for (const path of [
    "package.json",
    ".github/workflows/ci.yml",
    "RELEASE_NOTES.md",
    "docs/roadmap.md",
    "docs/marketplace-checklist.md",
    "docs/hosts/codex.md",
    "docs/hosts/claude.md",
    "docs/hosts/cursor.md",
    "docs/hosts/gemini.md",
    "docs/hosts/opencode.md"
  ]) {
    assert.ok(result.checked.includes(path), `${path} should be checked`);
  }
});
