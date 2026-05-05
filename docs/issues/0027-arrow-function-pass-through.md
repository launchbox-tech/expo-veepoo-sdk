# refactor: convert bare pass-through methods to arrow function class properties

**Issue:** #27
**Status:** Closed
**Labels:** enhancement
**Parent:** #22

## What to build

Convert `syncPersonalInfo`, `readDeviceAllData`, and `setLanguage` from verbose methods with `async`/`return`/`{}` to compact arrow function class properties that delegate directly to `this.native.*`.

## Acceptance criteria

- [ ] All three are arrow function class properties with no `async`, no `return`, no `{}`
- [ ] Each delegates to `this.native.*` with correct arguments
- [ ] Existing tests still pass
