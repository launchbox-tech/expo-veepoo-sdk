import type { PersonalInfo } from "@/types/index";

export interface PersonalInfoNativeMethods {
  syncPersonalInfo(info: PersonalInfo): Promise<boolean>;
}
