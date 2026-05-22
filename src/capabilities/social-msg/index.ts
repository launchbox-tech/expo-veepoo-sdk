import type { CapabilityContext } from "@/capabilities/shared/context";
import type { SocialMsgNativeMethods } from "./native";
import { normalizeSocialMsgData } from "./normalizers";
import { validateSocialMsgData } from "./validators";
import type { OperationStatus, SocialMsgData } from "@/types/index";
import { deepCamelKeys } from "@/normalizers/deep-keys";

export class SocialMsgCapability {
  constructor(private readonly ctx: CapabilityContext<SocialMsgNativeMethods>) {}

  readSocialMsgData(): Promise<SocialMsgData> {
    return this.ctx.invoke({
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
    return this.ctx.invoke({
      validate: () => validateSocialMsgData(data),
      invoke: () => this.ctx.native.writeSocialMsgData(deepCamelKeys(data) as Partial<SocialMsgData>),
    });
  }
}
