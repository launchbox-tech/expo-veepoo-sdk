import { useContext } from "react";
import { useSyncExternalStore } from "react";
import { VeepooSDKContext } from "./veepoo-sdk-context";

export function useVeepooSDK() {
  const ctx = useContext(VeepooSDKContext);
  if (ctx === null) {
    throw new Error(
      "useVeepooSDK must be called inside <VeepooSDKProvider>. " +
        "Wrap your app (or the relevant subtree) with <VeepooSDKProvider>.",
    );
  }
  const status = useSyncExternalStore(ctx.store.subscribe, ctx.store.getSnapshot);
  return { sdk: ctx.sdk, status, error: ctx.error };
}
