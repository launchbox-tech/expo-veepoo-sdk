import { invokeOrThrow } from "../../bridge/native-invoke-pipeline.js";
import type { CapabilityContext } from "../shared/context.js";
import type { RealtimeTestsNativeMethods } from "./native.js";
import type { EcgTestOptions, RealtimeTestModality } from "../../types/index.js";
import { deepCamelKeys } from "../../normalizers/deep-keys.js";

type Direction = "start" | "stop";

type DispatchEntry = {
  start: () => Promise<void>;
  stop: () => Promise<void>;
};

export class RealtimeTestsCapability {
  private readonly dispatch: Record<RealtimeTestModality, DispatchEntry>;

  constructor(private readonly ctx: CapabilityContext<RealtimeTestsNativeMethods>) {
    const n = ctx.native;
    this.dispatch = {
      heart_rate: {
        start: () => n.startHeartRateTest(),
        stop: () => n.stopHeartRateTest(),
      },
      blood_pressure: {
        start: () => n.startBloodPressureTest(),
        stop: () => n.stopBloodPressureTest(),
      },
      blood_oxygen: {
        start: () => n.startBloodOxygenTest(),
        stop: () => n.stopBloodOxygenTest(),
      },
      temperature: {
        start: () => n.startTemperatureTest(),
        stop: () => n.stopTemperatureTest(),
      },
      stress: {
        start: () => n.startStressTest(),
        stop: () => n.stopStressTest(),
      },
      blood_glucose: {
        start: () => n.startBloodGlucoseTest(),
        stop: () => n.stopBloodGlucoseTest(),
      },
      hrv: {
        start: () => n.startHrvTest(),
        stop: () => n.stopHrvTest(),
      },
      fatigue: {
        start: () => n.startFatigueTest(),
        stop: () => n.stopFatigueTest(),
      },
      breathing: {
        start: () => n.startBreathingTest(),
        stop: () => n.stopBreathingTest(),
      },
      body_composition: {
        start: () => n.startBodyCompositionTest(),
        stop: () => n.stopBodyCompositionTest(),
      },
    };
  }

  private runTest(modality: RealtimeTestModality, direction: Direction): Promise<void> {
    const label = `test.${modality}.${direction}`;
    this.ctx.log("info", "test", label, `${direction === "start" ? "Starting" : "Stopping"} ${modality} test`, {
      deviceId: this.ctx.connectedDeviceId() ?? undefined,
    });
    return invokeOrThrow({
      invoke: () => this.dispatch[modality][direction](),
      mapError: (e: unknown) => this.ctx.mapError(e),
    });
  }

  startTest(modality: RealtimeTestModality): Promise<void> {
    return this.runTest(modality, "start");
  }

  stopTest(modality: RealtimeTestModality): Promise<void> {
    return this.runTest(modality, "stop");
  }

  async startEcgTest(options?: EcgTestOptions): Promise<void> {
    this.ctx.log("info", "test", "test.ecg.start", "Starting ECG test", {
      deviceId: this.ctx.connectedDeviceId() ?? undefined,
      data: options,
    });
    await invokeOrThrow({
      invoke: () => this.ctx.native.startEcgTest(options ? deepCamelKeys(options) as { includeWaveform?: boolean } : undefined),
      mapError: (e: unknown) => this.ctx.mapError(e),
    });
  }

  stopEcgTest(): Promise<void> {
    this.ctx.log("info", "test", "test.ecg.stop", "Stopping ECG test", {
      deviceId: this.ctx.connectedDeviceId() ?? undefined,
    });
    return invokeOrThrow({
      invoke: () => this.ctx.native.stopEcgTest(),
      mapError: (e: unknown) => this.ctx.mapError(e),
    });
  }
}
