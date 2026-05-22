/**
 * Health-test types have moved next to their owning capability:
 * - TestState, all *TestResult, RealtimeTest, RealtimeTestModality, BodyComposition*,
 *   BloodAnalysis*, Gsr/Ptt, EcgTestOptions → src/capabilities/realtime-tests/types.ts
 * - ReadState, ReadOriginProgress         → src/capabilities/origin-data/types.ts
 *
 * Kept as a stable import path via re-exports — the file itself
 * no longer declares any types.
 */
export type {} from '@/capabilities/realtime-tests/types';
