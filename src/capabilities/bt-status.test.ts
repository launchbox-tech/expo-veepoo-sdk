jest.mock('expo-modules-core', () => ({
  requireNativeModule: jest.fn().mockReturnValue({}),
}));
jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

import { BtStatusCapability, normalizeDeviceBTState, normalizeDeviceBTStatus } from '@/capabilities/bt-status';
import { VeepooSDKRuntime } from '@/sdk/veepoo-sdk-runtime';
import { makeMockNative, type MockNative } from '@/__tests__/helpers/mock-native';

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

describe('BtStatusCapability', () => {
  let native: MockNative;
  let runtime: VeepooSDKRuntime;
  let btStatus: BtStatusCapability;

  beforeEach(() => {
    native = makeMockNative();
    runtime = new VeepooSDKRuntime(native);
    btStatus = new BtStatusCapability(runtime.createCapabilityContext());
  });

  it('readDeviceBTStatus delegates to native', async () => {
    native.readDeviceBTStatus.mockResolvedValueOnce({ btState: 1, classicBtEnabled: true });

    await btStatus.readDeviceBTStatus();

    expect(native.readDeviceBTStatus).toHaveBeenCalledTimes(1);
  });

  it('setDeviceBTSwitch(true) delegates to native', async () => {
    await btStatus.setDeviceBTSwitch(true);

    expect(native.setDeviceBTSwitch).toHaveBeenCalledWith(true);
  });
});
