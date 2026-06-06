#!/usr/bin/env node
import { mkdtemp, rm, stat } from "node:fs/promises";
import { execFile } from "node:child_process";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

import { SKILL_ORDER } from "../lib/manifest.js";

const execFileAsync = promisify(execFile);
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const tempRoot = await mkdtemp(join(tmpdir(), "supered-smoke-"));
const dest = join(tempRoot, "skills");

try {
  await execFileAsync("node", ["./bin/supered.mjs", "install", "--target", "codex", "--dest", dest], {
    cwd: root
  });

  for (const skill of SKILL_ORDER) {
    await stat(join(dest, skill, "SKILL.md"));
  }

  console.log(`Smoke install passed: ${SKILL_ORDER.length} skills copied to an isolated temp directory.`);
} finally {
  await rm(tempRoot, { recursive: true, force: true });
}
