import type { DeviceFunctions } from "../../../types/index.js";
import { isRecord, normalizeFunctionStatus } from "../../../normalizers/primitives.js";

export function normalizePackage1(record: Record<string, unknown>): DeviceFunctions["package1"] {
  if (isRecord(record.package1)) {
    return Object.fromEntries(
      Object.entries(record.package1)
        .filter(([key]) => key !== 'type')
        .map(([key, item]) => [key, normalizeFunctionStatus(item)])
    ) as unknown as DeviceFunctions["package1"];
  }

  return {
    bloodPressure: normalizeFunctionStatus(record.Bp ?? record.bp),
    drinking: normalizeFunctionStatus(record.Drink ?? record.drink),
    sedentaryRemind: normalizeFunctionStatus(record.Longseat ?? record.longseat),
    heartRateWarning: normalizeFunctionStatus(record.HeartWaring ?? record.heartWaring),
    weChatSport: normalizeFunctionStatus(record.WeChatSport ?? record.weChatSport),
    camera: normalizeFunctionStatus(record.Camera ?? record.camera),
    fatigue: normalizeFunctionStatus(record.Fatigue ?? record.fatigue),
    spoH: normalizeFunctionStatus(record.SpoH ?? record.spoH),
    spo2HAdjustment: normalizeFunctionStatus(record.SpoHAdjuster ?? record.spoHAdjuster),
    spoHBreathBreak: normalizeFunctionStatus(record.SpoHBreathBreak ?? record.spoHBreathBreak),
    woman: normalizeFunctionStatus(record.Woman ?? record.woman),
    alarm: normalizeFunctionStatus(record.Alarm2 ?? record.alarm2),
    newCalcSport: normalizeFunctionStatus(record.newCalcSport),
    ambulatoryBPAdjustment: normalizeFunctionStatus(record.AngioAdjuster ?? record.angioAdjuster),
    screenLight: normalizeFunctionStatus(record.SreenLight ?? record.sreenLight),
    heartRateDetect: normalizeFunctionStatus(record.HeartDetect ?? record.heartDetect),
    nightTurnSetting: normalizeFunctionStatus(record.NightTurnSetting ?? record.nightTurnSetting),
    textAlarm: normalizeFunctionStatus(record.textAlarm),
    temperatureFunction: normalizeFunctionStatus(record.temperatureFunction),
  };
}
