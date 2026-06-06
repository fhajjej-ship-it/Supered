import test from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

import { SKILL_ORDER } from "../lib/manifest.js";

const execFileAsync = promisify(execFile);
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const npmPackEnv = {
  ...process.env,
  npm_config_dry_run: "false"
};

test("package metadata is ready for public npm publishing", async () => {
  const packageJson = JSON.parse(await readFile(join(root, "package.json"), "utf8"));

  assert.equal(packageJson.name, "supered");
  assert.equal(packageJson.publishConfig.access, "public");
  assert.equal(packageJson.bin.supered, "bin/supered.mjs");
  assert.equal(packageJson.scripts["verify-package"], "node ./scripts/verify-npm-package.mjs");
  assert.deepEqual(packageJson.files, [
    ".claude-plugin/",
    ".codex-plugin/",
    ".cursor-plugin/",
    ".opencode/",
    "1.svg",
    "assets/",
    "bin/",
    "docs/",
    "gemini-extension.json",
    "install.sh",
    "lib/",
    "skills/",
    "README.md",
    "LICENSE"
  ]);
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
  assert.ok(!files.some((file) => file.startsWith("tests/")));
  assert.ok(!files.some((file) => file.startsWith("artifacts/")));
  assert.ok(!files.some((file) => file.startsWith("node_modules/")));
});

test("packed npm tarball supports npx-style install for every target", async () => {
  const tempRoot = await mkdtemp(join(tmpdir(), "supered-npm-pack-"));
  const packageJson = JSON.parse(await readFile(join(root, "package.json"), "utf8"));
  const tarballName = `supered-${packageJson.version}.tgz`;

  try {
    await execFileAsync("npm", ["pack", "--pack-destination", tempRoot], { cwd: root, env: npmPackEnv });
    const tarball = join(tempRoot, tarballName);
    await stat(tarball);

    for (const target of ["codex", "claude", "cursor", "gemini", "opencode"]) {
      const dest = join(tempRoot, target);
      const { stdout } = await execFileAsync(
        "npm",
        ["exec", "--yes", "--package", tarball, "--", "supered", "install", "--target", target, "--dest", dest],
        { cwd: root, env: npmPackEnv }
      );

      assert.match(stdout, new RegExp(`Installed Supered skills for ${target}`));
      for (const skill of SKILL_ORDER) {
        await stat(join(dest, skill, "SKILL.md"));
      }
    }
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});
