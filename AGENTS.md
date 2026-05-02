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

## Docs structure

Issue tracker is mirrored locally under `docs/` so agents can read full specs offline.

**`docs/prd/`** — Full PRDs (Problem Statement + User Stories + Implementation + Testing sections). Named `NNNN-slug.md` where `NNNN` is the GitHub issue number. A PRD is any issue with the full PRD template body (User Stories section present).

**`docs/issues/`** — Short issue cards (What to build + Acceptance criteria). Named `NNNN-slug.md` where `NNNN` is the GitHub issue number.

**Labels → local status:**
- `needs-triage` — **incoming queue only**; remove from GitHub once reviewed (and drop from local mirrors). Do **not** leave on **closed** issues — it clutters views.
- `ready-for-agent` — fully specified, safe for an autonomous AFK agent
- `ready-for-human` — requires human judgment or physical device
- `enhancement` — new feature or refactor

**Sync rule:** When a new GitHub issue or PRD is created, create the matching local file immediately in the same commit. When an issue is closed or its body **or labels** change, update the local file metadata (`Status`, `Labels`). Use `gh issue view N --repo launchbox-tech/expo-veepoo-sdk --json number,title,labels,state,body` to fetch the latest content.

## Flagged ambiguities

_(none yet)_
