"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealtimeTest = exports.REALTIME_TEST_DEFINITIONS = void 0;
exports.eventNameToNative = eventNameToNative;
const deep_keys_1 = require("../../shared/deep-keys");
const normalizers_1 = require("./normalizers");
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
exports.REALTIME_TEST_DEFINITIONS = {
    heart_rate: {
        event: "heart_rate_test_result",
        eventField: "result",
        logScope: "test",
        normalize: normalizers_1.normalizeHeartRateTestResult,
        control: {
            start: (n) => n.startHeartRateTest(),
            stop: (n) => n.stopHeartRateTest(),
        },
    },
    blood_pressure: {
        event: "blood_pressure_test_result",
        eventField: "result",
        logScope: "test",
        normalize: normalizers_1.normalizeBloodPressureTestResult,
        control: {
            start: (n) => n.startBloodPressureTest(),
            stop: (n) => n.stopBloodPressureTest(),
        },
    },
    blood_oxygen: {
        event: "blood_oxygen_test_result",
        eventField: "result",
        logScope: "test",
        normalize: normalizers_1.normalizeBloodOxygenTestResult,
        control: {
            start: (n) => n.startBloodOxygenTest(),
            stop: (n) => n.stopBloodOxygenTest(),
        },
    },
    temperature: {
        event: "temperature_test_result",
        eventField: "result",
        logScope: "test",
        normalize: normalizers_1.normalizeTemperatureTestResult,
        control: {
            start: (n) => n.startTemperatureTest(),
            stop: (n) => n.stopTemperatureTest(),
        },
    },
    stress: {
        event: "stress_data",
        eventField: "data",
        logScope: "test",
        normalize: normalizers_1.normalizeStressData,
        control: {
            start: (n) => n.startStressTest(),
            stop: (n) => n.stopStressTest(),
        },
    },
    blood_glucose: {
        event: "blood_glucose_data",
        eventField: "data",
        logScope: "test",
        normalize: normalizers_1.normalizeBloodGlucoseData,
        control: {
            start: (n) => n.startBloodGlucoseTest(),
            stop: (n) => n.stopBloodGlucoseTest(),
        },
    },
    hrv: {
        event: "hrv_test_result",
        eventField: "result",
        logScope: "test",
        normalize: normalizers_1.normalizeHrvTestResult,
        control: {
            start: (n) => n.startHrvTest(),
            stop: (n) => n.stopHrvTest(),
        },
    },
    ecg: {
        event: "ecg_test_result",
        eventField: "result",
        logScope: "test",
        normalize: normalizers_1.normalizeEcgTestResult,
        control: {
            start: (n, opts) => n.startEcgTest(opts
                ? (0, deep_keys_1.deepCamelKeys)(opts)
                : undefined),
            stop: (n) => n.stopEcgTest(),
        },
    },
    fatigue: {
        event: "fatigue_test_result",
        eventField: "result",
        logScope: "test",
        normalize: normalizers_1.normalizeFatigueTestResult,
        control: {
            start: (n) => n.startFatigueTest(),
            stop: (n) => n.stopFatigueTest(),
        },
    },
    breathing: {
        event: "breathing_test_result",
        eventField: "result",
        logScope: "test",
        normalize: normalizers_1.normalizeBreathingTestResult,
        control: {
            start: (n) => n.startBreathingTest(),
            stop: (n) => n.stopBreathingTest(),
        },
    },
    body_composition: {
        event: "body_composition_test_result",
        eventField: "result",
        logScope: "test",
        normalize: normalizers_1.normalizeBodyCompositionTestResult,
        control: {
            start: (n) => n.startBodyCompositionTest(),
            stop: (n) => n.stopBodyCompositionTest(),
        },
    },
    health_glance: {
        event: "health_glance_test_result",
        eventField: "result",
        logScope: "test",
        normalize: normalizers_1.normalizeHealthGlanceResult,
        control: {
            start: (n) => n.startHealthGlanceTest(),
            stop: (n) => n.stopHealthGlanceTest(),
        },
    },
    blood_analysis: {
        event: "blood_analysis_test_result",
        eventField: "result",
        logScope: "device",
        normalize: normalizers_1.normalizeBloodAnalysisTestResult,
    },
    gsr: {
        event: "gsr_test_result",
        eventField: "result",
        logScope: "device",
        normalize: normalizers_1.normalizeGsrTestResult,
    },
    ptt: {
        event: "ptt_test_result",
        eventField: "result",
        logScope: "device",
        normalize: normalizers_1.normalizePttTestResult,
    },
};
/**
 * String-literal map of {@link RealtimeTestModality} values, derived from the
 * registry. Useful for autocompletion: `RealtimeTest.heart_rate`.
 */
exports.RealtimeTest = Object.fromEntries(Object.entries(exports.REALTIME_TEST_DEFINITIONS)
    .filter(([, def]) => def.control !== undefined)
    .map(([k]) => [k, k]));
/** Snake-case event name → camelCase native emitter name. */
function eventNameToNative(event) {
    return event.replace(/_([a-z\d])/g, (_m, c) => c.toUpperCase());
}
//# sourceMappingURL=registry.js.map