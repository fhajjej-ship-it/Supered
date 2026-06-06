import { access, readFile } from "node:fs/promises";
import { join, relative } from "node:path";

import { collectManifest, listSkills } from "./manifest.js";
import { REQUIRED_PACKAGE_FILES } from "./package-verification.js";
import { HOST_TARGETS, SKILL_ORDER } from "./supered-policy.js";

async function readText(root, path) {
  return readFile(join(root, path), "utf8");
}

function add(errorList, condition, message) {
  if (!condition) {
    errorList.push(message);
  }
}

function pushChecked(checked, paths) {
  for (const path of paths) {
    if (!checked.includes(path)) {
      checked.push(path);
    }
  }
}

export async function validateReleaseBundle(root = process.cwd()) {
  const errors = [];
  const checked = [];
  const manifest = await collectManifest(root);
  const version = manifest.package.version;
  const hostTargets = Object.keys(HOST_TARGETS);

  pushChecked(checked, [
    "package.json",
    ".codex-plugin/plugin.json",
    ".claude-plugin/plugin.json",
    ".cursor-plugin/plugin.json",
    "gemini-extension.json"
  ]);

  add(errors, manifest.package.name === "supered", "package.json name must be supered");
  add(errors, manifest.package.publishConfig?.access === "public", "package.json publishConfig.access must be public");
  add(errors, manifest.package.bin?.supered === "bin/supered.mjs", "package.json bin.supered must point at bin/supered.mjs");
  add(errors, manifest.package.scripts?.["verify-site"] === "node ./scripts/verify-site.mjs", "verify-site script is missing");
  add(
    errors,
    manifest.package.scripts?.["verify-package"] === "node ./scripts/verify-npm-package.mjs",
    "verify-package script is missing"
  );
  add(
    errors,
    manifest.package.scripts?.["verify-codex-plugin"] === "node ./scripts/verify-codex-plugin.mjs",
    "verify-codex-plugin script is missing"
  );
  add(
    errors,
    JSON.stringify(manifest.package.files) === JSON.stringify(REQUIRED_PACKAGE_FILES),
    "package.json files list is not aligned"
  );

  add(errors, manifest.codexPlugin.name === "supered", ".codex-plugin/plugin.json name must be supered");
  add(errors, manifest.codexPlugin.version === version, "Codex plugin version must match package.json");
  add(errors, manifest.claudePlugin.version === version, "Claude plugin version must match package.json");
  add(errors, manifest.cursorPlugin.version === version, "Cursor plugin version must match package.json");
  add(errors, manifest.geminiExtension.version === version, "Gemini extension version must match package.json");
  add(errors, manifest.codexPlugin.interface?.displayName === "Supered", "Codex plugin displayName must be Supered");
  add(errors, manifest.codexPlugin.skills === "./skills/", "Codex plugin skills path must be ./skills/");
  add(
    errors,
    JSON.stringify(manifest.codexPlugin.interface?.screenshots ?? []) === JSON.stringify(["./docs/preview.svg"]),
    "Codex plugin screenshots must include docs preview"
  );

  const logoPath = manifest.codexPlugin.interface?.logo?.replace(/^\.\//, "");
  if (logoPath) {
    pushChecked(checked, [logoPath]);
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
    add(errors, Boolean(skill.name), `${relative(root, skill.path)} is missing a name`);
    add(errors, Boolean(skill.description), `${relative(root, skill.path)} is missing a description`);
    add(errors, /^# /m.test(skill.body), `${relative(root, skill.path)} is missing an H1`);
  }

  const skillNames = skills.map((skill) => skill.name);
  for (const expected of SKILL_ORDER) {
    add(errors, skillNames.includes(expected), `Missing skill: ${expected}`);
  }

  pushChecked(checked, [
    ".agents/plugins/marketplace.json",
    ".github/workflows/ci.yml",
    "RELEASE_NOTES.md",
    "docs/roadmap.md",
    "docs/marketplace-checklist.md",
    "docs/codex-plugin-listing.md",
    "docs/index.html",
    "README.md",
    "install.sh"
  ]);

  const ci = await readText(root, ".github/workflows/ci.yml");
  for (const command of [
    "npm ci",
    "npm test",
    "npm run validate",
    "npm run smoke-install",
    "npm run verify-package",
    "npm run verify-codex-plugin",
    "npm run verify-site"
  ]) {
    add(errors, ci.includes(command), `CI must run ${command}`);
  }

  const releaseNotes = await readText(root, "RELEASE_NOTES.md");
  add(errors, releaseNotes.includes(`# Supered v${version}`), `Release notes must include v${version}`);

  const roadmap = await readText(root, "docs/roadmap.md");
  add(errors, /^# Supered Roadmap/m.test(roadmap), "Roadmap must have a Supered heading");

  const marketplace = await readText(root, "docs/marketplace-checklist.md");
  add(errors, marketplace.includes("install.sh"), "Marketplace checklist must mention install.sh");
  add(errors, marketplace.includes("verify-package"), "Marketplace checklist must mention package verification");
  add(errors, marketplace.includes("verify-codex-plugin"), "Marketplace checklist must mention Codex plugin verification");
  add(errors, marketplace.includes(".agents/plugins/marketplace.json"), "Marketplace checklist must mention public Codex marketplace");

  for (const host of hostTargets) {
    const hostDoc = `docs/hosts/${host}.md`;
    pushChecked(checked, [hostDoc]);
    const doc = await readText(root, hostDoc);
    add(errors, new RegExp(`# .*${host}`, "i").test(doc), `${hostDoc} must name the host`);
    add(errors, doc.includes("install.sh"), `${hostDoc} must mention install.sh`);
    add(errors, /SUPERED_TARGET|--target/.test(doc), `${hostDoc} must document target selection`);
  }

  return {
    errors,
    checked,
    skills,
    version,
    hostTargets
  };
}
