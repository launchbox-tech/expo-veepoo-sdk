import { useContext } from "react";
import { useSyncExternalStore } from "react";
import { VeepooSDKContext } from "./VeepooSDKContext.js";
import type { SDKStateSnapshot } from "./sdk-state-store.js";

export function useSDKState<T>(selector: (state: SDKStateSnapshot) => T): T {
  const ctx = useContext(VeepooSDKContext);
  if (ctx === null) {
    throw new Error(
      "useSDKState must be called inside <VeepooSDKProvider>. " +
        "Wrap your app (or the relevant subtree) with <VeepooSDKProvider>.",
    );
  }
  return useSyncExternalStore(
    ctx.store.subscribe,
    () => selector(ctx.store.getSnapshot()),
  );
}
