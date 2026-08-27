import type { DeviceFunctions } from "@/types/index";
import { PACKAGE1_FIELDS } from "../declared-keys";
import { readDeclaredFields } from "./nested";
import { isRecord, normalizeFunctionStatus } from "@/shared/primitives";

export function normalizePackage1(record: Record<string, unknown>): DeviceFunctions["package1"] {
  if (isRecord(record.package1)) {
    return readDeclaredFields<DeviceFunctions["package1"]>(record.package1, PACKAGE1_FIELDS);
  }

  return {
    blood_pressure: normalizeFunctionStatus(record.Bp ?? record.bp),
    drinking: normalizeFunctionStatus(record.Drink ?? record.drink),
    sedentary_remind: normalizeFunctionStatus(record.Longseat ?? record.longseat),
    heart_rate_warning: normalizeFunctionStatus(record.HeartWaring ?? record.heartWaring),
    we_chat_sport: normalizeFunctionStatus(record.WeChatSport ?? record.weChatSport),
    camera: normalizeFunctionStatus(record.Camera ?? record.camera),
    fatigue: normalizeFunctionStatus(record.Fatigue ?? record.fatigue),
    spo_h: normalizeFunctionStatus(record.SpoH ?? record.spoH),
    spo2_h_adjustment: normalizeFunctionStatus(record.SpoHAdjuster ?? record.spoHAdjuster),
    spo_h_breath_break: normalizeFunctionStatus(record.SpoHBreathBreak ?? record.spoHBreathBreak),
    woman: normalizeFunctionStatus(record.Woman ?? record.woman),
    alarm: normalizeFunctionStatus(record.Alarm2 ?? record.alarm2),
    new_calc_sport: normalizeFunctionStatus(record.newCalcSport),
    ambulatory_bp_adjustment: normalizeFunctionStatus(record.AngioAdjuster ?? record.angioAdjuster),
    screen_light: normalizeFunctionStatus(record.SreenLight ?? record.sreenLight),
    heart_rate_detect: normalizeFunctionStatus(record.HeartDetect ?? record.heartDetect),
    night_turn_setting: normalizeFunctionStatus(record.NightTurnSetting ?? record.nightTurnSetting),
    text_alarm: normalizeFunctionStatus(record.textAlarm),
    temperature_function: normalizeFunctionStatus(record.temperatureFunction),
  };
}
