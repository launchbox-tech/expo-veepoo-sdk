import type { LogScope, VeepooEvent, EcgTestOptions } from "@/types/index";
import { deepCamelKeys } from "@/shared/deep-keys";
import type { RealtimeTestsNativeMethods } from "./native";
import {
  normalizeBloodAnalysisTestResult,
  normalizeBloodGlucoseData,
  normalizeBloodOxygenTestResult,
  normalizeBloodPressureTestResult,
  normalizeBodyCompositionTestResult,
  normalizeBreathingTestResult,
  normalizeEcgTestResult,
  normalizeFatigueTestResult,
  normalizeGsrTestResult,
  normalizeHealthGlanceResult,
  normalizeHeartRateTestResult,
  normalizeHrvTestResult,
  normalizePttTestResult,
  normalizeStressData,
  normalizeTemperatureTestResult,
} from "./normalizers";

export interface RealtimeTestControl<TOptions = void> {
  /** Start the test on the Band. `options` is per-test; most are parameterless. */
  start: (
    native: RealtimeTestsNativeMethods,
    options?: TOptions,
  ) => Promise<unknown>;
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
export const REALTIME_TEST_DEFINITIONS = {
  heart_rate: {
    event: "heart_rate_test_result",
    eventField: "result",
    logScope: "test",
    normalize: normalizeHeartRateTestResult,
    control: {
      start: (n) => n.startHeartRateTest(),
      stop: (n) => n.stopHeartRateTest(),
    },
  },
  blood_pressure: {
    event: "blood_pressure_test_result",
    eventField: "result",
    logScope: "test",
    normalize: normalizeBloodPressureTestResult,
    control: {
      start: (n) => n.startBloodPressureTest(),
      stop: (n) => n.stopBloodPressureTest(),
    },
  },
  blood_oxygen: {
    event: "blood_oxygen_test_result",
    eventField: "result",
    logScope: "test",
    normalize: normalizeBloodOxygenTestResult,
    control: {
      start: (n) => n.startBloodOxygenTest(),
      stop: (n) => n.stopBloodOxygenTest(),
    },
  },
  temperature: {
    event: "temperature_test_result",
    eventField: "result",
    logScope: "test",
    normalize: normalizeTemperatureTestResult,
    control: {
      start: (n) => n.startTemperatureTest(),
      stop: (n) => n.stopTemperatureTest(),
    },
  },
  stress: {
    event: "stress_data",
    eventField: "data",
    logScope: "test",
    normalize: normalizeStressData,
    control: {
      start: (n) => n.startStressTest(),
      stop: (n) => n.stopStressTest(),
    },
  },
  blood_glucose: {
    event: "blood_glucose_data",
    eventField: "data",
    logScope: "test",
    normalize: normalizeBloodGlucoseData,
    control: {
      start: (n) => n.startBloodGlucoseTest(),
      stop: (n) => n.stopBloodGlucoseTest(),
    },
  },
  hrv: {
    event: "hrv_test_result",
    eventField: "result",
    logScope: "test",
    normalize: normalizeHrvTestResult,
    control: {
      start: (n) => n.startHrvTest(),
      stop: (n) => n.stopHrvTest(),
    },
  },
  ecg: {
    event: "ecg_test_result",
    eventField: "result",
    logScope: "test",
    normalize: normalizeEcgTestResult,
    control: {
      start: (n, opts?: EcgTestOptions) =>
        n.startEcgTest(
          opts
            ? (deepCamelKeys(opts) as { includeWaveform?: boolean })
            : undefined,
        ),
      stop: (n) => n.stopEcgTest(),
    },
  },
  fatigue: {
    event: "fatigue_test_result",
    eventField: "result",
    logScope: "test",
    normalize: normalizeFatigueTestResult,
    control: {
      start: (n) => n.startFatigueTest(),
      stop: (n) => n.stopFatigueTest(),
    },
  },
  breathing: {
    event: "breathing_test_result",
    eventField: "result",
    logScope: "test",
    normalize: normalizeBreathingTestResult,
    control: {
      start: (n) => n.startBreathingTest(),
      stop: (n) => n.stopBreathingTest(),
    },
  },
  body_composition: {
    event: "body_composition_test_result",
    eventField: "result",
    logScope: "test",
    normalize: normalizeBodyCompositionTestResult,
    control: {
      start: (n) => n.startBodyCompositionTest(),
      stop: (n) => n.stopBodyCompositionTest(),
    },
  },
  health_glance: {
    event: "health_glance_test_result",
    eventField: "result",
    logScope: "test",
    normalize: normalizeHealthGlanceResult,
    control: {
      start: (n) => n.startHealthGlanceTest(),
      stop: (n) => n.stopHealthGlanceTest(),
    },
  },
  blood_analysis: {
    event: "blood_analysis_test_result",
    eventField: "result",
    logScope: "device",
    normalize: normalizeBloodAnalysisTestResult,
  },
  gsr: {
    event: "gsr_test_result",
    eventField: "result",
    logScope: "device",
    normalize: normalizeGsrTestResult,
  },
  ptt: {
    event: "ptt_test_result",
    eventField: "result",
    logScope: "device",
    normalize: normalizePttTestResult,
  },
} as const satisfies Record<string, RealtimeTestDef<unknown, never>>;

export type RealtimeTestKey = keyof typeof REALTIME_TEST_DEFINITIONS;

/**
 * Modalities the capability can start/stop — rows in
 * {@link REALTIME_TEST_DEFINITIONS} that declare a `control` surface.
 * `blood_analysis`, `gsr`, `ptt` are receive-only and excluded.
 */
export type RealtimeTestModality = {
  [K in RealtimeTestKey]: typeof REALTIME_TEST_DEFINITIONS[K] extends {
    control: unknown;
  }
    ? K
    : never;
}[RealtimeTestKey];

/**
 * String-literal map of {@link RealtimeTestModality} values, derived from the
 * registry. Useful for autocompletion: `RealtimeTest.heart_rate`.
 */
export const RealtimeTest = Object.fromEntries(
  (Object.entries(REALTIME_TEST_DEFINITIONS) as [
    RealtimeTestKey,
    RealtimeTestDef<unknown, unknown>,
  ][])
    .filter(([, def]) => def.control !== undefined)
    .map(([k]) => [k, k]),
) as { readonly [K in RealtimeTestModality]: K };

/** Snake-case event name → camelCase native emitter name. */
export function eventNameToNative(event: VeepooEvent): string {
  return event.replace(/_([a-z\d])/g, (_m, c: string) => c.toUpperCase());
}
