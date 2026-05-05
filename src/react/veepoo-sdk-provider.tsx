import React, { useEffect, useMemo, useRef, useState } from "react";
import { VeepooSDK } from "@/veepoo-sdk";
import { VeepooSDKStateStore } from "./sdk-state-store";
import { VeepooSDKContext } from "./veepoo-sdk-context";
import type { LogListener } from "@/veepoo-sdk-module";
import type { VeepooError } from "@/types/index";

type VeepooSDKProviderProps = {
  children?: React.ReactNode;
  logEnabled?: boolean;
  logger?: LogListener;
};

export function VeepooSDKProvider({ children, logEnabled, logger }: VeepooSDKProviderProps) {
  const sdkRef = useRef<VeepooSDK | null>(null);
  const storeRef = useRef<VeepooSDKStateStore | null>(null);

  if (sdkRef.current === null) {
    sdkRef.current = new VeepooSDK();
  }
  if (storeRef.current === null) {
    storeRef.current = new VeepooSDKStateStore(sdkRef.current);
  }

  const [error, setError] = useState<VeepooError | null>(null);

  useEffect(() => {
    const sdk = sdkRef.current!;
    if (logEnabled !== undefined) sdk.setLogEnabled(logEnabled);
    if (logger !== undefined) sdk.setLogger(logger);

    sdk.init().catch((e: unknown) => setError(e as VeepooError));

    return () => {
      storeRef.current?.destroy();
      sdk.destroy();
    };
  }, []);

  const value = useMemo(
    () => ({ sdk: sdkRef.current!, store: storeRef.current!, error }),
    [error],
  );

  return <VeepooSDKContext.Provider value={value}>{children}</VeepooSDKContext.Provider>;
}
