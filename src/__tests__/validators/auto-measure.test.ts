import { validateAutoMeasureSetting } from '@/capabilities/auto-measure';
import { expectInvalidArgument } from '@/__tests__/helpers/expect-invalid-argument';

describe('validateAutoMeasureSetting', () => {
  it('passes for empty partial', () => {
    expect(() => validateAutoMeasureSetting({})).not.toThrow();
  });

  it('throws for measure_interval below 1', () => {
    expectInvalidArgument(() => validateAutoMeasureSetting({ measure_interval: 0 }), 'measureInterval');
  });

  it('throws for measure_interval above 120', () => {
    expectInvalidArgument(() => validateAutoMeasureSetting({ measure_interval: 121 }), 'measureInterval');
  });

  it('passes for valid measure_interval', () => {
    expect(() => validateAutoMeasureSetting({ measure_interval: 30 })).not.toThrow();
  });

  it('throws for current_start_minute above 1439', () => {
    expectInvalidArgument(() => validateAutoMeasureSetting({ current_start_minute: 1440 }), 'currentStartMinute');
  });

  it('throws for current_end_minute above 1439', () => {
    expectInvalidArgument(() => validateAutoMeasureSetting({ current_end_minute: 1440 }), 'currentEndMinute');
  });
});
