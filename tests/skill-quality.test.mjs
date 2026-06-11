import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

import { listSkills } from "../lib/manifest.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const requiredSections = [
  "## Trigger",
  "## Do Not Use When",
  "## Required Inputs",
  "## Operating Procedure",
  "## Output Contract",
  "## Guardrails",
  "## Failure Modes",
  "## Quality Gates"
];

function wordCount(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

test("each Supered skill is a real playbook, not a paragraph prompt", async () => {
  const skills = await listSkills(root);

  for (const skill of skills) {
    for (const section of requiredSections) {
      assert.match(skill.body, new RegExp(`^${section}`, "m"), `${skill.name} missing ${section}`);
    }

    assert.ok(wordCount(skill.body) >= 420, `${skill.name} is too thin`);
    assert.match(skill.body, /Stop if|Do not|Never/i, `${skill.name} needs hard guardrails`);
    assert.match(skill.body, /Evidence|Verified|verification|proof/i, `${skill.name} needs evidence language`);
    assert.match(skill.body, /Example|Good|Bad|Scenario/i, `${skill.name} needs concrete examples or scenarios`);
    assert.match(skill.body, /^## Activation Prompts/m, `${skill.name} needs activation prompts`);
    assert.match(skill.body, /^## Output Examples/m, `${skill.name} needs output examples`);
    assert.match(skill.body, /```text\nUse Supered to /, `${skill.name} needs at least one direct Supered prompt`);
    assert.match(skill.body, /Useful output:/, `${skill.name} needs a useful output example`);
    assert.match(skill.body, /Weak output:/, `${skill.name} needs a weak output counterexample`);
  }
});

test("skill descriptions remain trigger-only and do not shortcut the body", async () => {
  const skills = await listSkills(root);
  const processWords = /\b(step|steps|workflow|procedure|output|guardrail|verify|evidence)\b/i;

  for (const skill of skills) {
    assert.match(skill.description, /^Use when /, `${skill.name} description must start with Use when`);
    assert.ok(skill.description.length < 240, `${skill.name} description is too long`);
    assert.doesNotMatch(skill.description, processWords, `${skill.name} description summarizes process`);
  }
});

test("skill hardening notes cite current primary guidance", async () => {
  const notes = await readFile(join(root, "docs", "skill-design-principles.md"), "utf8");

  assert.match(notes, /openai\.com\/academy\/skills/);
  assert.match(notes, /openai\.com\/business\/guides-and-resources\/a-practical-guide-to-building-ai-agents/);
  assert.match(notes, /anthropic\.com\/engineering\/equipping-agents-for-the-real-world-with-agent-skills/);
  assert.match(notes, /anthropic\.com\/engineering\/building-effective-agents/);
  assert.match(notes, /help\.openai\.com\/en\/articles\/6654000/);
});
