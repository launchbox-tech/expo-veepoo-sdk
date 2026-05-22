jest.mock('expo-modules-core', () => ({
  requireNativeModule: jest.fn().mockReturnValue({}),
}));
jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

import { VeepooSDK } from '@/veepoo-sdk';
import type {
  PersonalInfo,
  BatteryInfo,
  DeviceVersion,
  VeepooEventPayload,
} from '@/types/index';
import {
  runSessionBaseline,
  attachSessionBaseline,
  type SessionBaselineDeps,
  type SessionBaselineEventSource,
  type SessionBaselineResult,
} from '@/session/session-baseline';
import { makeMockNative, type MockNative } from './helpers/mock-native';

// ── Fixtures ────────────────────────────────────────────────────────

const PERSONAL_INFO: PersonalInfo = {
  sex: 1,
  height: 175,
  weight: 70,
  age: 30,
  step_aim: 8000,
  sleep_aim: 480,
};

const BATTERY_OK: BatteryInfo = {
  level: 80,
  is_charging: false,
  status: 'normal',
};

const VERSION_OK: DeviceVersion = {
  firmware_version: '1.0.0',
  hardware_version: 'HW1',
  device_model: 'M1',
  band_address: 'AA:BB:CC',
  // Spread the rest as required by the type — keep minimal & safe.
} as DeviceVersion;

// ── Narrow fake satisfying SessionBaselineDeps + EventSource ────────

type DeviceReadyListener = (
  payload: VeepooEventPayload['device_ready'],
) => void;

interface FakeBaselineSource extends SessionBaselineDeps, SessionBaselineEventSource {
  emitDeviceReady(payload?: VeepooEventPayload['device_ready']): void;
}

function makeFakeBaselineSource(overrides?: {
  syncPersonalInfo?: jest.Mock;
  readBattery?: jest.Mock;
  readDeviceVersion?: jest.Mock;
}): FakeBaselineSource {
  const listeners = new Set<DeviceReadyListener>();
  return {
    personalInfo: {
      syncPersonalInfo:
        overrides?.syncPersonalInfo ??
        jest.fn().mockResolvedValue(true),
    },
    battery: {
      readBattery:
        overrides?.readBattery ?? jest.fn().mockResolvedValue(BATTERY_OK),
    },
    deviceVersion: {
      readDeviceVersion:
        overrides?.readDeviceVersion ?? jest.fn().mockResolvedValue(VERSION_OK),
    },
    on(event, listener) {
      if (event === 'device_ready') listeners.add(listener);
      return undefined;
    },
    off(event, listener) {
      if (event === 'device_ready') listeners.delete(listener);
      return undefined;
    },
    emitDeviceReady(payload = { device_id: 'AA:BB:CC' } as VeepooEventPayload['device_ready']) {
      for (const l of listeners) l(payload);
    },
  };
}

// ── Tests ───────────────────────────────────────────────────────────

describe('Session baseline helper (narrow fake)', () => {
  describe('runSessionBaseline', () => {
    it('calls syncPersonalInfo, readBattery, readDeviceVersion in parallel', async () => {
      const fake = makeFakeBaselineSource();

      const result = await runSessionBaseline(fake, { personalInfo: PERSONAL_INFO });

      expect(fake.personalInfo.syncPersonalInfo).toHaveBeenCalledTimes(1);
      expect(fake.personalInfo.syncPersonalInfo).toHaveBeenCalledWith(PERSONAL_INFO);
      expect(fake.battery.readBattery).toHaveBeenCalledTimes(1);
      expect(fake.deviceVersion.readDeviceVersion).toHaveBeenCalledTimes(1);
      expect(result.personalInfoSynced).toBe(true);
      expect(result.battery).toEqual(BATTERY_OK);
      expect(result.deviceVersion).toEqual(VERSION_OK);
      expect(result.errors).toEqual({});
    });

    it('captures syncPersonalInfo failure without blocking others', async () => {
      const fake = makeFakeBaselineSource({
        syncPersonalInfo: jest.fn().mockRejectedValue(new Error('sync failed')),
      });

      const result = await runSessionBaseline(fake, { personalInfo: PERSONAL_INFO });

      expect(result.personalInfoSynced).toBe(false);
      expect(result.battery).toEqual(BATTERY_OK);
      expect(result.deviceVersion).toEqual(VERSION_OK);
      expect(result.errors.syncPersonalInfo).toBeDefined();
    });

    it('captures readBattery failure without blocking others', async () => {
      const fake = makeFakeBaselineSource({
        readBattery: jest.fn().mockRejectedValue(new Error('battery read failed')),
      });

      const result = await runSessionBaseline(fake, { personalInfo: PERSONAL_INFO });

      expect(result.personalInfoSynced).toBe(true);
      expect(result.battery).toBeNull();
      expect(result.deviceVersion).toEqual(VERSION_OK);
      expect(result.errors.readBattery).toBeDefined();
    });

    it('captures readDeviceVersion failure without blocking others', async () => {
      const fake = makeFakeBaselineSource({
        readDeviceVersion: jest
          .fn()
          .mockRejectedValue(new Error('version read failed')),
      });

      const result = await runSessionBaseline(fake, { personalInfo: PERSONAL_INFO });

      expect(result.personalInfoSynced).toBe(true);
      expect(result.battery).toEqual(BATTERY_OK);
      expect(result.deviceVersion).toBeNull();
      expect(result.errors.readDeviceVersion).toBeDefined();
    });

    it('captures all three failures gracefully', async () => {
      const fake = makeFakeBaselineSource({
        syncPersonalInfo: jest.fn().mockRejectedValue(new Error('a')),
        readBattery: jest.fn().mockRejectedValue(new Error('b')),
        readDeviceVersion: jest.fn().mockRejectedValue(new Error('c')),
      });

      const result = await runSessionBaseline(fake, { personalInfo: PERSONAL_INFO });

      expect(result.personalInfoSynced).toBe(false);
      expect(result.battery).toBeNull();
      expect(result.deviceVersion).toBeNull();
      expect(Object.keys(result.errors)).toHaveLength(3);
    });

    it('never rejects the returned promise', async () => {
      const fake = makeFakeBaselineSource({
        syncPersonalInfo: jest.fn().mockRejectedValue(new Error('boom')),
        readBattery: jest.fn().mockRejectedValue(new Error('boom')),
        readDeviceVersion: jest.fn().mockRejectedValue(new Error('boom')),
      });

      await expect(
        runSessionBaseline(fake, { personalInfo: PERSONAL_INFO }),
      ).resolves.toBeDefined();
    });
  });

  describe('attachSessionBaseline', () => {
    it('runs baseline on device_ready and calls onResult', async () => {
      const fake = makeFakeBaselineSource();
      const results: SessionBaselineResult[] = [];

      attachSessionBaseline(fake, {
        personalInfo: PERSONAL_INFO,
        onResult: (r) => results.push(r),
      });

      fake.emitDeviceReady();
      await flushPromises();

      expect(results).toHaveLength(1);
      expect(results[0].personalInfoSynced).toBe(true);
      expect(results[0].battery).toEqual(BATTERY_OK);
      expect(results[0].deviceVersion).toEqual(VERSION_OK);
    });

    it('runs baseline on each device_ready event', async () => {
      const fake = makeFakeBaselineSource();
      const results: SessionBaselineResult[] = [];

      attachSessionBaseline(fake, {
        personalInfo: PERSONAL_INFO,
        onResult: (r) => results.push(r),
      });

      fake.emitDeviceReady();
      await flushPromises();
      fake.emitDeviceReady({ device_id: 'DD:EE:FF' } as VeepooEventPayload['device_ready']);
      await flushPromises();

      expect(results).toHaveLength(2);
    });

    it('destroy() stops listening to device_ready', async () => {
      const fake = makeFakeBaselineSource();
      const results: SessionBaselineResult[] = [];

      const handle = attachSessionBaseline(fake, {
        personalInfo: PERSONAL_INFO,
        onResult: (r) => results.push(r),
      });

      fake.emitDeviceReady();
      await flushPromises();
      expect(results).toHaveLength(1);

      handle.destroy();

      fake.emitDeviceReady();
      await flushPromises();
      expect(results).toHaveLength(1);
    });

    it('destroy() is safe to call multiple times', () => {
      const fake = makeFakeBaselineSource();
      const handle = attachSessionBaseline(fake, { personalInfo: PERSONAL_INFO });

      expect(() => {
        handle.destroy();
        handle.destroy();
        handle.destroy();
      }).not.toThrow();
    });

    it('does not call onResult after destroy even if baseline was in-flight', async () => {
      let resolveSync!: (v: boolean) => void;
      const slowSync = jest.fn().mockReturnValueOnce(
        new Promise<boolean>((r) => {
          resolveSync = r;
        }),
      );

      const fake = makeFakeBaselineSource({ syncPersonalInfo: slowSync });
      const results: SessionBaselineResult[] = [];

      const handle = attachSessionBaseline(fake, {
        personalInfo: PERSONAL_INFO,
        onResult: (r) => results.push(r),
      });

      fake.emitDeviceReady();
      handle.destroy();
      resolveSync(true);
      await flushPromises();

      expect(results).toHaveLength(0);
    });

    it('works without onResult callback', async () => {
      const fake = makeFakeBaselineSource();

      attachSessionBaseline(fake, { personalInfo: PERSONAL_INFO });

      fake.emitDeviceReady();
      await flushPromises();
    });
  });
});

// Regression: prove `VeepooSDK` still satisfies the narrow interface. One
// integration test is enough — the rest belong against the fake above.
describe('Session baseline (VeepooSDK satisfies SessionBaselineDeps)', () => {
  let native: MockNative;
  let sdk: VeepooSDK;

  beforeEach(async () => {
    native = makeMockNative();
    sdk = new VeepooSDK(native);
    await sdk.init();
  });

  it('accepts a real VeepooSDK as the dependency', async () => {
    // Compile-time check via type position
    const deps: SessionBaselineDeps = sdk;

    const result = await runSessionBaseline(deps, { personalInfo: PERSONAL_INFO });

    expect(native.syncPersonalInfo).toHaveBeenCalledTimes(1);
    expect(native.readBattery).toHaveBeenCalledTimes(1);
    expect(native.readDeviceVersion).toHaveBeenCalledTimes(1);
    expect(result.personalInfoSynced).toBe(true);
    expect(result.battery).not.toBeNull();
    expect(result.deviceVersion).not.toBeNull();
  });
});

// ── Helpers ─────────────────────────────────────────────────────────

function flushPromises(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}
