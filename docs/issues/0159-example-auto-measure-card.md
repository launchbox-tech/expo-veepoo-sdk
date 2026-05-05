# feat(example): AutoMeasureCard — read and modify auto-measure settings

**Issue:** #159
**Status:** Closed
**Labels:** enhancement, ready-for-agent
**Parent:** #154

## What to build

New `AutoMeasureCard` component covering the two auto-measure SDK methods.

## Acceptance criteria

- [ ] "Read" → `readAutoMeasureSetting()`, displays returned list as JSON
- [ ] "Modify" → `modifyAutoMeasureSetting({measureInterval: 30})`, displays updated list as JSON
- [ ] Modify button disabled until a read succeeds
