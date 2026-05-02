# 59 — feat(docs): vendor upstream tracking and API parity

> GitHub: https://github.com/launchbox-tech/expo-veepoo-sdk/issues/59
> Status: closed | Labels: enhancement

## Problem Statement

Maintainers of **expo-veepoo-sdk** integrate Veepoo/HBand capabilities through **vendored** Android AARs and iOS frameworks, while **official reference material** lives on **HBandSDK** GitHub repos and **wikis** that change independently. Today it is easy for:

- **Binary versions** in the repo to drift from what maintainers last reviewed against upstream.
- **Offline API snapshots** under documentation to lag wiki changelog rows (new commands or semantics appear upstream before they are reflected locally).
- **Implemented surface area** (JavaScript API, native bridge, events) to be **ambiguous**: unclear what is shipped versus still only described in internal checklists or old issues.
- **Contributors** to clone the wrong mental model (expecting git submodules or automatic alignment with upstream `master`).

Host-app developers depend on a **stable, truthful contract** from this module; maintainers need **low-friction guardrails** that **surface drift without blocking** day-to-day work until the team is ready to act.

## Solution

Introduce a **single vendor manifest** at the repository root that records **every vendored Android artifact identity**, **iOS SDK/framework identity**, and **optional last-reviewed upstream Git references** for the official HBandSDK Android and iOS repositories. Add a **`vendor:check` automation** (npm script) that compares **remote default-branch tips** to those recorded references and **prints warnings** while **exiting successfully** so CI does not fail by default.

Author a **canonical parity matrix** document under the documentation tree that maps **vendor API areas** to **what this module exposes** (methods, events) and **device verification status**, and link it from a **GitHub umbrella epic** with **child issues** for manifest delivery, script delivery, matrix population, wiki snapshot refresh, and checklist hygiene.

Record irreversible policy and vocabulary for **manifest-only** tracking (no submodules) in a new **ADR** alongside existing naming ADR, so future readers understand why upstream repos are not submodules.

Refresh **stale maintainer checklists** with a **banner** pointing at the parity matrix and **correct** sections that no longer match the codebase.

## User Stories

1. As a **maintainer**, I want a **single manifest file** listing all vendored binary identities and optional upstream review pins, so that **version truth** has one obvious source.
2. As a **maintainer**, I want **`vendor:check`** to **warn** when HBandSDK repos have moved past our recorded pins, so that we **notice upstream activity** without CI turning red by default.
3. As a **maintainer**, I want **`vendor:check` to exit zero** on warnings, so that **normal PR pipelines** keep merging until we consciously bump pins or binaries.
4. As a **maintainer**, I want the **parity matrix** to live as **version-controlled documentation**, so that it **tracks code history** and is not buried in a GitHub issue body.
5. As a **maintainer**, I want a **GitHub umbrella epic** with **linked child issues**, so that work is **traceable** and **sliceable** without one unreadable mega-thread.
6. As a **host-app developer**, I want the **parity matrix** to state **which Band-facing capabilities** are exposed through **this module**, so that I do not assume vendor wiki features exist in JS until the matrix says so.
7. As a **host-app developer**, I want **release notes** to remain the place where **binary bumps** are announced, so that **upgrade risk** is visible when consuming the package.
8. As a **new contributor**, I want an **ADR** explaining **no git submodules** for HBandSDK repos, so that I do not expect **`git submodule update`** to refresh binaries.
9. As a **maintainer**, I want **optional upstream SHAs** in the manifest to be **explicitly optional**, so that the project can **bootstrap** the manifest before first pin review.
10. As a **maintainer**, I want **wiki snapshot documents** to be refreshed on a **defined cadence** (child issue), so that **offline API reading** stays closer to vendor truth.
11. As a **maintainer**, I want **README** installation paths to be **valid for this repo**, so that **copy-paste** from the readme does not reference **foreign machine paths**.
12. As a **maintainer**, I want the **existing checklist document** preserved but **cleaned**, so that **historical refactor notes** remain without **contradicting** current code.
13. As a **CI owner**, I want **`vendor:check` invocable in CI** (warn-only), so that **logs** show drift on schedules or PRs without failing the job.
14. As a **release captain**, I want a **clear gate**: changing anything under vendored Android libraries or iOS frameworks requires **manifest + release notes + parity matrix touch**, so that **releases stay explainable**.
15. As a **maintainer**, I want **domain language** for the **Band** and **Session** to stay aligned with project glossary, so that **vendor mechanics** do not overload **user-facing terms**.
16. As a **maintainer**, I want **native feature issues** to reference **which vendor API area** was implemented, so that **future wiki diffs** map to **bridge changes**.
17. As a **host-app developer**, I want to **subscribe to release notes** only for **behavior or binary changes**, not for every upstream git tip movement, so that **noise stays low**.
18. As a **maintainer**, I want the **deep module** boundary to be **manifest + check script** behind a **tiny CLI interface**, so that **policy changes** stay localized.
19. As a **maintainer**, I want **parity matrix** updates to be **incremental** after each feature ships, so that the matrix **does not rot** between big-bang audits.
20. As a **security-conscious maintainer**, I want **`vendor:check`** to use **read-only remote queries**, so that we do not **mutate** upstream repos.
21. As a **downstream consumer**, I want **no change** to **public JS API** from this effort unless **release notes** say so, so that **this is infrastructure**, not a feature surprise.
22. As a **maintainer**, I want **child issues** for **wiki doc refresh** and **README fix** to be **independent** of **manifest land**, so that **parallel work** is possible.
23. As a **triage lead**, I want the **issue** carrying this PRD to enter **`needs-triage`**, so that **labels and sequencing** follow house rules.

## Implementation Decisions

- **No git submodules** for HBandSDK Android or iOS repositories; reference remains **documentation URLs + optional SHA pins in manifest** only.
- **Vendor manifest** is the **authoritative list** of vendored binary identities (Android artifacts and iOS SDK/framework identifiers) and **optional** `lastReviewedUpstream` fields for both upstream repos.
- **`vendor:check`** compares **`git ls-remote`** (or equivalent) default-branch tips to manifest pins; **default behavior is warn and exit success**.
- **Parity matrix** is **maintained as markdown in the docs tree**; the umbrella epic **links** to it rather than hosting the matrix only in GitHub.
- **Umbrella epic + child issues** for: manifest + script, parity matrix population, checklist banner + stale fixes, wiki snapshot refresh, README path fixes, ADR addition.
- **ADR** documents manifest-only policy, warn-only check, and where **vendor vocabulary** lives (avoid duplicating **Band** / **Session** glossary in a second CONTEXT file).
- **Deep module**: a small **vendor tooling** surface — manifest schema + check runner — so native and TS layers do not absorb drift logic.
- **Respect ADR 0001**: keep **Veepoo** naming for package/module/types; this effort does not rename artifacts.

## Testing Decisions

- **Good tests** assert **observable behavior**: manifest parsing validates required fields; **`vendor:check`** prints expected warning text when a **mocked** remote differs from pins; exit code **zero** in default mode.
- **Modules to test**: manifest parsing / validation (pure, fast); optionally a thin wrapper around remote queries **mocked** in unit tests so CI does not depend on GitHub availability.
- **Prior art**: existing **validator** and **normalizer** unit tests — **table-driven** boundary cases, no internal call-count assertions.
- **Network-dependent tests**: **skipped or mocked** in CI by default; optional manual **integration** run documented for maintainers.
- **Docs**: parity matrix **reviewed** in PR as human-verifiable; no automated snapshot of wiki HTML in this PRD.

## Out of Scope

- **Failing CI** when upstream moves (no strict fail-by-default).
- **Automatic opening** of GitHub issues when drift is detected (can be a later enhancement).
- **Submodule** or **subtree** import of HBandSDK repos.
- **Replacing** vendored binaries with **build-from-source** from those repos.
- **Full feature parity** with vendor wiki in one milestone (matrix may show gaps explicitly).
- **Host-app-facing API** additions (e.g. heart rate alarm native bridge) — tracked separately.

## Further Notes

- Mirror this PRD under **`docs/prd/`** with filename keyed to this issue number per AGENTS sync rule.
- Grill decisions already locked: manifest-only, warn-only check, matrix in docs, checklist trim not delete, ADR yes, epic + children, no duplicate CONTEXT for vendor terms.
- **Labels:** `needs-triage` was used when opening related GitHub issues; after closure, **`needs-triage` was removed from GitHub and local mirrors** per label hygiene (queue-only label — see AGENTS.md).
