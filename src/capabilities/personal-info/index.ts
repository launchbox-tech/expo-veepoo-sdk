import type { CapabilityContext } from "@/capabilities/shared/context";
import type { PersonalInfoNativeMethods } from "./native";
import { validatePersonalInfo } from "./validators";
import type { PersonalInfo } from "@/types/index";
import { deepCamelKeys } from "@/normalizers/deep-keys";

export class PersonalInfoCapability {
  constructor(private readonly ctx: CapabilityContext<PersonalInfoNativeMethods>) {}

  syncPersonalInfo(info: PersonalInfo): Promise<boolean> {
    return this.ctx.invoke({
      validate: () => validatePersonalInfo(info),
      invoke: () => this.ctx.native.syncPersonalInfo(deepCamelKeys(info) as PersonalInfo),
    });
  }
}
