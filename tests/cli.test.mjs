import test from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, rm, stat } from "node:fs/promises";
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
  assert.match(help, /supered doctor --target codex/);

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

test("CLI install allows a custom target label with an explicit destination", async () => {
  const dest = await mkdtemp(join(tmpdir(), "supered-cli-custom-"));
  const { stdout } = await execFileAsync("node", [cli, "install", "--target", "zed", "--dest", dest], {
    cwd: root
  });

  assert.match(stdout, /Installed Supered skills for zed/);
  await stat(join(dest, "using-supered", "SKILL.md"));
});

test("CLI doctor reports install health as human text and JSON", async () => {
  const dest = await mkdtemp(join(tmpdir(), "supered-cli-doctor-"));
  await execFileAsync("node", [cli, "install", "--target", "codex", "--dest", dest], { cwd: root });

  const { stdout } = await execFileAsync("node", [cli, "doctor", "--target", "codex", "--dest", dest], { cwd: root });
  assert.match(stdout, /Supered doctor passed for codex/);

  const { stdout: json } = await execFileAsync(
    "node",
    [cli, "doctor", "--target", "codex", "--dest", dest, "--json"],
    { cwd: root }
  );
  const result = JSON.parse(json);
  assert.equal(result.status, "ok");
  assert.equal(result.installedSkills.length, 7);
});

test("CLI doctor exits non-zero with fix instructions for broken installs", async () => {
  const dest = await mkdtemp(join(tmpdir(), "supered-cli-doctor-broken-"));
  await execFileAsync("node", [cli, "install", "--target", "codex", "--dest", dest], { cwd: root });
  await rm(join(dest, "using-supered", "SKILL.md"));

  await assert.rejects(
    execFileAsync("node", [cli, "doctor", "--target", "codex", "--dest", dest], { cwd: root }),
    (error) => {
      assert.equal(error.code, 1);
      assert.match(error.stdout, /Supered doctor found 1 issue/);
      assert.match(error.stdout, /missing-skill/);
      assert.match(error.stdout, /npx supered@latest install --target codex --dest/);
      return true;
    }
  );
});

test("CLI doctor --fix repairs broken installs and supports JSON", async () => {
  const dest = await mkdtemp(join(tmpdir(), "supered-cli-doctor-fix-"));
  await execFileAsync("node", [cli, "install", "--target", "codex", "--dest", dest], { cwd: root });
  await rm(join(dest, "using-supered", "SKILL.md"));

  const { stdout } = await execFileAsync("node", [cli, "doctor", "--target", "codex", "--dest", dest, "--fix"], {
    cwd: root
  });
  assert.match(stdout, /Supered doctor fixed 1 skill/);
  await stat(join(dest, "using-supered", "SKILL.md"));

  const { stdout: json } = await execFileAsync(
    "node",
    [cli, "doctor", "--target", "codex", "--dest", dest, "--fix", "--json"],
    { cwd: root }
  );
  const result = JSON.parse(json);
  assert.equal(result.status, "ok");
  assert.deepEqual(result.fixedSkills, []);
});
