import test from "node:test";
import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, stat, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { installSuperedSkills } from "../lib/host-install.js";
import { inspectSuperedInstall, repairSuperedInstall } from "../lib/install-doctor.js";
import { SKILL_ORDER } from "../lib/supered-policy.js";

async function fakeBundle() {
  const root = await mkdtemp(join(tmpdir(), "supered-doctor-bundle-"));
  const skillsDir = join(root, "skills");
  await mkdir(skillsDir);

  for (const skill of SKILL_ORDER) {
    const skillDir = join(skillsDir, skill);
    await mkdir(skillDir);
    await writeFile(join(skillDir, "SKILL.md"), `# ${skill}\n\nInstalled from the test bundle.\n`);
  }

  return root;
}

test("Install Doctor reports a healthy Host Install", async () => {
  const root = await fakeBundle();
  const dest = await mkdtemp(join(tmpdir(), "supered-doctor-dest-"));
  await installSuperedSkills({ root, target: "codex", dest });

  const result = await inspectSuperedInstall({ root, target: "codex", dest });

  assert.equal(result.status, "ok");
  assert.equal(result.target, "codex");
  assert.equal(result.dest, dest);
  assert.deepEqual(result.issues, []);
  assert.deepEqual(result.installedSkills, SKILL_ORDER);
  assert.match(result.fixCommand, /npx supered@latest install --target codex --dest /);
});

test("Install Doctor reports missing and changed Skill Bundle files", async () => {
  const root = await fakeBundle();
  const dest = await mkdtemp(join(tmpdir(), "supered-doctor-dest-"));
  await installSuperedSkills({ root, target: "codex", dest });
  await rm(join(dest, "using-supered", "SKILL.md"));
  await writeFile(join(dest, "shape-the-task", "SKILL.md"), "# shape-the-task\n\nOld local copy.\n");

  const result = await inspectSuperedInstall({ root, target: "codex", dest });

  assert.equal(result.status, "issues");
  assert.deepEqual(result.missingSkills, ["using-supered"]);
  assert.deepEqual(result.changedSkills, ["shape-the-task"]);
  assert.deepEqual(result.issues.map((issue) => issue.code), ["missing-skill", "changed-skill"]);
});

test("Install Doctor reports default destinations and unsafe symlinks", async () => {
  const root = await fakeBundle();
  const home = await mkdtemp(join(tmpdir(), "supered-doctor-home-"));
  const installed = await installSuperedSkills({ root, target: "gemini", home });
  await symlink("/tmp", join(installed.dest, "make-a-map", "linked"));

  const result = await inspectSuperedInstall({ root, target: "gemini", home });

  assert.equal(result.dest, join(home, ".gemini", "skills"));
  assert.equal(result.status, "issues");
  assert.equal(result.issues[0].code, "unsafe-symlink");
  assert.match(result.issues[0].message, /make-a-map/);
});

test("Install Doctor reports a symlinked destination path", async () => {
  const root = await fakeBundle();
  const realDest = await mkdtemp(join(tmpdir(), "supered-doctor-real-dest-"));
  const linkDest = join(await mkdtemp(join(tmpdir(), "supered-doctor-link-parent-")), "skills-link");
  await symlink(realDest, linkDest);

  const result = await inspectSuperedInstall({ root, target: "codex", dest: linkDest });

  assert.equal(result.status, "issues");
  assert.deepEqual(result.issues.map((issue) => issue.code), ["symlinked-destination"]);
});

test("Install Doctor repair fixes missing and changed Skill Bundle files", async () => {
  const root = await fakeBundle();
  const dest = await mkdtemp(join(tmpdir(), "supered-doctor-fix-dest-"));
  await writeFile(join(dest, "unrelated.txt"), "keep me");
  await installSuperedSkills({ root, target: "codex", dest });
  await rm(join(dest, "using-supered", "SKILL.md"));
  await writeFile(join(dest, "shape-the-task", "SKILL.md"), "# shape-the-task\n\nOld local copy.\n");

  const result = await repairSuperedInstall({ root, target: "codex", dest });

  assert.equal(result.status, "fixed");
  assert.deepEqual(result.fixedSkills, ["using-supered", "shape-the-task"]);
  assert.deepEqual(result.refusedIssues, []);
  assert.deepEqual(result.after.issues, []);
  await stat(join(dest, "unrelated.txt"));
  assert.equal(await readFile(join(dest, "shape-the-task", "SKILL.md"), "utf8"), "# shape-the-task\n\nInstalled from the test bundle.\n");
});

test("Install Doctor repair creates a missing destination", async () => {
  const root = await fakeBundle();
  const dest = join(await mkdtemp(join(tmpdir(), "supered-doctor-fix-parent-")), "missing-skills");

  const result = await repairSuperedInstall({ root, target: "codex", dest });

  assert.equal(result.status, "fixed");
  assert.ok(result.fixedSkills.includes("using-supered"));
  await stat(join(dest, "using-supered", "SKILL.md"));
});

test("Install Doctor repair refuses unsafe symlink issues", async () => {
  const root = await fakeBundle();
  const dest = await mkdtemp(join(tmpdir(), "supered-doctor-fix-symlink-"));
  await installSuperedSkills({ root, target: "codex", dest });
  await symlink("/tmp", join(dest, "make-a-map", "linked"));

  const result = await repairSuperedInstall({ root, target: "codex", dest });

  assert.equal(result.status, "refused");
  assert.deepEqual(result.fixedSkills, []);
  assert.deepEqual(result.refusedIssues.map((issue) => issue.code), ["unsafe-symlink"]);
});
