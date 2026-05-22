export interface DeviceAlarm {
  id: number;
  enabled: boolean;
  hour: number;
  minute: number;
  repeat: number[];
  scene?: number;
  type?: 'normal' | 'text';
  text?: string;
}

export interface HeartRateAlarm {
  enabled: boolean;
  high_threshold: number;
  low_threshold: number;
}

/** SpO₂ low-saturation alarm settings stored on the Band. */
export interface Spo2Alarm {
  enabled: boolean;
  /** SpO₂ percentage threshold (1–99) below which the alarm fires. */
  low_threshold: number;
}
