import type { DeviceFunctions } from "../../../types/index.js";
import { isRecord, toInt, normalizeFunctionStatus } from "../../../normalizers/primitives.js";

export function normalizePackage3(record: Record<string, unknown>): DeviceFunctions["package3"] {
  if (isRecord(record.package3)) {
    return Object.fromEntries(
      Object.entries(record.package3)
        .filter(([key]) => key !== 'type')
        .map(([key, item]) =>
          typeof item === 'number' ? [key, item] : [key, normalizeFunctionStatus(item)]
        )
    ) as unknown as DeviceFunctions["package3"];
  }

  return {
    bigDataTranType: toInt(record.bitDataTranType ?? record.bigDataTranType),
    watchUiServerCount: toInt(record.watchUiServerCount),
    watchUiCustomCount: toInt(record.watchUiCoustomCount ?? record.watchUiCustomCount),
    temperatureFunction: normalizeFunctionStatus(record.temperatureFunction),
    temperatureType: toInt(record.temptureType ?? record.temperatureType),
    cpuType: toInt(record.cpuType),
    stressFunction: normalizeFunctionStatus(record.stress),
    musicStyle: toInt(record.musicStyle),
    findDeviceByPhoneFunction: normalizeFunctionStatus(
      record.findDeviceByPhone ?? record.findDeviceByPhoneFunction
    ),
    agpsFunction: normalizeFunctionStatus(record.agps),
    bloodGlucose: toInt(record.bloodGlucoseType ?? record.bloodGlucose),
    bloodGlucoseAdjusting: normalizeFunctionStatus(record.bloodGlucoseAdjusting),
    bloodComponent: normalizeFunctionStatus(record.bloodComponent),
    bodyComponent: normalizeFunctionStatus(record.bodyComponent),
  };
}
