import type { CapabilityContext } from "@/capabilities/shared/context";
import type { SedentaryReminderNativeMethods } from "./native";
import { normalizeSedentaryReminderSettings } from "./normalizers";
import { validateSedentaryReminderSettings } from "./validators";
import type { SedentaryReminderSettings } from "@/types/index";
import { deepCamelKeys } from "@/shared/deep-keys";

export class SedentaryReminderCapability {
  constructor(private readonly ctx: CapabilityContext<SedentaryReminderNativeMethods>) {}

  readSedentaryReminder(): Promise<SedentaryReminderSettings> {
    return this.ctx.invoke({
      invoke: () => this.ctx.native.readSedentaryReminder(),
      normalize: normalizeSedentaryReminderSettings,
    });
  }

  setSedentaryReminder(settings: SedentaryReminderSettings): Promise<void> {
    return this.ctx.invoke({
      validate: () => validateSedentaryReminderSettings(settings),
      invoke: () => this.ctx.native.setSedentaryReminder(deepCamelKeys(settings) as SedentaryReminderSettings),
    });
  }
}
