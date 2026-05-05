---
number: 179
title: "refactor: rename all JS-exposed event names to snake_case"
status: Closed
labels: [enhancement]
---

## What to build

Rename every JS-facing event name from camelCase to snake_case while keeping native bridge strings unchanged. The event bus subscribes to native camelCase names but re-emits to app consumers under snake_case names.

## Acceptance criteria

- [ ] `NATIVE_EMITTED_EVENTS` unchanged (native contract)
- [ ] `NATIVE_TO_JS_EVENT_MAP` maps camelCase → snake_case
- [ ] `JS_LOCAL_ONLY_EVENTS` and `ALL_VEEPOO_EVENTS` use snake_case
- [ ] `VeepooEvent` union and `VeepooEventPayload` keyed by snake_case
- [ ] `EventBus.setupEventListeners` subscribes via native camelCase, emits via snake_case
- [ ] `event-normalizer.ts` dispatch table uses snake_case keys
- [ ] All capabilities, SDK runtime, state store, session utilities use snake_case
- [ ] Tests and example app updated
- [ ] tsc, lint, 512 tests pass

## Blocked by

None - can start immediately
