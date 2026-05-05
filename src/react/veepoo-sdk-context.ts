import { createContext } from "react";
import type { VeepooSDKInterface } from "@/veepoo-sdk";
import type { VeepooSDKStateStore } from "./sdk-state-store";
import type { VeepooError } from "@/types/index";

export type VeepooSDKContextValue = {
  readonly sdk: VeepooSDKInterface;
  readonly store: VeepooSDKStateStore;
  readonly error: VeepooError | null;
};

export const VeepooSDKContext = createContext<VeepooSDKContextValue | null>(null);
