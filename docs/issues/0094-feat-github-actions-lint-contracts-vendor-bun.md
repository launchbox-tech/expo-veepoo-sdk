# 94 — feat: GitHub Actions — lint, contracts, vendor, Bun pin, cache (#90)

> GitHub: https://github.com/launchbox-tech/expo-veepoo-sdk/issues/94  
> Status: open | Labels: needs-triage

## Parent

#90 — PRD: Module test coverage reports and CI quality pipeline

## What to build

Tracer bullet from PRD #90: extend the CI workflow with **lint**, **typecheck**, **build** (emit), then **Veepoo events** bridge contract CLI and **native rejection** bridge contract CLI using the **build** output (single **tsc** for the slice), then **vendor manifest check** (**git ls-remote**). Pin **Bun** via **`packageManager`** in **package.json**; add **actions/cache** for **Bun**’s global install cache keyed primarily on the lockfile. Use **distinct step names** so a failed run shows whether **events**, **rejections**, or **vendor** drift failed.

## Acceptance criteria

- [ ] **lint** and **typecheck** run and fail the job on error.
- [ ] **build** runs once; contract CLIs consume emitted output without redundant full **tsc** per CLI.
- [ ] Separate named steps for **events contract**, **rejection contract**, and **vendor check**.
- [ ] **packageManager** pins Bun; **setup-bun** resolves the toolchain from **package.json** (no floating **latest** in CI).
- [ ] **actions/cache** (or equivalent) caches **Bun** install cache with a lockfile-scoped primary key.
- [ ] **Vendor** check fails when **git ls-remote** cannot run or remotes are unreachable (no silent pass).

## Blocked by

- #92
- #93

## Type

AFK

## User stories covered (from #90)

6, 7, 8, 10, 11, 12, 13, 21.
