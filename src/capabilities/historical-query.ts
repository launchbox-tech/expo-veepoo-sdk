import type { CapabilityContext } from "@/capabilities/shared/context";
import type { SportMode } from "@/capabilities/sport-mode/types";
import { SPORT_MODE_ORDINALS } from "@/capabilities/sport-mode/types";
import { collectStream } from "@/capabilities/shared/collect-stream";
import { isRecord } from "@/shared/primitives";
import type {
  BloodGlucoseData,
  BloodOxygenData,
  BloodPressureData,
  StressData,
  TemperatureData,
} from "@/capabilities/realtime-tests/types";

// ── Types ────────────────────────────────────────────────────────────────────

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
  minute_data: ExerciseMinuteData[];
}

// ── Inner-payload normalizer (bridge delegates via wrapInner) ───────────────

const SPORT_MODE_SET: ReadonlySet<string> = new Set(SPORT_MODE_ORDINALS);

/**
 * Native exercise payloads carry the sport name in the native tables'
 * camelCase ("outdoorRun"); the JS surface is snake_case `SportMode`
 * (ADR 0004/0013). `deepSnakeKeys` rewrites keys, never values — so the
 * `type` VALUE is converted here, validated against the canonical ordinal
 * list, and nulled when unknown (matching the declared `SportMode | null`).
 */
export function normalizeExerciseSessionInner(raw: unknown): unknown {
  if (!isRecord(raw)) return raw;
  const type =
    typeof raw.type === "string"
      ? raw.type.replace(/([A-Z])/g, "_$1").toLowerCase()
      : null;
  return { ...raw, type: type !== null && SPORT_MODE_SET.has(type) ? type : null };
}

// ── Native methods ──────────────────────────────────────────────────────────

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

// ── Capability ──────────────────────────────────────────────────────────────

export class HistoricalQueryCapability {
  constructor(private readonly ctx: CapabilityContext<HistoricalQueryNativeMethods>) {}

  readDeviceAllData(): Promise<boolean> {
    return this.ctx.invoke({
      invoke: () => this.ctx.native.readDeviceAllData(),
    });
  }

  startReadOriginData(): Promise<void> {
    this.ctx.log("info", "read", "read.origin.start", "Starting origin data read", {
    });
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
  readOriginRawDump(dayOffset: number): Promise<Record<string, unknown>> {
    return this.ctx.invoke({
      invoke: () => this.ctx.native.readOriginRawDump(dayOffset),
    });
  }

  /** Precision-sleep sessions (gate: precise-sleep support). Raw vendor shape. */
  readAccurateSleepData(date?: string): Promise<unknown> {
    return this.ctx.invoke({
      invoke: () => this.ctx.native.readAccurateSleepData(date ?? null),
    });
  }

  /** Stored offline ECG records. Raw vendor shape. */
  readStoredEcgData(date?: string): Promise<unknown> {
    return this.ctx.invoke({
      invoke: () => this.ctx.native.readStoredEcgData(date ?? null),
    });
  }

  /** Stored HRV records. Raw vendor shape. */
  readStoredHrvData(date?: string): Promise<unknown> {
    return this.ctx.invoke({
      invoke: () => this.ctx.native.readStoredHrvData(date ?? null),
    });
  }

  /** Stored temperature records. Raw vendor shape. */
  readStoredTemperatureData(date?: string): Promise<unknown> {
    return this.ctx.invoke({
      invoke: () => this.ctx.native.readStoredTemperatureData(date ?? null),
    });
  }

  /** Stored blood-glucose records. Raw vendor shape. */
  readStoredBloodGlucoseData(date?: string): Promise<unknown> {
    return this.ctx.invoke({
      invoke: () => this.ctx.native.readStoredBloodGlucoseData(date ?? null),
    });
  }

  /** Stored body-composition records. Raw vendor shape. */
  readStoredBodyCompositionData(date?: string): Promise<unknown> {
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
  readExerciseSessions(opts?: {
    onProgress?: (progress: ExerciseReadProgress) => void;
    /** Streams each session as it arrives — persist incrementally so a
     * mid-read death keeps everything received so far. */
    onSession?: (session: ExerciseSession) => void;
  }): Promise<ExerciseSession[]> {
    this.ctx.log("info", "read", "read.exercise.start", "Starting exercise history read", {
    });
    return collectStream(this.ctx, {
      start: () =>
        this.ctx.invoke({
          invoke: () => this.ctx.native.startReadExerciseData(),
        }),
      dataEvent: "exercise_session_data",
      pick: (payload) => payload.session,
      onItem: opts?.onSession,
      completeEvent: "exercise_read_complete",
      isFailure: (payload) =>
        payload.success ? null : "exercise read aborted by the Band (invalid state)",
      progress: {
        event: "exercise_read_progress",
        onProgress: (payload: { progress: ExerciseReadProgress }) => {
          opts?.onProgress?.(payload.progress);
        },
      },
      stallMs: EXERCISE_STALL_MS,
    });
  }
}

/** Max silence between exercise-stream events before the read is declared
 * dead. The vendor app budgets 60s for its whole `readSportModelOrigin` step;
 * per-event silence of 30s is far past any live transfer's inter-packet gap. */
const EXERCISE_STALL_MS = 30_000;
