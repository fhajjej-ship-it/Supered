import test from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

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

test("CLI help and default install support every host target", async () => {
  const { stdout: help } = await execFileAsync("node", [cli, "--help"], { cwd: root });

  assert.match(help, /codex\|claude\|cursor\|gemini\|opencode/);
  assert.match(help, /npx supered install --target codex/);

  for (const target of ["codex", "claude", "cursor", "gemini", "opencode"]) {
    const home = await mkdtemp(join(tmpdir(), `supered-cli-${target}-`));
    const { stdout } = await execFileAsync("node", [cli, "install", "--target", target], {
      cwd: root,
      env: {
        ...process.env,
        HOME: home
      }
    });

    assert.match(stdout, new RegExp(`Installed Supered skills for ${target}`));
    const targetDir = target === "opencode" ? ".opencode" : `.${target}`;
    await stat(join(home, targetDir, "skills", "using-supered", "SKILL.md"));
  }
});
