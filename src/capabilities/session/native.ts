import type { ConnectOptions, ConnectionStatus, OperationStatus } from "@/types/index";

export interface SessionNativeMethods {
  init(): Promise<void>;
  connect(deviceId: string, options?: ConnectOptions): Promise<void>;
  disconnect(deviceId: string): Promise<void>;
  getConnectionStatus(deviceId: string): Promise<ConnectionStatus>;
  verifyPassword(password: string, is24Hour: boolean): Promise<unknown>;
  renameDevice(name: string): Promise<OperationStatus>;
  isConnectionConfirmEnabled(): Promise<boolean>;
  setConnectionConfirmEnabled(enabled: boolean): Promise<OperationStatus>;
  setConnectionConfirmTimeout(seconds: number): Promise<OperationStatus>;
}
