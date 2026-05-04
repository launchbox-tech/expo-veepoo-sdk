import { invokeOrThrow } from "../../bridge/native-invoke-pipeline.js";
import type { ThrowingInvoke } from "../../bridge/native-invoke-pipeline.js";
import type { CapabilityContext } from "../shared/context.js";
import type { AutoMeasureNativeMethods } from "./native.js";
import { normalizeAutoMeasureSettings } from "./normalizers.js";
import { validateAutoMeasureSetting } from "./validators.js";
import type { AutoMeasureSetting } from "../../types/index.js";

export class AutoMeasureCapability {
  constructor(private readonly ctx: CapabilityContext<AutoMeasureNativeMethods>) {}

  private call<T>(opts: Omit<ThrowingInvoke<T>, "mapError">): Promise<T> {
    return invokeOrThrow({ ...opts, mapError: (e) => this.ctx.mapError(e) });
  }

  readAutoMeasureSetting(): Promise<AutoMeasureSetting[]> {
    return this.call({
      invoke: () => this.ctx.native.readAutoMeasureSetting(),
      normalize: normalizeAutoMeasureSettings,
      afterSuccess: (result) => {
        this.ctx.log("debug", "device", "autoMeasure.read", "Auto measure settings received", {
          deviceId: this.ctx.connectedDeviceId() ?? undefined,
          data: { count: result.length },
        });
      },
    });
  }

  modifyAutoMeasureSetting(setting: Partial<AutoMeasureSetting>): Promise<AutoMeasureSetting[]> {
    return this.call({
      validate: () => {
        validateAutoMeasureSetting(setting);
        this.ctx.log("info", "device", "autoMeasure.modify.start", "Modifying auto measure settings", {
          deviceId: this.ctx.connectedDeviceId() ?? undefined,
          data: setting,
        });
      },
      invoke: () => this.ctx.native.modifyAutoMeasureSetting(setting),
      normalize: normalizeAutoMeasureSettings,
      afterSuccess: (result) => {
        this.ctx.log("info", "device", "autoMeasure.modify.result", "Auto measure settings updated", {
          deviceId: this.ctx.connectedDeviceId() ?? undefined,
          data: { count: result.length },
        });
      },
    });
  }
}
