import type { CapabilityContext } from "@/capabilities/shared/context";
import type { WomenHealthNativeMethods } from "./native";
import { normalizeWomenHealthSettings } from "./normalizers";
import { validateWomenHealthSettings } from "./validators";
import type { WomenHealthSettings } from "@/types/index";
import { deepCamelKeys } from "@/shared/deep-keys";

export class WomenHealthCapability {
  constructor(private readonly ctx: CapabilityContext<WomenHealthNativeMethods>) {}

  readWomenHealthSettings(): Promise<WomenHealthSettings> {
    return this.ctx.invoke({
      invoke: () => this.ctx.native.readWomenHealthSettings(),
      normalize: normalizeWomenHealthSettings,
    });
  }

  setWomenHealthSettings(settings: WomenHealthSettings): Promise<void> {
    return this.ctx.invoke({
      validate: () => validateWomenHealthSettings(settings),
      invoke: () => this.ctx.native.setWomenHealthSettings(deepCamelKeys(settings) as WomenHealthSettings),
    });
  }
}
