import type { CapabilityContext } from "../capabilities/shared/context";
export interface SportStepData {
    date: string;
    step_count: number;
    distance: number;
    calories: number;
}
export interface SportStepsNativeMethods {
    readSportStepData(date?: string): Promise<unknown>;
}
export declare function normalizeSportStepData(value: unknown): SportStepData;
export declare class SportStepsCapability {
    private readonly ctx;
    constructor(ctx: CapabilityContext<SportStepsNativeMethods>);
    readSportStepData(date?: string): Promise<SportStepData>;
}
//# sourceMappingURL=sport-steps.d.ts.map