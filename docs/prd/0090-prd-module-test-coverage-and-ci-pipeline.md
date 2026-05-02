# PRD: Module test coverage reports and CI quality pipeline

> GitHub: https://github.com/launchbox-tech/expo-veepoo-sdk/issues/90
> Status: closed | Labels: — | Delivered: #91–#94

## Problem Statement

As maintainers and contributors of the **expo-veepoo-sdk** module, we lack a single, repeatable way to see **TypeScript unit-test coverage** for the published module surface, and we have no automated place that runs **lint**, **typecheck**, **compiled bridge-contract checks**, **vendor pin drift detection**, and **tests with coverage** together. Reviewers cannot rely on CI to catch regressions in **VeepooEvent** / **native rejection** contracts or **vendor-manifest** drift without running many commands locally. **Session**-related correctness still depends on tests and contracts, but visibility and enforcement were fragmented.

## Solution

Provide **informational Jest coverage** for module TypeScript (everything under the primary source tree used by the unit tests, excluding test-only paths), publish **HTML and LCOV** reports as **CI artifacts**, and run a **pinned-Bun** GitHub Actions workflow that installs with a **warm cache**, then runs **lint**, **typecheck**, **build**, **Veepoo events bridge contract verification**, **native rejection bridge contract verification**, **vendor manifest check**, and **tests with coverage**. **Coverage percentage gates are explicitly out of scope for v1** so the pipeline stays informative rather than blocking on a baseline. **Hosted coverage services** (e.g. Codecov) and **GitHub branch protection required checks** are deferred to avoid extra ceremony on a private repo.

## User Stories

1. As an SDK maintainer, I want **`npm run test:coverage`** (or the Bun equivalent) to produce **text, summary, HTML, and LCOV** coverage output for the module, so that I can inspect gaps without guessing which files lack tests.
2. As an SDK maintainer, I want Jest **`collectCoverageFrom`** scoped to **module source** and to **exclude** declaration files and test folders, so that coverage numbers reflect shippable code rather than fixtures.
3. As an SDK maintainer, I want **no `coverageThreshold`** in Jest for the initial rollout, so that CI educates rather than blocks while the baseline stabilizes.
4. As an SDK maintainer, I want **ESLint overrides** that relax **`no-explicit-any`** in unit tests only, so that pragmatic test doubles do not force a large typing refactor unrelated to product behavior.
5. As an SDK maintainer, I want **production TypeScript** to prefer **`unknown`** over **`any`** where the bridge touches payloads, so that **`Session`**-adjacent event handling stays type-safe at the boundary.
6. As a contributor, I want **CI** to run **lint** and **typecheck** before tests, so that style and typing issues fail fast.
7. As a contributor, I want **CI** to run **`tsc` emit** once and then run **bridge-contract CLI checks** against the **build output**, so that **native event names** and **rejection code** expectations cannot drift silently from the TypeScript contract.
8. As a contributor, I want **`vendor:check`** in CI, so that **vendor SDK pins** in the manifest are compared to upstream default-branch heads and drift is surfaced on the runner log.
9. As a reviewer, I want a **downloadable `coverage` artifact** on every workflow run (including failed runs when partial output exists), so that I can open **HTML coverage** without checking out the branch locally.
10. As a reviewer, I want **contract check steps** named distinctly in the workflow, so that when a job fails I know whether the problem is **events**, **rejections**, or **vendor** drift.
11. As a release manager, I want **Bun’s toolchain version pinned** in **`package.json`** ( **`packageManager`** field), so that **local** and **CI** use the same Bun major/minor/patch and installs are reproducible.
12. As a release manager, I want **`bun install --frozen-lockfile`** in CI, so that **`package.json`** and **`bun.lock`** cannot diverge on the merge commit.
13. As a release manager, I want **GitHub Actions caching** of **Bun’s global install cache**, keyed primarily on the **lockfile**, so that dependency install time stays low on warm runners.
14. As a host app developer, I want the **module’s public behavior** (including **Band Discovery**, **Pairing**, and **Session** flows exercised in tests) to remain correct when contributors change internals, so that indirect coverage via **`VeepooSDK`** tests still protects integration-shaped paths.
15. As an SDK maintainer, I want **`once()` listener wrappers** to use a **`const`** self-referential **`EventListener`**, so that lint rules and runtime semantics stay aligned.
16. As an SDK maintainer, I want **global `__DEV__` augmentation** lint-suppressed with an explicit rationale, so that **React Native** conventions remain without fighting **`no-var`** on ambient declarations.
17. As a contributor, I want **concurrency control** in the workflow (one active run per PR ref, cancel superseded runs), so that the queue stays short when pushing frequently.
18. As an SDK maintainer, I want **triggers** on **pull requests** and **pushes to `main`**, so that **default-branch** health matches what contributors see in PRs.
19. As a contributor, I want **test runs** to use **non-interactive** Jest (no watch) in the **`test:coverage`** script path, so that CI and one-shot local runs behave the same.
20. As an SDK maintainer, I want **native rejection mapping** and **event normalization** to remain covered by existing Jest suites as the primary safety net, so that **ADR 0003**-aligned error behavior does not regress without a failing test.
21. As a reviewer, I want **vendor network checks** (`git ls-remote`) to fail the job when the runner cannot reach remotes, so that “green” means the check actually ran, not that it was skipped.
22. As an SDK maintainer, I want to **avoid** third-party coverage hosting in v1, so that **private-repo** secrets and vendor relationships stay minimal.
23. As an org admin, I want **branch protection** configuration to remain **manual** and **optional**, so that teams adopt required checks only when ready for that operational overhead.
24. As a contributor, I want **example app** scope **out of** this PRD’s coverage mandate, so that the **published module** remains the focused quality bar.
25. As an SDK maintainer, I want **future work** (coverage thresholds, Codecov, optional **`packageManager`**-aware cache key tweaks) to be **explicitly deferred**, so that the first slice ships without scope creep.

## Implementation Decisions

### Tooling and configuration

- **Jest** remains the unit test runner via the **Expo module** test entrypoint; project Jest config extends the preset with **ESM `.js` import mapping** for TypeScript sources and adds **coverage collection globs**, **coverage directory**, and **reporters** (including **LCOV** for optional future upload).
- **`test:coverage`** script sets **non-interactive** behavior so watchers are not started in CI-style invocations.
- **ESLint** gains a **test-only override** disabling **`@typescript-eslint/no-explicit-any`**; production sources keep stricter typing.
- **TypeScript `build`** emits JavaScript consumed by **bridge-contract** verification CLIs; **typecheck** remains a separate **`noEmit`** pass for speed and clarity.

### CI platform

- **GitHub Actions** workflow on **`ubuntu-latest`** with **checkout**, **Bun setup** (version resolved from **`packageManager`**), **cache restore/save** for **Bun’s package cache**, **frozen install**, then **lint**, **typecheck**, **build**, **events contract CLI**, **native rejection contract CLI**, **vendor check**, **tests with coverage**, and **artifact upload** for the **coverage** directory.
- **Workflow concurrency** limits duplicate runs per PR branch.
- **Artifact upload** uses **post-job behavior** that does not fail the job when no coverage directory exists (early failure edge case).

### Policy

- **Coverage is informational**: no **minimum percentage** enforcement in Jest for this PRD’s initial delivery.
- **Branch protection** and **required status checks** are **not** part of automated repository changes in this slice.
- **Hosted coverage dashboards** are **out of scope** for v1.

### Code quality adjustments tied to CI lint

- **Type guards** and **normalizer internals** use **`Record<string, unknown>`** (or equivalent) instead of **`any`** where lint surfaced issues.
- **`once()`** uses a **`const`** **`EventListener`** that closes over itself for self-removal.
- **Obsolete `ts-ignore`** comments in tests are removed when constructor injection is already correctly typed.

## Testing Decisions

### What makes a good test (ongoing)

Good tests assert **observable behavior**: public methods, emitted events, normalized payloads, and **VeepooError** codes after **native rejection** mapping. They avoid locking to private method names or internal field layout. **Bridge-contract** tests and **CLI verifiers** assert **synchronization** between **TypeScript expectations** and **documented native surfaces**, not device hardware behavior.

### Modules and areas exercised

- **`VeepooSDK`** behavior via injected native doubles (lifecycle, events, **once**, logging gates).
- **Normalizers and validators** with direct and indirect coverage.
- **Native invoke pipeline**, **async method registry**, **mapNativeRejection**, and **contract verification** modules aligned with **ADR 0003** and **`CONTEXT.md`** bridge-error vocabulary.
- **Jest coverage** attributes executed lines to the above when tests run; **untested** CLI-only or **plugin** paths may appear as gaps until additional tests are added.

### Prior art

Existing **`src/__tests__/**`** suites (including **VeepooSDK**, **normalizers**, **validators**, **bridge-contract** tests) continue as the primary pattern; coverage reporting **adds visibility** without mandating new test categories in v1.

## Out of Scope

- **Example app** test coverage and **E2E** UI tests.
- **Kotlin / Swift** code coverage or **native** unit test orchestration in CI.
- **Coverage percentage thresholds** or **ratcheting** policies.
- **Codecov**, **Coveralls**, or other **hosted coverage** integrations.
- **Automatic configuration** of **GitHub branch protection** or **required checks** (organizational choice).
- **Parallel CI jobs** splitting lint from tests unless performance requires it later.
- **Matrix** testing across multiple **Bun** or **Node** versions.

## Further Notes

- **Vendor check** depends on **network** access for **`git ls-remote`**; flaky networks can fail CI—acceptable trade-off for catching manifest drift.
- **Cache key** uses the **lockfile** hash; rare **Bun-only** bumps that do not touch the lockfile may still reuse cache—acceptable unless proven problematic.
- Terminology for **Band**, **Session**, **Band Discovery**, and **Pairing** matches **`AGENTS.md`** / **`CLAUDE.md`**; this PRD is **tooling** and does not redefine those terms.
