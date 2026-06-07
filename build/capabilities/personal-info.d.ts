import type { CapabilityContext } from "../capabilities/shared/context";
export type Sex = 0 | 1;
export interface PersonalInfo {
    sex: Sex;
    height: number;
    weight: number;
    age: number;
    step_aim: number;
    sleep_aim: number;
}
export interface PersonalInfoNativeMethods {
    syncPersonalInfo(info: PersonalInfo): Promise<boolean>;
}
export declare class PersonalInfoCapability {
    private readonly ctx;
    constructor(ctx: CapabilityContext<PersonalInfoNativeMethods>);
    syncPersonalInfo(info: PersonalInfo): Promise<boolean>;
}
//# sourceMappingURL=personal-info.d.ts.map