import type { OperationStatus, SocialMsgData } from "../../types/index.js";

export interface SocialMsgNativeMethods {
  readSocialMsgData(): Promise<unknown>;
  writeSocialMsgData(data: Partial<SocialMsgData>): Promise<OperationStatus>;
}
