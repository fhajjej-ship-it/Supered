#!/usr/bin/env node
import { resolve } from "node:path";

import { validateCodexPluginListing } from "../lib/codex-plugin-listing.js";

const root = resolve(import.meta.dirname, "..");
const result = await validateCodexPluginListing(root);

if (result.errors.length > 0) {
  console.error("Codex plugin listing verification failed:");
  for (const error of result.errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(
  `Codex plugin listing verification passed: ${result.listing.displayName} v${result.listing.version}, ` +
    `${result.skills.length} skills, ${result.checked.length} files checked.`
);
