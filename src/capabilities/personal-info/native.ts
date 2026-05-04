import type { PersonalInfo } from "../../types/index.js";

export interface PersonalInfoNativeMethods {
  syncPersonalInfo(info: PersonalInfo): Promise<boolean>;
}
