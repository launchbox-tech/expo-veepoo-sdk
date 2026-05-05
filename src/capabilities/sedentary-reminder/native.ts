import type { SedentaryReminderSettings } from "@/types/index";

export interface SedentaryReminderNativeMethods {
  readSedentaryReminder(): Promise<unknown>;
  setSedentaryReminder(settings: SedentaryReminderSettings): Promise<void>;
}
