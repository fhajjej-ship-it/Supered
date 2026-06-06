import test from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, readFile, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

import { SKILL_ORDER } from "../lib/manifest.js";

const execFileAsync = promisify(execFile);
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

test("install.sh documents one-line remote install and supports help", async () => {
  const installer = await readFile(join(root, "install.sh"), "utf8");
  const { stdout } = await execFileAsync("sh", ["install.sh", "--help"], { cwd: root });

  assert.match(installer, /raw\.githubusercontent\.com\/fhajjej-ship-it\/Supered/);
  assert.match(stdout, /SUPERED_TARGET/);
  assert.match(stdout, /--target codex/);
});

test("install.sh installs all skills from a local source directory", async () => {
  const dest = await mkdtemp(join(tmpdir(), "supered-installer-"));
  const { stdout } = await execFileAsync("sh", ["install.sh", "--target", "codex", "--dest", dest], {
    cwd: root,
    env: {
      ...process.env,
      SUPERED_SOURCE_DIR: root
    }
  });

  assert.match(stdout, /Installed Supered/);
  for (const skill of SKILL_ORDER) {
    await stat(join(dest, skill, "SKILL.md"));
  }
});

test("install.sh allows a custom target label with an explicit destination", async () => {
  const dest = await mkdtemp(join(tmpdir(), "supered-installer-custom-"));
  const { stdout } = await execFileAsync("sh", ["install.sh", "--target", "zed", "--dest", dest], {
    cwd: root,
    env: {
      ...process.env,
      SUPERED_SOURCE_DIR: root
    }
  });

  assert.match(stdout, /Installed Supered for zed/);
  await stat(join(dest, "using-supered", "SKILL.md"));
});

test("host docs cover every supported install target", async () => {
  const hosts = ["codex", "claude", "cursor", "gemini", "opencode"];

  for (const host of hosts) {
    const doc = await readFile(join(root, "docs", "hosts", `${host}.md`), "utf8");
    assert.match(doc, new RegExp(`# .*${host}`, "i"));
    assert.match(doc, /install\.sh/);
    assert.match(doc, /SUPERED_TARGET|--target/);
  }
});

test("repo has marketplace and contribution readiness artifacts", async () => {
  const checklist = await readFile(join(root, "docs", "marketplace-checklist.md"), "utf8");
  const contributing = await readFile(join(root, "CONTRIBUTING.md"), "utf8");
  const bug = await readFile(join(root, ".github", "ISSUE_TEMPLATE", "bug_report.md"), "utf8");
  const skill = await readFile(join(root, ".github", "ISSUE_TEMPLATE", "skill_request.md"), "utf8");
  const compatibility = await readFile(join(root, ".github", "ISSUE_TEMPLATE", "compatibility_report.md"), "utf8");
  const config = await readFile(join(root, ".github", "ISSUE_TEMPLATE", "config.yml"), "utf8");

  assert.match(checklist, /Codex/);
  assert.match(checklist, /Claude/);
  assert.match(checklist, /Cursor/);
  assert.match(checklist, /Gemini/);
  assert.match(checklist, /OpenCode/);
  assert.match(contributing, /npm test/);
  assert.match(bug, /Expected behavior/);
  assert.match(skill, /Workflow/);
  assert.match(compatibility, /Agent host/);
  assert.match(config, /blank_issues_enabled: false/);
});

test("README exposes the one-line installer and host docs", async () => {
  const readme = await readFile(join(root, "README.md"), "utf8");

  assert.match(readme, /curl -fsSL https:\/\/raw\.githubusercontent\.com\/fhajjej-ship-it\/Supered\/main\/install\.sh \| sh/);
  assert.match(readme, /npx supered install --target codex/);
  assert.match(readme, /docs\/hosts\/codex\.md/);
  assert.match(readme, /docs\/marketplace-checklist\.md/);
});
