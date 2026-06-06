---
name: build-in-slices
description: Use when implementing features or repository changes that should be built incrementally and verified as they land.
---

# Build In Slices

Build one meaningful slice at a time. Each slice should make the repo more complete without hiding unfinished work behind broad claims.

## Steps

1. Start with the smallest test or validator that can catch drift.
2. Run it and observe the failure when practical.
3. Implement the slice.
4. Re-run the relevant check.
5. Continue only after the evidence matches the claim.

## Slice Examples

- Add manifest tests before writing manifest code.
- Add CLI behavior before expanding documentation.
- Add one skill file, validate it, then add the next.
- Update docs only after the product surface is real.

## Evidence

Every slice should leave behind a file diff and a command result that explains what changed.
