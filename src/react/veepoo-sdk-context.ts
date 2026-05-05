import { createContext } from "react";
import type { VeepooSDKInterface } from "../VeepooSDK.js";
import type { VeepooSDKStateStore } from "./sdk-state-store.js";
import type { VeepooError } from "../types/index.js";

export type VeepooSDKContextValue = {
  readonly sdk: VeepooSDKInterface;
  readonly store: VeepooSDKStateStore;
  readonly error: VeepooError | null;
};

export const VeepooSDKContext = createContext<VeepooSDKContextValue | null>(null);
