# 76 — docs(errors): release notes for native rejection mapping (PRD #73)

> GitHub: https://github.com/launchbox-tech/expo-veepoo-sdk/issues/76
> Status: open | Labels: needs-triage

## Parent

[#73 — PRD: Native rejection normalization to VeepooError (JS bridge)](https://github.com/launchbox-tech/expo-veepoo-sdk/issues/73)

## What to build

Add **`docs/release-notes/`** entry for consuming apps: **`nativeCode`**, stable **`code`** after native rejects, hybrid mapping policy, pointer to **ADR 0003** / **`CONTEXT.md`**. Optionally extend **example** vitals lab log line to print **`nativeCode`** when present on **`error`** payloads (minimal). Optionally bump package version with maintainer approval.

## Acceptance criteria

- [ ] New release-notes file describes upgrade impact and behaviour; **`docs/README.md`** index updated if required by repo convention.
- [ ] Root **`README.md`** “Latest release” / upgrade link updated if version bumped.
- [ ] Optional: example **`error`** listener shows **`nativeCode`** in the event log when set.

## Blocked by

- #75

## Type

AFK

## User stories covered (from #73)

22, 28, 30.
