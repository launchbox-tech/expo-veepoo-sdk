export interface SleepDataItem {
  date: string;
  sleep_time: string;
  wake_time: string;
  deep_sleep_minutes: number;
  light_sleep_minutes: number;
  total_sleep_minutes: number;
  sleep_quality: number;
  sleep_line: string;
  wake_up_count: number;
}

export interface SleepData {
  date: string;
  items: SleepDataItem[];
  summary: {
    total_deep_sleep_minutes: number;
    total_light_sleep_minutes: number;
    total_sleep_minutes: number;
    average_sleep_quality: number;
    total_wake_up_count: number;
  };
}

/** Sleep state for a single minute point in the detailed sleep curve. */
export type SleepMinuteState = 'deep' | 'light' | 'rem' | 'insomnia' | 'awake';

export interface SleepMinutePoint {
  /** 0-based minute index from sleep start. */
  index: number;
  state: SleepMinuteState;
}

/** Detailed sleep session from the accurate-sleep read path. */
export interface AccurateSleepSession {
  /** Timestamp string "YYYY-MM-DD HH:MM:SS" */
  sleep_time: string;
  wake_time: string;
  /** Deep sleep duration in minutes */
  deep_duration: number;
  /** Light sleep duration in minutes */
  light_duration: number;
  /** REM duration in minutes (otherDuration on Android) */
  rem_duration: number;
  /** Wake/getUp duration in minutes */
  get_up_duration: number;
  /** Total sleep duration in minutes */
  sleep_duration: number;
  /** Number of wake-ups */
  get_up_times: number;
  /** Sleep quality 0–4 (0=worst, 4=best) */
  sleep_quality: number;
  /** Insomnia score */
  insomnia_score: number;
  /** Number of insomnia events */
  insomnia_times: number;
  /** Fall-asleep efficiency score */
  fall_asleep_score: number;
  /** Sleep efficiency score */
  sleep_efficiency_score: number;
  /** Per-minute sleep state curve */
  curve: SleepMinutePoint[];
}
