import type { CapabilityContext } from "@/capabilities/shared/context";
import type { DeviceTimeSetting, VeepooError } from "@/types/index";

// ── Native methods ──────────────────────────────────────────────────────────

export interface DeviceTimeNativeMethods {
  setDeviceTime(time?: Omit<DeviceTimeSetting, "system">): Promise<boolean>;
}

// ── Validators ──────────────────────────────────────────────────────────────

function validateDeviceTime(time?: Date): void {
  if (time === undefined) return;
  if (!(time instanceof Date) || isNaN(time.getTime())) {
    throw { code: "INVALID_ARGUMENT", message: "time must be a valid Date" } satisfies VeepooError;
  }
}

// ── Capability ──────────────────────────────────────────────────────────────

export class DeviceTimeCapability {
  constructor(private readonly ctx: CapabilityContext<DeviceTimeNativeMethods>) {}

  async setDeviceTime(time?: Date): Promise<boolean> {
    validateDeviceTime(time);
    return this.ctx.invoke({
      invoke: () =>
        this.ctx.native.setDeviceTime(
          time === undefined
            ? undefined
            : {
                year: time.getFullYear(),
                month: time.getMonth() + 1,
                day: time.getDate(),
                hour: time.getHours(),
                minute: time.getMinutes(),
                second: time.getSeconds(),
              },
        ),
    });
  }
}
