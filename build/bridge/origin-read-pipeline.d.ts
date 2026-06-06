import type { VeepooEventPayload } from "../types/events";
/**
 * Pure pipeline that wraps per-device deduplication for `readOriginProgress`
 * events, operating directly on the normalized payload rather than raw
 * primitives.
 *
 * Rules (identical to {@link OriginReadProgressFilter}, lifted to payload level):
 * - `payload.progress` is not an object → **pass** (return `true`), no state stored
 * - Non-finite `progress.progress` → **pass** (return `true`), no state stored
 * - `readState === "start"` → reset stored progress for the device, **pass**
 * - Equal progress → **suppress** (return `false`)
 * - Progress changed → update stored progress, **pass** (return `true`)
 *
 * No dependency on the runtime, state manager, logger, or event bus.
 */
export declare class OriginReadPipeline {
    private readonly lastProgress;
    /**
     * Decide whether the event should be emitted.
     *
     * @param payload The already-normalized `readOriginProgress` payload.
     * @returns `true` if the event should be emitted, `false` if it should be suppressed.
     */
    shouldEmit(payload: VeepooEventPayload["read_origin_progress"]): boolean;
    /**
     * Remove stored state for a device (call on disconnect so the next read
     * cycle starts fresh).
     */
    clearDevice(deviceId: string): void;
}
//# sourceMappingURL=origin-read-pipeline.d.ts.map