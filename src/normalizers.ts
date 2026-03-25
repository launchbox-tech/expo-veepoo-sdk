import type {
  BluetoothAuthorization,
  BluetoothState,
  BluetoothStatus,
  PermissionStatus,
  PermissionsResult,
} from './types.js';

const bluetoothStatesByCode: BluetoothState[] = [
  'unknown',
  'resetting',
  'unsupported',
  'unauthorized',
  'poweredOff',
  'poweredOn',
];

const bluetoothAuthorizationsByCode: BluetoothAuthorization[] = [
  'notDetermined',
  'restricted',
  'denied',
  'allowedAlways',
];

const validPermissionStatuses = new Set<PermissionStatus>([
  'granted',
  'denied',
  'restricted',
  'unknown',
  'never_ask_again',
  'powered_off',
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function normalizePermissionsResult(value: unknown): PermissionsResult {
  if (typeof value === 'boolean') {
    return {
      granted: value,
      status: value ? 'granted' : 'denied',
      canAskAgain: !value,
    };
  }

  if (typeof value === 'string') {
    const normalized = value.toLowerCase();
    switch (normalized) {
      case 'granted':
        return { granted: true, status: 'granted', canAskAgain: false };
      case 'restricted':
        return { granted: false, status: 'restricted', canAskAgain: false };
      case 'never_ask_again':
        return { granted: false, status: 'never_ask_again', canAskAgain: false };
      case 'poweredoff':
      case 'powered_off':
        return { granted: false, status: 'powered_off', canAskAgain: false };
      case 'unknown':
        return { granted: false, status: 'unknown', canAskAgain: true };
      case 'denied':
      default:
        return { granted: false, status: 'denied', canAskAgain: true };
    }
  }

  if (isRecord(value)) {
    const rawGranted = value.granted;
    const rawStatus = value.status;
    const rawCanAskAgain = value.canAskAgain;

    const status =
      typeof rawStatus === 'string' && validPermissionStatuses.has(rawStatus as PermissionStatus)
        ? (rawStatus as PermissionStatus)
        : typeof rawGranted === 'boolean' && rawGranted
          ? 'granted'
          : 'denied';

    return {
      granted: typeof rawGranted === 'boolean' ? rawGranted : status === 'granted',
      status,
      canAskAgain: typeof rawCanAskAgain === 'boolean' ? rawCanAskAgain : status !== 'granted' && status !== 'restricted' && status !== 'never_ask_again' && status !== 'powered_off',
    };
  }

  return { granted: false, status: 'unknown', canAskAgain: true };
}

export function normalizeBluetoothStatus(value: unknown): unknown {
  if (!isRecord(value)) {
    return value;
  }

  const rawState = value.state;
  const rawAuthorization = value.authorization;

  const state =
    typeof rawState === 'number'
      ? bluetoothStatesByCode[rawState] ?? 'unknown'
      : typeof rawState === 'string'
        ? rawState
        : 'unknown';

  const authorization =
    typeof rawAuthorization === 'number'
      ? bluetoothAuthorizationsByCode[rawAuthorization] ?? 'notDetermined'
      : typeof rawAuthorization === 'string'
        ? rawAuthorization
        : 'notDetermined';

  const payload: BluetoothStatus = {
    state: state as BluetoothState,
    stateName: typeof value.stateName === 'string' ? value.stateName : state,
    authorization: authorization as BluetoothAuthorization,
    authorizationName:
      typeof value.authorizationName === 'string' ? value.authorizationName : authorization,
    isScanning: typeof value.isScanning === 'boolean' ? value.isScanning : false,
    pendingScanStart: typeof value.pendingScanStart === 'boolean' ? value.pendingScanStart : false,
  };

  return payload;
}
