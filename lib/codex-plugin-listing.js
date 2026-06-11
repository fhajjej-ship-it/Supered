import { access, readFile } from "node:fs/promises";
import { join } from "node:path";

import { collectManifest, listSkills } from "./manifest.js";
import { SKILL_ORDER } from "./supered-policy.js";

export const CODEX_PLUGIN_LISTING_DOC = "docs/codex-plugin-listing.md";
export const CODEX_GLOBAL_SUBMISSION_DOC = "docs/codex-global-listing-submission.md";
export const CODEX_PUBLIC_MARKETPLACE_FILE = ".agents/plugins/marketplace.json";
export const CODEX_PUBLIC_PLUGIN_ROOT = "plugins/supered";
export const CODEX_PLUGIN_BUNDLE_FILES = [
  CODEX_PUBLIC_MARKETPLACE_FILE,
  `${CODEX_PUBLIC_PLUGIN_ROOT}/.codex-plugin/plugin.json`,
  `${CODEX_PUBLIC_PLUGIN_ROOT}/skills/`,
  `${CODEX_PUBLIC_PLUGIN_ROOT}/1.svg`,
  `${CODEX_PUBLIC_PLUGIN_ROOT}/assets/supered-plugin-logo.svg`,
  `${CODEX_PUBLIC_PLUGIN_ROOT}/assets/supered-mark.svg`,
  `${CODEX_PUBLIC_PLUGIN_ROOT}/docs/preview.svg`,
  ".codex-plugin/plugin.json",
  "skills/",
  "1.svg",
  "assets/supered-plugin-logo.svg",
  "assets/supered-mark.svg",
  "docs/preview.svg",
  CODEX_PLUGIN_LISTING_DOC,
  CODEX_GLOBAL_SUBMISSION_DOC,
  "docs/privacy.html",
  "docs/terms.html",
  "docs/marketplace-checklist.md",
  "README.md",
  "LICENSE"
];

const SUPERED_SITE = "https://fhajjej-ship-it.github.io/Supered/";
const SUPERED_PRIVACY_URL = `${SUPERED_SITE}privacy.html`;
const SUPERED_TERMS_URL = `${SUPERED_SITE}terms.html`;

const REQUIRED_INTERFACE_FIELDS = [
  "displayName",
  "shortDescription",
  "longDescription",
  "developerName",
  "category",
  "capabilities",
  "defaultPrompt",
  "websiteURL",
  "privacyPolicyURL",
  "termsOfServiceURL",
  "brandColor",
  "composerIcon",
  "logo",
  "screenshots"
];

const REQUIRED_DOC_PHRASES = [
  "Codex plugin directory",
  "Create a new plugin",
  "Workspace settings",
  "codex plugin marketplace add fhajjej-ship-it/Supered",
  "codex plugin add supered@supered",
  "codex plugin add supered@personal",
  "npx supered@latest install --target codex",
  "https://github.com/fhajjej-ship-it/Supered",
  "https://www.npmjs.com/package/supered",
  "https://openai.com/academy/codex-plugins-and-skills/",
  "https://help.openai.com/hu-hu/articles/20001256-plugins-in-codex"
];

const REQUIRED_SUBMISSION_PHRASES = [
  "Codex Global Plugin Directory Submission",
  "codex plugin marketplace add fhajjej-ship-it/Supered --ref v0.7.0",
  "codex plugin add supered@supered",
  "supered@supered  installed, enabled  0.7.0",
  "Supered is skills-only",
  "does not request credentials",
  "does not include an MCP server",
  "npm run verify-codex-plugin",
  SUPERED_PRIVACY_URL,
  SUPERED_TERMS_URL
];

async function readText(root, path) {
  return readFile(join(root, path), "utf8");
}

async function readJson(root, path) {
  return JSON.parse(await readText(root, path));
}

async function fileExists(root, path) {
  try {
    await access(join(root, path));
    return true;
  } catch {
    return false;
  }
}

function add(errors, condition, message) {
  if (!condition) {
    errors.push(message);
  }
}

function pushChecked(checked, paths) {
  for (const path of paths) {
    if (!checked.includes(path)) {
      checked.push(path);
    }
  }
}

function normalizeManifestPath(path) {
  return typeof path === "string" ? path.replace(/^\.\//, "") : "";
}

function hasDefaultPrompt(value) {
  if (typeof value === "string") {
    return value.trim().length > 0;
  }
  return Array.isArray(value) && value.some((entry) => typeof entry === "string" && entry.trim().length > 0);
}

export async function validateCodexPluginListing(root = process.cwd()) {
  const errors = [];
  const checked = [];
  const manifest = await collectManifest(root);
  const publicMarketplace = await readJson(root, CODEX_PUBLIC_MARKETPLACE_FILE);
  const codex = manifest.codexPlugin;
  const listing = {
    name: codex.name,
    displayName: codex.interface?.displayName,
    version: codex.version,
    repository: codex.repository,
    skillsPath: codex.skills
  };

  pushChecked(checked, CODEX_PLUGIN_BUNDLE_FILES);

  add(errors, manifest.package.name === "supered", "package.json name must be supered");
  add(errors, manifest.package.version === codex.version, "Codex plugin version must match package.json");
  add(errors, manifest.package.repository?.url?.includes("github.com/fhajjej-ship-it/Supered"), "package repository must point at the public Supered repo");
  add(errors, manifest.package.publishConfig?.access === "public", "package must publish publicly");
  add(errors, codex.name === "supered", "Codex plugin name must be supered");
  add(errors, codex.interface?.displayName === "Supered", "Codex displayName must be Supered");
  add(errors, codex.interface?.category === "Coding", "Codex plugin category must be Coding");
  add(errors, codex.skills === "./skills/", "Codex plugin skills path must be ./skills/");
  add(errors, codex.interface?.privacyPolicyURL === SUPERED_PRIVACY_URL, "Codex privacyPolicyURL must point at Supered privacy page");
  add(errors, codex.interface?.termsOfServiceURL === SUPERED_TERMS_URL, "Codex termsOfServiceURL must point at Supered terms page");
  add(errors, publicMarketplace.name === "supered", "Public Codex marketplace name must be supered");
  add(errors, publicMarketplace.interface?.displayName === "Supered", "Public Codex marketplace displayName must be Supered");

  const publicEntry = publicMarketplace.plugins?.find((plugin) => plugin?.name === "supered");
  add(errors, Boolean(publicEntry), "Public Codex marketplace must include a supered entry");
  add(errors, publicEntry?.source?.source === "local", "Public Codex marketplace source must be local");
  add(errors, publicEntry?.source?.path === "./plugins/supered", "Public Codex marketplace path must be ./plugins/supered");
  add(errors, publicEntry?.policy?.installation === "AVAILABLE", "Public Codex marketplace installation policy must be AVAILABLE");
  add(errors, publicEntry?.policy?.authentication === "ON_INSTALL", "Public Codex marketplace authentication policy must be ON_INSTALL");
  add(errors, publicEntry?.category === "Coding", "Public Codex marketplace category must be Coding");

  for (const field of REQUIRED_INTERFACE_FIELDS) {
    add(errors, codex.interface?.[field] !== undefined, `Codex interface.${field} is required for listing readiness`);
  }
  add(errors, hasDefaultPrompt(codex.interface?.defaultPrompt), "Codex interface.defaultPrompt must include at least one prompt");
  add(errors, Array.isArray(codex.interface?.capabilities) && codex.interface.capabilities.length > 0, "Codex interface.capabilities must not be empty");
  add(errors, Array.isArray(codex.interface?.screenshots) && codex.interface.screenshots.length > 0, "Codex interface.screenshots must not be empty");

  for (const asset of [
    codex.interface?.logo,
    codex.interface?.composerIcon,
    ...(codex.interface?.screenshots ?? [])
  ]) {
    const assetPath = normalizeManifestPath(asset);
    if (assetPath) {
      pushChecked(checked, [assetPath]);
      add(errors, await fileExists(root, assetPath), `Missing Codex plugin asset: ${assetPath}`);
    }
  }

  const skills = await listSkills(root);
  const skillNames = skills.map((skill) => skill.name);
  add(errors, skills.length === SKILL_ORDER.length, `Codex plugin must ship ${SKILL_ORDER.length} skills`);
  for (const expected of SKILL_ORDER) {
    add(errors, skillNames.includes(expected), `Codex plugin missing skill: ${expected}`);
  }

  for (const path of [
    ".codex-plugin/plugin.json",
    "1.svg",
    "assets/supered-plugin-logo.svg",
    "assets/supered-mark.svg",
    "docs/preview.svg",
    "README.md",
    "LICENSE",
    ...SKILL_ORDER.map((skill) => `skills/${skill}/SKILL.md`)
  ]) {
    const publicPath = `${CODEX_PUBLIC_PLUGIN_ROOT}/${path}`;
    pushChecked(checked, [publicPath]);
    const [sourceContents, publicContents] = await Promise.all([
      readText(root, path),
      readText(root, publicPath)
    ]);
    add(errors, publicContents === sourceContents, `Public Codex marketplace mirror is stale: ${publicPath}`);
  }

  for (const bundleFile of CODEX_PLUGIN_BUNDLE_FILES.filter((path) => !path.endsWith("/"))) {
    add(errors, await fileExists(root, bundleFile), `Missing Codex plugin bundle file: ${bundleFile}`);
  }

  const listingDoc = await readText(root, CODEX_PLUGIN_LISTING_DOC);
  for (const phrase of REQUIRED_DOC_PHRASES) {
    add(errors, listingDoc.includes(phrase), `${CODEX_PLUGIN_LISTING_DOC} must mention ${phrase}`);
  }

  const submissionDoc = await readText(root, CODEX_GLOBAL_SUBMISSION_DOC);
  for (const phrase of REQUIRED_SUBMISSION_PHRASES) {
    add(errors, submissionDoc.includes(phrase), `${CODEX_GLOBAL_SUBMISSION_DOC} must mention ${phrase}`);
  }

  return {
    errors,
    checked,
    listing,
    bundleFiles: [...CODEX_PLUGIN_BUNDLE_FILES],
    skills
  };
}
