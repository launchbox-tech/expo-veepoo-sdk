/**
 * Optional Session baseline helper (#89).
 *
 * Encodes the documented post-`deviceReady` baseline from AGENTS.md:
 *   - syncPersonalInfo (called on every deviceReady)
 *   - readBattery
 *   - readDeviceVersion
 *
 * All three run in parallel via `Promise.allSettled`; individual failures
 * do not block the others.
 *
 * **Out of scope (app-owned):**
 *   - Band Discovery retries
 *   - Pairing / deviceId storage
 *   - Auto-reconnect on deviceDisconnected
 *
 * @module
 */
import type { VeepooSDKInterface } from '../veepoo-sdk';
import type { PersonalInfo, BatteryInfo, DeviceVersion, VeepooEventPayload } from '../types/index';
/**
 * Narrow dependency shape for {@link runSessionBaseline}. The three reads it
 * actually performs — nothing more. `VeepooSDKInterface` satisfies this
 * structurally; tests can inject a 3-method fake.
 */
export interface SessionBaselineDeps {
    personalInfo: {
        syncPersonalInfo: VeepooSDKInterface['personalInfo']['syncPersonalInfo'];
    };
    battery: {
        readBattery: VeepooSDKInterface['battery']['readBattery'];
    };
    deviceVersion: {
        readDeviceVersion: VeepooSDKInterface['deviceVersion']['readDeviceVersion'];
    };
}
/**
 * Event-subscription surface required by {@link attachSessionBaseline}. Just
 * `on('device_ready', …)` / `off('device_ready', …)`. The Band facade
 * satisfies this; tests can pass any EventEmitter-shaped fake.
 */
export interface SessionBaselineEventSource {
    on(event: 'device_ready', listener: (payload: VeepooEventPayload['device_ready']) => void): unknown;
    off(event: 'device_ready', listener: (payload: VeepooEventPayload['device_ready']) => void): unknown;
}
/** Configuration for the Session baseline. */
export interface SessionBaselineConfig {
    /** PersonalInfo to push on every `deviceReady`. */
    personalInfo: PersonalInfo;
}
/** Outcome of a single baseline run. */
export interface SessionBaselineResult {
    /** `true` when `syncPersonalInfo` resolved successfully. */
    personalInfoSynced: boolean;
    /** Battery info when read succeeded; `null` on failure. */
    battery: BatteryInfo | null;
    /** Device version when read succeeded; `null` on failure. */
    deviceVersion: DeviceVersion | null;
    /** Per-call errors keyed by operation name (empty on full success). */
    errors: Partial<Record<'syncPersonalInfo' | 'readBattery' | 'readDeviceVersion', unknown>>;
}
/** Extended config for {@link attachSessionBaseline}. */
export interface AttachSessionBaselineConfig extends SessionBaselineConfig {
    /**
     * Called after every baseline run with the aggregate result.
     * Fires once per `deviceReady` event.
     */
    onResult?: (result: SessionBaselineResult) => void;
}
/** Handle returned by {@link attachSessionBaseline}. */
export interface SessionBaselineHandle {
    /** Unsubscribe the `deviceReady` listener. Safe to call multiple times. */
    destroy(): void;
}
/**
 * Run the documented Session baseline once.
 *
 * Call this from your own `deviceReady` handler, or use
 * {@link attachSessionBaseline} to wire it automatically.
 *
 * All three operations run in parallel via `Promise.allSettled`:
 * 1. `syncPersonalInfo(config.personalInfo)`
 * 2. `readBattery()`
 * 3. `readDeviceVersion()`
 *
 * Individual failures are captured in `result.errors`; they do not
 * reject the returned promise.
 */
export declare function runSessionBaseline(deps: SessionBaselineDeps, config: SessionBaselineConfig): Promise<SessionBaselineResult>;
/**
 * Subscribe to `deviceReady` and run the Session baseline automatically.
 *
 * Returns a handle whose `destroy()` removes the listener.
 *
 * ```ts
 * import { attachSessionBaseline } from 'expo-veepoo-sdk/session';
 *
 * const handle = attachSessionBaseline(sdk, {
 *   personalInfo: { sex: 1, height: 175, weight: 70, age: 30, stepAim: 8000, sleepAim: 480 },
 *   onResult: (r) => console.log('baseline done', r),
 * });
 *
 * // later, on unmount:
 * handle.destroy();
 * ```
 *
 * **Does not** implement reconnection, retry loops, or stored `deviceId`
 * policy; the host app owns those flows.
 */
export declare function attachSessionBaseline(source: SessionBaselineDeps & SessionBaselineEventSource, config: AttachSessionBaselineConfig): SessionBaselineHandle;
//# sourceMappingURL=session-baseline.d.ts.map