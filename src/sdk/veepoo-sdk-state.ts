import type {
  ConnectionStatus,
  VeepooEvent,
  VeepooEventPayload,
} from "@/types/index";

/**
 * Mutable **Session** / scan / init fields driven by native events and host calls.
 *
 * Two paths into the state, both part of the public interface:
 *   - **Setters** (`setConnectedDeviceId`, `setScanning`, `markInitialized`, `reset`)
 *     used by capabilities for explicit, operation-driven mutations
 *     (e.g. `SessionCapability.connect` afterSuccess).
 *   - **`applyEvent`** used by the bridge to fold a normalized native event
 *     into state. The per-event dispatch lives inside the class — callers
 *     and tests cross the same public interface the bridge does.
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

  /** Clears connection/session scan fields (e.g. destroy). */
  reset(): void {
    this.initialized = false;
    this.scanning = false;
    this.deviceId = null;
  }

  /**
   * Folds a normalized event into Session/scan/init state.
   * No-op for events that do not affect state.
   */
  applyEvent<K extends VeepooEvent>(event: K, payload: VeepooEventPayload[K]): void {
    switch (event) {
      case "bluetooth_state_changed": {
        const p = payload as VeepooEventPayload["bluetooth_state_changed"];
        if (typeof p.is_scanning === "boolean") {
          this.scanning = p.is_scanning;
        }
        return;
      }
      case "device_connected": {
        const p = payload as VeepooEventPayload["device_connected"];
        this.onDeviceConnected(p.device_id ?? "");
        return;
      }
      case "device_disconnected": {
        const p = payload as VeepooEventPayload["device_disconnected"];
        this.onDeviceDisconnected(p.device_id);
        return;
      }
      case "device_connect_status":
      case "connection_status_changed": {
        const p = payload as VeepooEventPayload["connection_status_changed"];
        if (p.status) {
          this.onConnectionStatusChanged(p.device_id, p.status);
        }
        return;
      }
      default:
        return;
    }
  }

  // ── Internal transitions ─────────────────────────────────────────────
  // Private so callers/tests cross the same seam (`applyEvent`) the bridge does.

  private onDeviceConnected(deviceId: string): void {
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
  private onDeviceDisconnected(deviceId: string | undefined): void {
    if (!deviceId || this.deviceId === deviceId) {
      this.deviceId = null;
    }
    this.scanning = false;
  }

  /**
   * Clears `connectedDeviceId` only when `status === "disconnected"` AND
   * (`deviceId` is undefined/empty OR `deviceId` matches `connectedDeviceId`).
   */
  private onConnectionStatusChanged(
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
}
