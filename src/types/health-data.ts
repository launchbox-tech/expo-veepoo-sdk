/**
 * Health-data types have moved next to their owning capability:
 * - HeartRate/BloodPressure/BloodOxygen/Temperature/Stress/BloodGlucose data
 *     → src/capabilities/realtime-tests/types.ts
 * - Sleep* / AccurateSleep / SleepMinute*  → src/capabilities/sleep-data/types.ts
 * - SportStepData                          → src/capabilities/sport-steps/types.ts
 * - DaySummaryData                         → src/capabilities/day-summary/types.ts
 * - OriginData / HalfHourData / Spo2OriginData → src/capabilities/origin-data/types.ts
 * - DailyHealthData / Exercise* / Stored*  → src/capabilities/historical-query/types.ts
 *
 * Kept as a stable import path via re-exports — the file itself
 * no longer declares any types.
 */
export type {} from '@/capabilities/historical-query/types';
