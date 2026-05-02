# 91 — feat: Informational Jest coverage for module TypeScript (#90)

> GitHub: https://github.com/launchbox-tech/expo-veepoo-sdk/issues/91  
> Status: open | Labels: needs-triage

## Parent

#90 — PRD: Module test coverage reports and CI quality pipeline

## What to build

Tracer bullet from PRD #90: configure **informational** Jest coverage for the **published module** TypeScript sources—**collectCoverageFrom** excludes tests and declarations, reporters include **text**, **text-summary**, **html**, and **lcov**. Add a **`test:coverage`** (or equivalent) script that runs Jest **non-interactively** (no watch). Do **not** add **coverageThreshold**. All existing unit tests must remain green.

End-to-end: a contributor runs the coverage script locally and opens the HTML report; coverage reflects module source files, not the **example** app.

## Acceptance criteria

- [ ] Jest config defines **collectCoverageFrom** for module sources with appropriate exclusions (e.g. `__tests__`, `*.d.ts`).
- [ ] Coverage reporters include at least **text-summary**, **html**, and **lcov**; output directory is gitignored where applicable.
- [ ] **package.json** exposes a one-shot **`test:coverage`** (or documented equivalent) suitable for CI (no watch).
- [ ] No **coverageThreshold** / percentage gates in this slice.
- [ ] Default **`test`** / **`expo-module test`** behavior unchanged unless the project already standardizes on a flag (coverage only when using the coverage script).
- [ ] All existing Jest suites pass.

## Blocked by

None — can start immediately.

## Type

AFK

## User stories covered (from #90)

1, 2, 3, 14, 19, 20, 24.
