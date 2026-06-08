import test from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

const execFileAsync = promisify(execFile);
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

test("GitHub Pages landing page is present and product-focused", async () => {
  const html = await readFile(join(root, "docs", "index.html"), "utf8");

  assert.match(html, /<title>Supered/);
  assert.match(html, /<img[^>]+src="\.\.\/1\.svg"/);
  assert.match(html, /codex plugin marketplace add fhajjej-ship-it\/Supered --ref v0\.6\.2/);
  assert.match(html, /codex plugin add supered@supered/);
  assert.match(html, /Global directory review packet/);
  assert.match(html, /60-second beta install test/);
  assert.match(html, /Real workflow examples/);
  assert.match(html, /Shape/);
  assert.match(html, /Build/);
  assert.match(html, /Prove/);
  assert.match(html, /Ship/);
});

test("README has launch badges and a Pages link", async () => {
  const readme = await readFile(join(root, "README.md"), "utf8");

  assert.match(readme, /img\.shields\.io\/github\/v\/release\/fhajjej-ship-it\/Supered/);
  assert.match(readme, /github\.com\/fhajjej-ship-it\/Supered\/actions\/workflows\/ci\.yml/);
  assert.match(readme, /fhajjej-ship-it\.github\.io\/Supered/);
  assert.match(readme, /codex plugin marketplace add fhajjej-ship-it\/Supered --ref v0\.6\.2/);
  assert.match(readme, /codex plugin add supered@supered/);
  assert.match(readme, /docs\/launch-post\.md/);
});

test("smoke install copies the shipped skills into an isolated temp directory", async () => {
  const { stdout } = await execFileAsync("node", ["scripts/smoke-install.mjs"], { cwd: root });

  assert.match(stdout, /Smoke install passed/);
  assert.match(stdout, /7 skills/);
});

test("launch artifacts include CI, roadmap, release notes, and preview metadata", async () => {
  const ci = await readFile(join(root, ".github", "workflows", "ci.yml"), "utf8");
  const roadmap = await readFile(join(root, "docs", "roadmap.md"), "utf8");
  const releaseNotes = await readFile(join(root, "RELEASE_NOTES.md"), "utf8");
  const packageJson = JSON.parse(await readFile(join(root, "package.json"), "utf8"));
  const plugin = JSON.parse(await readFile(join(root, ".codex-plugin", "plugin.json"), "utf8"));

  assert.match(ci, /npm test/);
  assert.match(ci, /npm ci/);
  assert.match(ci, /npm run validate/);
  assert.match(ci, /npm run smoke-install/);
  assert.match(ci, /npm run verify-package/);
  assert.match(ci, /npm run verify-codex-plugin/);
  assert.match(ci, /npm run verify-site/);
  assert.equal(packageJson.scripts["verify-site"], "node ./scripts/verify-site.mjs");
  assert.equal(packageJson.scripts["verify-codex-plugin"], "node ./scripts/verify-codex-plugin.mjs");
  assert.match(roadmap, /# Supered Roadmap/);
  assert.match(releaseNotes, /# Supered v0\.1\.3/);
  assert.match(releaseNotes, /# Supered v0\.1\.2/);
  assert.match(releaseNotes, /# Supered v0\.1\.1/);
  assert.match(releaseNotes, /# Supered v0\.1\.0/);
  assert.deepEqual(plugin.interface.screenshots, ["./docs/preview.svg"]);
});
