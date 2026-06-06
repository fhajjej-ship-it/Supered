import { join } from "node:path";

export const SKILL_ORDER = [
  "using-supered",
  "shape-the-task",
  "make-a-map",
  "build-in-slices",
  "trace-the-fault",
  "prove-the-change",
  "ship-the-work"
];

export const HOST_TARGETS = {
  codex: ".codex/skills",
  claude: ".claude/skills",
  cursor: ".cursor/skills",
  gemini: ".gemini/skills",
  opencode: ".opencode/skills"
};

export function defaultInstallDest(target, home = process.env.HOME) {
  if (!home) {
    throw new Error("HOME is not set; pass --dest explicitly.");
  }

  const targetPath = HOST_TARGETS[target];
  if (!targetPath) {
    throw new Error(`Unsupported target: ${target}`);
  }

  return join(home, targetPath);
}
