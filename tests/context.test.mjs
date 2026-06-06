import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");

test("CONTEXT documents Supered domain terms", async () => {
  const context = await readFile(resolve(root, "CONTEXT.md"), "utf8");

  for (const term of [
    "Skill Bundle",
    "Host Install",
    "Package Verification",
    "Site Verification",
    "Eval Pack",
    "Release Bundle"
  ]) {
    assert.match(context, new RegExp(`\\b${term}\\b`));
  }
});
