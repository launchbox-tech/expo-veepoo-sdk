import { invokeOrThrow } from "../../bridge/native-invoke-pipeline.js";
import type { ThrowingInvoke } from "../../bridge/native-invoke-pipeline.js";
import type { CapabilityContext } from "../shared/context.js";
import type { SedentaryReminderNativeMethods } from "./native.js";
import { normalizeSedentaryReminderSettings } from "./normalizers.js";
import { validateSedentaryReminderSettings } from "./validators.js";
import type { SedentaryReminderSettings } from "../../types/index.js";
import { deepCamelKeys } from "../../normalizers/deep-keys.js";

export class SedentaryReminderCapability {
  constructor(private readonly ctx: CapabilityContext<SedentaryReminderNativeMethods>) {}

  private call<T>(opts: Omit<ThrowingInvoke<T>, "mapError">): Promise<T> {
    return invokeOrThrow({ ...opts, mapError: (e) => this.ctx.mapError(e) });
  }

  readSedentaryReminder(): Promise<SedentaryReminderSettings> {
    return this.call({
      invoke: () => this.ctx.native.readSedentaryReminder(),
      normalize: normalizeSedentaryReminderSettings,
    });
  }

  setSedentaryReminder(settings: SedentaryReminderSettings): Promise<void> {
    return this.call({
      validate: () => validateSedentaryReminderSettings(settings),
      invoke: () => this.ctx.native.setSedentaryReminder(deepCamelKeys(settings) as SedentaryReminderSettings),
    });
  }
}
