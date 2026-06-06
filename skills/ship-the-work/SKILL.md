---
name: ship-the-work
description: Use when preparing local work for GitHub: staging, committing, pushing, creating a repository, or handing off a public link.
---

# Ship The Work

Shipping is the last implementation slice. Treat it with the same care as code.

## Steps

1. Inspect `git status --short`.
2. Review the changed files for accidental scope.
3. Run the relevant verification commands.
4. Stage only intended files.
5. Commit with a short, specific message.
6. Push to the intended public repository.
7. Report the branch, commit, repository URL, and checks.

## Guardrails

- Do not stage unrelated user changes silently.
- Do not push secrets, local credentials, or generated noise.
- Do not call a repo public until GitHub confirms visibility.

## Evidence

The handoff should include a GitHub URL and the exact validation that ran before the push.
