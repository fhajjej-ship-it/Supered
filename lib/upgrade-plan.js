import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { promisify } from "node:util";

import { inspectSuperedInstall, repairSuperedInstall } from "./install-doctor.js";
import { HOST_TARGETS } from "./supered-policy.js";

const execFileAsync = promisify(execFile);

function shellQuote(value) {
  if (!/[\s'"\\]/.test(value)) {
    return value;
  }
  return `'${value.replace(/'/g, "'\\''")}'`;
}

function parseVersion(version) {
  return version
    .split(".")
    .map((part) => Number.parseInt(part, 10))
    .map((part) => Number.isFinite(part) ? part : 0);
}

export function compareVersions(left, right) {
  const leftParts = parseVersion(left);
  const rightParts = parseVersion(right);
  const length = Math.max(leftParts.length, rightParts.length);

  for (let index = 0; index < length; index += 1) {
    const leftPart = leftParts[index] ?? 0;
    const rightPart = rightParts[index] ?? 0;
    if (leftPart > rightPart) return 1;
    if (leftPart < rightPart) return -1;
  }

  return 0;
}

async function readPackageVersion(root) {
  const packageJson = JSON.parse(await readFile(join(root, "package.json"), "utf8"));
  return packageJson.version;
}

export async function fetchLatestSuperedVersion() {
  if (process.env.SUPERED_LATEST_VERSION) {
    return process.env.SUPERED_LATEST_VERSION;
  }

  const { stdout } = await execFileAsync("npm", ["view", "supered", "version"]);
  return stdout.trim();
}

function statusFor(packageStatus, installStatus) {
  if (packageStatus === "outdated") {
    return "upgrade-available";
  }
  if (installStatus !== "ok") {
    return "repair-needed";
  }
  if (packageStatus === "ahead") {
    return "ahead";
  }
  return "current";
}

function applyCommandFor(packageStatus, target, dest) {
  const command = packageStatus === "outdated" ? "npx supered@latest doctor" : "supered doctor";
  return `${command} --target ${target} --dest ${shellQuote(dest)} --fix`;
}

function latestRepairCommand(target, dest) {
  return {
    bin: "npm",
    args: [
      "exec",
      "--yes",
      "--package",
      "supered@latest",
      "--",
      "supered",
      "doctor",
      "--target",
      target,
      "--dest",
      dest,
      "--fix"
    ]
  };
}

async function runLatestRepairCommand(command) {
  return execFileAsync(command.bin, command.args);
}

export async function planSuperedUpgrade({
  root = process.cwd(),
  target,
  dest,
  home = process.env.HOME,
  latestVersion
} = {}) {
  if (!target) {
    throw new Error("Upgrade requires --target or --all.");
  }

  const currentVersion = await readPackageVersion(root);
  const resolvedLatestVersion = latestVersion ?? await fetchLatestSuperedVersion();
  const versionComparison = compareVersions(currentVersion, resolvedLatestVersion);
  const packageStatus = versionComparison < 0 ? "outdated" : versionComparison > 0 ? "ahead" : "current";
  const install = await inspectSuperedInstall({ root, target, dest, home });

  return {
    target,
    dest: install.dest,
    status: statusFor(packageStatus, install.status),
    packageStatus,
    installStatus: install.status,
    currentVersion,
    latestVersion: resolvedLatestVersion,
    issues: install.issues,
    applyCommand: applyCommandFor(packageStatus, target, install.dest),
    install
  };
}

export async function planAllSuperedUpgrades({
  root = process.cwd(),
  home = process.env.HOME,
  latestVersion
} = {}) {
  const resolvedLatestVersion = latestVersion ?? await fetchLatestSuperedVersion();
  const targets = await Promise.all(
    Object.keys(HOST_TARGETS).map((target) => planSuperedUpgrade({ root, target, home, latestVersion: resolvedLatestVersion }))
  );

  return {
    status: targets.every((target) => target.status === "current" || target.status === "ahead") ? "current" : "issues",
    latestVersion: resolvedLatestVersion,
    targets
  };
}

export async function applySuperedUpgrade({
  root = process.cwd(),
  target,
  dest,
  home = process.env.HOME,
  latestVersion,
  runLatestRepair = runLatestRepairCommand
} = {}) {
  const plan = await planSuperedUpgrade({ root, target, dest, home, latestVersion });

  if (plan.packageStatus === "outdated") {
    const command = latestRepairCommand(plan.target, plan.dest);
    const result = await runLatestRepair(command);
    return {
      ...plan,
      status: "delegated",
      delegatedCommand: `${command.bin} ${command.args.map(shellQuote).join(" ")}`,
      stdout: result.stdout ?? "",
      stderr: result.stderr ?? ""
    };
  }

  const repair = await repairSuperedInstall({ root, target: plan.target, dest: plan.dest, home });
  if (repair.status === "refused") {
    return {
      ...plan,
      status: "refused",
      fixedSkills: repair.fixedSkills,
      refusedIssues: repair.refusedIssues,
      repair
    };
  }

  return {
    ...plan,
    status: repair.status === "fixed" || repair.status === "ok" ? "applied" : "issues",
    fixedSkills: repair.fixedSkills,
    refusedIssues: repair.refusedIssues,
    repair
  };
}

export async function applyAllSuperedUpgrades({
  root = process.cwd(),
  home = process.env.HOME,
  latestVersion,
  runLatestRepair = runLatestRepairCommand
} = {}) {
  const resolvedLatestVersion = latestVersion ?? await fetchLatestSuperedVersion();
  const targets = [];
  for (const target of Object.keys(HOST_TARGETS)) {
    targets.push(await applySuperedUpgrade({ root, target, home, latestVersion: resolvedLatestVersion, runLatestRepair }));
  }

  return {
    status: targets.every((target) => target.status === "applied" || target.status === "delegated") ? "applied" : "issues",
    latestVersion: resolvedLatestVersion,
    targets
  };
}
