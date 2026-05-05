jest.mock('expo-modules-core', () => ({
  requireNativeModule: jest.fn().mockReturnValue({}),
}));
jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

import { DeviceSwitchesCapability } from '@/capabilities/device-switches/index';
import { VeepooSDKRuntime } from '@/sdk/veepoo-sdk-runtime';
import { makeMockNative, type MockNative } from '@/__tests__/helpers/mock-native';

const ALL_SWITCH_KEYS = [
  'auto_hr', 'auto_bp', 'auto_spo2', 'auto_temperature', 'auto_hrv',
  'auto_blood_glucose', 'auto_ppg', 'wear_detection', 'disconnect_remind',
  'sos_remind', 'auto_answer', 'exercise_detection', 'accurate_sleep',
  'ecg_normally_open', 'met', 'stress', 'music_control',
] as const;

describe('DeviceSwitchesCapability', () => {
  let native: MockNative;
  let runtime: VeepooSDKRuntime;
  let deviceSwitches: DeviceSwitchesCapability;

  beforeEach(() => {
    native = makeMockNative();
    runtime = new VeepooSDKRuntime(native);
    deviceSwitches = new DeviceSwitchesCapability(runtime.createCapabilityContext());
  });

  // ── readDeviceSwitches ────────────────────────────────────────────────────

  it('readDeviceSwitches returns full DeviceSwitches record with all keys present', async () => {
    native.readDeviceSwitches.mockResolvedValueOnce({});

    const result = await deviceSwitches.readDeviceSwitches();

    // All keys must be present
    for (const key of ALL_SWITCH_KEYS) {
      expect(result).toHaveProperty(key);
      expect(typeof result[key]).toBe('boolean');
    }
  });

  it('readDeviceSwitches defaults unknown values to false', async () => {
    native.readDeviceSwitches.mockResolvedValueOnce({});

    const result = await deviceSwitches.readDeviceSwitches();

    for (const key of ALL_SWITCH_KEYS) {
      expect(result[key]).toBe(false);
    }
  });

  it('readDeviceSwitches maps camelCase native response correctly', async () => {
    native.readDeviceSwitches.mockResolvedValueOnce({ autoHr: true, autoHRV: true, musicControl: false });

    const result = await deviceSwitches.readDeviceSwitches();

    expect(result.auto_hr).toBe(true);
    expect(result.auto_hrv).toBe(true);
    expect(result.music_control).toBe(false);
  });

  it('readDeviceSwitches emits device_switches_data via emitLocal', async () => {
    const emitSpy = jest.spyOn(runtime, 'emitLocal');

    await deviceSwitches.readDeviceSwitches();

    expect(emitSpy).toHaveBeenCalledWith(
      'device_switches_data',
      expect.objectContaining({ switches: expect.any(Object) }),
    );
  });

  // ── setDeviceSwitch ───────────────────────────────────────────────────────

  it('setDeviceSwitch("auto_hr", true) delegates to native with correct args', async () => {
    const result = await deviceSwitches.setDeviceSwitch('auto_hr', true);

    expect(native.setDeviceSwitch).toHaveBeenCalledWith('auto_hr', true);
    expect(result).toBe('success');
  });

  it('setDeviceSwitch("stress", false) delegates to native', async () => {
    await deviceSwitches.setDeviceSwitch('stress', false);

    expect(native.setDeviceSwitch).toHaveBeenCalledWith('stress', false);
  });

  it('setDeviceSwitch with invalid type rejects with INVALID_ARGUMENT before calling native', async () => {
    await expect(
      deviceSwitches.setDeviceSwitch('invalid_type' as never, true),
    ).rejects.toMatchObject({ code: 'INVALID_ARGUMENT' });
    expect(native.setDeviceSwitch).not.toHaveBeenCalled();
  });
});
