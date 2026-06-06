import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";

import { SKILL_ORDER } from "./supered-policy.js";

export { SKILL_ORDER } from "./supered-policy.js";

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

function parseSkill(path, contents) {
  const frontmatter = contents.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!frontmatter) {
    return {
      path,
      name: "",
      description: "",
      body: contents
    };
  }

  const metadata = Object.fromEntries(
    frontmatter[1]
      .split("\n")
      .map((line) => line.match(/^([A-Za-z0-9_-]+):\s*"?([^"]*)"?$/))
      .filter(Boolean)
      .map((match) => [match[1], match[2]])
  );

  return {
    path,
    name: metadata.name ?? "",
    description: metadata.description ?? "",
    body: frontmatter[2]
  };
}

export async function listSkills(root = process.cwd()) {
  const skillsDir = join(root, "skills");
  const entries = await readdir(skillsDir, { withFileTypes: true });
  const skills = await Promise.all(
    entries
      .filter((entry) => entry.isDirectory())
      .map(async (entry) => {
        const path = join(skillsDir, entry.name, "SKILL.md");
        return parseSkill(path, await readFile(path, "utf8"));
      })
  );

  return skills.sort((left, right) => {
    const leftIndex = SKILL_ORDER.indexOf(left.name);
    const rightIndex = SKILL_ORDER.indexOf(right.name);
    return leftIndex - rightIndex;
  });
}

export async function collectManifest(root = process.cwd()) {
  return {
    package: await readJson(join(root, "package.json")),
    codexPlugin: await readJson(join(root, ".codex-plugin", "plugin.json")),
    claudePlugin: await readJson(join(root, ".claude-plugin", "plugin.json")),
    cursorPlugin: await readJson(join(root, ".cursor-plugin", "plugin.json")),
    geminiExtension: await readJson(join(root, "gemini-extension.json"))
  };
}

export async function validateProject(root = process.cwd()) {
  const { validateReleaseBundle } = await import("./release-bundle.js");
  return validateReleaseBundle(root);
}
