#!/usr/bin/env node
import { cp, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { listSkills, validateProject } from "../lib/manifest.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const [command, ...args] = process.argv.slice(2);
const installTargets = {
  codex: ".codex/skills",
  claude: ".claude/skills",
  cursor: ".cursor/skills",
  gemini: ".gemini/skills",
  opencode: ".opencode/skills"
};

function printHelp() {
  console.log(`Supered

Usage:
  supered skills [--json]
  supered validate
  supered install --target <codex|claude|cursor|gemini|opencode> [--dest <path>]

Examples:
  npx supered install --target codex
  npx supered install --target gemini --dest ~/.gemini/skills
`);
}

async function skillsCommand() {
  const skills = await listSkills(root);
  if (args.includes("--json")) {
    console.log(JSON.stringify(skills, null, 2));
    return;
  }

  for (const skill of skills) {
    console.log(`${skill.name}: ${skill.description}`);
  }
}

async function validateCommand() {
  const result = await validateProject(root);
  if (result.errors.length > 0) {
    for (const error of result.errors) {
      console.error(`- ${error}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log(`Supered bundle is valid: ${result.skills.length} skills, ${result.checked.length} files checked.`);
}

function defaultInstallDest(target) {
  const home = process.env.HOME;
  if (!home) {
    throw new Error("HOME is not set; pass --dest explicitly.");
  }

  if (installTargets[target]) return `${home}/${installTargets[target]}`;
  throw new Error(`Unsupported target: ${target}`);
}

async function installCommand() {
  const targetIndex = args.indexOf("--target");
  const destIndex = args.indexOf("--dest");
  const target = targetIndex === -1 ? "" : args[targetIndex + 1];
  const dest = destIndex === -1 ? defaultInstallDest(target) : args[destIndex + 1];

  if (!target || !dest) {
    throw new Error("Install requires --target <codex|claude|cursor|gemini|opencode>.");
  }

  await mkdir(dest, { recursive: true });
  await cp(resolve(root, "skills"), dest, { recursive: true });
  console.log(`Installed Supered skills for ${target} at ${dest}.`);
}

try {
  if (!command || command === "help" || command === "--help") {
    printHelp();
  } else if (command === "skills") {
    await skillsCommand();
  } else if (command === "validate") {
    await validateCommand();
  } else if (command === "install") {
    await installCommand();
  } else {
    throw new Error(`Unknown command: ${command}`);
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
