# 81 — PRD: JavaScript bridge architecture hardening (contract, depth, optional Session recipe)

> GitHub: https://github.com/launchbox-tech/expo-veepoo-sdk/issues/81  
> Status: open | Labels: needs-triage, enhancement

## Problem Statement

Maintainers and host-app developers depend on a thin JavaScript layer that validates inputs, calls native `AsyncFunction`s, normalizes payloads, and maps native rejections into `VeepooError`. Today that behaviour is spread across a **large façade**, **parallel TypeScript surfaces** (native-shaped versus app-facing), and **hand-aligned** iOS/Kotlin/JS names for events and rejection codes. That creates **high coupling**, **parity risk** between platforms, and **systematic drift** whenever the bridge gains a method or native emits a new code. The product vocabulary (**Band**, **Session**, **Band Discovery**, **Pairing**) is documented in `AGENTS.md`, but there is no **shared contract artifact** that makes cross-platform and TypeScript alignment **mechanical**. Optional **Session**-readiness patterns (e.g. post-`deviceReady` work) are reimplemented in each host or only illustrated in the example app, so the same policy is not available as a **small, testable module** for apps that want it. The result: slower, riskier changes; harder reviews; and more end-user-visible bugs when event names, codes, or normalizers disagree.

## Solution

Deliver a **phased** hardening of the JavaScript bridge: (1) a **machine-checkable cross-platform contract** for **event names** and **native rejection codes** the TypeScript layer must understand, with CI or scripted checks; (2) a **single source of truth** for how native and public TypeScript **interfaces** stay in sync, reducing duplicate maintenance and test doubles; (3) a **declarative or table-driven** path for the common “validate → call native → normalize → map rejection” flow, so **ADR 0003** rules apply **consistently**; (4) **internal vertical slices** (by concern: discovery, connection, health data, realtime tests, device settings, event wiring) behind the **unchanged** default **Adapter** that host apps import, improving **locality** without new host-facing API churn; and (5) an **optional** export that encodes a **Session baseline** recipe (e.g. ordering after `deviceReady`) for apps that want a documented default, **without** taking over **reconnection** or **Pairing** storage—those remain app-owned per existing decisions.

## User Stories

1. As a host-app developer, I want **the same `VeepooEvent` names and payloads** to mean the same thing on iOS and Android after an SDK upgrade, so that my listeners do not silently break.
2. As a host-app developer, I want **native rejection codes** that affect **Session** eligibility or realtime-test **mutex** to surface as stable **`VeepooError.code`** values consistently across platforms, so that one branching strategy works everywhere.
3. As an SDK maintainer, I want a **single checklist or artifact** listing required bridge events and rejection strings, so that code review can verify parity without opening three trees.
4. As an SDK maintainer, I want **CI** (or a deterministic script) to fail when iOS, Kotlin, or TypeScript **drift** from that contract, so that regressions merge rarely.
5. As an SDK maintainer, I want adding a new **`AsyncFunction`** to update **one canonical definition** that feeds typings and mocks, so that I do not forget parallel edits.
6. As an SDK maintainer, I want **test doubles** for native modules to stay **narrow** and derived from the same contract as production typings, so that Jest stays trustworthy with less boilerplate.
7. As an SDK maintainer, I want the **native-invocation** pattern (validators, normalizers, **`mapNativeRejection`**, logging) **centralized**, so that a new method cannot accidentally use a **wrong fallback code** or skip normalization.
8. As an SDK maintainer, I want **internal modules** grouped by **Band Discovery**, **Session-related** calls, **historical data**, **realtime vitals**, **settings**, and **events**, so that I can change one concern without scrolling an oversized class.
9. As a host-app developer, I want the **default exported `VeepooSDK`** API to remain **stable** (same method names and shapes), so that upgrades do not force refactors except where documented.
10. As a host-app developer, I want an **optional helper** I can import that runs a **documented baseline** after **`deviceReady`** (including **`syncPersonalInfo`** policy alignment with `AGENTS.md`), so that I do not copy-paste from the example app.
11. As a host-app developer, I want that optional helper to **not** implement **reconnection**, **retry loops**, or stored **`deviceId`** policy, so that my app keeps ownership of those flows.
12. As a product owner, I want work to **respect ADR 0001** (package and module naming unchanged) and **ADR 0003** (**`mapNativeRejection`** only on native **`await`** failures; validators unchanged), so that architectural decisions are not re-litigated.
13. As a QA engineer, I want **automated tests** that prove **contract** elements (event strings, mapped codes) stay aligned, so that release testing focuses on hardware behaviour.
14. As a support engineer, I want **opaque native failures** to remain **`OPERATION_FAILED`** with messages preserved, per existing policy, so that tickets stay actionable after refactors.
15. As an SDK maintainer, I want **vertical slicing** to avoid **duplicating** the native-invocation pipeline in five places, so that one **deep** “invoke bridge operation” module is reused internally.
16. As a host-app developer, I want **performance** of the default SDK path to stay **on par** with today (no mandatory extra serialization round-trips), so that architecture work does not regress latency.
17. As an SDK maintainer, I want **release notes** to describe any **new optional export** or **developer-facing** contract tooling, so consumers know how to adopt it.
18. As an accessibility-minded host developer, I want **error UX** to remain keyed off **`VeepooError.code`**, not vendor prose, after pipeline refactors.
19. As an SDK maintainer, I want **example app** changes to be **minimal** unless we showcase the optional Session helper, so that the example stays a thin integration surface.
20. As a security reviewer, I want **no new PII** in contract artifacts—only symbolic event names and codes already emitted by native.
21. As an SDK maintainer, I want **semver discipline**: internal refactors and optional exports should be **minor** or **patch** compatible unless we intentionally introduce breaking typings.
22. As a host-app developer, I want **tree-shaking** and bundle size to remain reasonable if I **do not** import optional helpers, so that the core bundle does not grow for unused Session recipes.
23. As an SDK maintainer, I want **documentation** in the domain glossary updated when we name the optional Session helper or contract artifact, so that language stays consistent with **Band** / **Session** terms.
24. As an SDK maintainer, I want **Kotlin** and **Swift** emitters to stay **readable**—contract checks should not force obfuscated generated native code if generation is used.
25. As a downstream monorepo maintainer, I want **TypeScript** project references and **expo** autolinking to keep working without new manual steps after this PRD ships.
26. As an SDK maintainer, I want **rollback** to be safe: contract checks should be **additive** at first (warn mode) if the team prefers a phased rollout.
27. As a host-app developer, I want **`deviceDisconnected`** and **`deviceReady`** semantics unchanged unless a dedicated migration note says otherwise, so that Session state machines stay valid.
28. As an SDK maintainer, I want **parity matrices** or vendor docs references updated when contract lists change, so offline reviewers see the full picture.
29. As an SDK maintainer, I want **child issues** allowed for each phase (contract, SSoT, pipeline, slices, optional helper) so AFK agents can ship slices independently after triage.
30. As a host-app developer, I want **Realtime** test start/stop errors to remain **mutex-aware** after refactors, so concurrent vitals tests still fail predictably.
31. As an SDK maintainer, I want **origin read progress** state and related maps to live beside **historical data** concerns **internally**, so bugs in that area have **locality**.
32. As an SDK maintainer, I want **logging scopes** to remain consistent when moving methods between internal slices, so observability does not churn unnecessarily.
33. As a contributor, I want **CONTRIBUTING**-level guidance on how to add a bridge method **after** this PRD, so onboarding stays short.
34. As a host-app developer, I want **Web** or unsupported targets to **fail fast** with existing behaviour if native is absent, so platform guards are not broken by restructuring.
35. As an SDK maintainer, I want **jest** mocks of **`expo-modules-core`** to remain **one-liners** where possible, so tests stay approachable.
36. As a product owner, I want **Band Discovery** flows (`startScan` / `stopScan`) to behave identically for hosts, so internal splits do not change scan semantics.
37. As a host-app developer, I want **`ConnectOptions`** and **`ScanOptions`** validation to remain **strict** preflight, so invalid IDs fail before native calls.
38. As an SDK maintainer, I want **normalizers** to stay **pure** and tested independently of the façade, so pipeline wiring does not weaken unit tests.
39. As an SDK maintainer, I want **native rejection fixtures** in tests to grow with the **alias table**, not scatter string literals across unrelated specs.
40. As a host-app developer, I want **`PermissionsResult`** shaping to remain coherent across platforms after typings consolidation.
41. As an SDK maintainer, I want **event subscription lifecycle** (`destroy`, listener cleanup) centralized so internal refactors do not leak subscriptions.
42. As a QA engineer, I want **manual test scripts** for Session flows referenced when contract tooling ships, so hardware validation stays repeatable.
43. As an SDK maintainer, I want **dependency ordering** respected: contract and typings groundwork before large façade moves, so branches merge cleanly.
44. As a host-app developer using **React hooks**, I want example **`useBandSession`** patterns to align with any optional Session helper **documentation**, so mental models match.
45. As an SDK maintainer, I want **lint** and **typecheck** CI to cover new packages or scripts introduced for contract checks.
46. As a downstream consumer, I want **no mandatory** new runtime dependencies for the core SDK path unless justified and reviewed.
47. As an SDK maintainer, I want **iOS extension files** and **Kotlin extension files** to remain the **native** organization pattern—this PRD focuses on **JavaScript** structure unless contract checks require tiny native annotations.
48. As a host-app developer, I want **alarm** and **heart-rate alarm** flows unchanged externally, so wearable configuration UIs keep working.
49. As an SDK maintainer, I want **explicit out-of-scope** boundaries so implementers do not slip **auto-reconnect** into optional Session helpers.
50. As a stakeholder, I want **criticality ranking** from architecture review reflected in **implementation order**: contract and typings highest, optional Session helper last.

## Implementation Decisions

- **Phasing:** Implement in dependency order: **cross-platform contract checks** and **TypeScript interface single source of truth** first; **declarative native-invocation pipeline** next; **internal vertical slices** of the façade following or interleaved with pipeline extraction where it reduces duplication; **optional Session baseline helper** last and clearly marked optional.
- **Public surface:** Preserve the existing **default Adapter** shape (`VeepooSDKModuleInterface`) for hosts unless a semver-major release is explicitly approved; additive **optional exports** only for the Session recipe.
- **ADR alignment:** **`mapNativeRejection`** applies only to failures from **`await`** native methods; **validators** and TypeScript preflight continue to construct **`VeepooError`** directly (**ADR 0003**, **`CONTEXT.md`**).
- **Naming:** Keep **`expo-veepoo-sdk`**, **`VeepooSDK`**, and **`VeepooDevice`** naming per **ADR 0001**; do not rename the native module.
- **Deep modules:** Introduce (a) a **contract module** (artifact + checker) with a **small interface**—inputs are repo state or extracted lists, output is pass/fail or a report; (b) a **canonical bridge operation registry** or codegen inputs feeding TypeScript definitions and tests; (c) an **invoke native operation** pipeline **Module** that encapsulates validate → call → normalize → map → optional log, parameterized per operation.
- **Vertical slices:** Split **implementation** only—**facade** methods delegate to internal **Modules** named by domain concern (**Band Discovery**, connection/password, historical health data, realtime tests, device settings, event hub). **Interfaces** at host boundary stay one class implementing **`VeepooSDKModuleInterface`**.
- **Session recipe:** If shipped, document that it encodes **post–`deviceReady` baseline work** aligned with **`syncPersonalInfo`** guidance in **`AGENTS.md`** and does **not** store **`deviceId`**, start **Band Discovery**, or **auto-reconnect** on **`deviceDisconnected`**.
- **Native code:** Prefer **contract verification** over rewriting vendor SDK calls; native trees change only if a checker requires **explicit constants** export or similar minimal glue.
- **Tooling:** Contract checks may live as **Node scripts**, **Jest smoke tests** over extracted JSON, or **CI steps**—choose the smallest approach that prevents drift.

## Testing Decisions

- **Good tests** assert **observable behaviour**: emitted **event** names, **`VeepooError.code`** after simulated native rejections, normalized **return shapes**, and **facade** methods delegating correctly—not private field names or internal slice class titles.
- **Modules to test:** (1) contract checker against known-good and intentional drift fixtures; (2) canonical typings or registry—tests that generated or derived shapes stay **assignable** to the hand-written public **interface** where applicable; (3) **invoke pipeline** with fake native **Adapter**—single suite proving fallback codes and normalizer wiring; (4) **integration-style façade tests** (prior art: existing **`VeepooSDK`** Jest suite) updated for slimmer mocks; (5) optional **Session helper**—unit tests for ordering and failure propagation without touching native.
- **Prior art:** Existing **`map-native-rejection`** tests, **normalizer** unit tests, **validator** tests, and **`VeepooSDK.test.ts`** constructor-injected native mock patterns.

## Out of Scope

- **Automatic reconnection**, **retry scheduling**, or persisting **Pairing** (`deviceId`) inside the SDK—the app owns those flows.
- **Renaming** the package, native module, or public **`Veepoo*`** types (**ADR 0001**).
- **Vendor SDK upgrades** or new Band hardware features unless a contract line requires a **new event** or **reject** string for existing behaviour.
- **Rewriting** iOS/Android business logic beyond **minimal** hooks needed for contract extraction or constants.
- **UI** changes in host apps except optional example updates to demonstrate the Session helper.
- **Message substring heuristics** for errors (**ADR 0003**).

## Further Notes

- **Triage** may split this PRD into **child issues** per phase; link them back as **tracked-by** relationships.
- **Criticality** (from architecture review): cross-platform **contract** highest; **interface SSoT** next; **declarative pipeline**; **vertical slices**; **optional Session recipe** last.
