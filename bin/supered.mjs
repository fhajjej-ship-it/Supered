#!/usr/bin/env node
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { installSuperedSkills } from "../lib/host-install.js";
import { inspectSuperedInstall, repairSuperedInstall } from "../lib/install-doctor.js";
import { listSkills } from "../lib/manifest.js";
import { validateReleaseBundle } from "../lib/release-bundle.js";
import { applyAllSuperedUpgrades, applySuperedUpgrade, planAllSuperedUpgrades, planSuperedUpgrade } from "../lib/upgrade-plan.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const [command, ...args] = process.argv.slice(2);

function printHelp() {
  console.log(`Supered

Usage:
  supered skills [--json]
  supered validate
  supered install --target <codex|claude|cursor|gemini|opencode> [--dest <path>]
  supered doctor --target <codex|claude|cursor|gemini|opencode> [--dest <path>] [--fix] [--json]
  supered upgrade --target <codex|claude|cursor|gemini|opencode> [--dest <path>] [--apply] [--json]
  supered upgrade --all [--apply] [--json]

Examples:
  npx supered install --target codex
  npx supered install --target gemini --dest ~/.gemini/skills
  supered doctor --target codex
  supered upgrade --target codex
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
  const result = await validateReleaseBundle(root);
  if (result.errors.length > 0) {
    for (const error of result.errors) {
      console.error(`- ${error}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log(`Supered bundle is valid: ${result.skills.length} skills, ${result.checked.length} files checked.`);
}

async function installCommand() {
  const targetIndex = args.indexOf("--target");
  const destIndex = args.indexOf("--dest");
  const target = targetIndex === -1 ? "" : args[targetIndex + 1];
  const dest = destIndex === -1 ? undefined : args[destIndex + 1];

  if (!target || (destIndex !== -1 && !dest)) {
    throw new Error("Install requires --target <codex|claude|cursor|gemini|opencode>.");
  }

  const result = await installSuperedSkills({ root, target, dest });
  console.log(`Installed Supered skills for ${result.target} at ${result.dest}.`);
}

async function doctorCommand() {
  const targetIndex = args.indexOf("--target");
  const destIndex = args.indexOf("--dest");
  const target = targetIndex === -1 ? "" : args[targetIndex + 1];
  const dest = destIndex === -1 ? undefined : args[destIndex + 1];
  const json = args.includes("--json");
  const fix = args.includes("--fix");

  if (!target || (destIndex !== -1 && !dest)) {
    throw new Error("Doctor requires --target <codex|claude|cursor|gemini|opencode>.");
  }

  const result = fix
    ? await repairSuperedInstall({ root, target, dest })
    : await inspectSuperedInstall({ root, target, dest });
  if (json) {
    console.log(JSON.stringify(result, null, 2));
    if (result.status !== "ok" && result.status !== "fixed") {
      process.exitCode = 1;
    }
    return;
  }

  if (fix && result.status === "fixed") {
    console.log(`Supered doctor fixed ${result.fixedSkills.length} skill${result.fixedSkills.length === 1 ? "" : "s"} for ${result.target} at ${result.dest}.`);
    for (const skill of result.fixedSkills) {
      console.log(`- ${skill}`);
    }
    return;
  }

  if (fix && result.status === "refused") {
    console.log(`Supered doctor refused to fix ${result.refusedIssues.length} unsafe issue${result.refusedIssues.length === 1 ? "" : "s"} for ${result.target} at ${result.dest}.`);
    for (const installIssue of result.refusedIssues) {
      console.log(`- [${installIssue.code}] ${installIssue.message}`);
    }
    process.exitCode = 1;
    return;
  }

  if (fix && result.status === "issues") {
    console.log(`Supered doctor repaired ${result.fixedSkills.length} skill${result.fixedSkills.length === 1 ? "" : "s"}, but ${result.after.issues.length} issue${result.after.issues.length === 1 ? "" : "s"} remain for ${result.target} at ${result.dest}.`);
    for (const installIssue of result.after.issues) {
      console.log(`- [${installIssue.code}] ${installIssue.message}`);
    }
    process.exitCode = 1;
    return;
  }

  if (result.status === "ok") {
    console.log(`Supered doctor passed for ${result.target} at ${result.dest}.`);
    const installedCount = result.installedSkills?.length ?? result.after?.installedSkills?.length ?? 0;
    console.log(`${installedCount} skills installed and current.`);
    return;
  }

  console.log(`Supered doctor found ${result.issues.length} issue${result.issues.length === 1 ? "" : "s"} for ${result.target} at ${result.dest}.`);
  for (const installIssue of result.issues) {
    console.log(`- [${installIssue.code}] ${installIssue.message}`);
  }
  console.log(`Fix: ${result.fixCommand}`);
  process.exitCode = 1;
}

function latestVersionOption() {
  const index = args.indexOf("--latest-version");
  return index === -1 ? undefined : args[index + 1];
}

function printUpgradeTarget(result) {
  if (result.status === "current") {
    console.log(`Supered upgrade check passed for ${result.target}: ${result.currentVersion} is current and the install is healthy.`);
    return;
  }
  if (result.status === "ahead") {
    console.log(`Supered local package ${result.currentVersion} is ahead of npm latest ${result.latestVersion} for ${result.target}.`);
    return;
  }
  if (result.status === "upgrade-available") {
    console.log(`Supered upgrade available for ${result.target}: ${result.currentVersion} -> ${result.latestVersion}.`);
  } else {
    console.log(`Supered repair needed for ${result.target}: package ${result.currentVersion} is ${result.packageStatus}.`);
  }
  if (result.issues.length > 0) {
    for (const installIssue of result.issues) {
      console.log(`- [${installIssue.code}] ${installIssue.message}`);
    }
  }
  console.log(`Apply: ${result.applyCommand}`);
}

function printUpgradeApply(result) {
  if (result.status === "delegated") {
    console.log(`Supered upgrade delegated to latest package for ${result.target}.`);
    if (result.stdout) {
      process.stdout.write(result.stdout);
    }
    return;
  }
  if (result.status === "applied") {
    console.log(`Supered upgrade applied for ${result.target} at ${result.dest}.`);
    console.log(`${result.fixedSkills.length} skill${result.fixedSkills.length === 1 ? "" : "s"} repaired.`);
    return;
  }
  if (result.status === "refused") {
    console.log(`Supered upgrade refused ${result.refusedIssues.length} unsafe issue${result.refusedIssues.length === 1 ? "" : "s"} for ${result.target}.`);
    for (const installIssue of result.refusedIssues) {
      console.log(`- [${installIssue.code}] ${installIssue.message}`);
    }
    process.exitCode = 1;
    return;
  }
  console.log(`Supered upgrade still has issues for ${result.target}.`);
  process.exitCode = 1;
}

async function upgradeCommand() {
  const targetIndex = args.indexOf("--target");
  const destIndex = args.indexOf("--dest");
  const target = targetIndex === -1 ? "" : args[targetIndex + 1];
  const dest = destIndex === -1 ? undefined : args[destIndex + 1];
  const json = args.includes("--json");
  const apply = args.includes("--apply");
  const all = args.includes("--all");
  const latestVersion = latestVersionOption();

  if (all && dest) {
    throw new Error("Upgrade --all cannot use --dest.");
  }
  if (!all && (!target || (destIndex !== -1 && !dest))) {
    throw new Error("Upgrade requires --target <codex|claude|cursor|gemini|opencode> or --all.");
  }

  const result = all
    ? apply
      ? await applyAllSuperedUpgrades({ root, latestVersion })
      : await planAllSuperedUpgrades({ root, latestVersion })
    : apply
      ? await applySuperedUpgrade({ root, target, dest, latestVersion })
      : await planSuperedUpgrade({ root, target, dest, latestVersion });

  if (json) {
    console.log(JSON.stringify(result, null, 2));
    if (apply && (result.status === "issues" || result.status === "refused")) {
      process.exitCode = 1;
    }
    return;
  }

  if (all) {
    console.log(`Supered upgrade checked ${result.targets.length} targets; status: ${result.status}.`);
    for (const targetResult of result.targets) {
      console.log(`- ${targetResult.target}: ${targetResult.status}`);
    }
    if (apply && result.status === "issues") {
      process.exitCode = 1;
    }
    return;
  }

  if (apply) {
    printUpgradeApply(result);
    return;
  }

  printUpgradeTarget(result);
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
  } else if (command === "doctor") {
    await doctorCommand();
  } else if (command === "upgrade") {
    await upgradeCommand();
  } else {
    throw new Error(`Unknown command: ${command}`);
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
