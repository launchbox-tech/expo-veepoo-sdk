import { validateReadWatchFaceStyleOptions, validateWatchFaceStyleSettings } from '@/capabilities/watch-face';
import { expectInvalidArgument } from '@/__tests__/helpers/expect-invalid-argument';

describe('validateReadWatchFaceStyleOptions', () => {
  it('allows undefined', () => {
    expect(() => validateReadWatchFaceStyleOptions(undefined)).not.toThrow();
  });

  it('allows valid dialType', () => {
    expect(() => validateReadWatchFaceStyleOptions({ dial_type: 'market' })).not.toThrow();
  });

  it('rejects invalid dialType', () => {
    expectInvalidArgument(() => validateReadWatchFaceStyleOptions({ dial_type: 'x' as any }), 'dialType');
  });
});

describe('validateWatchFaceStyleSettings', () => {
  it('requires screenIndex in range', () => {
    expect(() => validateWatchFaceStyleSettings({ screen_index: 0 })).not.toThrow();
    expectInvalidArgument(() => validateWatchFaceStyleSettings({ screen_index: -1 }), 'screenIndex');
    expectInvalidArgument(
      () => validateWatchFaceStyleSettings({ screen_index: 66_000 }),
      'screenIndex',
    );
  });

  it('validates optional dialType', () => {
    expectInvalidArgument(
      () => validateWatchFaceStyleSettings({ screen_index: 0, dial_type: 'oops' as any }),
      'dialType',
    );
  });
});
