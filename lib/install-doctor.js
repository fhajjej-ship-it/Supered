import { lstat, readFile, readdir } from "node:fs/promises";
import { join, resolve } from "node:path";

import { defaultInstallDest, SKILL_ORDER } from "./supered-policy.js";

function shellQuote(value) {
  if (!/[\s'"\\]/.test(value)) {
    return value;
  }
  return `'${value.replace(/'/g, "'\\''")}'`;
}

function fixCommand(target, dest) {
  return `npx supered@latest install --target ${target} --dest ${shellQuote(dest)}`;
}

function issue(code, message, extra = {}) {
  return {
    code,
    message,
    ...extra
  };
}

async function lstatOrNull(path) {
  try {
    return await lstat(path);
  } catch (error) {
    if (error.code === "ENOENT") {
      return null;
    }
    throw error;
  }
}

async function findSymlink(path) {
  const entry = await lstatOrNull(path);
  if (!entry) {
    return null;
  }
  if (entry.isSymbolicLink()) {
    return path;
  }
  if (!entry.isDirectory()) {
    return null;
  }

  const children = await readdir(path);
  for (const child of children) {
    const linked = await findSymlink(join(path, child));
    if (linked) {
      return linked;
    }
  }
  return null;
}

async function readInstalledSkill(dest, skill) {
  const skillDir = join(dest, skill);
  const linked = await findSymlink(skillDir);
  if (linked) {
    return {
      linked
    };
  }

  const skillFile = join(skillDir, "SKILL.md");
  const fileStat = await lstatOrNull(skillFile);
  if (!fileStat) {
    return {
      missing: true
    };
  }
  if (fileStat.isSymbolicLink()) {
    return {
      linked: skillFile
    };
  }

  return {
    contents: await readFile(skillFile, "utf8")
  };
}

export async function inspectSuperedInstall({ root = process.cwd(), target, dest, home = process.env.HOME } = {}) {
  if (!target) {
    throw new Error("Doctor requires --target.");
  }

  const installDest = dest ?? defaultInstallDest(target, home);
  const sourceSkillsDir = resolve(root, "skills");
  const issues = [];
  const missingSkills = [];
  const changedSkills = [];
  const installedSkills = [];
  const command = fixCommand(target, installDest);
  const destStat = await lstatOrNull(installDest);

  if (!destStat) {
    return {
      target,
      dest: installDest,
      status: "issues",
      issues: [
        issue("missing-destination", `Install destination does not exist: ${installDest}`, {
          path: installDest
        })
      ],
      installedSkills,
      missingSkills: [...SKILL_ORDER],
      changedSkills,
      fixCommand: command
    };
  }

  if (destStat.isSymbolicLink()) {
    return {
      target,
      dest: installDest,
      status: "issues",
      issues: [
        issue("symlinked-destination", `Install destination is a symlink: ${installDest}`, {
          path: installDest
        })
      ],
      installedSkills,
      missingSkills,
      changedSkills,
      fixCommand: command
    };
  }

  for (const skill of SKILL_ORDER) {
    const expectedPath = join(sourceSkillsDir, skill, "SKILL.md");
    const expected = await readFile(expectedPath, "utf8");
    const installed = await readInstalledSkill(installDest, skill);

    if (installed.linked) {
      issues.push(
        issue("unsafe-symlink", `Managed skill contains a symlink: ${installed.linked}`, {
          skill,
          path: installed.linked
        })
      );
      continue;
    }

    if (installed.missing) {
      missingSkills.push(skill);
      issues.push(
        issue("missing-skill", `Missing installed skill file: ${join(installDest, skill, "SKILL.md")}`, {
          skill,
          path: join(installDest, skill, "SKILL.md")
        })
      );
      continue;
    }

    installedSkills.push(skill);
    if (installed.contents !== expected) {
      changedSkills.push(skill);
      issues.push(
        issue("changed-skill", `Installed skill differs from this Supered bundle: ${skill}`, {
          skill,
          path: join(installDest, skill, "SKILL.md")
        })
      );
    }
  }

  return {
    target,
    dest: installDest,
    status: issues.length === 0 ? "ok" : "issues",
    issues,
    installedSkills,
    missingSkills,
    changedSkills,
    fixCommand: command
  };
}
