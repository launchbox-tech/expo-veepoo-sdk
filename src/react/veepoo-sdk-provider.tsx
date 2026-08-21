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

// One BLE central per process → one SDK wrapper per process. The native
// VPBleCentralManage is itself a singleton that survives a JS reload; a fresh JS
// wrapper per provider mount/remount/Fast-Refresh would re-init + re-connect on
// top of the still-live native link (concurrent connect/read → deaf band → the
// observed "stuck at 0%"). Pin the wrapper + its state store on globalThis
// (mirrors the app's bandSession singleton) so every mount, remount, and reload
// share ONE instance. Torn down only at process exit; init() is idempotent.
type VeepooSingleton = { sdk: VeepooSDK; store: VeepooSDKStateStore };
const g = globalThis as typeof globalThis & { __rayuVeepooSdk?: VeepooSingleton };
function getVeepooSingleton(): VeepooSingleton {
  if (!g.__rayuVeepooSdk) {
    const sdk = new VeepooSDK();
    g.__rayuVeepooSdk = { sdk, store: new VeepooSDKStateStore(sdk) };
  }
  return g.__rayuVeepooSdk;
}

export function VeepooSDKProvider({ children, logEnabled, logger }: VeepooSDKProviderProps) {
  const [{ sdk, store }] = useState(getVeepooSingleton);
  const [error, setError] = useState<VeepooError | null>(null);

  // Layout effect runs before the init effect on mount, so logging is configured first (PRD #166).
  useLayoutEffect(() => {
    applyLoggingConfig(sdk, { logEnabled, logger });
  }, [sdk, logEnabled, logger]);

  useEffect(() => {
    void sdk.init().catch((e: unknown) => setError(e as VeepooError));

    // No teardown: the SDK wrapper is a process singleton that must survive a
    // provider remount / JS reload (see getVeepooSingleton). Destroying it on
    // unmount is what let a remount strand the live native link and re-connect on
    // top of an in-flight read. The wrapper is released only at process exit.
    return undefined;
  }, [sdk, store]);

  const value = useMemo(() => ({ sdk, store, error }), [sdk, store, error]);

  return <VeepooSDKContext.Provider value={value}>{children}</VeepooSDKContext.Provider>;
}
