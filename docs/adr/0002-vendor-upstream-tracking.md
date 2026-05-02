# Vendor binaries and upstream reference (no submodules)

## Status

Accepted

## Context

The module ships **vendored** Android AARs and iOS frameworks (VeepooBleSDK and related binaries). Official API documentation and demo sources live in **HBandSDK** GitHub repositories and **wikis**, which move independently of this repo.

Contributors might expect **git submodules** to pin upstream demos or to refresh binaries automatically. That does not match how OEM drops are delivered: binaries are copied into `android/libs/` and `ios/VeepooSDK/Frameworks/` and versioned here.

We need a **single manifest** of what we ship, **optional** pins of upstream repo HEAD SHAs for **human-process drift awareness**, and **non-blocking** automation so CI stays green until maintainers deliberately review upstream.

Product glossary (**Band**, **Session**, **Band Discovery**, **Pairing**) stays in **AGENTS.md**. This ADR only covers **maintainer / vendor** mechanics.

## Decision

1. **`vendor-manifest.json`** at the repository root is the authoritative list of **vendored artifact identities** (Android AAR paths tied to `expo-module.config.json`, iOS linked frameworks from the podspec) and **`upstreamReference`** entries with `lastReviewedHeadSha` for `HBandSDK/Android_Ble_SDK` and `HBandSDK/iOS_Ble_SDK`.
2. **No git submodules** for those upstream repos. Reference remains wiki URLs + manifest pins + offline snapshots under `docs/VeepooSDK * Api.md`.
3. **`npm run vendor:check`** (`scripts/vendor-check.mjs`) performs **read-only** `git ls-remote … HEAD` comparisons to manifest pins, **prints warnings** when default branches move, checks for **missing AAR files** when `android/libs` is present, and **always exits code 0** (warn-only; does not fail CI by default).
4. When bumping any vendored binary: update **`vendor-manifest.json`**, **`docs/release-notes/`**, and **`docs/vendor-parity-matrix.md`** as applicable; refresh **`lastReviewedHeadSha`** after reviewing upstream wikis/commits.

## Consequences

- **Positive:** predictable clone for consumers; drift visibility without submodule friction; clear release gate tied to manifest + notes.
- **Negative:** bumping binaries remains a **manual** copy step from OEM drops; upstream SHA pins require occasional maintainer updates after wiki/API review.

## Links

- Parent PRD: GitHub issue #59 (`docs/prd/0059-vendor-upstream-tracking-and-parity.md`)
- Android wiki (EN): https://github.com/HBandSDK/Android_Ble_SDK/wiki/VeepooSDK-Android-API-Document
- iOS wiki (EN): https://github.com/HBandSDK/iOS_Ble_SDK/wiki/VeepooSDK-iOS-API-Document
