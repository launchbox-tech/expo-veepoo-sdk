import { invokeOrThrow } from "../../bridge/native-invoke-pipeline.js";
import type { ThrowingInvoke } from "../../bridge/native-invoke-pipeline.js";
import type { CapabilityContext } from "../shared/context.js";
import type { WristFlipNativeMethods } from "./native.js";
import { normalizeWristFlipWakeSettings } from "./normalizers.js";
import { validateWristFlipWakeSettings } from "./validators.js";
import type { WristFlipWakeSettings } from "../../types/index.js";
import { deepCamelKeys } from "../../normalizers/deep-keys.js";

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
