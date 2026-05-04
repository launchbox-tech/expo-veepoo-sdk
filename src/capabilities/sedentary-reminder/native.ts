import type { SedentaryReminderSettings } from "../../types/index.js";

export interface SedentaryReminderNativeMethods {
  readSedentaryReminder(): Promise<unknown>;
  setSedentaryReminder(settings: SedentaryReminderSettings): Promise<void>;
}
