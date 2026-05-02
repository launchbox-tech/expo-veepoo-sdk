# 92 — feat: ESLint policy and lint-clean module sources (#90)

> GitHub: https://github.com/launchbox-tech/expo-veepoo-sdk/issues/92  
> Status: closed | Labels: —

## Parent

#90 — PRD: Module test coverage reports and CI quality pipeline

## What to build

Tracer bullet from PRD #90: make **`lint`** reliable for CI by adding an ESLint **override** for unit tests (e.g. relax **`@typescript-eslint/no-explicit-any`**) and fixing **production** TypeScript so lint passes—aligned with the PRD (**`unknown`** at bridge boundaries where applicable, **`once`** uses a **`const`** **EventListener**, **`__DEV__` global** handling, remove obsolete **`@ts-ignore`**). Do not change the public module API or **Session** semantics.

## Acceptance criteria

- [x] **`bun run lint`** / **`npm run lint`** passes on the repo.
- [x] Test-only ESLint override is scoped to test paths and documents why **`any`** is allowed there.
- [x] Production fixes are lint-driven and consistent with **ADR 0003** and **`CONTEXT.md`** (no opportunistic behavior changes).
- [x] All existing Jest suites pass.

## Blocked by

None — can start immediately.

## Type

AFK

## User stories covered (from #90)

4, 5, 15, 16.
