import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const scoringDimensions = [
  "clarity",
  "actionability",
  "guardrails",
  "evidence",
  "outcome"
];
const expectedSkills = [
  "using-supered",
  "shape-the-task",
  "make-a-map",
  "build-in-slices",
  "trace-the-fault",
  "prove-the-change",
  "ship-the-work"
];

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

test("eval scenario catalog covers realistic coding-agent work", async () => {
  const catalog = await readJson(join(root, "docs", "evals", "scenarios.json"));

  assert.equal(catalog.product, "Supered");
  assert.equal(catalog.version, "0.1");
  assert.equal(catalog.scoring.maxScore, 5);
  assert.deepEqual(catalog.scoring.dimensions, scoringDimensions);
  assert.equal(catalog.scenarios.length, 10);

  const ids = new Set();
  const coveredSkills = new Set();

  for (const scenario of catalog.scenarios) {
    assert.match(scenario.id, /^S\d{2}$/);
    assert.ok(!ids.has(scenario.id), `${scenario.id} must be unique`);
    ids.add(scenario.id);

    assert.ok(scenario.title.length >= 12, `${scenario.id} needs a specific title`);
    assert.ok(scenario.prompt.length >= 80, `${scenario.id} prompt is too thin`);
    assert.ok(scenario.context.length >= 80, `${scenario.id} context is too thin`);
    assert.ok(scenario.successCriteria.length >= 3, `${scenario.id} needs success criteria`);
    assert.ok(scenario.expectedEvidence.length >= 2, `${scenario.id} needs evidence expectations`);
    assert.ok(scenario.primarySkills.length >= 1, `${scenario.id} needs a primary skill`);

    for (const skill of scenario.primarySkills) {
      coveredSkills.add(skill);
      assert.ok(expectedSkills.includes(skill), `${scenario.id} references unknown skill ${skill}`);
    }
  }

  for (const skill of expectedSkills) {
    assert.ok(coveredSkills.has(skill), `catalog does not exercise ${skill}`);
  }
});

test("eval results show how usefulness is scored", async () => {
  const report = await readJson(join(root, "docs", "evals", "baseline-results.json"));

  assert.equal(report.product, "Supered");
  assert.equal(report.catalogVersion, "0.1");
  assert.equal(report.results.length, 10);
  assert.ok(report.summary.averageScore >= 4.2, "baseline average should show useful outcomes");

  for (const result of report.results) {
    assert.match(result.scenarioId, /^S\d{2}$/);
    assert.deepEqual(Object.keys(result.scores).sort(), [...scoringDimensions].sort());
    for (const score of Object.values(result.scores)) {
      assert.ok(Number.isInteger(score), "scores must be integers");
      assert.ok(score >= 1 && score <= 5, "scores must be within the rubric");
    }
    assert.ok(result.notes.length >= 80, `${result.scenarioId} needs explanatory scoring notes`);
    assert.ok(result.recommendedSkill.length > 0, `${result.scenarioId} needs a recommended skill`);
  }
});

test("repo exposes eval pack and skill chooser to readers", async () => {
  const readme = await readFile(join(root, "README.md"), "utf8");
  const site = await readFile(join(root, "docs", "index.html"), "utf8");
  const guide = await readFile(join(root, "docs", "which-skill.md"), "utf8");
  const report = await readFile(join(root, "docs", "evals", "README.md"), "utf8");

  assert.match(readme, /Which Skill Should I Use/i);
  assert.match(readme, /eval/i);
  assert.match(site, /Which skill should I use/i);
  assert.match(site, /Eval pack/i);
  assert.match(guide, /using-supered/);
  assert.match(guide, /trace-the-fault/);
  assert.match(report, /10 realistic coding-agent scenarios/i);
  assert.match(report, /clarity/i);
  assert.match(report, /actionability/i);
  assert.match(report, /guardrails/i);
  assert.match(report, /evidence/i);
  assert.match(report, /outcome/i);
});
