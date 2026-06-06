import test from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const execFileAsync = promisify(execFile);
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const cli = resolve(root, "bin/supered.mjs");

test("CLI lists skills as stable JSON", async () => {
  const { stdout } = await execFileAsync("node", [cli, "skills", "--json"], { cwd: root });
  const skills = JSON.parse(stdout);

  assert.equal(skills.length, 7);
  assert.equal(skills[0].name, "using-supered");
  assert.ok(skills.every((skill) => skill.path.endsWith("/SKILL.md")));
});

test("CLI validate exits cleanly and prints a concise summary", async () => {
  const { stdout } = await execFileAsync("node", [cli, "validate"], { cwd: root });

  assert.match(stdout, /Supered bundle is valid/);
  assert.match(stdout, /7 skills/);
});
