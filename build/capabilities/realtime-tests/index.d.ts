import type { CapabilityContext } from "../../capabilities/shared/context";
import type { RealtimeTestsNativeMethods } from "./native";
import type { EcgTestOptions } from "../../types/index";
import { type RealtimeTestModality } from "./registry";
/**
 * Drives the realtime-test family on the Band: start/stop a modality,
 * including ECG with its optional options payload. Each modality's native
 * binding lives in {@link REALTIME_TEST_DEFINITIONS} — see
 * `src/capabilities/realtime-tests/registry.ts`.
 */
export declare class RealtimeTestsCapability {
    private readonly ctx;
    constructor(ctx: CapabilityContext<RealtimeTestsNativeMethods>);
    startTest(modality: "ecg", options?: EcgTestOptions): Promise<void>;
    startTest(modality: Exclude<RealtimeTestModality, "ecg">): Promise<void>;
    stopTest(modality: RealtimeTestModality): Promise<void>;
    startEcgTest(options?: EcgTestOptions): Promise<void>;
    stopEcgTest(): Promise<void>;
    private runTest;
}
//# sourceMappingURL=index.d.ts.map