import type { ConnectOptions, ConnectionStatus } from "../../types/index.js";

export interface SessionNativeMethods {
  init(): Promise<void>;
  connect(deviceId: string, options?: ConnectOptions): Promise<void>;
  disconnect(deviceId: string): Promise<void>;
  getConnectionStatus(deviceId: string): Promise<ConnectionStatus>;
  verifyPassword(password: string, is24Hour: boolean): Promise<unknown>;
}
