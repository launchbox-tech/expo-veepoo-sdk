# refactor(src): kebab-case file renames + strip .js extensions + @ path alias imports

**Issue:** #177
**Status:** Open
**Labels:** enhancement, needs-triage
**Parent:** #175

## What to build

Rename 4 PascalCase source files and 7 PascalCase test files to kebab-case. Strip the `.js` extension from every internal import across all ~130 source files. Migrate cross-directory relative imports to `@/` absolute paths. Same-directory imports (`./normalizers`, `./validators`) stay relative. No behaviour changes — the existing test suite is the correctness signal.

**Source files to rename:**
- `src/VeepooSDK.ts` → `src/veepoo-sdk.ts`
- `src/NativeVeepooSDK.ts` → `src/native-veepoo-sdk.ts`
- `src/VeepooSDKModule.ts` → `src/veepoo-sdk-module.ts`
- `src/react/VeepooSDKContext.ts` → `src/react/veepoo-sdk-context.ts`

**Test files to rename:**
- `src/__tests__/VeepooSDK.test.ts` → `src/__tests__/veepoo-sdk.test.ts`
- `src/__tests__/device-settings/AlarmSettings.test.ts` → `src/__tests__/device-settings/alarm-settings.test.ts`
- `src/__tests__/device-settings/DisplaySettings.test.ts` → `src/__tests__/device-settings/display-settings.test.ts`
- `src/__tests__/device-settings/EmergencySettings.test.ts` → `src/__tests__/device-settings/emergency-settings.test.ts`
- `src/__tests__/device-settings/HealthConfig.test.ts` → `src/__tests__/device-settings/health-config.test.ts`
- `src/__tests__/device-settings/MediaInteraction.test.ts` → `src/__tests__/device-settings/media-interaction.test.ts`
- `src/__tests__/device-settings/SystemSettings.test.ts` → `src/__tests__/device-settings/system-settings.test.ts`

## Acceptance criteria

- [ ] All 4 PascalCase source files renamed to kebab-case
- [ ] All 7 PascalCase test files renamed to kebab-case
- [ ] No `.js` extensions remain in any internal import across `src/`
- [ ] Cross-directory imports use `@/` prefix (e.g. `@/normalizers/primitives` not `../../normalizers/primitives`)
- [ ] Same-directory imports remain relative (`./normalizers`, `./validators`)
- [ ] All 512 tests pass after renames
- [ ] `tsc --noEmit` passes in both the SDK root and `example/`
- [ ] `npm run build` exits 0

## Blocked by

#176 — tsconfig `@` alias must be in place before imports can be migrated to `@/` paths
