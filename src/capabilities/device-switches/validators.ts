import type { DeviceSwitchType } from "@/types/index";

const DEVICE_SWITCH_TYPES = new Set<string>([
  'auto_hr', 'auto_bp', 'auto_spo2', 'auto_temperature', 'auto_hrv',
  'auto_blood_glucose', 'auto_ppg', 'wear_detection', 'disconnect_remind',
  'sos_remind', 'auto_answer', 'exercise_detection', 'accurate_sleep',
  'ecg_normally_open', 'met', 'stress', 'music_control',
]);

export function validateDeviceSwitchType(type: unknown): asserts type is DeviceSwitchType {
  if (typeof type !== 'string' || !DEVICE_SWITCH_TYPES.has(type)) {
    throw { code: 'INVALID_ARGUMENT', message: `Invalid device switch type: ${String(type)}` };
  }
}
