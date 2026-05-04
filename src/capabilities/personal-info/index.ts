import { invokeOrThrow } from "../../bridge/native-invoke-pipeline.js";
import type { ThrowingInvoke } from "../../bridge/native-invoke-pipeline.js";
import type { CapabilityContext } from "../shared/context.js";
import type { PersonalInfoNativeMethods } from "./native.js";
import { validatePersonalInfo } from "./validators.js";
import type { PersonalInfo } from "../../types/index.js";

export class PersonalInfoCapability {
  constructor(private readonly ctx: CapabilityContext<PersonalInfoNativeMethods>) {}

  private call<T>(opts: Omit<ThrowingInvoke<T>, "mapError">): Promise<T> {
    return invokeOrThrow({ ...opts, mapError: (e) => this.ctx.mapError(e) });
  }

  syncPersonalInfo(info: PersonalInfo): Promise<boolean> {
    return this.call({
      validate: () => validatePersonalInfo(info),
      invoke: () => this.ctx.native.syncPersonalInfo(info),
    });
  }
}
