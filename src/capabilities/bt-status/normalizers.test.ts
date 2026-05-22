import { normalizeDeviceBTState, normalizeDeviceBTStatus } from './normalizers';

describe('normalizeDeviceBTState', () => {
  it('maps 0 to disconnected', () => {
    expect(normalizeDeviceBTState(0)).toBe('disconnected');
  });
  it('maps 1 to connected', () => {
    expect(normalizeDeviceBTState(1)).toBe('connected');
  });
  it('maps 2 to pairing', () => {
    expect(normalizeDeviceBTState(2)).toBe('pairing');
  });
  it('maps string "connected" to connected', () => {
    expect(normalizeDeviceBTState('connected')).toBe('connected');
  });
  it('maps string "pairing" to pairing', () => {
    expect(normalizeDeviceBTState('pairing')).toBe('pairing');
  });
  it('falls back to disconnected for unknown', () => {
    expect(normalizeDeviceBTState(99)).toBe('disconnected');
    expect(normalizeDeviceBTState(undefined)).toBe('disconnected');
  });
});

describe('normalizeDeviceBTStatus', () => {
  it('normalizes a full Android BTInfo record', () => {
    const result = normalizeDeviceBTStatus({
      isBTOpen: true,
      isAutoCon: true,
      isAudioOpen: false,
      isHavePairInfo: true,
      status: 1,
    });
    expect(result).toEqual({
      is_bt_open: true,
      is_auto_connect: true,
      is_audio_open: false,
      has_pair_info: true,
      state: 'connected',
    });
  });

  it('handles missing/undefined fields gracefully', () => {
    const result = normalizeDeviceBTStatus({});
    expect(result.is_bt_open).toBe(false);
    expect(result.is_auto_connect).toBe(false);
    expect(result.is_audio_open).toBe(false);
    expect(result.has_pair_info).toBe(false);
    expect(result.state).toBe('disconnected');
  });

  it('handles non-object input', () => {
    const result = normalizeDeviceBTStatus(null);
    expect(result.is_bt_open).toBe(false);
    expect(result.state).toBe('disconnected');
  });
});
