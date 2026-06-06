#!/usr/bin/env node
import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

import { SKILL_ORDER } from "../lib/manifest.js";

const execFileAsync = promisify(execFile);
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const tempRoot = await mkdtemp(join(tmpdir(), "supered-package-"));
const npmPackEnv = {
  ...process.env,
  npm_config_dry_run: "false"
};

try {
  const packageJson = JSON.parse(await readFile(join(root, "package.json"), "utf8"));
  const tarballName = `supered-${packageJson.version}.tgz`;
  await execFileAsync("npm", ["pack", "--pack-destination", tempRoot], { cwd: root, env: npmPackEnv });
  const tarball = join(tempRoot, tarballName);
  await stat(tarball);

  for (const target of ["codex", "claude", "cursor", "gemini", "opencode"]) {
    const dest = join(tempRoot, target);
    await execFileAsync(
      "npm",
      ["exec", "--yes", "--package", tarball, "--", "supered", "install", "--target", target, "--dest", dest],
      { cwd: root, env: npmPackEnv }
    );

    for (const skill of SKILL_ORDER) {
      await stat(join(dest, skill, "SKILL.md"));
    }
  }

  console.log(`Npm package verification passed: ${SKILL_ORDER.length} skills installed for 5 targets.`);
} finally {
  await rm(tempRoot, { recursive: true, force: true });
}
