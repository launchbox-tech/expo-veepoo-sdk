import type { VeepooSDKInterface } from "../veepoo-sdk";
import type { VeepooSDKStateStore } from "./sdk-state-store";
import type { VeepooError } from "../types/index";
export type VeepooSDKContextValue = {
    readonly sdk: VeepooSDKInterface;
    readonly store: VeepooSDKStateStore;
    readonly error: VeepooError | null;
};
export declare const VeepooSDKContext: import("react").Context<VeepooSDKContextValue | null>;
//# sourceMappingURL=veepoo-sdk-context.d.ts.map