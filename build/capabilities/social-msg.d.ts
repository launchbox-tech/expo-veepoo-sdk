import type { CapabilityContext } from "../capabilities/shared/context";
import type { FunctionStatus, OperationStatus } from "../types/index";
export interface SocialMsgData {
    phone: FunctionStatus;
    sms: FunctionStatus;
    wechat: FunctionStatus;
    qq: FunctionStatus;
    facebook: FunctionStatus;
    twitter: FunctionStatus;
    instagram: FunctionStatus;
    linkedin: FunctionStatus;
    whatsapp: FunctionStatus;
    line: FunctionStatus;
    skype: FunctionStatus;
    email: FunctionStatus;
    other: FunctionStatus;
}
export interface SocialMsgNativeMethods {
    readSocialMsgData(): Promise<unknown>;
    writeSocialMsgData(data: Partial<SocialMsgData>): Promise<OperationStatus>;
}
/**
 * The social-message channels this module bridges. The vendor reports 26; these
 * 13 are the ones both native emitters produce, and a contract check holds the
 * three lists in agreement.
 */
export declare const SOCIAL_MSG_CHANNELS: readonly ["phone", "sms", "wechat", "qq", "facebook", "twitter", "instagram", "linkedin", "whatsapp", "line", "skype", "email", "other"];
export declare function normalizeSocialMsgData(value: unknown): SocialMsgData;
export declare class SocialMsgCapability {
    private readonly ctx;
    constructor(ctx: CapabilityContext<SocialMsgNativeMethods>);
    readSocialMsgData(): Promise<SocialMsgData>;
    writeSocialMsgData(data: Partial<SocialMsgData>): Promise<OperationStatus>;
}
//# sourceMappingURL=social-msg.d.ts.map