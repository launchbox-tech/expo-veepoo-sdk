# feat(example): add write buttons to 5 existing read-only settings cards

**Issue:** #156
**Status:** Closed
**Labels:** enhancement, ready-for-agent
**Parent:** #154

## What to build

Add an "Apply" write button to each of the five settings cards that currently only expose a read operation. The button re-sends the last-read value back to the Band, validating the round-trip without requiring user input.

## Acceptance criteria

- [ ] `ScreenLightCard` gains "Apply brightness" → `setScreenLightSettings(lastRead)` and "Apply duration" → `setScreenLightDuration(lastDuration)` buttons
- [ ] `SedentaryCard` gains "Apply" → `setSedentaryReminder(lastRead)` button
- [ ] `WristFlipCard` gains "Apply" → `setWristFlipWake(lastRead)` button
- [ ] `WomenHealthCard` gains "Apply" → `setWomenHealth(lastRead)` button
- [ ] `FindBandCard` exposes "Find Band" button → `findBand()`
- [ ] Write buttons disabled until a read succeeds
