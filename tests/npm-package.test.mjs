import test from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

import { SKILL_ORDER } from "../lib/manifest.js";
import {
  EXCLUDED_PACKAGE_PREFIXES,
  PACKAGE_TARGETS,
  REQUIRED_PACKAGE_FILES,
  verifyNpmPackage
} from "../lib/package-verification.js";

const execFileAsync = promisify(execFile);
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

test("package metadata is ready for public npm publishing", async () => {
  const packageJson = JSON.parse(await readFile(join(root, "package.json"), "utf8"));

  assert.equal(packageJson.name, "supered");
  assert.equal(packageJson.publishConfig.access, "public");
  assert.equal(packageJson.bin.supered, "bin/supered.mjs");
  assert.equal(packageJson.scripts["verify-package"], "node ./scripts/verify-npm-package.mjs");
  assert.deepEqual(packageJson.files, REQUIRED_PACKAGE_FILES);
});

test("npm pack includes installable assets and excludes local-only harness files", async () => {
  const { stdout } = await execFileAsync("npm", ["pack", "--dry-run", "--json"], { cwd: root });
  const [pack] = JSON.parse(stdout);
  const files = pack.files.map((file) => file.path);

  assert.ok(files.includes("bin/supered.mjs"));
  assert.ok(files.includes("skills/using-supered/SKILL.md"));
  assert.ok(files.includes("install.sh"));
  assert.ok(files.includes("docs/hosts/codex.md"));
  assert.ok(files.includes(".codex-plugin/plugin.json"));
  for (const prefix of EXCLUDED_PACKAGE_PREFIXES) {
    assert.ok(!files.some((file) => file.startsWith(prefix)));
  }
});

test("Package Verification returns structured npx-style install proof", async () => {
  const result = await verifyNpmPackage({ root });

  assert.equal(result.packageName, "supered");
  assert.deepEqual(result.installedTargets, PACKAGE_TARGETS);
  assert.deepEqual(result.installedSkills, SKILL_ORDER);
  assert.deepEqual(result.missingRequiredFiles, []);
  assert.deepEqual(result.excludedFileViolations, []);
  assert.ok(result.files.includes("bin/supered.mjs"));
});
