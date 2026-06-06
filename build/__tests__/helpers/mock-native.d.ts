import { type NativeAsyncMethodName } from '../../bridge/async-native-method-registry';
import type { NativeVeepooSDKInterface } from '../../native-veepoo-sdk';
export type MockNative = jest.Mocked<NativeVeepooSDKInterface> & {
    _emit(event: string, payload: unknown): void;
};
/** Resolved values for `jest.fn().mockResolvedValue` — keys not listed default to `undefined`. */
export declare const NATIVE_ASYNC_MOCK_RESOLVES: Partial<Record<NativeAsyncMethodName, unknown>>;
export declare function makeMockNative(overrides?: Partial<Record<NativeAsyncMethodName, unknown>>): MockNative;
//# sourceMappingURL=mock-native.d.ts.map