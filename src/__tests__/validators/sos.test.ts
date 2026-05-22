import { validateSosCallTimes } from '@/capabilities/sos';
import { expectInvalidArgument } from '@/__tests__/helpers/expect-invalid-argument';

describe('validateSosCallTimes', () => {
  it('passes for 1', () => {
    expect(() => validateSosCallTimes(1)).not.toThrow();
  });

  it('passes for 9', () => {
    expect(() => validateSosCallTimes(9)).not.toThrow();
  });

  it('throws for zero', () => {
    expectInvalidArgument(() => validateSosCallTimes(0), 'times');
  });

  it('throws for negative', () => {
    expectInvalidArgument(() => validateSosCallTimes(-1), 'times');
  });

  it('throws for non-integer', () => {
    expectInvalidArgument(() => validateSosCallTimes(2.5), 'times');
  });
});
