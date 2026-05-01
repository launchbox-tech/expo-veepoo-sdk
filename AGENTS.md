# expo-veepoo-sdk (HBand companion module)

A React Native / Expo module that bridges the VeepooSDK native libraries to JavaScript, enabling a companion app to communicate with HBand wearable devices. Private, GitHub-only.
Install skills with npx skills experimental_install if not present

## Language

**Band** (or **Device**):
The physical HBand wearable hardware. A single app targets one model of Band.
_Avoid_: watch, wearable, peripheral, gadget

**Session**:
An active BLE connection between the app and the Band. A Session starts after a successful connection and password verification, and ends on disconnect or signal loss.
_Avoid_: connection, link

**Band Discovery**:
The phase when the app actively scans for visible Bands. Begins when the user taps "Scan" and ends when scanning is stopped or a Band is selected. Produces a list of `VeepooDevice` candidates.
_Avoid_: BLE scan, device search

**Pairing**:
The one-time act of the user selecting their Band from a scan list. The resulting `deviceId` is stored by the app and used for all future reconnections. Not a BLE pairing in the OS sense.
_Avoid_: bonding, linking

## Relationships

- An app manages at most one **Session** at a time
- A **Session** is required before any health data operations

## Decisions

- Naming kept as-is from the fork: package `expo-veepoo-sdk`, native module `VeepooSDK`, types `VeepooDevice` etc. No rename — private app, speed over branding. (ADR 0001)
- Reconnection flow: app stores `deviceId` from Pairing, rescans on every launch, matches by stored `deviceId`, connects silently. The module does not manage reconnection state internally.
- `syncPersonalInfo()` is called by the app on every `deviceReady` event, not tracked for changes.
- Connection drop handling: module emits `deviceDisconnected`; the app owns reconnection UX and retries via `startScan()` + `connect()`. Module does not auto-reconnect.
- Full data scope required: real-time health tests (HR, BP, SpO2, temperature, stress, glucose), historical data (5-min origin, half-hour, sleep, steps), and device config (battery, auto-measure, language).
- A minimal example app lives under `example/` in the repo for testing scan → connect → read data in isolation.
- Distribution: private, GitHub-only. Installed via `npm install github:launchbox-tech/expo-veepoo-sdk`. Not published to npm.

## Workflow

- After each GitHub issue is implemented, commit only that issue's diff with `Fixes #N` in the commit message body, then push immediately before starting the next issue.

## Flagged ambiguities

_(none yet)_
