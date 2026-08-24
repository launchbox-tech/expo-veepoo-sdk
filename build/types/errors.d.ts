export type VeepooErrorCode = 'UNKNOWN' | 'INVALID_ARGUMENT'
/**
 * iOS only: the id given to `connect()` is not a `CBPeripheral` UUID, so it
 * can never resolve — distinct from `DEVICE_NOT_FOUND`, which means the band
 * is merely absent right now. This one fails forever until the pairing is
 * rewritten, so callers should surface it as "re-pair", not "out of range".
 */
 | 'INVALID_CONNECT_ID' | 'PERMISSION_DENIED' | 'CONNECTION_FAILED' | 'DISCONNECTION_FAILED' | 'BLUETOOTH_NOT_ENABLED' | 'DEVICE_NOT_FOUND' | 'OPERATION_FAILED' | 'SDK_NOT_INITIALIZED' | 'DEVICE_NOT_CONNECTED' | 'DEVICE_NOT_READY' | 'REALTIME_TEST_IN_PROGRESS' | 'CAPABILITY_UNSUPPORTED' | 'DEVICE_BUSY' | 'PASSWORD_REQUIRED' | 'TIMEOUT' | 'NOT_WEARING';
export interface VeepooError {
    code: VeepooErrorCode;
    message: string;
    /** Raw native rejection code when the bridge collapsed/aliased into `code` (ADR 0003). */
    native_code?: string;
    device_id?: string;
}
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export type LogScope = 'sdk' | 'scan' | 'connection' | 'bluetooth' | 'permissions' | 'device' | 'read' | 'test' | 'listener';
export interface LogEntry {
    timestamp: number;
    level: LogLevel;
    scope: LogScope;
    action: string;
    platform: 'ios' | 'android' | 'web' | 'unknown';
    message: string;
    device_id?: string;
    data?: unknown;
    error?: string;
}
export type LogListener = (entry: LogEntry) => void;
//# sourceMappingURL=errors.d.ts.map