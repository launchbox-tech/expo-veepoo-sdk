/**
 * Single-owner settings types have moved next to their capability:
 * - AutoMeasureSetting                              → src/capabilities/auto-measure/types.ts
 * - Language                                        → src/capabilities/language/types.ts
 * - SportMode, SPORT_MODE_ORDINALS, SportModeStatus → src/capabilities/sport-mode/types.ts
 * - BloodGlucoseRiskConfig                          → src/capabilities/calibration/types.ts
 * - WorldClockEntry                                 → src/capabilities/world-clock/types.ts
 *
 * What stays here is the cross-cutting / orphan settings vocabulary:
 *   unit conventions, the universal `OperationStatus` result, and
 *   settings shapes that have no single capability owner.
 */

export type TemperatureUnit = 'celsius' | 'fahrenheit';
export type DistanceUnit = 'metric' | 'imperial';
export type TimeFormat = '12hour' | '24hour';
export type BloodGlucoseUnit = 'mmol_l' | 'mg_dl';

/** 1 = lightest (closest to white), 6 = darkest. Gate: Android skinType==2, iOS peripheralModel.skinType==2. */
export type SkinTone = 1 | 2 | 3 | 4 | 5 | 6;

/** SpO2 apnea alert settings. iOS only — Android rejects with CAPABILITY_UNSUPPORTED. Event-only payload. */
export interface ApneaRemindSettings {
  enabled: boolean;
  /** SpO2 threshold (%) below which the apnea alert fires. */
  threshold: number;
}

export type CustomSettings = {
  temperature_unit: TemperatureUnit;
  blood_glucose_unit: BloodGlucoseUnit;
  skin_tone: SkinTone;
};

/** Universal write-operation result returned by most setX/pushX native calls. */
export type OperationStatus = 'success' | 'fail' | 'unknown';
