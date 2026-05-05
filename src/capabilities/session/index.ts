import { invokeOrThrow, invokeWithRecovery } from "../../bridge/native-invoke-pipeline.js";
import type { CapabilityContext } from "../shared/context.js";
import type { SessionNativeMethods } from "./native.js";
import { normalizePasswordData } from "./normalizers.js";
import { validateDeviceId, validateConnectOptions } from "./validators.js";
import type { ConnectOptions, ConnectionStatus, PasswordData } from "../../types/index.js";

export class SessionCapability {
  constructor(private readonly ctx: CapabilityContext<SessionNativeMethods>) {}

  async connect(deviceId: string, options?: ConnectOptions): Promise<void> {
    validateDeviceId(deviceId);
    if (options) validateConnectOptions(options);
    this.ctx.log("info", "connection", "connect.start", "Connecting device", { deviceId, data: options });
    return invokeOrThrow({
      invoke: () => this.ctx.native.connect(deviceId, options),
      mapError: (e) => this.ctx.mapError(e, { code: "CONNECTION_FAILED", deviceId }),
      afterSuccess: () => {
        this.ctx.setConnectedDeviceId(deviceId);
        this.ctx.log("info", "connection", "connect.success", "Device connect request completed", { deviceId });
      },
    });
  }

  async disconnect(deviceId?: string): Promise<void> {
    const id = deviceId || this.ctx.connectedDeviceId();
    if (!id) return;

    this.ctx.log("info", "connection", "disconnect.start", "Disconnecting device", { deviceId: id });
    return invokeOrThrow({
      invoke: () => this.ctx.native.disconnect(id),
      mapError: (e) => this.ctx.mapError(e, { code: "DISCONNECTION_FAILED", deviceId: id }),
      afterSuccess: () => {
        if (this.ctx.connectedDeviceId() === id) {
          this.ctx.setConnectedDeviceId(null);
        }
        this.ctx.log("info", "connection", "disconnect.success", "Device disconnected", { deviceId: id });
      },
    });
  }

  async getConnectionStatus(deviceId?: string): Promise<ConnectionStatus> {
    const id = deviceId || this.ctx.connectedDeviceId();
    if (!id) return "disconnected";

    return invokeWithRecovery({
      invoke: () => this.ctx.native.getConnectionStatus(id),
      recover: (error: unknown) => {
        this.ctx.mapError(error, { code: "UNKNOWN", deviceId: id });
        return "disconnected";
      },
      afterSuccess: (status: ConnectionStatus) => {
        this.ctx.log("debug", "connection", "connection.status", "Fetched connection status", {
          deviceId: id,
          data: { status },
        });
      },
    });
  }

  async verifyPassword(password: string = "0000", is24Hour: boolean = false): Promise<PasswordData> {
    this.ctx.log("info", "connection", "password.verify.start", "Verifying device password", {
      deviceId: this.ctx.connectedDeviceId() ?? undefined,
      data: { is24Hour },
    });
    return invokeOrThrow({
      invoke: () => this.ctx.native.verifyPassword(password, is24Hour),
      normalize: normalizePasswordData,
      mapError: (e) => this.ctx.mapError(e, { deviceId: this.ctx.connectedDeviceId() ?? undefined }),
      afterSuccess: (result: PasswordData) => {
        this.ctx.log("info", "connection", "password.verify.result", "Device password verified", {
          deviceId: this.ctx.connectedDeviceId() ?? undefined,
          data: {
            status: result.status,
            device_number: result.device_number,
            device_version: result.device_version,
          },
        });
      },
    });
  }
}
