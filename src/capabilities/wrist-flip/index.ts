import { invokeOrThrow } from "@/bridge/native-invoke-pipeline";
import type { ThrowingInvoke } from "@/bridge/native-invoke-pipeline";
import type { CapabilityContext } from "@/capabilities/shared/context";
import type { WristFlipNativeMethods } from "./native";
import { normalizeWristFlipWakeSettings } from "./normalizers";
import { validateWristFlipWakeSettings } from "./validators";
import type { WristFlipWakeSettings } from "@/types/index";
import { deepCamelKeys } from "@/normalizers/deep-keys";

export class WristFlipCapability {
  constructor(private readonly ctx: CapabilityContext<WristFlipNativeMethods>) {}

  private call<T>(opts: Omit<ThrowingInvoke<T>, "mapError">): Promise<T> {
    return invokeOrThrow({ ...opts, mapError: (e) => this.ctx.mapError(e) });
  }

  readWristFlipWakeSettings(): Promise<WristFlipWakeSettings> {
    return this.call({
      invoke: () => this.ctx.native.readWristFlipWakeSettings(),
      normalize: normalizeWristFlipWakeSettings,
    });
  }

  setWristFlipWakeSettings(settings: WristFlipWakeSettings): Promise<void> {
    return this.call({
      validate: () => validateWristFlipWakeSettings(settings),
      invoke: () => this.ctx.native.setWristFlipWakeSettings(deepCamelKeys(settings) as WristFlipWakeSettings),
    });
  }
}
