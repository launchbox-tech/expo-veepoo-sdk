# PRD: Pre-feature checklist closure — verification, policy alignment, C/D spine

> GitHub: https://github.com/launchbox-tech/expo-veepoo-sdk/issues/95

## Problem Statement

Maintainers rely on `docs/checklist.md` as the gate before new Band-facing features, but multiple sections still show open tasks after recent refactors: Android AAR naming has not been spot-checked against vendored binaries; PRD promises (initial setup permissions and foundation refactor closure) are not re-verified on a schedule; architecture bullets under “decisions” conflict with resolved policy already captured in domain context (for example, synchronous validators versus the `error` event); and Group C/D vendor gaps are listed as unchecked rows without a single parent issue that ties verification, documentation alignment, and delivery order together. That leaves humans and AFK agents unsure what is “actually done” versus “still a real prerequisite,” and risks starting feature PRDs before the checklist is honest.

## Solution

Run a short, explicit **checklist closure** initiative: complete the remaining mechanical audits (AAR names versus packaged artifacts; smoke re-run of config-plugin / prebuild expectations from the initial-setup PRD; reconcile foundation PRD and GitHub #32 status in the checklist), align `docs/checklist.md` with documented bridge policy (validators, native slice layout, Group C/D sequencing), optionally relocate the native module TypeScript interface into the types domain when the public surface is next touched, and leave Group C/D implementation to **separate vertical-slice issues** filed in **CONTEXT.md** delivery order—with this PRD as the umbrella that marks the pre-feature gate green and points to the next capability issue.

## User Stories

1. As a maintainer, I want every open box in the pre-feature checklist to either be completed or explicitly deferred with a linked issue, so that the checklist does not lie about repo readiness.
2. As a maintainer, I want Android `gradleAarProjects` names verified against the actual `.aar` filenames on disk, so that builds do not break when Gradle resolves artifacts.
3. As a maintainer, I want confirmation that DFU-related AARs required for future OTA work remain correctly listed, so that OTA PRDs do not rediscover missing binaries.
4. As a developer consuming the example app, I want `expo prebuild --clean` to remain a reliable smoke test for injected Android and Apple permissions, so that regressions in the config plugin are caught before companion-app integration.
5. As a developer, I want the initial-setup PRD’s permission expectations (six Android manifest permissions, three Apple usage descriptions) to remain accurate after refactors, so that documentation matches generated projects.
6. As a maintainer, I want GitHub issue #32 and its sub-issues reflected accurately in the checklist and PRD mirror, so that “foundation refactor” is not re-audited forever once fully shipped.
7. As an AFK agent, I want the checklist’s “validation versus `error` event” bullets to match **CONTEXT.md**, so that I do not implement dual error channels for synchronous validators.
8. As an AFK agent, I want the native layout expectations (one Kotlin extension module class and one Swift extension category per feature) stated as the standard in the checklist, so that new bridges stay consistent without a repo-wide rewrite.
9. As a library author, I want an optional, low-churn refactor path for moving the Expo module interface type next to other domain types, so that the TypeScript layout stays coherent when the public API changes.
10. As a host-app developer, I want Group C/D capabilities to ship in the documented order (settings-style personalization first, then riskier integrations), so that breaking changes and dependency order stay predictable.
11. As a maintainer, I want the vendor parity matrix and checklist cross-links kept meaningful after this pass, so that “not bridged” rows stay traceable to upcoming issues.
12. As a QA-minded developer, I want the example app policy for new C/D APIs (minimal safe demo; OTA exempt from real flash) restated in checklist quick-start, so that feature PRs do not argue scope ad hoc.
13. As a Band user’s companion app developer, I want Session semantics for new settings APIs to match existing device-settings flows unless a PRD documents an exception, so that error handling stays uniform.
14. As a maintainer, I want historical HRV origin / RR gaps (Group B partial) called out as follow-up work distinct from realtime HRV tests, so that parity expectations are not confused.
15. As an AFK agent, I want acceptance criteria for this PRD to be checkable without a physical Band where possible (prebuild, typecheck, vendor check), so that CI and laptops can clear most of the work.
16. As a maintainer, I want “optional” checklist items (interface relocation) scoped so they piggyback on API-touch PRs, so that we avoid churn-only refactors.
17. As a developer, I want anti-loss, screen, sedentary, and wrist-flip settings understood as the next Group C tranche after checklist closure, so that Band Discovery and Session flows are not disrupted by speculative API.
18. As a security-conscious maintainer, I want OTA/DFU and dial management called out as higher-risk follow-ups with their own PRDs, so that flash and bulk-transfer behavior is designed deliberately.
19. As a maintainer, I want contacts/SOS and body composition tracked as later slices, so that privacy-heavy features get dedicated review.
20. As a maintainer, I want platform-specific controls such as Bluetooth power documented as last in sequence, so that Android-only behavior does not block unified API design for cross-platform features.
21. As a triage owner, I want this issue to enter `needs-triage` and then graduate to `ready-for-agent` or split children, so that work is schedulable in the normal label flow.
22. As a reader of `docs/checklist.md`, I want the “Last synced” metadata updated when this PRD’s acceptance criteria are met, so that the document’s header reflects reality.
23. As a contributor, I want grilling questions in §8 to stay aligned with **CONTEXT.md** after edits, so that duplicate contradictory Q&A does not reappear in the checklist body.
24. As a maintainer, I want Group D rows (weather, women’s health, AGPS, music/camera, Bluetooth toggles) to remain parity-matrix-backed, so that each future PRD can cite a single row.
25. As a developer integrating the SDK, I want `readDeviceFunctions()` to remain the capability gate for optional features, so that host UIs hide unsupported controls per Band model.

## Implementation Decisions

- **Verification module:** Complete AAR name audit against vendored Android binaries; record outcome by updating the checklist (and parity or manifest docs only if a mismatch is found).
- **Config plugin smoke module:** Re-run clean prebuild in the example consumer and confirm the six Android permissions and three Apple usage strings still appear as specified in the initial-setup PRD; fix plugin or docs if drifted.
- **Foundation closure module:** Confirm GitHub #32 and sub-issues are closed and acceptance criteria satisfied; update checklist §3 and §0 so “verify #32” is not an eternal open task.
- **Policy alignment module:** Mark checklist §5C and §5D items as resolved to match **CONTEXT.md** (throw-only synchronous validation; per-feature native file layout; incremental consistency). Remove or rewrite any checklist bullets that contradict that policy.
- **Optional types layout module:** If the next public API change touches the native module interface, relocate that interface type into the types domain package and re-export for a stable import path; skip if no API work lands during this initiative.
- **Backlog spine module:** Do not implement all Group C/D bridges in this PRD; instead ensure each open row either has an existing issue reference or a short follow-up issue list in **Further Notes**, ordered per **CONTEXT.md** delivery sequence.
- **Documentation hygiene module:** Update checklist quick-start, §1 open box, and “Last synced” date when acceptance criteria are satisfied.

## Testing Decisions

- **Good tests** here are mostly **verification commands and observable artifacts**: successful prebuild, manifest/plist diff expectations, `vendor:check` still passing, TypeScript compile clean—not new unit tests unless a code change introduces logic.
- **Modules to exercise:** Config plugin output (Android manifest + Apple Info.plist), Gradle resolution for AARs (assemble or dependency insight as appropriate for the repo’s CI), and any TypeScript surface if the optional interface move ships.
- **Prior art:** Existing CI or npm scripts used for typecheck and vendor manifest checks; example app already used for prebuild smoke in earlier PRDs.

## Out of Scope

- Implementing full JS/native bridges for every Group C/D capability in one change set.
- Physical Band HITL verification for this PRD (optional follow-up on specific feature issues).
- Changing vendor binary pins or upgrading upstream SDK versions unless the AAR audit reveals a naming bug only.
- Rewriting the feature-issue template (it intentionally uses unchecked template boxes).

## Further Notes

- After triage, consider splitting **child issues**: (1) AAR + prebuild verification PR, (2) checklist/context alignment PR, (3) first Group C vertical slice per **CONTEXT.md** order.
- Epic **#59** and **`docs/vendor-api/vendor-parity-matrix.md`** remain the canonical map; this PRD should not duplicate matrix rows—only ensure checklist gates and links stay honest.
- If **#32** is already fully closed, the main work item is documentation truthfulness and the AAR spot-check, not re-implementing foundation.
