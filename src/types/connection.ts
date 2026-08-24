import type { FunctionStatus } from '@/capabilities/device-functions/types';

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
  is_oad_model?: boolean;
  device_version?: string;
  device_number?: string;
}

export interface ScanOptions {
  timeout?: number;
  allow_duplicates?: boolean;
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
  use_24h?: boolean;
  time_setting?: DeviceTimeSetting;
  uuid?: string;
  /**
   * iOS only. Let CoreBluetooth hold the connect open with no timeout, so it
   * lands whenever the peripheral comes back into range — the radio scheduler
   * waits instead of your code polling, and it survives app suspension.
   *
   * Use it for a BACKGROUND reconnect, where nobody is watching and the only
   * alternative is a retry loop. Do NOT use it for a connect a user is waiting
   * on: the promise may never settle, so a pairing screen would sit on
   * "Connecting…" forever with no way to fail. Defaults to false.
   *
   * Ignored unless the peripheral is native to the vendor's central (a cached
   * scan result or a retrieve on that central) — a pending connect on a
   * foreign peripheral never fires.
   */
  hold_pending?: boolean;
}

export type BluetoothState =
  | 'unknown'
  | 'resetting'
  | 'unsupported'
  | 'unauthorized'
  | 'powered_off'
  | 'powered_on';

export type BluetoothAuthorization =
  | 'not_determined'
  | 'restricted'
  | 'denied'
  | 'allowed_always';

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
  can_ask_again?: boolean;
}

export interface BluetoothStatus {
  state: BluetoothState;
  state_name: string;
  authorization: BluetoothAuthorization;
  authorization_name: string;
  is_scanning: boolean;
  pending_scan_start: boolean;
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
  device_number?: string;
  device_version?: string;
  device_test_version?: string;
  is_have_drink_data?: boolean;
  is_open_night_turn_wrist?: FunctionStatus;
  find_phone_function?: FunctionStatus;
  wear_detect_function?: FunctionStatus;
}
