import React, { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { VeepooSDK } from "@/veepoo-sdk";
import { VeepooSDKStateStore } from "./sdk-state-store";
import { VeepooSDKContext } from "./veepoo-sdk-context";
import type { LogListener, VeepooError } from "@/types/index";

type VeepooSDKProviderProps = {
  children?: React.ReactNode;
  logEnabled?: boolean;
  logger?: LogListener;
};

function applyLoggingConfig(
  sdk: VeepooSDK,
  config: { logEnabled?: boolean; logger?: LogListener },
): void {
  if (config.logEnabled !== undefined) {
    sdk.setLogEnabled(config.logEnabled);
  }
  if (config.logger !== undefined) {
    sdk.setLogger(config.logger);
  }
}

export function VeepooSDKProvider({ children, logEnabled, logger }: VeepooSDKProviderProps) {
  const [sdk] = useState(() => new VeepooSDK());
  const [store] = useState(() => new VeepooSDKStateStore(sdk));
  const [error, setError] = useState<VeepooError | null>(null);

  // Layout effect runs before the init effect on mount, so logging is configured first (PRD #166).
  useLayoutEffect(() => {
    applyLoggingConfig(sdk, { logEnabled, logger });
  }, [sdk, logEnabled, logger]);

  useEffect(() => {
    void sdk.init().catch((e: unknown) => setError(e as VeepooError));

    return () => {
      store.destroy();
      sdk.destroy();
    };
  }, [sdk, store]);

  const value = useMemo(() => ({ sdk, store, error }), [sdk, store, error]);

  return <VeepooSDKContext.Provider value={value}>{children}</VeepooSDKContext.Provider>;
}
