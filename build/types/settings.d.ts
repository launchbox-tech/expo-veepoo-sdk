/**
 * Cross-cutting settings vocabulary: unit conventions used across capabilities
 * and the universal `OperationStatus` result. Capability-owned settings live
 * next to their capability under `src/capabilities/<feature>/types.ts`;
 * event-only payloads (CustomSettings, ApneaRemindSettings, …) live in
 * `types/events.ts` next to `VeepooEventPayload`.
 */
export type TemperatureUnit = 'celsius' | 'fahrenheit';
export type DistanceUnit = 'metric' | 'imperial';
export type TimeFormat = '12hour' | '24hour';
export type BloodGlucoseUnit = 'mmol_l' | 'mg_dl';
/** 1 = lightest (closest to white), 6 = darkest. Gate: Android skinType==2, iOS peripheralModel.skinType==2. */
export type SkinTone = 1 | 2 | 3 | 4 | 5 | 6;
/** Universal write-operation result returned by most setX/pushX native calls. */
export type OperationStatus = 'success' | 'fail' | 'unknown';
//# sourceMappingURL=settings.d.ts.map