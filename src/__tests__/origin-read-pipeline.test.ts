import { OriginReadPipeline } from '../bridge/origin-read-pipeline';
import type { VeepooEventPayload } from '../types/events';
import type { ReadOriginProgress } from '../types/health-tests';

/**
 * Helper to build a well-formed `readOriginProgress` payload.
 */
function makePayload(
  deviceId: string,
  progressValue: number,
  readState: ReadOriginProgress['readState'] = 'reading',
  totalDays = 7,
  currentDay = 1,
): VeepooEventPayload['readOriginProgress'] {
  return {
    deviceId,
    progress: { readState, totalDays, currentDay, progress: progressValue },
  };
}

describe('OriginReadPipeline', () => {
  let pipeline: OriginReadPipeline;

  beforeEach(() => {
    pipeline = new OriginReadPipeline();
  });

  // 1. First event for an unseen device → passes
  it('passes the first event for an unseen device', () => {
    expect(pipeline.shouldEmit(makePayload('dev1', 10))).toBe(true);
  });

  // 2. Second event with equal progress → suppressed
  it('suppresses a second event with equal progress', () => {
    pipeline.shouldEmit(makePayload('dev1', 50));
    expect(pipeline.shouldEmit(makePayload('dev1', 50))).toBe(false);
  });

  // 3. Increasing progress → passes
  it('passes increasing progress', () => {
    pipeline.shouldEmit(makePayload('dev1', 30));
    expect(pipeline.shouldEmit(makePayload('dev1', 60))).toBe(true);
  });

  // 4. Decreasing progress → passes
  it('passes decreasing progress', () => {
    pipeline.shouldEmit(makePayload('dev1', 80));
    expect(pipeline.shouldEmit(makePayload('dev1', 20))).toBe(true);
  });

  // 5. readState === "start" passes even when progress equals previous;
  //    subsequent equal value must be suppressed (verifying the reset)
  it('readState "start" passes with same progress as previous, then suppresses the next equal value', () => {
    pipeline.shouldEmit(makePayload('dev1', 50));
    // "start" with the same value must pass (not be suppressed)
    expect(pipeline.shouldEmit(makePayload('dev1', 50, 'start'))).toBe(true);
    // The state is now 50 again; a plain duplicate must be suppressed
    expect(pipeline.shouldEmit(makePayload('dev1', 50))).toBe(false);
  });

  // 6. clearDevice() resets one device; other device is unaffected
  it('clearDevice resets one device while leaving others intact', () => {
    pipeline.shouldEmit(makePayload('dev1', 40));
    pipeline.shouldEmit(makePayload('dev2', 40));

    pipeline.clearDevice('dev1');

    // dev1 was cleared → same value is a fresh first occurrence → passes
    expect(pipeline.shouldEmit(makePayload('dev1', 40))).toBe(true);
    // dev2 was NOT cleared → duplicate is still suppressed
    expect(pipeline.shouldEmit(makePayload('dev2', 40))).toBe(false);
  });

  // 7. Two devices tracked independently
  it('tracks separate deviceIds independently', () => {
    pipeline.shouldEmit(makePayload('dev1', 50));
    pipeline.shouldEmit(makePayload('dev2', 50));

    // Both at 50; a second 50 for each must be suppressed
    expect(pipeline.shouldEmit(makePayload('dev1', 50))).toBe(false);
    expect(pipeline.shouldEmit(makePayload('dev2', 50))).toBe(false);

    // Advancing dev1 does not affect dev2
    pipeline.shouldEmit(makePayload('dev1', 70));
    expect(pipeline.shouldEmit(makePayload('dev2', 50))).toBe(false);
    expect(pipeline.shouldEmit(makePayload('dev1', 70))).toBe(false);
  });

  // 8. Non-finite progress → passes, stores no state; subsequent finite value is a fresh first occurrence
  it('passes non-finite progress without storing state', () => {
    expect(pipeline.shouldEmit(makePayload('dev1', NaN))).toBe(true);
    expect(pipeline.shouldEmit(makePayload('dev1', Infinity))).toBe(true);
    expect(pipeline.shouldEmit(makePayload('dev1', -Infinity))).toBe(true);
    // No state stored by any of the above → next finite value is a first occurrence → passes
    expect(pipeline.shouldEmit(makePayload('dev1', 50))).toBe(true);
  });

  // 9. Pass-through payload (progress field is not an object) → passes, stores no state
  it('passes through a payload where progress is not an object, storing no state', () => {
    // Cast to simulate a normalization fallback that left progress as a raw number
    const passThrough = {
      deviceId: 'dev1',
      progress: 42 as unknown as ReadOriginProgress,
    } satisfies VeepooEventPayload['readOriginProgress'];

    expect(pipeline.shouldEmit(passThrough)).toBe(true);

    // No state was stored; a subsequent well-formed payload with the same
    // numeric value (42) is treated as a fresh first occurrence → passes
    expect(pipeline.shouldEmit(makePayload('dev1', 42))).toBe(true);
    // Now state IS stored; same value again → suppressed
    expect(pipeline.shouldEmit(makePayload('dev1', 42))).toBe(false);
  });
});
