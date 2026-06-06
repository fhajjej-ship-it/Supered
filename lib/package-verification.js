import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

import { HOST_TARGETS, SKILL_ORDER } from "./supered-policy.js";

const execFileAsync = promisify(execFile);
const npmPackEnv = {
  ...process.env,
  npm_config_dry_run: "false"
};

export const PACKAGE_TARGETS = Object.keys(HOST_TARGETS);
export const REQUIRED_PACKAGE_FILES = [
  ".claude-plugin/",
  ".codex-plugin/",
  ".cursor-plugin/",
  ".opencode/",
  "1.svg",
  "assets/",
  "bin/",
  "docs/",
  "gemini-extension.json",
  "install.sh",
  "lib/",
  "skills/",
  "README.md",
  "LICENSE"
];
export const EXCLUDED_PACKAGE_PREFIXES = [
  "tests/",
  "artifacts/",
  "node_modules/"
];

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

function packageFilePaths(pack) {
  return pack.files.map((file) => file.path);
}

export function inspectPackageFiles(files) {
  return {
    missingRequiredFiles: REQUIRED_PACKAGE_FILES.filter((path) => {
      if (path.endsWith("/")) {
        return !files.some((file) => file.startsWith(path));
      }
      return !files.includes(path);
    }),
    excludedFileViolations: files.filter((file) => EXCLUDED_PACKAGE_PREFIXES.some((prefix) => file.startsWith(prefix)))
  };
}

export async function verifyNpmPackage({ root = process.cwd(), tempRoot } = {}) {
  const workRoot = tempRoot ?? await mkdtemp(join(tmpdir(), "supered-package-"));
  const cleanup = !tempRoot;

  try {
    const packageJson = await readJson(join(root, "package.json"));
    const { stdout } = await execFileAsync("npm", ["pack", "--pack-destination", workRoot, "--json"], {
      cwd: root,
      env: npmPackEnv
    });
    const [pack] = JSON.parse(stdout);
    const tarball = join(workRoot, pack.filename);
    await stat(tarball);

    const files = packageFilePaths(pack);
    const fileInspection = inspectPackageFiles(files);

    if (fileInspection.missingRequiredFiles.length > 0) {
      throw new Error(`Npm package is missing required files: ${fileInspection.missingRequiredFiles.join(", ")}`);
    }
    if (fileInspection.excludedFileViolations.length > 0) {
      throw new Error(`Npm package includes local-only files: ${fileInspection.excludedFileViolations.join(", ")}`);
    }

    for (const target of PACKAGE_TARGETS) {
      const dest = join(workRoot, target);
      await execFileAsync(
        "npm",
        ["exec", "--yes", "--package", tarball, "--", "supered", "install", "--target", target, "--dest", dest],
        { cwd: root, env: npmPackEnv }
      );

      for (const skill of SKILL_ORDER) {
        await stat(join(dest, skill, "SKILL.md"));
      }
    }

    const result = {
      packageName: packageJson.name,
      version: packageJson.version,
      tarballName: pack.filename,
      files,
      installedTargets: [...PACKAGE_TARGETS],
      installedSkills: [...SKILL_ORDER],
      ...fileInspection
    };
    if (!cleanup) {
      result.tarball = tarball;
    }
    return result;
  } finally {
    if (cleanup) {
      await rm(workRoot, { recursive: true, force: true });
    }
  }
}
