import type { DeviceSwitches, DeviceSwitchType } from "@/types/index";
import { isRecord, toBoolean } from "@/normalizers/primitives";

const SWITCH_KEYS: DeviceSwitchType[] = [
  'auto_hr', 'auto_bp', 'auto_spo2', 'auto_temperature', 'auto_hrv',
  'auto_blood_glucose', 'auto_ppg', 'wear_detection', 'disconnect_remind',
  'sos_remind', 'auto_answer', 'exercise_detection', 'accurate_sleep',
  'ecg_normally_open', 'met', 'stress', 'music_control',
];

/** Camel-case variant → snake_case switch key mapping. */
const CAMEL_TO_SWITCH: Record<string, DeviceSwitchType> = {
  autoHr: 'auto_hr',
  autoHR: 'auto_hr',
  autoBp: 'auto_bp',
  autoBP: 'auto_bp',
  autoSpo2: 'auto_spo2',
  autoSPO2: 'auto_spo2',
  autoTemperature: 'auto_temperature',
  autoHrv: 'auto_hrv',
  autoHRV: 'auto_hrv',
  autoBloodGlucose: 'auto_blood_glucose',
  autoPpg: 'auto_ppg',
  autoPPG: 'auto_ppg',
  wearDetection: 'wear_detection',
  disconnectRemind: 'disconnect_remind',
  sosRemind: 'sos_remind',
  autoAnswer: 'auto_answer',
  exerciseDetection: 'exercise_detection',
  accurateSleep: 'accurate_sleep',
  ecgNormallyOpen: 'ecg_normally_open',
  met: 'met',
  stress: 'stress',
  musicControl: 'music_control',
};

export function normalizeDeviceSwitches(value: unknown): DeviceSwitches {
  const record = isRecord(value) ? value : {};

  // Start with all false
  const result = Object.fromEntries(SWITCH_KEYS.map(k => [k, false])) as DeviceSwitches;

  for (const [rawKey, rawVal] of Object.entries(record)) {
    const snakeKey = (CAMEL_TO_SWITCH[rawKey] ?? rawKey) as DeviceSwitchType;
    if (SWITCH_KEYS.includes(snakeKey)) {
      result[snakeKey] = toBoolean(rawVal, false);
    }
  }

  return result;
}
