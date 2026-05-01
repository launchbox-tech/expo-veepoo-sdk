# Keep existing Veepoo naming unchanged

We keep the fork's naming as-is: package `expo-veepoo-sdk`, native module `VeepooSDK`, TypeScript types `VeepooDevice`, `VeepooError`, etc. The package is private and GitHub-only, so there is no public-facing brand concern that would justify the rename cost. Speed matters more than OEM name hygiene for a private companion app.

## Considered Options

- Rename to `expo-hband-sdk` / `HBandSDK` — cleaner branding, ~8 file changes across native + JS
- Keep `expo-veepoo-sdk` / `VeepooSDK` **(chosen)** — zero changes, fork works immediately, naming is internal-only
