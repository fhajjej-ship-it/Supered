import test from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdir, mkdtemp, readFile, stat, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

import { SKILL_ORDER } from "../lib/manifest.js";

const execFileAsync = promisify(execFile);
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

async function fakeShellBundle({ missingSkill, symlinkSkill } = {}) {
  const bundleRoot = await mkdtemp(join(tmpdir(), "supered-shell-source-"));
  const skillsDir = join(bundleRoot, "skills");
  await mkdir(skillsDir);

  for (const skill of SKILL_ORDER) {
    const skillDir = join(skillsDir, skill);
    await mkdir(skillDir);
    if (skill !== missingSkill) {
      await writeFile(join(skillDir, "SKILL.md"), `# ${skill}\n`);
    }
  }

  const scratch = join(skillsDir, "scratch-skill");
  await mkdir(scratch);
  await writeFile(join(scratch, "SKILL.md"), "# scratch\n");

  if (symlinkSkill) {
    await symlink("/tmp", join(skillsDir, symlinkSkill, "linked"));
  }

  return bundleRoot;
}

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

test("install.sh copies only ordered Supered skills", async () => {
  const source = await fakeShellBundle();
  const dest = await mkdtemp(join(tmpdir(), "supered-installer-ordered-"));
  await execFileAsync("sh", ["install.sh", "--target", "codex", "--dest", dest], {
    cwd: root,
    env: {
      ...process.env,
      SUPERED_SOURCE_DIR: source
    }
  });

  for (const skill of SKILL_ORDER) {
    await stat(join(dest, skill, "SKILL.md"));
  }
  await assert.rejects(stat(join(dest, "scratch-skill", "SKILL.md")));
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

test("install.sh rejects unsafe Host Install inputs", async () => {
  const missingSource = await fakeShellBundle({ missingSkill: "using-supered" });
  const missingDest = await mkdtemp(join(tmpdir(), "supered-installer-missing-"));
  await assert.rejects(
    execFileAsync("sh", ["install.sh", "--target", "codex", "--dest", missingDest], {
      cwd: root,
      env: {
        ...process.env,
        SUPERED_SOURCE_DIR: missingSource
      }
    }),
    /Missing skill file/
  );

  const symlinkSource = await fakeShellBundle({ symlinkSkill: "shape-the-task" });
  const symlinkDest = await mkdtemp(join(tmpdir(), "supered-installer-symlink-"));
  await assert.rejects(
    execFileAsync("sh", ["install.sh", "--target", "codex", "--dest", symlinkDest], {
      cwd: root,
      env: {
        ...process.env,
        SUPERED_SOURCE_DIR: symlinkSource
      }
    }),
    /Refusing to install symlink/
  );

  const realDest = await mkdtemp(join(tmpdir(), "supered-installer-real-dest-"));
  const linkDest = join(await mkdtemp(join(tmpdir(), "supered-installer-link-parent-")), "skills-link");
  await symlink(realDest, linkDest);
  await assert.rejects(
    execFileAsync("sh", ["install.sh", "--target", "codex", "--dest", linkDest], {
      cwd: root,
      env: {
        ...process.env,
        SUPERED_SOURCE_DIR: root
      }
    }),
    /symlinked destination/
  );
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
  const betaInstall = await readFile(join(root, "BETA_INSTALL.md"), "utf8");
  const examples = await readFile(join(root, "docs", "examples.md"), "utf8");
  const reviewerFaq = await readFile(join(root, "docs", "reviewer-faq.md"), "utf8");
  const demoScript = await readFile(join(root, "docs", "demo-script.md"), "utf8");
  const feedbackLog = await readFile(join(root, "docs", "feedback-log.md"), "utf8");
  const bug = await readFile(join(root, ".github", "ISSUE_TEMPLATE", "bug_report.md"), "utf8");
  const skill = await readFile(join(root, ".github", "ISSUE_TEMPLATE", "skill_request.md"), "utf8");
  const compatibility = await readFile(join(root, ".github", "ISSUE_TEMPLATE", "compatibility_report.md"), "utf8");
  const installFeedback = await readFile(join(root, ".github", "ISSUE_TEMPLATE", "install_feedback.md"), "utf8");
  const config = await readFile(join(root, ".github", "ISSUE_TEMPLATE", "config.yml"), "utf8");

  assert.match(checklist, /Codex/);
  assert.match(checklist, /Claude/);
  assert.match(checklist, /Cursor/);
  assert.match(checklist, /Gemini/);
  assert.match(checklist, /OpenCode/);
  assert.match(contributing, /npm test/);
  assert.match(betaInstall, /60-second/);
  assert.match(betaInstall, /codex plugin marketplace add fhajjej-ship-it\/Supered --ref v0\.6\.2/);
  assert.match(betaInstall, /supered@supered  installed, enabled  0\.6\.2/);
  assert.match(examples, /Use Supered to debug/);
  assert.match(examples, /Use Supered to ship/);
  assert.match(reviewerFaq, /Reviewer FAQ/);
  assert.match(reviewerFaq, /skills-only/);
  assert.match(reviewerFaq, /does not collect plugin usage data/);
  assert.match(demoScript, /5-minute demo/);
  assert.match(demoScript, /Expected behavior/);
  assert.match(feedbackLog, /Beta Feedback Log/);
  assert.match(feedbackLog, /Install result/);
  assert.match(bug, /Expected behavior/);
  assert.match(skill, /Workflow/);
  assert.match(compatibility, /Agent host/);
  assert.match(installFeedback, /60-second install result/);
  assert.match(installFeedback, /codex plugin list/);
  assert.match(config, /blank_issues_enabled: false/);
});

test("README exposes the one-line installer and host docs", async () => {
  const readme = await readFile(join(root, "README.md"), "utf8");

  assert.match(readme, /curl -fsSL https:\/\/raw\.githubusercontent\.com\/fhajjej-ship-it\/Supered\/main\/install\.sh \| sh/);
  assert.match(readme, /npx supered install --target codex/);
  assert.match(readme, /docs\/hosts\/codex\.md/);
  assert.match(readme, /docs\/marketplace-checklist\.md/);
  assert.match(readme, /BETA_INSTALL\.md/);
  assert.match(readme, /docs\/examples\.md/);
  assert.match(readme, /docs\/reviewer-faq\.md/);
  assert.match(readme, /docs\/demo-script\.md/);
  assert.match(readme, /docs\/feedback-log\.md/);
});
