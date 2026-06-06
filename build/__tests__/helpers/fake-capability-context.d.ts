import type { CapabilityContext } from '../../capabilities/shared/context';
import type { LogLevel, LogScope, VeepooEvent, VeepooEventPayload } from '../../types/index';
import { type MockNative } from './mock-native';
/**
 * Captured side effects on a {@link FakeCapabilityContext}. Tests reach for
 * the spies directly (assert call counts / args) and for the `emittedEvents`
 * list when ordering matters.
 */
export interface CapabilityContextSpies {
    invoke: jest.Mock;
    invokeWithRecovery: jest.Mock;
    emit: jest.Mock;
    emitDeviceEvent: jest.Mock;
    log: jest.Mock;
    setConnectedDeviceId: jest.Mock;
    setScanning: jest.Mock;
    /** Flat list of `(event, payload)` for both `emit` and `emitDeviceEvent`. */
    emittedEvents: Array<{
        event: VeepooEvent;
        payload: unknown;
    }>;
    /** Log entries, in call order. */
    logEntries: Array<{
        level: LogLevel;
        scope: LogScope;
        action: string;
        message: string;
        options?: {
            deviceId?: string;
            data?: unknown;
            error?: unknown;
        };
    }>;
}
export type FakeCapabilityContext<TNative = MockNative> = CapabilityContext<TNative> & {
    spies: CapabilityContextSpies;
};
export interface FakeCapabilityContextOptions<TNative = MockNative> {
    native?: TNative;
    connectedDeviceId?: string | null;
    isScanning?: boolean;
}
/**
 * In-memory adapter satisfying {@link CapabilityContext}. Pairs with the
 * production adapter (`VeepooSDKRuntime.createCapabilityContext()`) so the
 * seam carries two adapters — the principle of "two adapters = real seam."
 *
 * Capabilities under test get the real `invoke` / `invokeWithRecovery`
 * pipeline (validate → native call → normalize). Emit/log calls are spied
 * and recorded; `connectedDeviceId` / `isScanning` are backed by mutable
 * locals so tests can advance state without wiring up `VeepooSDKRuntime`.
 */
export declare function makeFakeCapabilityContext<TNative = MockNative>(options?: FakeCapabilityContextOptions<TNative>): FakeCapabilityContext<TNative>;
/**
 * Find the first emission for an event name — convenience for tests that
 * don't care about ordering.
 */
export declare function findEmission<K extends VeepooEvent>(ctx: FakeCapabilityContext<unknown>, event: K): VeepooEventPayload[K] | undefined;
//# sourceMappingURL=fake-capability-context.d.ts.map