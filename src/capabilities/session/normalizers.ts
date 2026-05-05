import type { PasswordData } from "../../types/index.js";
import { isRecord, toBoolean, toStringValue, normalizeFunctionStatus } from "../../normalizers/primitives.js";

export { normalizePermissionsResult, normalizeBluetoothStatus } from "../band-discovery/normalizers.js";

export function normalizePasswordData(value: unknown): PasswordData {
  const record = isRecord(value) ? value : {};
  const rawStatus =
    record.status ??
    record.rawStatus ??
    record.mStatus ??
    record.result ??
    'UNKNOWN';

  let status: PasswordData['status'] = 'UNKNOWN';
  if (typeof rawStatus === 'string') {
    const normalized = rawStatus.toUpperCase();
    if (normalized.includes('CHECK_SUCCESS')) status = 'CHECK_SUCCESS';
    else if (normalized.includes('CHECK_FAIL')) status = 'CHECK_FAIL';
    else if (normalized.includes('NOT_SET')) status = 'NOT_SET';
    else if (normalized.includes('SUCCESS')) status = 'SUCCESS';
    else if (normalized.includes('FAIL')) status = 'FAILED';
  }

  return {
    status,
    password: toStringValue(record.password ?? record.pwd),
    device_number: toStringValue(record.deviceNumber ?? record.device_number),
    device_version: toStringValue(record.deviceVersion ?? record.device_version),
    device_test_version: toStringValue(record.deviceTestVersion ?? record.device_test_version),
    is_have_drink_data:
      (record.isHaveDrinkData ?? record.is_have_drink_data) === undefined ? undefined : toBoolean(record.isHaveDrinkData ?? record.is_have_drink_data),
    is_open_night_turn_wrist:
      (record.isOpenNightTurnWrist ?? record.isOpenNightTurnWriste ?? record.is_open_night_turn_wrist) === undefined
        ? undefined
        : normalizeFunctionStatus(record.isOpenNightTurnWrist ?? record.isOpenNightTurnWriste ?? record.is_open_night_turn_wrist),
    find_phone_function:
      (record.findPhoneFunction ?? record.find_phone_function) === undefined
        ? undefined
        : normalizeFunctionStatus(record.findPhoneFunction ?? record.find_phone_function),
    wear_detect_function:
      (record.wearDetectFunction ?? record.wear_detect_function) === undefined
        ? undefined
        : normalizeFunctionStatus(record.wearDetectFunction ?? record.wear_detect_function),
  };
}
