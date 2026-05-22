# refactor(android): decompose VeepooSDKModuleReadData.kt callback pipelines

**Issue:** #195
**Status:** Open
**Labels:** enhancement

## What to build

[`android/src/main/kotlin/expo/modules/veepoo/VeepooSDKModuleReadData.kt`](../../android/src/main/kotlin/expo/modules/veepoo/VeepooSDKModuleReadData.kt) (~1167 lines) uses deep nested `object : …Listener` blocks. Introduce reusable helpers or extension-per-read-type modules; align with [`src/bridge/origin-read-pipeline.ts`](../../src/bridge/origin-read-pipeline.ts) where applicable.

## Acceptance criteria

- Primary read-data module **under ~600 lines** or split into multiple focused files with clear ownership.
- No native API or event-shape regressions.
- Reduce listener nesting (named classes / small functions over giant anonymous blocks).

## References

- [`docs/prd/0140-origin-read-pipeline.md`](../prd/0140-origin-read-pipeline.md)
