export type VeepooErrorCode =
  | 'UNKNOWN'
  | 'PERMISSION_DENIED'
  | 'CONNECTION_FAILED'
  | 'DISCONNECTION_FAILED'
  | 'BLUETOOTH_NOT_ENABLED'
  | 'DEVICE_NOT_FOUND'
  | 'OPERATION_FAILED'
  | 'SDK_NOT_INITIALIZED'
  | 'DEVICE_NOT_CONNECTED'
  | 'DEVICE_BUSY'
  | 'PASSWORD_REQUIRED'
  | 'TIMEOUT'
  | 'NOT_WEARING';

export interface VeepooError {
  code: VeepooErrorCode;
  message: string;
  deviceId?: string;
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export type LogScope =
  | 'sdk'
  | 'scan'
  | 'connection'
  | 'bluetooth'
  | 'permissions'
  | 'device'
  | 'read'
  | 'test'
  | 'listener';

export interface LogEntry {
  timestamp: number;
  level: LogLevel;
  scope: LogScope;
  action: string;
  platform: 'ios' | 'android' | 'web' | 'unknown';
  message: string;
  deviceId?: string;
  data?: unknown;
  error?: string;
}
