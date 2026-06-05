# Trust retrieved peripherals — reattach before scanning

## Status

Accepted (2026-06-05) — reverses the scan-first policy in `handleConnect`

## Context

`handleConnect` resolved the peripheral in this order: scan-result cache →
`retrievePeripherals(withIdentifiers:)` → hidden scan fallback — but a
UUID-retrieved model was **deliberately discarded**
(`shouldUseScanFallbackDirectly = modelSource == "retrieved:uuid"`, comment:
"scan-result models are more stable"), forcing every UUID connect through a
5-second scan.

Consequences observed live (2026-06-05, companion app on physical hardware):

- **Every process start connects via scan** (the scan cache is empty at boot).
- **A band still holding the stale link from a killed process does not
  advertise** — it is invisible to scans → `DEVICE_NOT_FOUND` ("Device not
  found after scanning") → retry churn until iOS drops the stale link.
- Scans that did connect could attach onto the half-stale system link and
  produce a **deaf link**: password verify passes, every command write is
  silently dropped (the companion app grew zombie-detection + recycle
  machinery to survive this).
- The vendor's own G Band app connects **instantly** on open — it reattaches
  to the system-held peripheral directly; a direct CoreBluetooth connect
  needs no advertising at all.

The "retrieved models are unstable" distrust had a real root, found in this
revision: the retrieve ran on **`self.centralManager`** — the module's
separate permission-probe central — and a `CBPeripheral` is only valid with
the central that created it. The vendor (`VPBleCentralManage`) was being
handed a **foreign peripheral**.

## Decision

1. **Retrieve on the vendor's central.** `VPBleCentralManage` exposes its
   `centralManager` property — `retrievePeripherals(withIdentifiers:)` runs
   there, so the resulting peripheral is native to the central that will
   connect it.
2. **Trust the retrieved model**: `shouldUseScanFallbackDirectly` is true
   only for `modelSource == "none"`. A retrieved peripheral goes straight to
   `performConnect` — instant reattach when the band is system-connected,
   direct connect (wakes on advertisement) otherwise.
3. **The scan remains the fallback, never the default**: `performConnect`'s
   existing `fallbackToScan` covers failure/timeout, so trusting the model
   can never do worse than the old policy.

## Consequences

- Process-start reconnects drop from ~5–20s (scan window + stale-link
  blindness + retries) to milliseconds-to-~2s (G Band parity).
- The deaf-link class tied to scan-connecting over stale links should
  disappear; the companion app keeps its zombie-recycle as a backstop, not a
  crutch.
- If the vendor connect with a retrieved model ever proves unstable in the
  field, the failure path is the old behavior (scan fallback) — strictly no
  regression.
- `veepooSDKSelfScanConnectDevice:` (vendor API for app-supplied
  `CBPeripheral`s) is the documented alternative if model-wrapping ever
  needs to be bypassed; not needed in this revision.

## Links

- [`ios/VeepooSDK/VeepooSDKModule+Connect.swift`](../../ios/VeepooSDK/VeepooSDKModule+Connect.swift)
- [ADR-0012 — vendor calls enter from main](./0012-vendor-calls-enter-from-main.md)
