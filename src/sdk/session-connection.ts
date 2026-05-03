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
import type { SessionInterface, SubsystemRuntime } from "./subsystem-interfaces.js";

/** Session-oriented connection: connect, disconnect, password, status. */
export class SessionConnection implements SessionInterface {
  constructor(private readonly rt: SubsystemRuntime) {}

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
        this.rt.state.setConnectedDeviceId(deviceId);
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
    const id = deviceId || this.rt.state.connectedDeviceId;
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
        if (this.rt.state.connectedDeviceId === id) {
          this.rt.state.setConnectedDeviceId(null);
        }
        this.rt.log("info", "connection", "disconnect.success", "Device disconnected", {
          deviceId: id,
        });
      },
    });
  }

  async getConnectionStatus(deviceId?: string): Promise<ConnectionStatus> {
    const id = deviceId || this.rt.state.connectedDeviceId;
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
      deviceId: this.rt.state.connectedDeviceId ?? undefined,
      data: { is24Hour },
    });
    return invokeNative({
      invoke: () => this.rt.native.verifyPassword(password, is24Hour),
      normalize: normalizePasswordData,
      fallbackCode: "OPERATION_FAILED",
      deviceId: this.rt.state.connectedDeviceId ?? undefined,
      throwMapped: (error: unknown) => {
        throw this.rt.handleError(error, "OPERATION_FAILED", this.rt.state.connectedDeviceId ?? undefined);
      },
      afterSuccess: (result: PasswordData) => {
        this.rt.log("info", "connection", "password.verify.result", "Device password verified", {
          deviceId: this.rt.state.connectedDeviceId ?? undefined,
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
