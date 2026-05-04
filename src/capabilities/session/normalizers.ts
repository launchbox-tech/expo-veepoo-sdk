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
    deviceNumber: toStringValue(record.deviceNumber),
    deviceVersion: toStringValue(record.deviceVersion),
    deviceTestVersion: toStringValue(record.deviceTestVersion),
    isHaveDrinkData:
      record.isHaveDrinkData === undefined ? undefined : toBoolean(record.isHaveDrinkData),
    isOpenNightTurnWrist:
      record.isOpenNightTurnWrist === undefined && record.isOpenNightTurnWriste === undefined
        ? undefined
        : normalizeFunctionStatus(record.isOpenNightTurnWrist ?? record.isOpenNightTurnWriste),
    findPhoneFunction:
      record.findPhoneFunction === undefined
        ? undefined
        : normalizeFunctionStatus(record.findPhoneFunction),
    wearDetectFunction:
      record.wearDetectFunction === undefined
        ? undefined
        : normalizeFunctionStatus(record.wearDetectFunction),
  };
}
