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
    countDown: normalizeFunctionStatus(record.CountDown ?? record.countDown),
    sportModelFunction: normalizeFunctionStatus(record.SportModel ?? record.sportModel),
    hidFunction: normalizeFunctionStatus(record.hidFuction ?? record.hidFunction),
    screenStyleFunction: normalizeFunctionStatus(record.screenStyleFunction),
    breathFunction: normalizeFunctionStatus(record.beathFunction ?? record.breathFunction),
    hrvFunction: normalizeFunctionStatus(record.hrvFunction),
    weatherFunction: normalizeFunctionStatus(record.weatherFunction),
    screenLightTime: normalizeFunctionStatus(record.screenLightTime),
    precisionSleep: normalizeFunctionStatus(record.precisionSleep),
    ecgFunction: normalizeFunctionStatus(record.ecg),
    multSportMode: normalizeFunctionStatus(record.multSportModel),
    lowPower: normalizeFunctionStatus(record.lowPower),
    sleepTag: toInt(record.sleepTag),
    watchDataDayNumber: toInt(record.WathcDay ?? record.wathcDay),
    contactMsgLength: toInt(record.contactMsgLength),
    allMsgLength: toInt(record.allMsgLength),
    sportModelDay: toInt(record.sportmodelday),
    screenstyle: toInt(record.screenstyle),
    weatherStyle: toInt(record.weatherStyle),
    originProtocolVersion: toInt(record.originProtcolVersion),
    ecgType: toInt(record.ecgType),
  };
}
