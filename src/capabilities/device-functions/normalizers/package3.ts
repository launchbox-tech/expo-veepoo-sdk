import type { DeviceFunctions } from "@/types/index";
import { PACKAGE3_FIELDS } from "../declared-keys";
import { readDeclaredFields } from "./nested";
import { isRecord, toInt, normalizeFunctionStatus } from "@/shared/primitives";

export function normalizePackage3(record: Record<string, unknown>): DeviceFunctions["package3"] {
  if (isRecord(record.package3)) {
    return readDeclaredFields<DeviceFunctions["package3"]>(record.package3, PACKAGE3_FIELDS);
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
    blood_glucose_tag: toInt(record.bloodGlucoseTag),
    blood_glucose: normalizeFunctionStatus(record.bloodGlucose),
    blood_glucose_adjusting: normalizeFunctionStatus(record.bloodGlucoseAdjusting),
    blood_component: normalizeFunctionStatus(record.bloodComponent),
    body_component: normalizeFunctionStatus(record.bodyComponent),
  };
}
