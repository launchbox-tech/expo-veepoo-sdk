import type { CapabilityContext } from "@/capabilities/shared/context";
import type { RealtimeTestsNativeMethods } from "./native";
import type { EcgTestOptions } from "@/types/index";
import {
  REALTIME_TEST_DEFINITIONS,
  type RealtimeTestModality,
} from "./registry";

type Direction = "start" | "stop";

/**
 * Drives the realtime-test family on the Band: start/stop a modality,
 * including ECG with its optional options payload. Each modality's native
 * binding lives in {@link REALTIME_TEST_DEFINITIONS} — see
 * `src/capabilities/realtime-tests/registry.ts`.
 */
export class RealtimeTestsCapability {
  constructor(private readonly ctx: CapabilityContext<RealtimeTestsNativeMethods>) {}

  // Overloads: ECG accepts an optional options payload; all other modalities take none.
  startTest(modality: "ecg", options?: EcgTestOptions): Promise<void>;
  startTest(modality: Exclude<RealtimeTestModality, "ecg">): Promise<void>;
  startTest(modality: RealtimeTestModality, options?: EcgTestOptions): Promise<void> {
    return this.runTest(modality, "start", options);
  }

  stopTest(modality: RealtimeTestModality): Promise<void> {
    return this.runTest(modality, "stop");
  }

  // ── Back-compat: ECG-specific helpers (one-liners over startTest/stopTest)

  startEcgTest(options?: EcgTestOptions): Promise<void> {
    return this.startTest("ecg", options);
  }

  stopEcgTest(): Promise<void> {
    return this.stopTest("ecg");
  }

  private runTest(
    modality: RealtimeTestModality,
    direction: Direction,
    options?: EcgTestOptions,
  ): Promise<void> {
    const row = REALTIME_TEST_DEFINITIONS[modality];
    const label = `test.${modality}.${direction}`;
    this.ctx.log(
      "info",
      "test",
      label,
      `${direction === "start" ? "Starting" : "Stopping"} ${modality} test`,
      direction === "start" && options ? { data: options } : {},
    );
    return this.ctx.invoke({
      invoke: () =>
        direction === "start"
          ? row.control!.start(this.ctx.native, options as never)
          : row.control!.stop(this.ctx.native),
    });
  }
}
