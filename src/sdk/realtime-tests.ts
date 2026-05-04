import { invokeOrThrow } from "../bridge/native-invoke-pipeline.js";
import type { EcgTestOptions, RealtimeTestModality } from "../types/index.js";
import type { RealtimeTestsInterface, SubsystemRuntime } from "./subsystem-interfaces.js";

type Direction = "start" | "stop";

type DispatchEntry = {
  start: () => Promise<void>;
  stop: () => Promise<void>;
};

/** Realtime manual tests (vitals modalities). */
export class RealtimeTests implements RealtimeTestsInterface {
  private readonly dispatch: Record<RealtimeTestModality, DispatchEntry>;

  constructor(private readonly rt: SubsystemRuntime) {
    const n = rt.native;
    this.dispatch = {
      heartRate: {
        start: () => n.startHeartRateTest(),
        stop: () => n.stopHeartRateTest(),
      },
      bloodPressure: {
        start: () => n.startBloodPressureTest(),
        stop: () => n.stopBloodPressureTest(),
      },
      bloodOxygen: {
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
      bloodGlucose: {
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
      bodyComposition: {
        start: () => n.startBodyCompositionTest(),
        stop: () => n.stopBodyCompositionTest(),
      },
    };
  }

  private runTest(modality: RealtimeTestModality, direction: Direction): Promise<void> {
    const label = `test.${modality}.${direction}`;
    this.rt.log("info", "test", label, `${direction === "start" ? "Starting" : "Stopping"} ${modality} test`, {
      deviceId: this.rt.state.connectedDeviceId ?? undefined,
    });
    return invokeOrThrow({
      invoke: () => this.dispatch[modality][direction](),
      mapError: (e: unknown) => this.rt.nativeOpFailed(e),
    });
  }

  startTest(modality: RealtimeTestModality): Promise<void> {
    return this.runTest(modality, "start");
  }

  stopTest(modality: RealtimeTestModality): Promise<void> {
    return this.runTest(modality, "stop");
  }

  async startEcgTest(options?: EcgTestOptions): Promise<void> {
    this.rt.log("info", "test", "test.ecg.start", "Starting ECG test", {
      deviceId: this.rt.state.connectedDeviceId ?? undefined,
      data: options,
    });
    await invokeOrThrow({
      invoke: () => this.rt.native.startEcgTest(options),
      mapError: (e: unknown) => this.rt.nativeOpFailed(e),
    });
  }

  stopEcgTest(): Promise<void> {
    this.rt.log("info", "test", "test.ecg.stop", "Stopping ECG test", {
      deviceId: this.rt.state.connectedDeviceId ?? undefined,
    });
    return invokeOrThrow({
      invoke: () => this.rt.native.stopEcgTest(),
      mapError: (e: unknown) => this.rt.nativeOpFailed(e),
    });
  }
}
