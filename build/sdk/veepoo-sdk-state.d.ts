import type { VeepooEvent, VeepooEventPayload } from "../types/index";
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
export declare class VeepooSdkState {
    private initialized;
    private scanning;
    private deviceId;
    get isInitialized(): boolean;
    markInitialized(value: boolean): void;
    get isScanning(): boolean;
    setScanning(value: boolean): void;
    get connectedDeviceId(): string | null;
    setConnectedDeviceId(id: string | null): void;
    /** Clears connection/session scan fields (e.g. destroy). */
    reset(): void;
    /**
     * Folds a normalized event into Session/scan/init state.
     * No-op for events that do not affect state.
     */
    applyEvent<K extends VeepooEvent>(event: K, payload: VeepooEventPayload[K]): void;
    private onDeviceConnected;
    /**
     * Clears `connectedDeviceId` when:
     * - `deviceId` is undefined/empty (unconditional clear), OR
     * - `deviceId` matches `connectedDeviceId`
     *
     * Also sets `scanning = false`.
     */
    private onDeviceDisconnected;
    /**
     * Clears `connectedDeviceId` only when `status === "disconnected"` AND
     * (`deviceId` is undefined/empty OR `deviceId` matches `connectedDeviceId`).
     */
    private onConnectionStatusChanged;
}
//# sourceMappingURL=veepoo-sdk-state.d.ts.map