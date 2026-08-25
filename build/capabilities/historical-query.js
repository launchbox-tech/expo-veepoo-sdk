"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HistoricalQueryCapability = void 0;
exports.normalizeExerciseSessionInner = normalizeExerciseSessionInner;
const types_1 = require("../capabilities/sport-mode/types");
const collect_stream_1 = require("../capabilities/shared/collect-stream");
const primitives_1 = require("../shared/primitives");
// ── Inner-payload normalizer (bridge delegates via wrapInner) ───────────────
const SPORT_MODE_SET = new Set(types_1.SPORT_MODE_ORDINALS);
/**
 * Native exercise payloads carry the sport name in the native tables'
 * camelCase ("outdoorRun"); the JS surface is snake_case `SportMode`
 * (ADR 0004/0013). `deepSnakeKeys` rewrites keys, never values — so the
 * `type` VALUE is converted here, validated against the canonical ordinal
 * list, and nulled when unknown (matching the declared `SportMode | null`).
 */
function normalizeExerciseSessionInner(raw) {
    if (!(0, primitives_1.isRecord)(raw))
        return raw;
    const type = typeof raw.type === "string"
        ? raw.type.replace(/([A-Z])/g, "_$1").toLowerCase()
        : null;
    return { ...raw, type: type !== null && SPORT_MODE_SET.has(type) ? type : null };
}
// ── Capability ──────────────────────────────────────────────────────────────
class HistoricalQueryCapability {
    constructor(ctx) {
        this.ctx = ctx;
    }
    readDeviceAllData() {
        return this.ctx.invoke({
            invoke: () => this.ctx.native.readDeviceAllData(),
        });
    }
    startReadOriginData() {
        this.ctx.log("info", "read", "read.origin.start", "Starting origin data read", {});
        return this.ctx.invoke({
            invoke: () => this.ctx.native.startReadOriginData(),
        });
    }
    /**
     * Unfiltered per-day dump of the vendor SDK's local DB tables (iOS-only;
     * Android rejects CAPABILITY_UNSUPPORTED). Raw vendor field names and
     * units — the "get-everything" sink for host-side raw capture; promote
     * modalities to typed storage after the real shapes are known.
     */
    readOriginRawDump(dayOffset) {
        return this.ctx.invoke({
            invoke: () => this.ctx.native.readOriginRawDump(dayOffset),
        });
    }
    /** Precision-sleep sessions (gate: precise-sleep support). Raw vendor shape. */
    readAccurateSleepData(date) {
        return this.ctx.invoke({
            invoke: () => this.ctx.native.readAccurateSleepData(date ?? null),
        });
    }
    /** Stored offline ECG records. Raw vendor shape. */
    readStoredEcgData(date) {
        return this.ctx.invoke({
            invoke: () => this.ctx.native.readStoredEcgData(date ?? null),
        });
    }
    /** Stored HRV records. Raw vendor shape. */
    readStoredHrvData(date) {
        return this.ctx.invoke({
            invoke: () => this.ctx.native.readStoredHrvData(date ?? null),
        });
    }
    /** Stored temperature records. Raw vendor shape. */
    readStoredTemperatureData(date) {
        return this.ctx.invoke({
            invoke: () => this.ctx.native.readStoredTemperatureData(date ?? null),
        });
    }
    /** Stored blood-glucose records. Raw vendor shape. */
    readStoredBloodGlucoseData(date) {
        return this.ctx.invoke({
            invoke: () => this.ctx.native.readStoredBloodGlucoseData(date ?? null),
        });
    }
    /** Stored body-composition records. Raw vendor shape. */
    readStoredBodyCompositionData(date) {
        return this.ctx.invoke({
            invoke: () => this.ctx.native.readStoredBodyCompositionData(date ?? null),
        });
    }
    /**
     * Stream-read collector (ADR 0015): fires the exercise-history read and
     * resolves with every stored session once `exercise_read_complete` arrives.
     * `exercise_read_progress` events re-arm the stall watchdog (slow ≠ dead)
     * and stream to `onProgress` for host progress bars. Rejects
     * `CAPABILITY_UNSUPPORTED` when the Band has no exercise history (distinct
     * from a supported Band with zero stored workouts → `[]`),
     * `OPERATION_FAILED` when the vendor aborts (`success: false`), and
     * `TIMEOUT` after {@link EXERCISE_STALL_MS} of event silence.
     */
    readExerciseSessions(opts) {
        this.ctx.log("info", "read", "read.exercise.start", "Starting exercise history read", {});
        return (0, collect_stream_1.collectStream)(this.ctx, {
            start: () => this.ctx.invoke({
                invoke: () => this.ctx.native.startReadExerciseData(),
            }),
            dataEvent: "exercise_session_data",
            pick: (payload) => payload.session,
            onItem: opts?.onSession,
            completeEvent: "exercise_read_complete",
            isFailure: (payload) => payload.success ? null : "exercise read aborted by the Band (invalid state)",
            onComplete: opts?.onComplete,
            progress: {
                event: "exercise_read_progress",
                onProgress: (payload) => {
                    opts?.onProgress?.(payload.progress);
                },
            },
            stallMs: EXERCISE_STALL_MS,
        });
    }
}
exports.HistoricalQueryCapability = HistoricalQueryCapability;
/** Max silence between exercise-stream events before the read is declared
 * dead. The vendor app budgets 60s for its whole `readSportModelOrigin` step;
 * per-event silence of 30s is far past any live transfer's inter-packet gap. */
const EXERCISE_STALL_MS = 30000;
//# sourceMappingURL=historical-query.js.map