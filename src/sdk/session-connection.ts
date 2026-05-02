import { invokeNative } from "../bridge/native-invoke-pipeline.js";
import { normalizePasswordData } from "../normalizers/index.js";
import {
  validateDeviceId,
  validateConnectOptions,
} from "../validators/index.js";
import type {
  ConnectOptions,
  ConnectionStatus,
  PasswordData,
} from "../types/index.js";
import type { VeepooSDKRuntime } from "./veepoo-sdk-runtime.js";

/** Session-oriented connection: connect, disconnect, password, status. */
export class SessionConnection {
  constructor(private readonly rt: VeepooSDKRuntime) {}

  async connect(deviceId: string, options?: ConnectOptions): Promise<void> {
    validateDeviceId(deviceId);
    if (options) validateConnectOptions(options);
    this.rt.log("info", "connection", "connect.start", "Connecting device", {
      deviceId,
      data: options,
    });
    await invokeNative({
      invoke: () => this.rt.native.connect(deviceId, options),
      fallbackCode: "CONNECTION_FAILED",
      deviceId,
      throwMapped: (error: unknown) => {
        throw this.rt.handleError(error, "CONNECTION_FAILED", deviceId);
      },
      afterSuccess: () => {
        this.rt.connectedDeviceId = deviceId;
        this.rt.log(
          "info",
          "connection",
          "connect.success",
          "Device connect request completed",
          {
            deviceId,
          },
        );
      },
    });
  }

  async disconnect(deviceId?: string): Promise<void> {
    const id = deviceId || this.rt.connectedDeviceId;
    if (!id) return;

    this.rt.log("info", "connection", "disconnect.start", "Disconnecting device", {
      deviceId: id,
    });
    await invokeNative({
      invoke: () => this.rt.native.disconnect(id),
      fallbackCode: "DISCONNECTION_FAILED",
      deviceId: id,
      throwMapped: (error: unknown) => {
        throw this.rt.handleError(error, "DISCONNECTION_FAILED", id);
      },
      afterSuccess: () => {
        if (this.rt.connectedDeviceId === id) {
          this.rt.connectedDeviceId = null;
        }
        this.rt.log("info", "connection", "disconnect.success", "Device disconnected", {
          deviceId: id,
        });
      },
    });
  }

  async getConnectionStatus(deviceId?: string): Promise<ConnectionStatus> {
    const id = deviceId || this.rt.connectedDeviceId;
    if (!id) return "disconnected";

    return invokeNative({
      invoke: () => this.rt.native.getConnectionStatus(id),
      fallbackCode: "UNKNOWN",
      deviceId: id,
      recover: (error: unknown) => {
        this.rt.handleError(error, "UNKNOWN", id);
        return "disconnected";
      },
      afterSuccess: (status: ConnectionStatus) => {
        this.rt.log("debug", "connection", "connection.status", "Fetched connection status", {
          deviceId: id,
          data: { status },
        });
      },
    });
  }

  async verifyPassword(
    password: string = "0000",
    is24Hour: boolean = false,
  ): Promise<PasswordData> {
    this.rt.log("info", "connection", "password.verify.start", "Verifying device password", {
      deviceId: this.rt.connectedDeviceId ?? undefined,
      data: { is24Hour },
    });
    return invokeNative({
      invoke: () => this.rt.native.verifyPassword(password, is24Hour),
      normalize: normalizePasswordData,
      fallbackCode: "OPERATION_FAILED",
      deviceId: this.rt.connectedDeviceId ?? undefined,
      throwMapped: (error: unknown) => {
        throw this.rt.handleError(error, "OPERATION_FAILED", this.rt.connectedDeviceId ?? undefined);
      },
      afterSuccess: (result: PasswordData) => {
        this.rt.log("info", "connection", "password.verify.result", "Device password verified", {
          deviceId: this.rt.connectedDeviceId ?? undefined,
          data: {
            status: result.status,
            deviceNumber: result.deviceNumber,
            deviceVersion: result.deviceVersion,
          },
        });
      },
    });
  }
}
