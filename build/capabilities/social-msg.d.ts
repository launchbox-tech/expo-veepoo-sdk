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
export declare function normalizeSocialMsgData(value: unknown): SocialMsgData;
export declare function validateSocialMsgData(data: Partial<SocialMsgData>): void;
export declare class SocialMsgCapability {
    private readonly ctx;
    constructor(ctx: CapabilityContext<SocialMsgNativeMethods>);
    readSocialMsgData(): Promise<SocialMsgData>;
    writeSocialMsgData(data: Partial<SocialMsgData>): Promise<OperationStatus>;
}
//# sourceMappingURL=social-msg.d.ts.map