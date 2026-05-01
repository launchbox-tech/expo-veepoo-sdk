# PRD: refactor(example): extract presentational components from index.tsx

> GitHub: https://github.com/launchbox-tech/expo-veepoo-sdk/issues/18
> Labels: enhancement, ready-for-human
> Status: open

## Problem Statement

The example app's main screen file (`index.tsx`) is ~670 lines. After the custom-hook refactor (issues #11–#17) condensed all SDK lifecycle state into five hook calls, the remaining bulk is three presentational sub-components (`DeviceRow`, `InfoRow`, `HealthTestCard`) and ~60 StyleSheet keys defined inline. A developer working on the Band Discovery list item, the device info row, or the health test card must scroll through the full screen file to find them, and changes to one component visually pollute the diff of unrelated work.

## Solution

Extract each presentational sub-component into its own file under `example/src/components/`. Pull the shared color constants (`BLUE`, `RED`, `GREEN`) into a `theme.ts` file. Add a barrel `index.ts` so `index.tsx` imports all three components in a single line. After the extraction, `index.tsx` shrinks to ~200 lines: hook calls, stale-state derivations, and JSX only — no inline component definitions.

## User Stories

1. As a developer adding a new field to the Band Discovery list item, I want `DeviceRow` in its own file, so that my diff only touches one focused file.
2. As a developer restyling the health test card, I want `HealthTestCard` in its own file, so that I can find and edit all its styles without scrolling past unrelated screen-level code.
3. As a developer adding a new device info field, I want `InfoRow` in its own file, so that the component's props and styles are co-located.
4. As a developer importing a component from the example app into a test harness, I want a barrel export at `components/index.ts`, so that I can import all components from a single path.
5. As a developer reviewing a PR, I want each component's styles in the same file as the component, so that I can reason about visual changes without cross-referencing a monolith stylesheet.
6. As a developer scanning the `src/` directory, I want a `components/` directory alongside `hooks/`, so that the project structure communicates the separation between state logic and presentation.
7. As a developer looking for color constants, I want them in `components/theme.ts`, so that I have one authoritative place to update brand colors.
8. As a developer adding a new presentational component, I want an established `components/` directory with a consistent pattern, so that I know where to add it and how to structure its file.
9. As a developer reading `index.tsx`, I want it to contain only hook calls, stale-state derivations, and JSX, so that I can understand the screen's data flow without wading through component implementations.
10. As a developer running TypeScript checks, I want the extraction to produce zero `tsc` errors, so that I can trust the types are correct after the refactor.

## Implementation Decisions

- **Three component files**: `DeviceRow`, `InfoRow`, and `HealthTestCard` each get their own file. No grouping into a single `components.tsx`.
- **Color constants in `theme.ts`**: `BLUE`, `RED`, and `GREEN` move from inline definitions in `index.tsx` into `theme.ts`. Each component file imports only the colors it uses.
- **Styles stay local to each component**: `card`, `progressTrack`, `progressFill`, and `buttonPressed` appear in both `HealthTestCard` and `index.tsx`. Each file defines its own copy rather than sharing through `theme.ts`. Coupling two unrelated layout contexts through a shared stylesheet would cause silent cross-component style drift when one side needs to change.
- **Barrel export**: `components/index.ts` re-exports all three components so `index.tsx` needs one import line.
- **`unit` prop dropped from `HealthTestCard`**: The prop is declared and passed at every call site but never rendered. It is removed from the type and all call sites.
- **No new abstractions**: No new hooks, HOCs, or context providers. This is a file-move refactor only.
- **`index.tsx` after extraction**: imports from `../components`, imports colors from `../components/theme`, contains no function definitions below the default export.

## Testing Decisions

- These are pure presentational components with no internal state or side effects. A good test exercises only external behavior (what the component renders given certain props), not internal implementation (style object contents, which StyleSheet key was used).
- No existing test infrastructure exists in the example app, so no tests are written as part of this refactor. The TypeScript compiler (`tsc --noEmit`) serves as the correctness gate.
- If tests are added in the future, `HealthTestCard` is the most valuable target: it has conditional rendering paths (active vs inactive, with/without progress bar, error states) that benefit most from snapshot or render tests.

## Out of Scope

- Adding tests for the extracted components.
- Extracting the Historical Data section or the Session Active screen into additional sub-components (only the three existing inline functions are extracted).
- Renaming the components.
- Changing any visual behavior or props beyond dropping the unused `unit` prop.

## Further Notes

The extraction follows the same directory convention established by the `hooks/` refactor in issues #11–#17: one concern per file, grouped by type under `src/`. The `components/` directory will sit alongside `hooks/` under `example/src/`.
