import type { CapabilityContext } from "@/capabilities/shared/context";
import type { SportMode } from "@/capabilities/sport-mode/types";
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
  distance: number;
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

export interface ExerciseSession {
  /** Sport mode — null if ordinal is out of range or unknown. */
  type: SportMode | null;
  /** ISO-like timestamp string "YYYY-MM-DD HH:MM:SS" */
  begin_time: string;
  end_time: string;
  total_steps: number;
  total_distance: number;
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

// ── Native methods ──────────────────────────────────────────────────────────

export interface HistoricalQueryNativeMethods {
  readDeviceAllData(): Promise<boolean>;
  startReadOriginData(): Promise<void>;
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
}
