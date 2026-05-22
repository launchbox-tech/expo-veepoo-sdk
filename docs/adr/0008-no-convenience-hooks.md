# No convenience hooks over `useSDKState`

## Status

Accepted

## Context

`src/react/convenience-hooks.ts` exported five one-liners over `useSDKState`: `useIsConnected`, `useIsSessionReady`, `useIsScanning`, `useConnectedDeviceId`, `useSDKInitialized`. Each body was a single `useSDKState((s) => s.someField)`. The example app (`example/src/hooks/*`) and the README documented them as part of the public surface.

The hooks were a pure renaming layer:

```ts
export const useIsConnected = (): boolean => useSDKState((s) => s.isConnected);
```

Their interface (the hook name) was approximately the same size as their implementation (the field name). They added no memoisation, transformation, or composition. Host apps that needed a combination of fields (or any field not pre-blessed by a hook) already used `useSDKState((s) => …)` directly. Two ways to do the same thing.

## Decision

Delete the convenience hooks. Host apps read SDK state through `useSDKState` and an inline selector:

```ts
const isReady = useSDKState((s) => s.isReady);
const deviceId = useSDKState((s) => s.connectedDeviceId);
```

Concretely:

1. `src/react/convenience-hooks.ts` and its test file are removed.
2. `src/react/index.ts` and `src/index.ts` no longer re-export the five hooks.
3. The example app's `useSDKInit`, `useHealthTests`, `useDataSync`, and `usePassiveEvents` now consume `useSDKState((s) => …)` directly.
4. The README's hooks table loses the five rows and shows `useSDKState` selectors as the canonical pattern.

## Consequences

- **Positive:** One way to read SDK state. New fields on `SDKStateSnapshot` automatically have one consistent access pattern; nobody has to decide whether a new hook is justified.
- **Positive:** Future architecture reviews seeing the absence of convenience hooks and suggesting "add `useIsConnected` etc. for ergonomics" should treat this ADR as the answer — the renaming layer existed and was deleted because the interface was approximately the same size as the implementation.
- **Negative:** Host apps importing the five hook names need a one-line update per call site. This is a breaking change, scoped to the private/internal consumer base.
- **Negative:** If a real composed selector ever earns its place (e.g. `useSession()` returning `{ deviceId, isReady, lastDisconnectReason }` with memoisation or derivation), it can be added then. One adapter is a hypothetical seam; the previous five were not even one — they were renames.

## Links

- Architecture review (2026-05-22): `/improve-codebase-architecture` candidate #2
- Removed file: previously at `src/react/convenience-hooks.ts`
- React barrel: [`src/react/index.ts`](../../src/react/index.ts)
- Public barrel: [`src/index.ts`](../../src/index.ts)
- Related: [`ADR 0005`](0005-facade-interface-composition-by-construction.md) — same "interface ≈ implementation is not earning its keep" principle, applied to React surface instead of TypeScript type composition.
