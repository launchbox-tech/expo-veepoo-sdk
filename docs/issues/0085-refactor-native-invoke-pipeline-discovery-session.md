# 85 — refactor: Native invoke pipeline — Band Discovery + Session handshake (#81)

> GitHub: https://github.com/launchbox-tech/expo-veepoo-sdk/issues/85  
> Status: open | Labels: needs-triage, enhancement

## Parent

#81 — PRD: JavaScript bridge architecture hardening (contract, depth, optional Session recipe)

## What to build

Introduce a **small, deep** **native invoke pipeline** module (**validate → await native → normalize → `mapNativeRejection` → logging**) and migrate the **Band Discovery** + **Session** handshake path end-to-end: **init**, Bluetooth check, **permissions**, **`startScan` / `stopScan`**, **`connect` / `disconnect`**, **`getConnectionStatus`**, **`verifyPassword`**, including correct **scanning** / **connected device id** state and **event listener** setup that those flows depend on. Prove with **regression tests** on an injected native mock covering **discovery → connect → password** (mock-level).

## Acceptance criteria

- [x] **`invokeNative`** in **`src/bridge/native-invoke-pipeline.ts`** drives **init**, **checkBluetoothStatus**, **requestPermissions**, **startScan** / **stopScan**, **connect** / **disconnect**, **getConnectionStatus**, **verifyPassword**; **`withNative`** delegates to the same helper (all native failures go through **`handleError`** → **`mapNativeRejection`**).
- [x] Scanning / **connectedDeviceId** / logging order preserved; **`setupEventListeners`** still runs before **`native.init`**.
- [x] Jest: handshake **scan → connect → verifyPassword**; **connect** with native **`CONNECTION_FAILED`** code; **`native-invoke-pipeline`** unit tests.
- [x] **`validateDeviceId` / `validateConnectOptions`** unchanged (validators outside mapper per **ADR 0003**).

## Blocked by

- #84 (canonical method / mock pattern should exist first)

## Type

AFK

## User stories covered (from #81)

7, 8, 12, 16, 27, 33, 36, 37, 41, 43, 49, 50.
