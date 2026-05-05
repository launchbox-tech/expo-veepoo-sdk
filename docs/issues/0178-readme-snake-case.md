# docs(readme): rewrite all code examples to snake_case API

**Issue:** #178
**Status:** Open
**Labels:** enhancement, needs-triage
**Parent:** #175

## What to build

Rewrite every code example in README.md to use the current snake_case API introduced in #173. No structural changes to the README sections — purely replacing camelCase property names and string values in code blocks with their snake_case equivalents.

## Acceptance criteria

- [ ] No camelCase SDK property names remain in any code block in README.md
- [ ] No camelCase string literal union values remain in any code block (e.g. `'poweredOn'`, `'notDetermined'`)
- [ ] All input object examples use snake_case keys
- [ ] All destructuring examples use snake_case keys
- [ ] README renders correctly (no broken markdown)

## Blocked by

None - can start immediately
