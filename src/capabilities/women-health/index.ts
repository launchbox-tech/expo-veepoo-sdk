import { invokeOrThrow } from "@/bridge/native-invoke-pipeline";
import type { ThrowingInvoke } from "@/bridge/native-invoke-pipeline";
import type { CapabilityContext } from "@/capabilities/shared/context";
import type { WomenHealthNativeMethods } from "./native";
import { normalizeWomenHealthSettings } from "./normalizers";
import { validateWomenHealthSettings } from "./validators";
import type { WomenHealthSettings } from "@/types/index";
import { deepCamelKeys } from "@/normalizers/deep-keys";

export class WomenHealthCapability {
  constructor(private readonly ctx: CapabilityContext<WomenHealthNativeMethods>) {}

  private call<T>(opts: Omit<ThrowingInvoke<T>, "mapError">): Promise<T> {
    return invokeOrThrow({ ...opts, mapError: (e) => this.ctx.mapError(e) });
  }

  readWomenHealthSettings(): Promise<WomenHealthSettings> {
    return this.call({
      invoke: () => this.ctx.native.readWomenHealthSettings(),
      normalize: normalizeWomenHealthSettings,
    });
  }

  setWomenHealthSettings(settings: WomenHealthSettings): Promise<void> {
    return this.call({
      validate: () => validateWomenHealthSettings(settings),
      invoke: () => this.ctx.native.setWomenHealthSettings(deepCamelKeys(settings) as WomenHealthSettings),
    });
  }
}
