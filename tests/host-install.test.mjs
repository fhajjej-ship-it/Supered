import test from "node:test";
import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, stat, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { installSuperedSkills } from "../lib/host-install.js";
import { defaultInstallDest, HOST_TARGETS, SKILL_ORDER } from "../lib/supered-policy.js";

async function fakeBundle() {
  const root = await mkdtemp(join(tmpdir(), "supered-host-install-"));
  const skillsDir = join(root, "skills");
  await mkdir(skillsDir);

  for (const skill of SKILL_ORDER) {
    const skillDir = join(skillsDir, skill);
    await mkdir(skillDir);
    await writeFile(join(skillDir, "SKILL.md"), `# ${skill}\n`);
  }

  const scratch = join(skillsDir, "scratch-skill");
  await mkdir(scratch);
  await writeFile(join(scratch, "SKILL.md"), "# scratch\n");

  return root;
}

test("policy owns supported host targets and default destinations", () => {
  assert.deepEqual(Object.keys(HOST_TARGETS), ["codex", "claude", "cursor", "gemini", "opencode"]);
  assert.equal(defaultInstallDest("codex", "/tmp/home"), "/tmp/home/.codex/skills");
  assert.equal(defaultInstallDest("opencode", "/tmp/home"), "/tmp/home/.opencode/skills");
  assert.throws(() => defaultInstallDest("custom", "/tmp/home"), /Unsupported target/);
});

test("host install returns a structured result and copies only ordered Supered skills", async () => {
  const root = await fakeBundle();
  const dest = await mkdtemp(join(tmpdir(), "supered-dest-"));
  await writeFile(join(dest, "unrelated.txt"), "keep me");

  const result = await installSuperedSkills({ root, target: "custom-label", dest });

  assert.deepEqual(result, {
    target: "custom-label",
    dest,
    installedSkills: SKILL_ORDER
  });
  for (const skill of SKILL_ORDER) {
    assert.equal(await readFile(join(dest, skill, "SKILL.md"), "utf8"), `# ${skill}\n`);
  }
  await stat(join(dest, "unrelated.txt"));
  await assert.rejects(stat(join(dest, "scratch-skill", "SKILL.md")));
});

test("host install derives default destinations only for supported targets", async () => {
  const root = await fakeBundle();
  const home = await mkdtemp(join(tmpdir(), "supered-home-"));

  const result = await installSuperedSkills({ root, target: "gemini", home });
  assert.equal(result.dest, join(home, ".gemini", "skills"));
  await stat(join(result.dest, "using-supered", "SKILL.md"));

  await assert.rejects(installSuperedSkills({ root, target: "custom", home }), /Unsupported target/);
});

test("host install rejects missing skill files and symlinks in the source skill tree", async () => {
  const missingRoot = await fakeBundle();
  await writeFile(join(missingRoot, "skills", "using-supered", "README.md"), "not enough");
  await import("node:fs/promises").then(({ rm }) => rm(join(missingRoot, "skills", "using-supered", "SKILL.md")));

  await assert.rejects(
    installSuperedSkills({ root: missingRoot, target: "codex", dest: await mkdtemp(join(tmpdir(), "supered-dest-")) }),
    /Missing skill file/
  );

  const symlinkRoot = await fakeBundle();
  await symlink("/tmp", join(symlinkRoot, "skills", "shape-the-task", "linked"));

  await assert.rejects(
    installSuperedSkills({ root: symlinkRoot, target: "codex", dest: await mkdtemp(join(tmpdir(), "supered-dest-")) }),
    /Refusing to install symlink/
  );
});

test("host install rejects a symlinked destination path", async () => {
  const root = await fakeBundle();
  const realDest = await mkdtemp(join(tmpdir(), "supered-real-dest-"));
  const linkDest = join(await mkdtemp(join(tmpdir(), "supered-link-parent-")), "skills-link");
  await symlink(realDest, linkDest);

  await assert.rejects(installSuperedSkills({ root, target: "codex", dest: linkDest }), /symlinked destination/);
});

test("host install rejects symlinked managed skill destinations", async () => {
  const root = await fakeBundle();
  const dest = await mkdtemp(join(tmpdir(), "supered-dest-"));
  const realSkillDest = await mkdtemp(join(tmpdir(), "supered-real-skill-dest-"));
  await symlink(realSkillDest, join(dest, "using-supered"));

  await assert.rejects(
    installSuperedSkills({ root, target: "codex", dest }),
    /symlinked destination/
  );
});
