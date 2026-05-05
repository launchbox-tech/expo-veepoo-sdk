import type {
  BluetoothAuthorization,
  BluetoothState,
  BluetoothStatus,
  PermissionStatus,
  PermissionsResult,
} from "../../types/index.js";
import { isRecord, toBoolean } from "../../normalizers/primitives.js";

const bluetoothStatesByCode: BluetoothState[] = [
  'unknown',
  'resetting',
  'unsupported',
  'unauthorized',
  'powered_off',
  'powered_on',
];

const bluetoothAuthorizationsByCode: BluetoothAuthorization[] = [
  'not_determined',
  'restricted',
  'denied',
  'allowed_always',
];

const bluetoothStateValueMap: Record<string, BluetoothState> = {
  poweredOff: 'powered_off',
  poweredOn: 'powered_on',
};

const bluetoothAuthValueMap: Record<string, BluetoothAuthorization> = {
  notDetermined: 'not_determined',
  allowedAlways: 'allowed_always',
};

const validPermissionStatuses = new Set<PermissionStatus>([
  'granted',
  'denied',
  'restricted',
  'unknown',
  'never_ask_again',
  'powered_off',
]);

export function normalizePermissionsResult(value: unknown): PermissionsResult {
  if (typeof value === 'boolean') {
    return {
      granted: value,
      status: value ? 'granted' : 'denied',
      can_ask_again: !value,
    };
  }

  if (typeof value === 'string') {
    const normalized = value.toLowerCase();
    switch (normalized) {
      case 'granted':
        return { granted: true, status: 'granted', can_ask_again: false };
      case 'restricted':
        return { granted: false, status: 'restricted', can_ask_again: false };
      case 'never_ask_again':
        return { granted: false, status: 'never_ask_again', can_ask_again: false };
      case 'poweredoff':
      case 'powered_off':
        return { granted: false, status: 'powered_off', can_ask_again: false };
      case 'unknown':
        return { granted: false, status: 'unknown', can_ask_again: true };
      case 'denied':
      default:
        return { granted: false, status: 'denied', can_ask_again: true };
    }
  }

  if (isRecord(value)) {
    const rawGranted = value.granted;
    const rawStatus = value.status;
    const rawCanAskAgain = value.canAskAgain ?? value.can_ask_again;

    const status =
      typeof rawStatus === 'string' && validPermissionStatuses.has(rawStatus as PermissionStatus)
        ? (rawStatus as PermissionStatus)
        : typeof rawGranted === 'boolean' && rawGranted
          ? 'granted'
          : 'denied';

    return {
      granted: typeof rawGranted === 'boolean' ? rawGranted : status === 'granted',
      status,
      can_ask_again:
        typeof rawCanAskAgain === 'boolean'
          ? rawCanAskAgain
          : status !== 'granted' &&
            status !== 'restricted' &&
            status !== 'never_ask_again' &&
            status !== 'powered_off',
    };
  }

  return { granted: false, status: 'unknown', can_ask_again: true };
}

export function normalizeBluetoothStatus(value: unknown): BluetoothStatus | unknown {
  if (!isRecord(value)) return value;

  const rawState = value.state;
  const rawAuthorization = value.authorization;

  const stateRaw =
    typeof rawState === 'number'
      ? bluetoothStatesByCode[rawState] ?? 'unknown'
      : typeof rawState === 'string'
        ? (bluetoothStateValueMap[rawState] ?? rawState)
        : 'unknown';

  const authRaw =
    typeof rawAuthorization === 'number'
      ? bluetoothAuthorizationsByCode[rawAuthorization] ?? 'not_determined'
      : typeof rawAuthorization === 'string'
        ? (bluetoothAuthValueMap[rawAuthorization] ?? rawAuthorization)
        : 'not_determined';

  return {
    state: stateRaw as BluetoothState,
    state_name: typeof value.stateName === 'string' ? value.stateName : stateRaw,
    authorization: authRaw as BluetoothAuthorization,
    authorization_name:
      typeof value.authorizationName === 'string' ? value.authorizationName : authRaw,
    is_scanning: toBoolean(value.isScanning, false),
    pending_scan_start: toBoolean(value.pendingScanStart, false),
  };
}
