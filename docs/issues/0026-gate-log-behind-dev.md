# feat: gate SDK console output behind __DEV__

**Issue:** #26
**Status:** Closed
**Labels:** enhancement
**Parent:** #22

## What to build

Gate all `VeepooSDK.log()` console calls behind `this.logEnabled && (typeof __DEV__ === 'undefined' || __DEV__)`. The custom `logger` callback is not gated (host apps may use a production-safe remote logger).

## Acceptance criteria

- [ ] Console not called when `__DEV__` is falsy
- [ ] Custom `logger` is still called regardless of `__DEV__`
- [ ] Logging tests added, including production-mode suppression path
