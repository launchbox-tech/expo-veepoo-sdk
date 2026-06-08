import type { LogScope, VeepooEvent, EcgTestOptions } from "../../types/index";
import type { RealtimeTestsNativeMethods } from "./native";
import { normalizeBloodAnalysisTestResult, normalizeBloodGlucoseData, normalizeBloodOxygenTestResult, normalizeBloodPressureTestResult, normalizeBodyCompositionTestResult, normalizeBreathingTestResult, normalizeEcgTestResult, normalizeFatigueTestResult, normalizeGsrTestResult, normalizeHealthGlanceResult, normalizeHeartRateTestResult, normalizeHrvTestResult, normalizePttTestResult, normalizeStressData, normalizeTemperatureTestResult } from "./normalizers";
export interface RealtimeTestControl<TOptions = void> {
    /** Start the test on the Band. `options` is per-test; most are parameterless. */
    start: (native: RealtimeTestsNativeMethods, options?: TOptions) => Promise<unknown>;
    stop: (native: RealtimeTestsNativeMethods) => Promise<unknown>;
}
export interface RealtimeTestDef<TResult = unknown, TOptions = void> {
    /** JS event name carrying the test's result (e.g. `heart_rate_test_result`). */
    readonly event: VeepooEvent;
    /** Field within the native envelope that holds the inner payload. */
    readonly eventField: "result" | "data";
    /** Log scope used by the runtime when the result event is observed. */
    readonly logScope: LogScope;
    /** Inner-payload normalizer applied before `deepSnakeKeys` in the bridge. */
    readonly normalize: (raw: unknown) => TResult;
    /**
     * Native control surface for tests the capability initiates. Omit for
     * receive-only tests (`blood_analysis`, `gsr`, `ptt`) whose results are
     * surfaced via events but cannot be started/stopped from the JS side.
     */
    readonly control?: RealtimeTestControl<TOptions>;
}
/**
 * Single source of truth for realtime-test metadata.
 *
 * Each row binds a modality key (`heart_rate`, `ecg`, …) to its result event
 * name, the envelope field holding the payload, the result normalizer, and —
 * for tests the capability initiates — a `control` surface that dispatches the
 * matching native start/stop methods. The bridge's `event-registry.ts` derives
 * its result-event defs from this table, and `RealtimeTestsCapability` uses
 * `control` to dispatch `startTest()` / `stopTest()`.
 *
 * Adding a new realtime test = one row.
 */
export declare const REALTIME_TEST_DEFINITIONS: {
    readonly heart_rate: {
        readonly event: "heart_rate_test_result";
        readonly eventField: "result";
        readonly logScope: "test";
        readonly normalize: typeof normalizeHeartRateTestResult;
        readonly control: {
            readonly start: (n: RealtimeTestsNativeMethods) => Promise<void>;
            readonly stop: (n: RealtimeTestsNativeMethods) => Promise<void>;
        };
    };
    readonly blood_pressure: {
        readonly event: "blood_pressure_test_result";
        readonly eventField: "result";
        readonly logScope: "test";
        readonly normalize: typeof normalizeBloodPressureTestResult;
        readonly control: {
            readonly start: (n: RealtimeTestsNativeMethods) => Promise<void>;
            readonly stop: (n: RealtimeTestsNativeMethods) => Promise<void>;
        };
    };
    readonly blood_oxygen: {
        readonly event: "blood_oxygen_test_result";
        readonly eventField: "result";
        readonly logScope: "test";
        readonly normalize: typeof normalizeBloodOxygenTestResult;
        readonly control: {
            readonly start: (n: RealtimeTestsNativeMethods) => Promise<void>;
            readonly stop: (n: RealtimeTestsNativeMethods) => Promise<void>;
        };
    };
    readonly temperature: {
        readonly event: "temperature_test_result";
        readonly eventField: "result";
        readonly logScope: "test";
        readonly normalize: typeof normalizeTemperatureTestResult;
        readonly control: {
            readonly start: (n: RealtimeTestsNativeMethods) => Promise<void>;
            readonly stop: (n: RealtimeTestsNativeMethods) => Promise<void>;
        };
    };
    readonly stress: {
        readonly event: "stress_data";
        readonly eventField: "data";
        readonly logScope: "test";
        readonly normalize: typeof normalizeStressData;
        readonly control: {
            readonly start: (n: RealtimeTestsNativeMethods) => Promise<void>;
            readonly stop: (n: RealtimeTestsNativeMethods) => Promise<void>;
        };
    };
    readonly blood_glucose: {
        readonly event: "blood_glucose_data";
        readonly eventField: "data";
        readonly logScope: "test";
        readonly normalize: typeof normalizeBloodGlucoseData;
        readonly control: {
            readonly start: (n: RealtimeTestsNativeMethods) => Promise<void>;
            readonly stop: (n: RealtimeTestsNativeMethods) => Promise<void>;
        };
    };
    readonly hrv: {
        readonly event: "hrv_test_result";
        readonly eventField: "result";
        readonly logScope: "test";
        readonly normalize: typeof normalizeHrvTestResult;
        readonly control: {
            readonly start: (n: RealtimeTestsNativeMethods) => Promise<void>;
            readonly stop: (n: RealtimeTestsNativeMethods) => Promise<void>;
        };
    };
    readonly ecg: {
        readonly event: "ecg_test_result";
        readonly eventField: "result";
        readonly logScope: "test";
        readonly normalize: typeof normalizeEcgTestResult;
        readonly control: {
            readonly start: (n: RealtimeTestsNativeMethods, opts?: EcgTestOptions) => Promise<void>;
            readonly stop: (n: RealtimeTestsNativeMethods) => Promise<void>;
        };
    };
    readonly fatigue: {
        readonly event: "fatigue_test_result";
        readonly eventField: "result";
        readonly logScope: "test";
        readonly normalize: typeof normalizeFatigueTestResult;
        readonly control: {
            readonly start: (n: RealtimeTestsNativeMethods) => Promise<void>;
            readonly stop: (n: RealtimeTestsNativeMethods) => Promise<void>;
        };
    };
    readonly breathing: {
        readonly event: "breathing_test_result";
        readonly eventField: "result";
        readonly logScope: "test";
        readonly normalize: typeof normalizeBreathingTestResult;
        readonly control: {
            readonly start: (n: RealtimeTestsNativeMethods) => Promise<void>;
            readonly stop: (n: RealtimeTestsNativeMethods) => Promise<void>;
        };
    };
    readonly body_composition: {
        readonly event: "body_composition_test_result";
        readonly eventField: "result";
        readonly logScope: "test";
        readonly normalize: typeof normalizeBodyCompositionTestResult;
        readonly control: {
            readonly start: (n: RealtimeTestsNativeMethods) => Promise<void>;
            readonly stop: (n: RealtimeTestsNativeMethods) => Promise<void>;
        };
    };
    readonly health_glance: {
        readonly event: "health_glance_test_result";
        readonly eventField: "result";
        readonly logScope: "test";
        readonly normalize: typeof normalizeHealthGlanceResult;
        readonly control: {
            readonly start: (n: RealtimeTestsNativeMethods) => Promise<void>;
            readonly stop: (n: RealtimeTestsNativeMethods) => Promise<void>;
        };
    };
    readonly blood_analysis: {
        readonly event: "blood_analysis_test_result";
        readonly eventField: "result";
        readonly logScope: "device";
        readonly normalize: typeof normalizeBloodAnalysisTestResult;
    };
    readonly gsr: {
        readonly event: "gsr_test_result";
        readonly eventField: "result";
        readonly logScope: "device";
        readonly normalize: typeof normalizeGsrTestResult;
    };
    readonly ptt: {
        readonly event: "ptt_test_result";
        readonly eventField: "result";
        readonly logScope: "device";
        readonly normalize: typeof normalizePttTestResult;
    };
};
export type RealtimeTestKey = keyof typeof REALTIME_TEST_DEFINITIONS;
/**
 * Modalities the capability can start/stop — rows in
 * {@link REALTIME_TEST_DEFINITIONS} that declare a `control` surface.
 * `blood_analysis`, `gsr`, `ptt` are receive-only and excluded.
 */
export type RealtimeTestModality = {
    [K in RealtimeTestKey]: typeof REALTIME_TEST_DEFINITIONS[K] extends {
        control: unknown;
    } ? K : never;
}[RealtimeTestKey];
/**
 * String-literal map of {@link RealtimeTestModality} values, derived from the
 * registry. Useful for autocompletion: `RealtimeTest.heart_rate`.
 */
export declare const RealtimeTest: { readonly [K in RealtimeTestModality]: K; };
/** Snake-case event name → camelCase native emitter name. */
export declare function eventNameToNative(event: VeepooEvent): string;
//# sourceMappingURL=registry.d.ts.map