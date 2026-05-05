# fix: once() fires more than once — wrapper never removed from listeners Set

**Issue:** #25
**Status:** Closed
**Labels:** bug
**Parent:** #22

## What to build

Fix `once()`: the wrapper called `this.off(event, listener)` but the Set holds the wrapper, not the original listener, so the wrapper was never removed. Fix the wrapper to delete itself from the Set before invoking the original listener.

## Acceptance criteria

- [ ] `once(event, fn)` fires exactly once
- [ ] After first fire the wrapper is removed; second emit does not call `fn`
- [ ] Regression test added
