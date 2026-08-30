import type { CapabilityContext } from "../capabilities/shared/context";
import type { SportMode } from "../capabilities/sport-mode/types";
import type { VeepooEventPayload } from "../types/index";
import type { BloodGlucoseData, BloodOxygenData, BloodPressureData, StressData, TemperatureData } from "../capabilities/realtime-tests/types";
export interface DailyHealthData {
    date: string;
    step_count?: number;
    distance?: number;
    calories?: number;
    heart_rate?: number;
    blood_pressure?: BloodPressureData;
    blood_oxygen?: BloodOxygenData;
    temperature?: TemperatureData;
    stress?: StressData;
    blood_glucose?: BloodGlucoseData;
}
export interface ExerciseMinuteData {
    heart_rate: number;
    /** Kilometres (normalized at the native boundary — ADR 0016). */
    distance: number;
    /** Kilocalories (normalized at the native boundary — ADR 0016). */
    calories: number;
    steps: number;
    sport_value: number;
    is_paused: boolean;
    /**
     * The band's own minute index for this sample (vendor `packageCount`).
     * Absent on the legacy DB-dict read path, which does not carry it.
     *
     * A clean stream's indices run monotonically; an overrun tail repeats the
     * PRIOR session's final index (rayu.ai#566). Independent of `record_count`,
     * so the two can disagree and that disagreement is itself evidence.
     */
    packet_index?: number;
}
export interface StoredTemperatureData {
    /** "YYYY-MM-DD HH:MM" */
    timestamp: string;
    /** Body temperature °C */
    temperature: number;
    /** Skin/surface temperature °C */
    body_temperature?: number;
}
export interface StoredBloodGlucoseData {
    /** "YYYY-MM-DD HH:MM" */
    timestamp: string;
    blood_glucose: number;
    /** Risk level: "low" | "normal" | "high" */
    level?: string;
}
export interface StoredHrvData {
    /** "YYYY-MM-DD HH:MM" */
    timestamp: string;
    hrv: number;
    /** RR interval values (each × 10 = milliseconds) */
    rr_intervals: number[];
}
export interface StoredEcgData {
    /** "YYYY-MM-DD HH:MM:SS" */
    timestamp: string;
    /** Duration in seconds */
    duration: number;
    ave_heart: number;
    ave_hrv: number;
    ave_res_rate: number;
    ave_qt?: number;
    filter_signals: number[];
}
export interface StoredBodyCompositionData {
    /** "YYYY-MM-DD HH:MM:SS" */
    timestamp: string;
    bmi: number;
    body_fat_percentage: number;
    fat_mass: number;
    lean_body_mass: number;
    muscle_rate: number;
    muscle_mass: number;
    subcutaneous_fat: number;
    body_moisture: number;
    water_content: number;
    skeletal_muscle_rate: number;
    bone_mass: number;
    proportion_of_protein: number;
    protein_amount: number;
    basal_metabolic_rate: number;
}
export interface ExerciseReadProgress {
    /** `transfer` = band→SDK bulk transfer; `slots` = per-stored-session reads. */
    phase: "transfer" | "slots";
    read_state: "start" | "reading" | "complete" | "invalid";
    /** Units for `current` — transfer times (iOS), sessions (slots). 0 = unknown. */
    total: number;
    current: number;
    /** 0–100 within `current`. */
    progress: number;
}
export interface ExerciseSession {
    /** Sport mode — null if ordinal is out of range or unknown. */
    type: SportMode | null;
    /** Vendor slot CRC (sport-API reads) — slot↔session forensics. */
    crc?: number;
    /** ISO-like timestamp string "YYYY-MM-DD HH:MM:SS" */
    begin_time: string;
    end_time: string;
    total_steps: number;
    /** Kilometres (iOS DB stores metres; normalized natively — ADR 0016). */
    total_distance: number;
    /** Kilocalories (iOS DB stores cal; normalized natively — ADR 0016). */
    total_calories: number;
    /** Total active time in seconds */
    total_time: number;
    average_heart_rate: number;
    /** Average pace in seconds per km */
    average_pace: number;
    pause_count: number;
    /** Total paused time in seconds */
    pause_total_time: number;
    /**
     * How many per-minute records the BAND says this session has (vendor
     * `recordCount`). Absent on the legacy DB-dict read path.
     *
     * `0` means the band declared nothing — NOT that the session has no samples
     * (ADR-0060). Compare against `delivered_sample_count` to tell a clean read
     * from an overrun one; see `minute_data`.
     */
    record_count?: number;
    /**
     * How many per-minute records the vendor's array actually held, BEFORE
     * `minute_data` was bounded by `record_count`.
     *
     * When this exceeds `record_count`, the vendor returned the buffer's length
     * rather than the session's fill and the excess was the previous session's
     * data (rayu.ai#566) — `minute_data` has already been trimmed, but the
     * session's stream is still suspect and should be annotated, not trusted.
     */
    delivered_sample_count?: number;
    /**
     * Band-reported max/min heart rate for the session. Present only on the
     * GPS-bearing read path — the plain sport model carries no such field, so
     * consumers fall back to scanning `minute_data`.
     *
     * Prefer these where present: the sample scan reads the array that overruns,
     * so on an affected session it yields the PREVIOUS session's extrema.
     */
    max_heart_rate?: number;
    min_heart_rate?: number;
    /**
     * Per-minute stream, bounded at the native boundary by `record_count`
     * (rayu.ai#566). Where the band declared no count, it is passed through
     * unbounded and `delivered_sample_count` equals its length.
     */
    minute_data: ExerciseMinuteData[];
}
/**
 * Native exercise payloads carry the sport name in the native tables'
 * camelCase ("outdoorRun"); the JS surface is snake_case `SportMode`
 * (ADR 0004/0013). `deepSnakeKeys` rewrites keys, never values — so the
 * `type` VALUE is converted here, validated against the canonical ordinal
 * list, and nulled when unknown (matching the declared `SportMode | null`).
 */
export declare function normalizeExerciseSessionInner(raw: unknown): unknown;
export interface HistoricalQueryNativeMethods {
    readDeviceAllData(): Promise<boolean>;
    startReadOriginData(): Promise<void>;
    startReadExerciseData(): Promise<void>;
    readOriginRawDump(dayOffset: number): Promise<Record<string, unknown>>;
    readAccurateSleepData(date: string | null): Promise<unknown>;
    readStoredEcgData(date: string | null): Promise<unknown>;
    readStoredHrvData(date: string | null): Promise<unknown>;
    readStoredTemperatureData(date: string | null): Promise<unknown>;
    readStoredBloodGlucoseData(date: string | null): Promise<unknown>;
    readStoredBodyCompositionData(date: string | null): Promise<unknown>;
}
export declare class HistoricalQueryCapability {
    private readonly ctx;
    constructor(ctx: CapabilityContext<HistoricalQueryNativeMethods>);
    readDeviceAllData(): Promise<boolean>;
    startReadOriginData(): Promise<void>;
    /**
     * Unfiltered per-day dump of the vendor SDK's local DB tables (iOS-only;
     * Android rejects CAPABILITY_UNSUPPORTED). Raw vendor field names and
     * units — the "get-everything" sink for host-side raw capture; promote
     * modalities to typed storage after the real shapes are known.
     *
     * `origin` is the verbatim `original_table` row and uses the vendor's own
     * key spellings — capital `Wear`, `Step`, `SportValue`, not the camelCase
     * the SDK's narrowed view uses. `Wear` is passed through unmapped on
     * purpose: 0 means worn and 2 means NOT worn, so pin the enum against
     * captured data rather than guessing.
     *
     * `origin_normalized` is the SDK's own narrowed 12-key view of the same
     * slots, kept for callers already reading `stepValue` et al.
     *
     * **Check `origin_source` before trusting `origin`.** The verbatim read goes
     * through vendor internals that are not in the public headers; if a vendor
     * SDK bump moves them, `origin` silently degrades to the narrowed 10-key
     * shape and `Wear` disappears again. `origin_source` is `"original_table"`
     * on the real path and `"veepooSDKGetOriginalData"` on the fallback.
     */
    readOriginRawDump(dayOffset: number): Promise<Record<string, unknown>>;
    /** Precision-sleep sessions (gate: precise-sleep support). Raw vendor shape. */
    readAccurateSleepData(date?: string): Promise<unknown>;
    /** Stored offline ECG records. Raw vendor shape. */
    readStoredEcgData(date?: string): Promise<unknown>;
    /** Stored HRV records. Raw vendor shape. */
    readStoredHrvData(date?: string): Promise<unknown>;
    /** Stored temperature records. Raw vendor shape. */
    readStoredTemperatureData(date?: string): Promise<unknown>;
    /** Stored blood-glucose records. Raw vendor shape. */
    readStoredBloodGlucoseData(date?: string): Promise<unknown>;
    /** Stored body-composition records. Raw vendor shape. */
    readStoredBodyCompositionData(date?: string): Promise<unknown>;
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
    readExerciseSessions(opts?: {
        onProgress?: (progress: ExerciseReadProgress) => void;
        /** Streams each session as it arrives — persist incrementally so a
         * mid-read death keeps everything received so far. */
        onSession?: (session: ExerciseSession) => void;
        /** Read diagnostics from the completion event: which native path ran
         * (`read_path`) and its per-round coverage (`block_outcomes`). Fires on
         * success AND on a vendor abort. iOS-only — the fields are absent on
         * Android, so treat every one of them as optional (rayu.ai #467).
         *
         * A throw here is caught and discarded: the hook cannot fail the read. */
        onComplete?: (info: VeepooEventPayload["exercise_read_complete"]) => void;
    }): Promise<ExerciseSession[]>;
}
//# sourceMappingURL=historical-query.d.ts.map