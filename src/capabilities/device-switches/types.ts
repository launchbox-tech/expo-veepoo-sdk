export type DeviceSwitchType =
  | 'auto_hr' | 'auto_bp' | 'auto_spo2' | 'auto_temperature' | 'auto_hrv'
  | 'auto_blood_glucose' | 'auto_ppg' | 'wear_detection' | 'disconnect_remind'
  | 'sos_remind' | 'auto_answer' | 'exercise_detection' | 'accurate_sleep'
  | 'ecg_normally_open' | 'met' | 'stress' | 'music_control';

export type DeviceSwitches = Record<DeviceSwitchType, boolean>;
