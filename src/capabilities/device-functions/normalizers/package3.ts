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
    big_data_tran_type: toInt(record.bitDataTranType ?? record.bigDataTranType),
    watch_ui_server_count: toInt(record.watchUiServerCount),
    watch_ui_custom_count: toInt(record.watchUiCoustomCount ?? record.watchUiCustomCount),
    temperature_function: normalizeFunctionStatus(record.temperatureFunction),
    temperature_type: toInt(record.temptureType ?? record.temperatureType),
    cpu_type: toInt(record.cpuType),
    stress_function: normalizeFunctionStatus(record.stress),
    music_style: toInt(record.musicStyle),
    find_device_by_phone_function: normalizeFunctionStatus(
      record.findDeviceByPhone ?? record.findDeviceByPhoneFunction
    ),
    agps_function: normalizeFunctionStatus(record.agps),
    blood_glucose: toInt(record.bloodGlucoseType ?? record.bloodGlucose),
    blood_glucose_adjusting: normalizeFunctionStatus(record.bloodGlucoseAdjusting),
    blood_component: normalizeFunctionStatus(record.bloodComponent),
    body_component: normalizeFunctionStatus(record.bodyComponent),
  };
}
