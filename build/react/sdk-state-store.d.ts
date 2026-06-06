import type { VeepooSDKInterface } from "../veepoo-sdk";
export type SDKStateSnapshot = {
    readonly initialized: boolean;
    readonly isConnected: boolean;
    readonly isReady: boolean;
    readonly isScanning: boolean;
    readonly connectedDeviceId: string | null;
};
/**
 * Observable bridge between the SDK's event bus and React's `useSyncExternalStore`.
 * Has no React dependency — can be unit-tested in plain Node.
 */
export declare class VeepooSDKStateStore {
    private snapshot;
    private readonly listeners;
    private readonly cleanups;
    constructor(sdk: VeepooSDKInterface);
    private update;
    subscribe: (listener: () => void) => (() => void);
    getSnapshot: () => SDKStateSnapshot;
    destroy(): void;
}
//# sourceMappingURL=sdk-state-store.d.ts.map