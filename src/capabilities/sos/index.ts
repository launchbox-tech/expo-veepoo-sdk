import { invokeOrThrow } from "../../bridge/native-invoke-pipeline.js";
import type { ThrowingInvoke } from "../../bridge/native-invoke-pipeline.js";
import type { CapabilityContext } from "../shared/context.js";
import type { SosNativeMethods } from "./native.js";
import { normalizeSosCallTimesSettings } from "./normalizers.js";
import { validateSosCallTimes } from "./validators.js";
import type { SosCallTimesSettings } from "../../types/index.js";

export class SosCapability {
  constructor(private readonly ctx: CapabilityContext<SosNativeMethods>) {}

  private call<T>(opts: Omit<ThrowingInvoke<T>, "mapError">): Promise<T> {
    return invokeOrThrow({ ...opts, mapError: (e) => this.ctx.mapError(e) });
  }

  readSosCallTimes(): Promise<SosCallTimesSettings> {
    return this.call({
      invoke: () => this.ctx.native.readSosCallTimes(),
      normalize: normalizeSosCallTimesSettings,
      afterSuccess: (data) =>
        this.ctx.emit("sosCallTimesData", { deviceId: this.ctx.connectedDeviceId(), data }),
    });
  }

  setSosCallTimes(times: number): Promise<void> {
    return this.call({
      validate: () => validateSosCallTimes(times),
      invoke: () => this.ctx.native.setSosCallTimes(times),
    });
  }
}
