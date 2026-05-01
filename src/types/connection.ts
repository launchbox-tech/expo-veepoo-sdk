import type { FunctionStatus } from './device.js';

export interface VeepooDevice {
  id: string;
  name: string;
  rssi: number;
  mac?: string;
  uuid?: string;
  address?: string;
}

export type ConnectionStatus =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'disconnecting'
  | 'ready'
  | 'error';

export interface ConnectionResult {
  status: ConnectionStatus;
  code?: number;
  mac: string;
  isOadModel?: boolean;
  deviceVersion?: string;
  deviceNumber?: string;
}

export interface ScanOptions {
  timeout?: number;
  allowDuplicates?: boolean;
}

export interface ScanResult {
  device: VeepooDevice;
  timestamp: number;
}

export interface DeviceTimeSetting {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  system?: number;
}

export interface ConnectOptions {
  password?: string;
  is24Hour?: boolean;
  timeSetting?: DeviceTimeSetting;
  uuid?: string;
}

export type BluetoothState =
  | 'unknown'
  | 'resetting'
  | 'unsupported'
  | 'unauthorized'
  | 'poweredOff'
  | 'poweredOn';

export type BluetoothAuthorization =
  | 'notDetermined'
  | 'restricted'
  | 'denied'
  | 'allowedAlways';

export type PermissionStatus =
  | 'granted'
  | 'denied'
  | 'restricted'
  | 'unknown'
  | 'never_ask_again'
  | 'powered_off';

export interface PermissionsResult {
  granted: boolean;
  status: PermissionStatus;
  canAskAgain?: boolean;
}

export interface BluetoothStatus {
  state: BluetoothState;
  stateName: string;
  authorization: BluetoothAuthorization;
  authorizationName: string;
  isScanning: boolean;
  pendingScanStart: boolean;
}

export type PasswordStatus =
  | 'CHECK_SUCCESS'
  | 'CHECK_FAIL'
  | 'NOT_SET'
  | 'SUCCESS'
  | 'FAILED'
  | 'UNKNOWN';

export interface PasswordData {
  status: PasswordStatus;
  password: string;
  deviceNumber?: string;
  deviceVersion?: string;
  deviceTestVersion?: string;
  isHaveDrinkData?: boolean;
  isOpenNightTurnWrist?: FunctionStatus;
  findPhoneFunction?: FunctionStatus;
  wearDetectFunction?: FunctionStatus;
}
