import { invokeOrThrow } from "@/bridge/native-invoke-pipeline";
import type { ThrowingInvoke } from "@/bridge/native-invoke-pipeline";
import type { CapabilityContext } from "@/capabilities/shared/context";
import type { AutoMeasureNativeMethods } from "./native";
import { normalizeAutoMeasureSettings } from "./normalizers";
import { validateAutoMeasureSetting } from "./validators";
import type { AutoMeasureSetting } from "@/types/index";
import { deepCamelKeys } from "@/normalizers/deep-keys";

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
      invoke: () => this.ctx.native.modifyAutoMeasureSetting(deepCamelKeys(setting) as Partial<AutoMeasureSetting>),
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
