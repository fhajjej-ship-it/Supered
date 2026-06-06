import test from "node:test";
import assert from "node:assert/strict";
import { mkdir, mkdtemp, realpath, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { resolveStaticRequest } from "../scripts/site-server.mjs";

test("site verifier serves expected public files only", async () => {
  const root = await mkdtemp(join(tmpdir(), "supered-site-server-"));
  await mkdir(join(root, "docs"));
  await mkdir(join(root, "assets"));
  await writeFile(join(root, "docs", "index.html"), "");
  await writeFile(join(root, "docs", "styles.css"), "");
  await writeFile(join(root, "1.svg"), "");
  await writeFile(join(root, "assets", "supered-mark.svg"), "");

  assert.equal(await resolveStaticRequest(root, "/docs/"), await realpath(join(root, "docs", "index.html")));
  assert.equal(await resolveStaticRequest(root, "/docs/styles.css"), await realpath(join(root, "docs", "styles.css")));
  assert.equal(await resolveStaticRequest(root, "/1.svg"), await realpath(join(root, "1.svg")));
  assert.equal(
    await resolveStaticRequest(root, "/assets/supered-mark.svg"),
    await realpath(join(root, "assets", "supered-mark.svg"))
  );
});

test("site verifier refuses root files, dotfiles, traversal, and symlink escapes", async () => {
  const root = await mkdtemp(join(tmpdir(), "supered-site-server-"));
  await mkdir(join(root, "docs"));
  await writeFile(join(root, "docs", "index.html"), "");
  await writeFile(join(root, "package.json"), "{}");
  await writeFile(join(root, ".env"), "SECRET=1");

  const outside = join(root, "..", "outside-secret.txt");
  await writeFile(outside, "secret");
  await symlink(outside, join(root, "docs", "outside-secret"));

  await assert.rejects(resolveStaticRequest(root, "/.env"), /Refusing to serve/);
  await assert.rejects(resolveStaticRequest(root, "/package.json"), /Refusing to serve/);
  await assert.rejects(resolveStaticRequest(root, "/docs/../package.json"), /Refusing to serve/);
  await assert.rejects(resolveStaticRequest(root, "/docs/outside-secret"), /Refusing to serve/);
});

test("CI actions are pinned to immutable commit SHAs", async () => {
  const workflow = await import("node:fs/promises").then(({ readFile }) =>
    readFile(new URL("../.github/workflows/ci.yml", import.meta.url), "utf8")
  );
  const actionRefs = [...workflow.matchAll(/uses:\s+actions\/[^@\s]+@([^\s]+)/g)].map((match) => match[1]);

  assert.ok(actionRefs.length >= 2, "expected workflow action references");
  for (const ref of actionRefs) {
    assert.match(ref, /^[a-f0-9]{40}$/);
  }
});
