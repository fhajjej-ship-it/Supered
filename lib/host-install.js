import { cp, lstat, mkdir, readdir, stat } from "node:fs/promises";
import { join, resolve } from "node:path";

import { defaultInstallDest, SKILL_ORDER } from "./supered-policy.js";

async function assertNoSymlinks(path) {
  const entry = await lstat(path);
  if (entry.isSymbolicLink()) {
    throw new Error(`Refusing to install symlink: ${path}`);
  }

  if (!entry.isDirectory()) {
    return;
  }

  const children = await readdir(path);
  await Promise.all(children.map((child) => assertNoSymlinks(join(path, child))));
}

async function assertSkillIsInstallable(skillsDir, skill) {
  const skillDir = join(skillsDir, skill);
  await assertNoSymlinks(skillDir);

  const skillFile = join(skillDir, "SKILL.md");
  try {
    await stat(skillFile);
  } catch (error) {
    if (error.code === "ENOENT") {
      throw new Error(`Missing skill file: ${skillFile}`);
    }
    throw error;
  }
}

async function assertDestinationPathIsSafe(dest) {
  try {
    const destination = await lstat(dest);
    if (destination.isSymbolicLink()) {
      throw new Error(`Refusing to install into symlinked destination: ${dest}`);
    }
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }
}

async function assertManagedDestinationsAreSafe(dest) {
  for (const skill of SKILL_ORDER) {
    const skillDest = join(dest, skill);
    try {
      const destination = await lstat(skillDest);
      if (destination.isSymbolicLink()) {
        throw new Error(`Refusing to install into symlinked destination: ${skillDest}`);
      }
    } catch (error) {
      if (error.code !== "ENOENT") {
        throw error;
      }
    }
  }
}

export async function installSuperedSkills({ root = process.cwd(), target, dest, home = process.env.HOME } = {}) {
  if (!target) {
    throw new Error("Install requires --target.");
  }

  const installDest = dest ?? defaultInstallDest(target, home);
  const skillsDir = resolve(root, "skills");

  await assertDestinationPathIsSafe(installDest);
  await assertManagedDestinationsAreSafe(installDest);
  for (const skill of SKILL_ORDER) {
    await assertSkillIsInstallable(skillsDir, skill);
  }

  await mkdir(installDest, { recursive: true });
  for (const skill of SKILL_ORDER) {
    await cp(join(skillsDir, skill), join(installDest, skill), { recursive: true });
  }

  return {
    target,
    dest: installDest,
    installedSkills: [...SKILL_ORDER]
  };
}
