import type { VeepooSDKInterface } from "@/veepoo-sdk";

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
export class VeepooSDKStateStore {
  private snapshot: SDKStateSnapshot;
  private readonly listeners = new Set<() => void>();
  private readonly cleanups: Array<() => void> = [];

  constructor(sdk: VeepooSDKInterface) {
    this.snapshot = {
      initialized: sdk.isSDKInitialized(),
      isConnected: sdk.getConnectedDeviceId() !== null,
      isReady: sdk.getConnectedDeviceId() !== null,
      isScanning: sdk.isScanningActive(),
      connectedDeviceId: sdk.getConnectedDeviceId(),
    };

    const on = <K extends Parameters<typeof sdk.on>[0]>(
      event: K,
      handler: Parameters<typeof sdk.on<K>>[1],
    ) => {
      sdk.on(event, handler);
      this.cleanups.push(() => sdk.off(event, handler));
    };

    on("sdkInitialized", () => {
      this.update({ initialized: true });
    });

    on("deviceConnected", ({ device_id }) => {
      this.update({ isConnected: true, connectedDeviceId: device_id });
    });

    on("deviceReady", ({ device_id }) => {
      this.update({ isReady: true, connectedDeviceId: device_id });
    });

    on("deviceDisconnected", () => {
      this.update({ isConnected: false, isReady: false, connectedDeviceId: null });
    });

    on("scanStarted", () => {
      this.update({ isScanning: true });
    });

    on("scanStopped", () => {
      this.update({ isScanning: false });
    });
  }

  private update(patch: Partial<SDKStateSnapshot>): void {
    this.snapshot = { ...this.snapshot, ...patch };
    this.listeners.forEach((l) => l());
  }

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getSnapshot = (): SDKStateSnapshot => this.snapshot;

  destroy(): void {
    this.cleanups.forEach((c) => c());
    this.cleanups.length = 0;
    this.listeners.clear();
  }
}
