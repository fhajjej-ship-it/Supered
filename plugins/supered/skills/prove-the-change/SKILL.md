---
name: prove-the-change
description: Use when a claim may be made that work is done, correct, fixed, tested, published, deployed, visible, or ready.
---

# Prove The Change

Evidence comes before claims. This skill prevents the agent from converting confidence, memory, or a partial check into a completion statement.

## Trigger

Use this before final answers, after fixes, before commits, before releases, before saying tests pass, after publishing, after browser-visible work, and whenever the user asks "is it done?" or "does it work?"

## Do Not Use When

Do not use stale command output from a previous turn. Do not use this to invent checks after the fact while skipping the actual command. Do not claim the whole product is verified when only one layer was checked.

## Required Inputs

- Claims you are about to make.
- Commands or observations that can prove each claim.
- Current git state.
- External targets when relevant: npm registry, GitHub release, Pages URL, CI run, browser screenshot, API response.
- Known limitations or blocked checks.

## Operating Procedure

1. Write the claims in plain language. Example: "Tests pass", "npm package is live", "site renders on mobile".
2. Map each claim to evidence:
   - code behavior: targeted test plus broader suite
   - package integrity: `npm pack`, tarball inspection, install from tarball
   - publish: registry/API lookup and real install from clean temp dir
   - website: HTTP status, content check, browser screenshot
   - repository state: `git status --short --branch`, remote run status
3. Run the full command fresh. Read exit code and output.
4. If any check fails, state the failure and either fix it or downgrade the claim.
5. Report evidence compactly in the final response.
6. Include residual risk only when it matters to the user's next decision.

## Output Contract

```text
Claims checked:
Commands run:
Results:
Remote checks:
Not checked:
Conclusion:
```

For routine coding work, the final answer can be shorter, but it must still name the meaningful checks.

## Guardrails

- Stop if you catch yourself writing "should", "probably", "looks", or "I think" in a completion claim.
- Never claim a remote publish from a local dry-run.
- Never call CI green until the remote run conclusion is success.
- Do not hide failed checks behind passing checks.
- Do not ask the user to verify something you can verify with available tools.

## Failure Modes

- **Partial proof:** Unit tests pass, but package install fails. Fix by checking the layer you changed.
- **Wrong environment:** A command works inside the repo but not from a clean temp directory. Fix by testing like a user.
- **Remote lag:** GitHub Pages or npm cache has not updated. Fix by polling or stating pending status.
- **Overclaim:** "Everything works" after one command. Fix by listing only proven claims.

## Quality Gates

- Every final claim has a fresh check.
- The strongest check matches the user's real use path.
- Failures are reported plainly.
- The final answer distinguishes local, CI, and remote evidence.

## Activation Prompts

```text
Use Supered to prove this change is actually ready.
```

```text
Use Supered to map every completion claim to fresh evidence.
```

```text
Use Supered to verify local, package, site, and remote claims separately.
```

## Output Examples

Useful output:

```text
Claims checked:
- Tests pass.
- Package validation passes.
- The live site shows the new link.
Commands run:
- npm test
- npm run validate
- curl -fsSL https://fhajjej-ship-it.github.io/Supered/ | rg "Beta outreach kit"
Results:
- npm test passed 64/64.
- validate passed.
- live site check returned the expected link text.
Remote checks:
- GitHub CI conclusion is success.
Not checked:
- npm publish was not run for this docs-only change.
Conclusion:
- The docs change is verified locally and remotely.
```

Weak output:

```text
Everything looks good.
```

The weak output makes a completion claim without commands, outputs, remote status, or unchecked scope.

## Example

Good:

```text
Claim: npx install works.
Check: run `npx --yes supered@latest install --target codex --dest <tmp>` from an empty temp directory.
Result: installed expected skill files.
```

Bad: "npm publish dry-run passed, so npx works" before publishing or testing the registry package.
