# 60 — feat(vendor): manifest + npm run vendor:check (warn-only)

## Parent

#59

## What to build

Add a single **vendor manifest** at the repo root listing every **vendored Android AAR identity** (matching Expo module config), **iOS VeepooBleSDK / linked framework identities**, and **optional** `lastReviewedUpstream` SHAs for `HBandSDK/Android_Ble_SDK` and `HBandSDK/iOS_Ble_SDK`.

Implement **`npm run vendor:check`**: read the manifest, optionally compare default-branch tips via read-only `git ls-remote` to the recorded SHAs, **print warnings** when they differ, and **always exit 0** (warn-only; does not fail CI by default).

This slice is complete when a maintainer can bump a binary, update the manifest, run the script locally or in CI, and see drift warnings without blocking merges.

## Acceptance criteria

- [ ] Root manifest file committed with schema documented inline or in ADR #61 cross-reference
- [ ] All Expo-configured Android AAR entries reflected in the manifest
- [ ] iOS vendor blobs (`VeepooBleSDK` and other linked frameworks from podspec) identified in the manifest
- [ ] `vendor:check` runs via `npm run vendor:check`; warns on upstream SHA drift; exits `0`
- [ ] No submodule requirement; manifest remains the single source of truth for pins

## Blocked by

None — can start immediately.
