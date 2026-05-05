import { invokeOrThrow } from "@/bridge/native-invoke-pipeline";
import type { ThrowingInvoke } from "@/bridge/native-invoke-pipeline";
import type { CapabilityContext } from "@/capabilities/shared/context";
import type { SosNativeMethods } from "./native";
import { normalizeSosCallTimesSettings } from "./normalizers";
import { validateSosCallTimes } from "./validators";
import type { SosCallTimesSettings } from "@/types/index";

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
        this.ctx.emit("sos_call_times_data", { device_id: this.ctx.connectedDeviceId(), data }),
    });
  }

  setSosCallTimes(times: number): Promise<void> {
    return this.call({
      validate: () => validateSosCallTimes(times),
      invoke: () => this.ctx.native.setSosCallTimes(times),
    });
  }
}
