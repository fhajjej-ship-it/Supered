import { access, readFile, readdir } from "node:fs/promises";
import { join, relative } from "node:path";

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
  const errors = [];
  const checked = ["package.json"];
  const manifest = await collectManifest(root);
  checked.push(".codex-plugin/plugin.json");
  checked.push(".claude-plugin/plugin.json");
  checked.push(".cursor-plugin/plugin.json");
  checked.push("gemini-extension.json");

  if (manifest.package.name !== "supered") {
    errors.push("package.json name must be supered");
  }

  if (manifest.codexPlugin.name !== "supered") {
    errors.push(".codex-plugin/plugin.json name must be supered");
  }

  if (manifest.codexPlugin.interface?.displayName !== "Supered") {
    errors.push("Codex plugin displayName must be Supered");
  }

  if (manifest.codexPlugin.skills !== "./skills/") {
    errors.push("Codex plugin skills path must be ./skills/");
  }

  const logoPath = manifest.codexPlugin.interface?.logo?.replace(/^\.\//, "");
  if (logoPath) {
    checked.push(logoPath);
    try {
      await access(join(root, logoPath));
    } catch {
      errors.push(`Missing logo file: ${logoPath}`);
    }
  } else {
    errors.push("Codex plugin interface.logo is required");
  }

  const skills = await listSkills(root);
  for (const skill of skills) {
    checked.push(relative(root, skill.path));
    if (!skill.name) {
      errors.push(`${relative(root, skill.path)} is missing a name`);
    }
    if (!skill.description) {
      errors.push(`${relative(root, skill.path)} is missing a description`);
    }
    if (!/^# /m.test(skill.body)) {
      errors.push(`${relative(root, skill.path)} is missing an H1`);
    }
  }

  const skillNames = skills.map((skill) => skill.name);
  for (const expected of SKILL_ORDER) {
    if (!skillNames.includes(expected)) {
      errors.push(`Missing skill: ${expected}`);
    }
  }

  return {
    errors,
    checked,
    skills
  };
}
