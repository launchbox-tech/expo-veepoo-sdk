"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizePermissionsResult = normalizePermissionsResult;
exports.normalizeBluetoothStatus = normalizeBluetoothStatus;
const primitives_1 = require("../../shared/primitives");
const bluetoothStatesByCode = [
    'unknown',
    'resetting',
    'unsupported',
    'unauthorized',
    'powered_off',
    'powered_on',
];
const bluetoothAuthorizationsByCode = [
    'not_determined',
    'restricted',
    'denied',
    'allowed_always',
];
const bluetoothStateValueMap = {
    poweredOff: 'powered_off',
    poweredOn: 'powered_on',
};
const bluetoothAuthValueMap = {
    notDetermined: 'not_determined',
    allowedAlways: 'allowed_always',
};
const validPermissionStatuses = new Set([
    'granted',
    'denied',
    'restricted',
    'unknown',
    'never_ask_again',
    'powered_off',
]);
function normalizePermissionsResult(value) {
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
    if ((0, primitives_1.isRecord)(value)) {
        const rawGranted = value.granted;
        const rawStatus = value.status;
        const rawCanAskAgain = value.canAskAgain ?? value.can_ask_again;
        const status = typeof rawStatus === 'string' && validPermissionStatuses.has(rawStatus)
            ? rawStatus
            : typeof rawGranted === 'boolean' && rawGranted
                ? 'granted'
                : 'denied';
        return {
            granted: typeof rawGranted === 'boolean' ? rawGranted : status === 'granted',
            status,
            can_ask_again: typeof rawCanAskAgain === 'boolean'
                ? rawCanAskAgain
                : status !== 'granted' &&
                    status !== 'restricted' &&
                    status !== 'never_ask_again' &&
                    status !== 'powered_off',
        };
    }
    return { granted: false, status: 'unknown', can_ask_again: true };
}
function normalizeBluetoothStatus(value) {
    if (!(0, primitives_1.isRecord)(value))
        return value;
    const rawState = value.state;
    const rawAuthorization = value.authorization;
    const stateRaw = typeof rawState === 'number'
        ? bluetoothStatesByCode[rawState] ?? 'unknown'
        : typeof rawState === 'string'
            ? (bluetoothStateValueMap[rawState] ?? rawState)
            : 'unknown';
    const authRaw = typeof rawAuthorization === 'number'
        ? bluetoothAuthorizationsByCode[rawAuthorization] ?? 'not_determined'
        : typeof rawAuthorization === 'string'
            ? (bluetoothAuthValueMap[rawAuthorization] ?? rawAuthorization)
            : 'not_determined';
    return {
        state: stateRaw,
        state_name: typeof value.stateName === 'string' ? value.stateName : stateRaw,
        authorization: authRaw,
        authorization_name: typeof value.authorizationName === 'string' ? value.authorizationName : authRaw,
        is_scanning: (0, primitives_1.toBoolean)(value.isScanning, false),
        pending_scan_start: (0, primitives_1.toBoolean)(value.pendingScanStart, false),
    };
}
//# sourceMappingURL=normalizers.js.map