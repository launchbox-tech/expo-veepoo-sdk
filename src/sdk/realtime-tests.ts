import { invokeNative } from "../bridge/native-invoke-pipeline.js";
import type { LogScope, EcgTestOptions } from "../types/index.js";
import type { VeepooSDKRuntime } from "./veepoo-sdk-runtime.js";

/** Realtime manual tests (vitals modalities). */
export class RealtimeTests {
  constructor(private readonly rt: VeepooSDKRuntime) {}

  private invokeRealtimeTestVoid(
    scope: LogScope,
    action: string,
    message: string,
    invoke: () => Promise<void>,
  ): Promise<void> {
    this.rt.log("info", scope, action, message, { deviceId: this.rt.state.connectedDeviceId ?? undefined });
    return invokeNative({
      invoke,
      fallbackCode: "OPERATION_FAILED",
      deviceId: this.rt.state.connectedDeviceId ?? undefined,
      throwMapped: (e: unknown) => this.rt.nativeOpFailed(e),
    });
  }

  startHeartRateTest = (): Promise<void> =>
    this.invokeRealtimeTestVoid("test", "test.heartRate.start", "Starting heart rate test", () => this.rt.native.startHeartRateTest());

  stopHeartRateTest = (): Promise<void> =>
    this.invokeRealtimeTestVoid("test", "test.heartRate.stop", "Stopping heart rate test", () => this.rt.native.stopHeartRateTest());

  startBloodPressureTest = (): Promise<void> =>
    this.invokeRealtimeTestVoid("test", "test.bloodPressure.start", "Starting blood pressure test", () => this.rt.native.startBloodPressureTest());

  stopBloodPressureTest = (): Promise<void> =>
    this.invokeRealtimeTestVoid("test", "test.bloodPressure.stop", "Stopping blood pressure test", () => this.rt.native.stopBloodPressureTest());

  startBloodOxygenTest = (): Promise<void> =>
    this.invokeRealtimeTestVoid("test", "test.bloodOxygen.start", "Starting blood oxygen test", () => this.rt.native.startBloodOxygenTest());

  stopBloodOxygenTest = (): Promise<void> =>
    this.invokeRealtimeTestVoid("test", "test.bloodOxygen.stop", "Stopping blood oxygen test", () => this.rt.native.stopBloodOxygenTest());

  startTemperatureTest = (): Promise<void> =>
    this.invokeRealtimeTestVoid("test", "test.temperature.start", "Starting temperature test", () => this.rt.native.startTemperatureTest());

  stopTemperatureTest = (): Promise<void> =>
    this.invokeRealtimeTestVoid("test", "test.temperature.stop", "Stopping temperature test", () => this.rt.native.stopTemperatureTest());

  startStressTest = (): Promise<void> =>
    this.invokeRealtimeTestVoid("test", "test.stress.start", "Starting stress test", () => this.rt.native.startStressTest());

  stopStressTest = (): Promise<void> =>
    this.invokeRealtimeTestVoid("test", "test.stress.stop", "Stopping stress test", () => this.rt.native.stopStressTest());

  startBloodGlucoseTest = (): Promise<void> =>
    this.invokeRealtimeTestVoid("test", "test.bloodGlucose.start", "Starting blood glucose test", () => this.rt.native.startBloodGlucoseTest());

  stopBloodGlucoseTest = (): Promise<void> =>
    this.invokeRealtimeTestVoid("test", "test.bloodGlucose.stop", "Stopping blood glucose test", () => this.rt.native.stopBloodGlucoseTest());

  startHrvTest = (): Promise<void> =>
    this.invokeRealtimeTestVoid("test", "test.hrv.start", "Starting HRV test", () => this.rt.native.startHrvTest());

  stopHrvTest = (): Promise<void> =>
    this.invokeRealtimeTestVoid("test", "test.hrv.stop", "Stopping HRV test", () => this.rt.native.stopHrvTest());

  async startEcgTest(options?: EcgTestOptions): Promise<void> {
    this.rt.log("info", "test", "test.ecg.start", "Starting ECG test", {
      deviceId: this.rt.state.connectedDeviceId ?? undefined,
      data: options,
    });
    await invokeNative({
      invoke: () => this.rt.native.startEcgTest(options),
      fallbackCode: "OPERATION_FAILED",
      deviceId: this.rt.state.connectedDeviceId ?? undefined,
      throwMapped: (e: unknown) => this.rt.nativeOpFailed(e),
    });
  }

  stopEcgTest = (): Promise<void> =>
    this.invokeRealtimeTestVoid("test", "test.ecg.stop", "Stopping ECG test", () => this.rt.native.stopEcgTest());

  startFatigueTest = (): Promise<void> =>
    this.invokeRealtimeTestVoid("test", "test.fatigue.start", "Starting fatigue test", () => this.rt.native.startFatigueTest());

  stopFatigueTest = (): Promise<void> =>
    this.invokeRealtimeTestVoid("test", "test.fatigue.stop", "Stopping fatigue test", () => this.rt.native.stopFatigueTest());

  startBreathingTest = (): Promise<void> =>
    this.invokeRealtimeTestVoid("test", "test.breathing.start", "Starting breathing test", () => this.rt.native.startBreathingTest());

  stopBreathingTest = (): Promise<void> =>
    this.invokeRealtimeTestVoid("test", "test.breathing.stop", "Stopping breathing test", () => this.rt.native.stopBreathingTest());

  startBodyCompositionTest = (): Promise<void> =>
    this.invokeRealtimeTestVoid(
      "test",
      "test.bodyComposition.start",
      "Starting body composition test",
      () => this.rt.native.startBodyCompositionTest(),
    );

  stopBodyCompositionTest = (): Promise<void> =>
    this.invokeRealtimeTestVoid(
      "test",
      "test.bodyComposition.stop",
      "Stopping body composition test",
      () => this.rt.native.stopBodyCompositionTest(),
    );
}
