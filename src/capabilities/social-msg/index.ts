import { invokeOrThrow } from "../../bridge/native-invoke-pipeline.js";
import type { ThrowingInvoke } from "../../bridge/native-invoke-pipeline.js";
import type { CapabilityContext } from "../shared/context.js";
import type { SocialMsgNativeMethods } from "./native.js";
import { normalizeSocialMsgData } from "./normalizers.js";
import { validateSocialMsgData } from "./validators.js";
import type { OperationStatus, SocialMsgData } from "../../types/index.js";
import { deepCamelKeys } from "../../normalizers/deep-keys.js";

export class SocialMsgCapability {
  constructor(private readonly ctx: CapabilityContext<SocialMsgNativeMethods>) {}

  private call<T>(opts: Omit<ThrowingInvoke<T>, "mapError">): Promise<T> {
    return invokeOrThrow({ ...opts, mapError: (e) => this.ctx.mapError(e) });
  }

  readSocialMsgData(): Promise<SocialMsgData> {
    return this.call({
      invoke: () => this.ctx.native.readSocialMsgData(),
      normalize: normalizeSocialMsgData,
      afterSuccess: (result) => {
        this.ctx.log("debug", "device", "device.social.read", "Social message settings received", {
          deviceId: this.ctx.connectedDeviceId() ?? undefined,
          data: result,
        });
      },
    });
  }

  writeSocialMsgData(data: Partial<SocialMsgData>): Promise<OperationStatus> {
    return this.call({
      validate: () => validateSocialMsgData(data),
      invoke: () => this.ctx.native.writeSocialMsgData(deepCamelKeys(data) as Partial<SocialMsgData>),
    });
  }
}
