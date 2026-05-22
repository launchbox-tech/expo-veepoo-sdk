import type { CapabilityContext } from "@/capabilities/shared/context";
import type { WristFlipNativeMethods } from "./native";
import { normalizeWristFlipWakeSettings } from "./normalizers";
import { validateWristFlipWakeSettings } from "./validators";
import type { WristFlipWakeSettings } from "@/types/index";
import { deepCamelKeys } from "@/normalizers/deep-keys";

export class WristFlipCapability {
  constructor(private readonly ctx: CapabilityContext<WristFlipNativeMethods>) {}

  readWristFlipWakeSettings(): Promise<WristFlipWakeSettings> {
    return this.ctx.invoke({
      invoke: () => this.ctx.native.readWristFlipWakeSettings(),
      normalize: normalizeWristFlipWakeSettings,
    });
  }

  setWristFlipWakeSettings(settings: WristFlipWakeSettings): Promise<void> {
    return this.ctx.invoke({
      validate: () => validateWristFlipWakeSettings(settings),
      invoke: () => this.ctx.native.setWristFlipWakeSettings(deepCamelKeys(settings) as WristFlipWakeSettings),
    });
  }
}
