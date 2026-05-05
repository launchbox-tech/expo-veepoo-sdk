import type { DeviceFunctions } from "../../../types/index.js";
import { isRecord, toInt, normalizeFunctionStatus } from "../../../normalizers/primitives.js";

export function normalizePackage2(record: Record<string, unknown>): DeviceFunctions["package2"] {
  if (isRecord(record.package2)) {
    return Object.fromEntries(
      Object.entries(record.package2)
        .filter(([key]) => key !== 'type')
        .map(([key, item]) =>
          typeof item === 'number' ? [key, item] : [key, normalizeFunctionStatus(item)]
        )
    ) as unknown as DeviceFunctions["package2"];
  }

  return {
    count_down: normalizeFunctionStatus(record.CountDown ?? record.countDown),
    sport_model_function: normalizeFunctionStatus(record.SportModel ?? record.sportModel),
    hid_function: normalizeFunctionStatus(record.hidFuction ?? record.hidFunction),
    screen_style_function: normalizeFunctionStatus(record.screenStyleFunction),
    breath_function: normalizeFunctionStatus(record.beathFunction ?? record.breathFunction),
    hrv_function: normalizeFunctionStatus(record.hrvFunction),
    weather_function: normalizeFunctionStatus(record.weatherFunction),
    screen_light_time: normalizeFunctionStatus(record.screenLightTime),
    precision_sleep: normalizeFunctionStatus(record.precisionSleep),
    ecg_function: normalizeFunctionStatus(record.ecg),
    mult_sport_mode: normalizeFunctionStatus(record.multSportModel),
    low_power: normalizeFunctionStatus(record.lowPower),
    sleep_tag: toInt(record.sleepTag),
    watch_data_day_number: toInt(record.WathcDay ?? record.wathcDay),
    contact_msg_length: toInt(record.contactMsgLength),
    all_msg_length: toInt(record.allMsgLength),
    sport_model_day: toInt(record.sportmodelday),
    screenstyle: toInt(record.screenstyle),
    weather_style: toInt(record.weatherStyle),
    origin_protocol_version: toInt(record.originProtcolVersion),
    ecg_type: toInt(record.ecgType),
  };
}
