#!/usr/bin/env node
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { verifyNpmPackage } from "../lib/package-verification.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const result = await verifyNpmPackage({ root });
console.log(
  `Npm package verification passed: ${result.installedSkills.length} skills installed and checked for ${result.installedTargets.length} targets.`
);
