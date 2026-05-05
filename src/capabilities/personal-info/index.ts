import { invokeOrThrow } from "@/bridge/native-invoke-pipeline";
import type { ThrowingInvoke } from "@/bridge/native-invoke-pipeline";
import type { CapabilityContext } from "@/capabilities/shared/context";
import type { PersonalInfoNativeMethods } from "./native";
import { validatePersonalInfo } from "./validators";
import type { PersonalInfo } from "@/types/index";
import { deepCamelKeys } from "@/normalizers/deep-keys";

export class PersonalInfoCapability {
  constructor(private readonly ctx: CapabilityContext<PersonalInfoNativeMethods>) {}

  private call<T>(opts: Omit<ThrowingInvoke<T>, "mapError">): Promise<T> {
    return invokeOrThrow({ ...opts, mapError: (e) => this.ctx.mapError(e) });
  }

  syncPersonalInfo(info: PersonalInfo): Promise<boolean> {
    return this.call({
      validate: () => validatePersonalInfo(info),
      invoke: () => this.ctx.native.syncPersonalInfo(deepCamelKeys(info) as PersonalInfo),
    });
  }
}
