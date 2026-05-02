# 89 — feat: Optional Session baseline helper (post–deviceReady) (#81)

> GitHub: https://github.com/launchbox-tech/expo-veepoo-sdk/issues/89  
> Status: open | Labels: needs-triage, enhancement

## Parent

#81 — PRD: JavaScript bridge architecture hardening (contract, depth, optional Session recipe)

## What to build

Ship an **optional** export that runs a **documented Session baseline** after **`deviceReady`**—aligned with **`AGENTS.md`** (**`syncPersonalInfo`** on ready, etc.)—as a **small testable module**. **Must not** implement **Pairing** storage, **Band Discovery** retries, or **auto-reconnect** on **`deviceDisconnected`**; the host app owns those flows. Include **unit tests** for ordering and failure propagation using a **fake** **`VeepooSDKModuleInterface`**.

## Acceptance criteria

- [ ] Optional export is **tree-shakeable**; default bundle does not require it.
- [ ] Documented behaviour matches **`deviceReady`** / **Session** baseline policy; **no** reconnection logic inside the helper.
- [ ] Unit tests cover success ordering and at least one failure path (e.g. **`syncPersonalInfo`** rejects).
- [ ] **`CONTEXT.md`** or glossary updated if a new term is introduced for the helper.

## Blocked by

- #82 (event names stable under contract)
- #88 (facade structure settled)

## Type

AFK

## User stories covered (from #81)

10, 11, 12, 19, 22, 23, 44, 49, 50.
