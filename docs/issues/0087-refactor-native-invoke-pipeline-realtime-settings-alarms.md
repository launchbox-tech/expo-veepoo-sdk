# 87 — refactor: Native invoke pipeline — realtime vitals + settings + alarms (#81)

> GitHub: https://github.com/launchbox-tech/expo-veepoo-sdk/issues/87  
> Status: open | Labels: needs-triage, enhancement

## Parent

#81 — PRD: JavaScript bridge architecture hardening (contract, depth, optional Session recipe)

## What to build

Migrate **realtime vitals** start/stop methods, **device settings** (**auto measure**, **language**, **device time**), **alarms** (standard + **heart rate alarm**), **social write**, and any remaining **`AsyncFunction`**s not covered by prior slices—**all** through the **native invoke pipeline**. Preserve **realtime test mutex** error behaviour (**`VeepooError.code`** stable across platforms). Complete the façade migration so **every** native call path is consistent.

## Acceptance criteria

- [ ] All realtime start/stop pairs and settings/alarm/social write paths use the pipeline; **mutex** errors still surface as expected from mocks/native fixtures.
- [ ] Full **Jest** suite green; no bypassed **`catch`** blocks for native failures.
- [ ] Release notes or contributor note if any **internal** logging scope changes are visible to integrators.
- [ ] **Example app** unchanged unless a bugfix falls out of parity work.

## Blocked by

- #86 (health reads path merged first)

## Type

AFK

## User stories covered (from #81)

7, 8, 17, 19, 30, 32, 48, 50.
