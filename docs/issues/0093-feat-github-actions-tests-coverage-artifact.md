# 93 — feat: GitHub Actions — tests with coverage and artifact (#90)

> GitHub: https://github.com/launchbox-tech/expo-veepoo-sdk/issues/93  
> Status: open | Labels: needs-triage

## Parent

#90 — PRD: Module test coverage reports and CI quality pipeline

## What to build

Tracer bullet from PRD #90: add a **GitHub Actions** workflow triggered on **pull_request** and **push** to **main** that checks out the repo, installs dependencies with **Bun** using a **frozen lockfile**, runs **`test:coverage`**, and uploads the **coverage** directory as a workflow artifact. Include **concurrency** so superseded runs on the same PR are cancelled. Do **not** add Codecov or coverage percentage gates. The artifact upload step must not fail the job when coverage output is missing (early-failure edge case).

## Acceptance criteria

- [ ] Workflow runs on **pull_request** and **push** to **main**.
- [ ] Install uses **frozen** lockfile consistent with **bun.lock**.
- [ ] Runs **tests with coverage** and uploads a **coverage** artifact reviewers can download.
- [ ] **Concurrency** cancels in-progress runs for the same PR ref (or equivalent deduplication).
- [ ] Artifact upload runs even when the job fails, and does not fail when **coverage/** is absent.
- [ ] No third-party coverage host in this slice.

## Blocked by

- #91

## Type

AFK

## User stories covered (from #90)

9, 17, 18, 22.
