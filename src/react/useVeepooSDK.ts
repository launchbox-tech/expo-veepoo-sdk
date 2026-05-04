import { useContext } from "react";
import { VeepooSDKContext } from "./VeepooSDKContext.js";

export function useVeepooSDK() {
  const ctx = useContext(VeepooSDKContext);
  if (ctx === null) {
    throw new Error(
      "useVeepooSDK must be called inside <VeepooSDKProvider>. " +
        "Wrap your app (or the relevant subtree) with <VeepooSDKProvider>.",
    );
  }
  return { sdk: ctx.sdk, error: ctx.error };
}
