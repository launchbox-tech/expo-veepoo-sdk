# build(pipeline): migrate to tsdown, add @ path alias, collapse ./session export

**Issue:** #176
**Status:** Open
**Labels:** enhancement, needs-triage
**Parent:** #175

## What to build

Replace the bare `tsc` build with `tsdown`. Add an `@` path alias in tsconfig pointing to `src/`. Collapse the `./session` sub-path export into the single `"."` entry. The result is a build command that resolves path aliases in output without any post-processor, and a single canonical import path for consumers.

## Acceptance criteria

- [ ] `tsdown` is added as a dev dependency
- [ ] `tsdown.config.ts` exists at the repo root with entries for `src/index.ts` and `src/plugin/index.ts`, format `cjs`, `dts: true`, output to `build/`
- [ ] tsconfig has `"baseUrl": "./src"` and `"paths": { "@/*": ["./*"] }`
- [ ] `package.json` `"build"` script uses `tsdown` instead of `tsc`
- [ ] `package.json` `"build:watch"` updated to `tsdown --watch`
- [ ] The `"./session"` export condition is removed from `package.json`
- [ ] `npm run build` exits 0 and produces `build/index.js`, `build/index.d.ts`, `build/plugin/index.js`
- [ ] `check:veepoo-events` and `check:native-rejection` still exit 0
- [ ] All 512 existing tests pass
- [ ] `tsc --noEmit` passes in both the SDK root and `example/`

## Blocked by

None - can start immediately
