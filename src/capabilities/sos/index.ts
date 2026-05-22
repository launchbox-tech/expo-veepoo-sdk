import type { CapabilityContext } from "@/capabilities/shared/context";
import type { SosNativeMethods } from "./native";
import { normalizeSosCallTimesSettings } from "./normalizers";
import { validateSosCallTimes } from "./validators";
import type { SosCallTimesSettings } from "@/types/index";

export class SosCapability {
  constructor(private readonly ctx: CapabilityContext<SosNativeMethods>) {}

  readSosCallTimes(): Promise<SosCallTimesSettings> {
    return this.ctx.invoke({
      invoke: () => this.ctx.native.readSosCallTimes(),
      normalize: normalizeSosCallTimesSettings,
      afterSuccess: (data) =>
        this.ctx.emit("sos_call_times_data", { device_id: this.ctx.connectedDeviceId(), data }),
    });
  }

  setSosCallTimes(times: number): Promise<void> {
    return this.ctx.invoke({
      validate: () => validateSosCallTimes(times),
      invoke: () => this.ctx.native.setSosCallTimes(times),
    });
  }
}
