import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

import { collectManifest, listSkills, validateProject } from "../lib/manifest.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

test("collectManifest reads package and plugin metadata", async () => {
  const manifest = await collectManifest(root);

  assert.equal(manifest.package.name, "supered");
  assert.equal(manifest.codexPlugin.name, "supered");
  assert.equal(manifest.codexPlugin.interface.displayName, "Supered");
  assert.equal(manifest.codexPlugin.skills, "./skills/");
});

test("package and host metadata versions stay aligned", async () => {
  const manifest = await collectManifest(root);
  const version = manifest.package.version;

  assert.equal(manifest.codexPlugin.version, version);
  assert.equal(manifest.claudePlugin.version, version);
  assert.equal(manifest.cursorPlugin.version, version);
  assert.equal(manifest.geminiExtension.version, version);
});

test("listSkills returns the shipped Supered skill library", async () => {
  const skills = await listSkills(root);
  const skillNames = skills.map((skill) => skill.name);

  assert.deepEqual(skillNames, [
    "using-supered",
    "shape-the-task",
    "make-a-map",
    "build-in-slices",
    "trace-the-fault",
    "prove-the-change",
    "ship-the-work"
  ]);

  for (const skill of skills) {
    assert.match(skill.description, /\S/);
    assert.match(skill.body, /^# /m);
  }
});

test("validateProject reports a clean release bundle", async () => {
  const result = await validateProject(root);

  assert.deepEqual(result.errors, []);
  assert.ok(result.checked.includes("package.json"));
  assert.ok(result.checked.includes(".codex-plugin/plugin.json"));
  assert.ok(result.checked.includes("1.svg"));
  assert.ok(result.checked.includes("skills/using-supered/SKILL.md"));
});

test("readme names the product and credits the inspiration without copying it", async () => {
  const readme = await readFile(join(root, "README.md"), "utf8");

  assert.match(readme, /^# Supered/m);
  assert.match(readme, /inspired by obra\/superpowers/i);
  assert.doesNotMatch(readme, /complete software development methodology for your coding agents/i);
});
