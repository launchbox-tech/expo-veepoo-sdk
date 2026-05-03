# 109 — PRD: shrink example `index.tsx` to ~200 lines (fulfill PRD #18)

> GitHub: https://github.com/launchbox-tech/expo-veepoo-sdk/issues/109
> Status: open | Labels: enhancement, ready-for-agent

## Problem Statement

PRD #18 (Component Extraction) promised: *"After the extraction, `index.tsx` shrinks to ~200 lines: hook calls, stale-state derivations, and JSX only — no inline component definitions."*

The three presentational components (`DeviceRow`, `InfoRow`, `HealthTestCard`) were successfully extracted to `example/src/components/`, **but** the main `example/src/app/index.tsx` file remains **1115 lines**. It contains massive inline JSX for 15+ cards/sections (device info, find-band, watch-face, screen light, sedentary, wrist-flip, women's health, camera/music, GPS/AGPS, Bluetooth, firmware DFU, health tests, vitals lab, historical data sync, event log), the idle/scanning/disconnected screens, and a 150-line StyleSheet — all inline. Developers cannot "understand the screen's data flow without wading through component implementations" as promised.

## Solution

Extract all inline JSX and the StyleSheet from `example/src/app/index.tsx` into focused sub-components and a styles file, leaving only hook calls, stale-state derivations, and top-level JSX that composes the extracted pieces. The file must shrink from 1115 lines to approximately 200 lines. New sub-components should follow the same pattern as the existing `components/` directory and be independently testable.

## User Stories

1. As a developer reading `index.tsx`, I want the file to be ~200 lines, so that I can understand the screen's data flow without scrolling through component implementations.
2. As a developer, I want all hook calls (`useReducer`, `useSDKInit`, `useBandScan`, `useBandSession`, `useHealthTests`, `useDataSync`) at the top of `index.tsx`, so that I can see the full data-flow contract in one glance.
3. As a developer, I want stale-state derivations (e.g. `hrResult`, `bpResult`, `activeTest`, `dataSyncing`, `sleepSummary`, `stepData`) immediately after hook calls, so that I know what derived state feeds the JSX.
4. As a developer, I want the default export function `Index()` to contain only JSX that composes extracted sub-components, so that the render tree is obvious.
5. As a developer, I want the "initializing" state JSX extracted to a `InitializingScreen` component, so that bootstrap UI is in its own file.
6. As a developer, I want the "connecting" state JSX extracted to a `ConnectingScreen` component, so that connection-in-progress UI is co-located.
7. As a developer, I want the "disconnected" state JSX extracted to a `DisconnectedScreen` component, so that reconnect UI is in its own file.
8. As a developer, I want the "idle"/"scanning" state JSX (permission hint, scan button, device list) extracted to a `ScanScreen` component, so that Band Discovery UI is in its own file.
9. As a developer, I want the ready-state header (title + device name) extracted to a `ReadyHeader` component, so that the session-active header is reusable.
10. As a developer, I want the Device Info card (battery, firmware version) extracted to a `DeviceInfoCard` component, so that device-details UI is co-located.
11. As a developer, I want the Find Band card extracted to a `FindBandCard` component, so that anti-loss UI is in its own file.
12. As a developer, I want the Watch Face card extracted to a `WatchFaceCard` component, so that dial-style UI is co-located.
13. As a developer, I want the Screen Light card (brightness + duration) extracted to a `ScreenLightCard` component, so that screen-settings UI is in its own file.
14. As a developer, I want the Sedentary Reminder card extracted to a `SedentaryCard` component, so that reminder UI is co-located.
15. As a developer, I want the Wrist-Flip Wake card extracted to a `WristFlipCard` component, so that wrist-flip UI is in its own file.
16. As a developer, I want the Women's Health card extracted to a `WomenHealthCard` component, so that women's-health UI is co-located.
17. As a developer, I want the Camera & Music card extracted to a `CameraMusicCard` component, so that remote-control UI is in its own file.
18. As a developer, I want the GPS / AGPS card extracted to a `GpsAgpsCard` component, so that location-push UI is in its own file.
19. As a developer, I want the Band Bluetooth card extracted to a `BandBluetoothCard` component, so that Bluetooth-toggle UI is co-located.
20. As a developer, I want the Firmware DFU card extracted to a `FirmwareDfuCard` component, so that OTA-update UI is in its own file.
21. As a developer, I want the Personal Info Sync row extracted to a `PersonalInfoSync` component, so that sync-status UI is co-located.
22. As a developer, I want the Health Tests section header + cards extracted to a `HealthTestsSection` component, so that realtime-test UI is in its own file.
23. As a developer, I want the Vitals Lab section header + cards extracted to a `VitalsLabSection` component, so that HRV/ECG/fatigue/breathing UI is in its own file.
24. As a developer, I want the Historical Data section (sync button, progress, sleep summary, step data) extracted to a `HistoricalDataSection` component, so that data-sync UI is co-located.
25. As a developer, I want the Event Log card extracted to a `EventLogCard` component, so that lab-log UI is in its own file.
26. As a developer, I want the Disconnect button at the bottom of the ready screen extracted to a `DisconnectButton` component, so that session-teardown UI is co-located.
27. As a developer, I want the StyleSheet (150 lines) moved to `example/src/app/styles.ts`, so that layout constants don't bloat the component file.
28. As a developer importing sub-components, I want a barrel `example/src/app/components/index.ts` (or reuse `example/src/components/index.ts`), so that import lines stay short.
29. As a developer, I want each extracted sub-component to receive its data and callbacks via props, so that each sub-component is independently renderable and testable.
30. As a developer, I want `index.tsx` to use `useSDKEvent` calls for `findDeviceState`, `cameraShutter`, and `musicRemoteCommand` near the top with other hook calls, so that event subscriptions are visible in one place.
31. As a developer, I want the `useState` calls for `findPhase`, `screenLightInfo`, `screenDurationInfo`, `sedentaryInfo`, `wristFlipInfo`, `womenHealthInfo`, `watchFaceInfo`, `cameraInfo`, `musicCommandInfo`, `musicEnabled`, `gpsInfo`, `btInfo` to remain in `index.tsx` (or be co-located with their card's sub-component), so that local UI state stays discoverable.
32. As a developer running TypeScript checks, I want the extraction to produce zero `tsc` errors, so that I can trust the types are correct after the refactor.
33. As a developer, I want each extracted sub-component to have co-located styles (importing shared tokens from `components/theme.ts`), so that I can understand a component's visual structure without cross-referencing a monolith stylesheet.
34. As a reviewer, I want the diff for this PR to be clean — one commit that moves code from `index.tsx` into sub-files — so that code review is straightforward.
35. As a host-app developer using the example app, I want the app to behave identically after the refactor, so that I can verify correctness by visual inspection without re-reading logic.

## Implementation Decisions

### Modules to build/modify

- **`example/src/app/index.tsx` (modified)**: Strip everything except hook calls, stale-state derivations, `useSDKEvent` calls, and top-level JSX composing `<ScanScreen />` and `<ReadyScreen />`. Target: ~200 lines.
- **`example/src/app/ReadyScreen.tsx` (new)**: Composes all ready-state sub-components: `ReadyHeader`, `DeviceInfoCard`, `FindBandCard`, `WatchFaceCard`, `ScreenLightCard`, `SedentaryCard`, `WristFlipCard`, `WomenHealthCard`, `CameraMusicCard`, `GpsAgpsCard`, `BandBluetoothCard`, `FirmwareDfuCard`, `PersonalInfoSync`, `HealthTestsSection`, `VitalsLabSection`, `HistoricalDataSection`, `EventLogCard`, `DisconnectButton`.
- **`example/src/app/ScanScreen.tsx` (new)**: Composes idle/scanning/disconnected JSX + device list using `DeviceRow`.
- **`example/src/app/components/`*** (new files)**: One file per card/section listed in user stories 5–26. Each receives props (data + callbacks) and renders its own JSX with co-located styles.
- **`example/src/app/styles.ts` (new)**: Moved StyleSheet from `index.tsx` (lines 966–1115). Shared tokens (`BLUE`, `RED`, `GREEN`) imported from `components/theme.ts`.
- **`example/src/app/components/index.ts` (modified)**: Add barrel exports for all new sub-components.

### Architecture decisions

- **Deep modules**: Each card (e.g. `ScreenLightCard`, `HealthTestsSection`) is a deep module — it encapsulates its rendering and interaction logic behind a simple props interface. This matches the pattern established by `HealthTestCard`, `InfoRow`, and `DeviceRow`.
- **Props interface**: Each sub-component defines its own props type (e.g. `ScreenLightCardProps`) with typed data and callback props. No `any` in prop types.
- **Style locality**: Each sub-component file defines its own `StyleSheet.create({})` call, importing shared color tokens from `components/theme.ts`. The monolith `styles` object is fully decomposed.
- **State placement**: `useState` calls for card-specific UI state (e.g. `screenLightInfo`) move into their respective card component. `useSDKEvent` calls stay in `index.tsx` or move to `ReadyScreen.tsx` if they only affect one sub-component.
- **No behavior change**: This is a file-move refactor only. No visual behavior changes, no new features, no prop changes beyond what's needed to pass existing data.

### Schema changes

None. This is purely a file reorganization within the example app.

## Testing Decisions

### What makes a good test here

These are presentational components with no internal state beyond the props they receive. A good test exercises only external behavior (what the component renders given certain props), not internal implementation (style object contents, which StyleSheet key was used). Since the example app has no existing test infrastructure, no tests are written as part of this refactor. The TypeScript compiler (`tsc --noEmit`) serves as the correctness gate.

### Modules with tests

None — consistent with PRD #18's decision: *"No existing test infrastructure exists in the example app, so no tests are written as part of this refactor."*

If tests are added in the future, `HealthTestsSection` and `HistoricalDataSection` are the most valuable targets due to their conditional rendering paths.

## Out of Scope

- Adding tests for the extracted components (same decision as PRD #18).
- Changing any visual behavior or props beyond what's needed to pass existing data.
- Renaming the components or the main `index.tsx` file.
- Extracting the `useSDKInit`, `useBandScan`, `useBandSession`, `useHealthTests`, `useDataSync` hooks — they remain separate files as-is.
- Modifying the `components/DeviceRow.tsx`, `components/HealthTestCard.tsx`, or `components/InfoRow.tsx` — they are already correctly extracted.
- Changing native code, SDK hooks, or `example/src/hooks/` — this refactor touches only `example/src/app/index.tsx` and new sub-component files.

## Further Notes

- This PRD completes the unfulfilled user story from PRD #18: *"As a developer reading `index.tsx`, I want it to contain only hook calls, stale-state derivations, and JSX, so that I can understand the screen's data flow without wading through component implementations."*
- The current `index.tsx` is 1115 lines. After extraction it must be approximately 200 lines (±20). Anything above 250 lines means the extraction is incomplete.
- Domain language: use **Band**, **Session**, **Band Discovery**, **Pairing** per `AGENTS.md` — avoid "watch," "connection" for Session, etc.
- Naming: follow existing convention — `PascalCase` for component files (`ReadyScreen.tsx`), `camelCase` for props interfaces (`ReadyScreenProps`).
- After this PRD ships, update `docs/prd/0018-component-extraction.md` to mark all user stories as fulfilled and update the "Implementation Decisions" section to reflect the final state.
- The `ReadyScreen.tsx` can be further split in a future PR if it grows, but the current goal is to get `index.tsx` to ~200 lines.
