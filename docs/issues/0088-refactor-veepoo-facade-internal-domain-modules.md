# 88 — refactor: VeepooSDK façade — internal domain modules (#81)

> GitHub: https://github.com/launchbox-tech/expo-veepoo-sdk/issues/88  
> Status: open | Labels: enhancement, ready-for-agent

## Parent

#81 — PRD: JavaScript bridge architecture hardening (contract, depth, optional Session recipe)

## What to build

Refactor the **`VeepooSDK`** **implementation** into **internal domain modules** (e.g. **Band Discovery**, **Session** handshake / connection, **health data** reads, **realtime** + **settings** + **alarms**, **event hub**) that the public façade **delegates** to—**no** changes to **`VeepooSDKModuleInterface`**. Centralize **event subscription** lifecycle (**`destroy`**, listener cleanup) for **locality**. Behaviour and logging must remain observably the same unless a bugfix is explicitly documented.

## Acceptance criteria

- [ ] Public **`VeepooSDK`** API and default export unchanged for host apps.
- [ ] Internal structure groups methods by domain concern; **facade** is thin delegation + shared construction.
- [ ] **Subscription** / teardown paths have a **single** obvious owner module.
- [ ] Regression suite passes; **tree-shaking** / bundle impact neutral or improved for default import.

## Blocked by

- #87 (all methods already on pipeline)

## Type

AFK

## User stories covered (from #81)

8, 15, 22, 32, 41, 43, 50.
