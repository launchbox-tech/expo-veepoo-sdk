import { invokeOrThrow } from "../../bridge/native-invoke-pipeline.js";
import type { ThrowingInvoke } from "../../bridge/native-invoke-pipeline.js";
import type { CapabilityContext } from "../shared/context.js";
import type { WomenHealthNativeMethods } from "./native.js";
import { normalizeWomenHealthSettings } from "./normalizers.js";
import { validateWomenHealthSettings } from "./validators.js";
import type { WomenHealthSettings } from "../../types/index.js";
import { deepCamelKeys } from "../../normalizers/deep-keys.js";

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
