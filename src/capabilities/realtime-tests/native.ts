export interface RealtimeTestsNativeMethods {
  startHeartRateTest(): Promise<void>;
  stopHeartRateTest(): Promise<void>;
  startBloodPressureTest(): Promise<void>;
  stopBloodPressureTest(): Promise<void>;
  startBloodOxygenTest(): Promise<void>;
  stopBloodOxygenTest(): Promise<void>;
  startTemperatureTest(): Promise<void>;
  stopTemperatureTest(): Promise<void>;
  startStressTest(): Promise<void>;
  stopStressTest(): Promise<void>;
  startBloodGlucoseTest(): Promise<void>;
  stopBloodGlucoseTest(): Promise<void>;
  startHrvTest(): Promise<void>;
  stopHrvTest(): Promise<void>;
  startEcgTest(options?: { includeWaveform?: boolean }): Promise<void>;
  stopEcgTest(): Promise<void>;
  startFatigueTest(): Promise<void>;
  stopFatigueTest(): Promise<void>;
  startBreathingTest(): Promise<void>;
  stopBreathingTest(): Promise<void>;
  startBodyCompositionTest(): Promise<void>;
  stopBodyCompositionTest(): Promise<void>;
}
