import test from "node:test";
import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, stat, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { installSuperedSkills } from "../lib/host-install.js";
import { applySuperedUpgrade, planAllSuperedUpgrades, planSuperedUpgrade } from "../lib/upgrade-plan.js";
import { HOST_TARGETS, SKILL_ORDER } from "../lib/supered-policy.js";

async function fakeBundle(version = "1.0.0") {
  const root = await mkdtemp(join(tmpdir(), "supered-upgrade-bundle-"));
  const skillsDir = join(root, "skills");
  await mkdir(skillsDir);
  await writeFile(join(root, "package.json"), JSON.stringify({ name: "supered", version }, null, 2));

  for (const skill of SKILL_ORDER) {
    const skillDir = join(skillsDir, skill);
    await mkdir(skillDir);
    await writeFile(join(skillDir, "SKILL.md"), `# ${skill}\n\nVersion ${version}.\n`);
  }

  return root;
}

test("Upgrade Plan reports a current healthy install", async () => {
  const root = await fakeBundle("1.0.0");
  const dest = await mkdtemp(join(tmpdir(), "supered-upgrade-dest-"));
  await installSuperedSkills({ root, target: "codex", dest });

  const result = await planSuperedUpgrade({ root, target: "codex", dest, latestVersion: "1.0.0" });

  assert.equal(result.status, "current");
  assert.equal(result.packageStatus, "current");
  assert.equal(result.installStatus, "ok");
  assert.equal(result.currentVersion, "1.0.0");
  assert.equal(result.latestVersion, "1.0.0");
  assert.match(result.applyCommand, /supered doctor --target codex --dest .* --fix/);
});

test("Upgrade Plan reports repair-needed when the installed Skill Bundle is stale", async () => {
  const root = await fakeBundle("1.0.0");
  const dest = await mkdtemp(join(tmpdir(), "supered-upgrade-dest-"));
  await installSuperedSkills({ root, target: "codex", dest });
  await writeFile(join(dest, "using-supered", "SKILL.md"), "# using-supered\n\nOld copy.\n");

  const result = await planSuperedUpgrade({ root, target: "codex", dest, latestVersion: "1.0.0" });

  assert.equal(result.status, "repair-needed");
  assert.deepEqual(result.issues.map((issue) => issue.code), ["changed-skill"]);
  assert.match(result.applyCommand, /^supered doctor --target codex/);
});

test("Upgrade Plan reports an available package upgrade", async () => {
  const root = await fakeBundle("1.0.0");
  const dest = await mkdtemp(join(tmpdir(), "supered-upgrade-dest-"));
  await installSuperedSkills({ root, target: "codex", dest });

  const result = await planSuperedUpgrade({ root, target: "codex", dest, latestVersion: "1.2.0" });

  assert.equal(result.status, "upgrade-available");
  assert.equal(result.packageStatus, "outdated");
  assert.match(result.applyCommand, /^npx supered@latest doctor --target codex/);
});

test("Upgrade apply repairs stale local installs", async () => {
  const root = await fakeBundle("1.0.0");
  const dest = await mkdtemp(join(tmpdir(), "supered-upgrade-dest-"));
  await writeFile(join(dest, "unrelated.txt"), "keep me");
  await installSuperedSkills({ root, target: "codex", dest });
  await rm(join(dest, "using-supered", "SKILL.md"));

  const result = await applySuperedUpgrade({ root, target: "codex", dest, latestVersion: "1.0.0" });

  assert.equal(result.status, "applied");
  assert.deepEqual(result.fixedSkills, ["using-supered"]);
  await stat(join(dest, "using-supered", "SKILL.md"));
  await stat(join(dest, "unrelated.txt"));
});

test("Upgrade apply delegates package upgrades to supered@latest", async () => {
  const root = await fakeBundle("1.0.0");
  const dest = await mkdtemp(join(tmpdir(), "supered-upgrade-dest-"));
  await installSuperedSkills({ root, target: "codex", dest });
  const calls = [];

  const result = await applySuperedUpgrade({
    root,
    target: "codex",
    dest,
    latestVersion: "1.2.0",
    runLatestRepair: async (command) => {
      calls.push(command);
      return { stdout: "latest repaired\n" };
    }
  });

  assert.equal(result.status, "delegated");
  assert.equal(calls.length, 1);
  assert.deepEqual(calls[0].args.slice(0, 6), ["exec", "--yes", "--package", "supered@latest", "--", "supered"]);
  assert.match(result.stdout, /latest repaired/);
});

test("Upgrade apply refuses unsafe symlink repair", async () => {
  const root = await fakeBundle("1.0.0");
  const dest = await mkdtemp(join(tmpdir(), "supered-upgrade-dest-"));
  await installSuperedSkills({ root, target: "codex", dest });
  await symlink("/tmp", join(dest, "make-a-map", "linked"));

  const result = await applySuperedUpgrade({ root, target: "codex", dest, latestVersion: "1.0.0" });

  assert.equal(result.status, "refused");
  assert.deepEqual(result.refusedIssues.map((issue) => issue.code), ["unsafe-symlink"]);
});

test("Upgrade Plan can inspect every supported host target", async () => {
  const root = await fakeBundle("1.0.0");
  const home = await mkdtemp(join(tmpdir(), "supered-upgrade-home-"));
  await installSuperedSkills({ root, target: "codex", home });

  const result = await planAllSuperedUpgrades({ root, home, latestVersion: "1.0.0" });

  assert.deepEqual(result.targets.map((target) => target.target), Object.keys(HOST_TARGETS));
  assert.equal(result.targets.find((target) => target.target === "codex").status, "current");
  assert.equal(result.targets.find((target) => target.target === "gemini").status, "repair-needed");
});
