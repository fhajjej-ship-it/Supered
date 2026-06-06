import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { SKILL_ORDER } from "./supered-policy.js";

export const EVAL_CATALOG_VERSION = "0.1";
export const SCORING_DIMENSIONS = [
  "clarity",
  "actionability",
  "guardrails",
  "evidence",
  "outcome"
];

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

function add(errorList, condition, message) {
  if (!condition) {
    errorList.push(message);
  }
}

export async function readEvalPack(root = process.cwd()) {
  return {
    catalog: await readJson(join(root, "docs", "evals", "scenarios.json")),
    report: await readJson(join(root, "docs", "evals", "baseline-results.json"))
  };
}

export async function validateEvalPack(root = process.cwd()) {
  const errors = [];
  const { catalog, report } = await readEvalPack(root);
  const scenarioIds = new Set();
  const coveredSkills = new Set();

  add(errors, catalog.product === "Supered", "Eval Pack catalog product must be Supered");
  add(errors, catalog.version === EVAL_CATALOG_VERSION, `Eval Pack catalog version must be ${EVAL_CATALOG_VERSION}`);
  add(errors, catalog.scoring?.maxScore === 5, "Eval Pack scoring maxScore must be 5");
  add(
    errors,
    JSON.stringify(catalog.scoring?.dimensions ?? []) === JSON.stringify(SCORING_DIMENSIONS),
    "Eval Pack scoring dimensions are not aligned"
  );
  add(errors, catalog.scenarios?.length === 10, "Eval Pack must include 10 scenarios");

  for (const scenario of catalog.scenarios ?? []) {
    add(errors, /^S\d{2}$/.test(scenario.id), `${scenario.id} must use an S00-style id`);
    add(errors, !scenarioIds.has(scenario.id), `${scenario.id} must be unique`);
    scenarioIds.add(scenario.id);

    add(errors, scenario.title?.length >= 12, `${scenario.id} needs a specific title`);
    add(errors, scenario.prompt?.length >= 80, `${scenario.id} prompt is too thin`);
    add(errors, scenario.context?.length >= 80, `${scenario.id} context is too thin`);
    add(errors, scenario.successCriteria?.length >= 3, `${scenario.id} needs success criteria`);
    add(errors, scenario.expectedEvidence?.length >= 2, `${scenario.id} needs evidence expectations`);
    add(errors, scenario.primarySkills?.length >= 1, `${scenario.id} needs a primary skill`);

    for (const skill of scenario.primarySkills ?? []) {
      coveredSkills.add(skill);
      add(errors, SKILL_ORDER.includes(skill), `${scenario.id} references unknown skill ${skill}`);
    }
  }

  for (const skill of SKILL_ORDER) {
    add(errors, coveredSkills.has(skill), `Eval Pack does not exercise ${skill}`);
  }

  add(errors, report.product === "Supered", "Eval Pack report product must be Supered");
  add(errors, report.catalogVersion === EVAL_CATALOG_VERSION, "Eval Pack report catalogVersion is not aligned");
  add(errors, report.results?.length === 10, "Eval Pack report must include 10 results");
  add(errors, report.summary?.averageScore >= 4.2, "Eval Pack baseline average should show useful outcomes");

  for (const result of report.results ?? []) {
    add(errors, scenarioIds.has(result.scenarioId), `${result.scenarioId} does not match a known scenario`);
    add(
      errors,
      JSON.stringify(Object.keys(result.scores ?? {}).sort()) === JSON.stringify([...SCORING_DIMENSIONS].sort()),
      `${result.scenarioId} scores must cover every scoring dimension`
    );
    for (const score of Object.values(result.scores ?? {})) {
      add(errors, Number.isInteger(score), "Eval Pack scores must be integers");
      add(errors, score >= 1 && score <= 5, "Eval Pack scores must be between 1 and 5");
    }
    add(errors, result.notes?.length >= 80, `${result.scenarioId} needs explanatory scoring notes`);
    add(errors, result.recommendedSkill?.length > 0, `${result.scenarioId} needs a recommended skill`);
  }

  return {
    errors,
    catalog,
    report,
    summary: {
      scenarioCount: catalog.scenarios?.length ?? 0,
      resultCount: report.results?.length ?? 0,
      averageScore: report.summary?.averageScore ?? 0,
      coveredSkills: SKILL_ORDER.filter((skill) => coveredSkills.has(skill))
    }
  };
}
