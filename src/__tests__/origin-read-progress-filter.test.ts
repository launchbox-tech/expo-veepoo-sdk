import { OriginReadProgressFilter } from '../bridge/origin-read-progress-filter';

describe('OriginReadProgressFilter', () => {
  let filter: OriginReadProgressFilter;

  beforeEach(() => {
    filter = new OriginReadProgressFilter();
  });

  it('passes the first event for an unseen device', () => {
    expect(filter.shouldEmit('dev1', undefined, 10)).toBe(true);
  });

  it('suppresses equal progress', () => {
    filter.shouldEmit('dev1', undefined, 50);
    expect(filter.shouldEmit('dev1', undefined, 50)).toBe(false);
  });

  it('passes increasing progress', () => {
    filter.shouldEmit('dev1', undefined, 30);
    expect(filter.shouldEmit('dev1', undefined, 60)).toBe(true);
  });

  it('passes decreasing progress', () => {
    filter.shouldEmit('dev1', undefined, 80);
    expect(filter.shouldEmit('dev1', undefined, 20)).toBe(true);
  });

  it('readState "start" resets state and passes', () => {
    // Advance to progress 50 so equal-suppression would normally kick in
    filter.shouldEmit('dev1', undefined, 50);
    // A "start" event with the same value must pass
    expect(filter.shouldEmit('dev1', 'start', 50)).toBe(true);
  });

  it('readState "start" resets so a subsequent equal progress is suppressed', () => {
    filter.shouldEmit('dev1', undefined, 80);
    filter.shouldEmit('dev1', 'start', 10); // resets to 10
    // Same value again — must be suppressed
    expect(filter.shouldEmit('dev1', undefined, 10)).toBe(false);
  });

  it('clearDevice resets state so subsequent equal progress passes again', () => {
    filter.shouldEmit('dev1', undefined, 40);
    filter.clearDevice('dev1');
    // After clear the device is unknown again → first occurrence must pass
    expect(filter.shouldEmit('dev1', undefined, 40)).toBe(true);
  });

  it('tracks separate deviceIds independently', () => {
    filter.shouldEmit('dev1', undefined, 50);
    filter.shouldEmit('dev2', undefined, 50);

    // Both at 50; a second 50 for each must be suppressed
    expect(filter.shouldEmit('dev1', undefined, 50)).toBe(false);
    expect(filter.shouldEmit('dev2', undefined, 50)).toBe(false);

    // Advancing dev1 does not affect dev2
    filter.shouldEmit('dev1', undefined, 70);
    expect(filter.shouldEmit('dev2', undefined, 50)).toBe(false);
    expect(filter.shouldEmit('dev1', undefined, 70)).toBe(false);
  });

  it('clears only the target device and leaves others intact', () => {
    filter.shouldEmit('dev1', undefined, 50);
    filter.shouldEmit('dev2', undefined, 50);

    filter.clearDevice('dev1');

    // dev1 was cleared → same value passes
    expect(filter.shouldEmit('dev1', undefined, 50)).toBe(true);
    // dev2 was NOT cleared → same value is still suppressed
    expect(filter.shouldEmit('dev2', undefined, 50)).toBe(false);
  });

  it('passes non-finite progress without storing state', () => {
    expect(filter.shouldEmit('dev1', undefined, NaN)).toBe(true);
    expect(filter.shouldEmit('dev1', undefined, Infinity)).toBe(true);
    expect(filter.shouldEmit('dev1', undefined, -Infinity)).toBe(true);
    // State should remain unset so the next finite value is a fresh first occurrence
    expect(filter.shouldEmit('dev1', undefined, 50)).toBe(true);
  });
});
