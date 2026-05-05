# refactor: migrate to tsdown build, kebab-case filenames, @ path alias, and clean TypeScript imports

**Issue:** #175
**Status:** Open
**Labels:** enhancement, needs-triage

## Problem Statement

The SDK source has accumulated several inconsistencies that make it harder to navigate and maintain: three top-level files use PascalCase names while everything else is kebab-case; all internal imports carry spurious `.js` extensions that only make sense under Node ESM module resolution (but the project uses CommonJS); there is no path alias so deep files require long relative traversals like `../../../normalizers/primitives`; the build pipeline is a bare `tsc` invocation that cannot resolve path aliases in output; and the README code examples still reference the pre-snake_case API.

## Solution

Migrate the build pipeline from raw `tsc` to `tsdown`, which handles path alias resolution natively. Add an `@` path alias pointing to `src/` in tsconfig so every internal import is a stable absolute path. Strip the `.js` extensions from all internal imports. Rename the four PascalCase source files and seven PascalCase test files to kebab-case. Collapse the `./session` sub-entry into the single `"."` export. Rewrite the README with snake_case API throughout.

## User Stories

1. As a developer working inside the SDK, I want to import from `@/normalizers/primitives` instead of `../../../normalizers/primitives`, so that deep files are readable and refactor-safe.
2. As a developer, I want all source file names to be kebab-case, so that the naming convention is consistent across the entire codebase.
3. As a developer, I want internal imports to be bare relative paths with no `.js` extension, so that the source reads as idiomatic TypeScript.
4. As a developer, I want `tsdown` to handle the build, so that path aliases are resolved in the compiled output without a separate post-processing step.
5. As a developer, I want a single `npm run build` command that produces a valid CommonJS bundle with declaration files, so that the publish pipeline is straightforward.
6. As a developer reading the README, I want all code examples to use the current snake_case API, so that the docs match what the SDK actually produces.
7. As a developer, I want the `./session` sub-path export collapsed into the main entry, so that there is one canonical import path for the SDK.
8. As a developer, I want all 512 existing tests to pass after the rename and import rewrites, so that no behaviour is accidentally changed.
9. As a developer, I want `tsc --noEmit` to pass after the tsconfig changes, so that type-checking still works in editors and CI.
10. As a developer, I want the example app to continue compiling against the updated package exports, so that the integration is validated end-to-end.
11. As a developer, I want the `@` alias to resolve in both the TypeScript source and the compiled output, so that runtime behaviour matches the type-checked source.
12. As a developer, I want the build output to preserve the existing `"main": "build/index.js"` entry so consuming apps require no changes.
13. As a developer, I want declaration maps and source maps in the build output, so that IDE go-to-definition navigates to the TypeScript source.
14. As a developer, I want the `check:veepoo-events` and `check:native-rejection` scripts to continue working after the pipeline change.
15. As a developer, I want the Expo config plugin entry (`./build/plugin/index.js`) to remain reachable after the build, so that app installs are unaffected.

## Implementation Decisions

### tsconfig changes
- Add `"baseUrl": "./src"` and `"paths": { "@/*": ["./*"] }` to compilerOptions.
- Keep `"module": "CommonJS"` and `"moduleResolution": "node"` — no ESM migration.
- Keep strict, declaration, declarationMap, sourceMap flags as-is.

### tsdown build pipeline
- Add `tsdown` as a dev dependency.
- Create `tsdown.config.ts` at the repo root with a single entry (`src/index.ts`), format `cjs`, `dts: true`, output to `build/`.
- Replace the `"build"` script value with `tsdown && node scripts/copy-native-rejection-json.cjs`.
- Update `"build:watch"` to `tsdown --watch`.
- The Expo config plugin (`src/plugin/index.ts`) must be declared as an additional entry so `build/plugin/index.js` is still emitted.

### package.json exports
- Remove the `"./session"` export condition entirely.
- Keep the `"."` export with `types`, `react-native`, `import`, `require`, and `default` conditions pointing to `build/index`.

### File renames (source)
- `src/VeepooSDK.ts` → `src/veepoo-sdk.ts`
- `src/NativeVeepooSDK.ts` → `src/native-veepoo-sdk.ts`
- `src/VeepooSDKModule.ts` → `src/veepoo-sdk-module.ts`
- `src/react/VeepooSDKContext.ts` → `src/react/veepoo-sdk-context.ts`

### File renames (tests)
- `src/__tests__/VeepooSDK.test.ts` → `src/__tests__/veepoo-sdk.test.ts`
- `src/__tests__/device-settings/AlarmSettings.test.ts` → `src/__tests__/device-settings/alarm-settings.test.ts`
- `src/__tests__/device-settings/DisplaySettings.test.ts` → `src/__tests__/device-settings/display-settings.test.ts`
- `src/__tests__/device-settings/EmergencySettings.test.ts` → `src/__tests__/device-settings/emergency-settings.test.ts`
- `src/__tests__/device-settings/HealthConfig.test.ts` → `src/__tests__/device-settings/health-config.test.ts`
- `src/__tests__/device-settings/MediaInteraction.test.ts` → `src/__tests__/device-settings/media-interaction.test.ts`
- `src/__tests__/device-settings/SystemSettings.test.ts` → `src/__tests__/device-settings/system-settings.test.ts`

### Import rewriting
- Strip `.js` extension from every internal import across all ~130 source files.
- Migrate cross-directory relative imports to `@/` paths. Same-directory relative imports (`./normalizers`, `./validators`) stay relative.
- Imports from external packages (`expo-modules-core`, `react`, etc.) are unchanged.

### README rewrite
- All code examples updated to snake_case API (no migration callout, no version annotation).
- No structural change to the README sections.

## Testing Decisions

A good test only asserts externally observable behaviour — return values, thrown errors, emitted events — not which file was imported or what the import path looks like. The file renames and import rewrites are mechanical refactors with no behaviour change; the existing test suite is the correctness signal.

**Signals that must be green after all changes:**
- `tsdown build` exits 0; `build/index.js` and `build/index.d.ts` exist.
- `tsc --noEmit` exits 0 in both the SDK root and `example/`.
- All 512 unit tests pass (`expo-module test`).
- `check:veepoo-events` and `check:native-rejection` exit 0.

**No new unit tests required** — the rename and import changes are transparent to behaviour. The build output and type-check are the integration signals.

## Out of Scope

- Migrating from CommonJS to ESM output.
- Changing `moduleResolution` to `NodeNext` or `Bundler`.
- Adding `@/` aliases to the example app (it imports from the package, not from `src/`).
- Any changes to native iOS or Android code.
- Updating the vendor API parity matrix or release notes.

## Further Notes

- `tsdown` resolves `paths` from tsconfig automatically; no extra plugin config is needed.
- The Expo config plugin at `src/plugin/index.ts` must remain a separate tsdown entry so `build/plugin/index.js` is emitted. Without it the `expo.plugin` field in package.json breaks.
- The `app.plugin.js` shim at the repo root (referenced in `exports["./app.plugin"]`) is not compiled by tsdown — it stays as-is.
- `copy-native-rejection-json.cjs` copies a JSON file into `build/` as a post-step; it runs after tsdown, same as today.
