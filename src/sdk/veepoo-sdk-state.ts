import type { ConnectionStatus } from "@/types/connection";

/**
 * Mutable **Session** / scan / init fields driven by native events and host calls.
 * Controllers read via getters; mutations go through methods so the seam stays explicit.
 */
export class VeepooSdkState {
  private initialized = false;
  private scanning = false;
  private deviceId: string | null = null;

  get isInitialized(): boolean {
    return this.initialized;
  }

  markInitialized(value: boolean): void {
    this.initialized = value;
  }

  get isScanning(): boolean {
    return this.scanning;
  }

  setScanning(value: boolean): void {
    this.scanning = value;
  }

  get connectedDeviceId(): string | null {
    return this.deviceId;
  }

  setConnectedDeviceId(id: string | null): void {
    this.deviceId = id;
  }

  // ── Session transition methods ───────────────────────────────────────

  /** Sets `connectedDeviceId` when `deviceId` is a non-empty string. */
  onDeviceConnected(deviceId: string): void {
    if (typeof deviceId === "string" && deviceId.length > 0) {
      this.deviceId = deviceId;
    }
  }

  /**
   * Clears `connectedDeviceId` when:
   * - `deviceId` is undefined/empty (unconditional clear), OR
   * - `deviceId` matches `connectedDeviceId`
   *
   * Also sets `scanning = false`.
   */
  onDeviceDisconnected(deviceId: string | undefined): void {
    if (!deviceId || this.deviceId === deviceId) {
      this.deviceId = null;
    }
    this.scanning = false;
  }

  /**
   * Clears `connectedDeviceId` only when `status === "disconnected"` AND
   * (`deviceId` is undefined/empty OR `deviceId` matches `connectedDeviceId`).
   */
  onConnectionStatusChanged(
    deviceId: string | undefined,
    status: ConnectionStatus,
  ): void {
    if (
      status === "disconnected" &&
      (!deviceId || this.deviceId === deviceId)
    ) {
      this.deviceId = null;
    }
  }

  /** Clears connection/session scan fields (e.g. destroy). */
  reset(): void {
    this.initialized = false;
    this.scanning = false;
    this.deviceId = null;
  }
}
