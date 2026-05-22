import { normalizeWatchFaceStyle } from './watch-face';

describe('normalizeWatchFaceStyle', () => {
  it('maps dialType and screenIndex', () => {
    const r = normalizeWatchFaceStyle({
      dialType: 'MARKET',
      screenIndex: 4,
      operationSuccess: true,
    });
    expect(r.dial_type).toBe('market');
    expect(r.screen_index).toBe(4);
    expect(r.operation_success).toBe(true);
  });

  it('defaults unknown dial to default and omits operation_success when absent', () => {
    const r = normalizeWatchFaceStyle({ screenIndex: 1 });
    expect(r.dial_type).toBe('default');
    expect(r.screen_index).toBe(1);
    expect(r.operation_success).toBeUndefined();
  });
});
