jest.mock('expo-modules-core', () => ({
  requireNativeModule: jest.fn().mockReturnValue({}),
}));
jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

import { VeepooSDK } from '@/veepoo-sdk';
import type { PersonalInfo } from '@/types/index';
import {
  runSessionBaseline,
  attachSessionBaseline,
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



// ── Tests ───────────────────────────────────────────────────────────

describe('Session baseline helper', () => {
  let native: MockNative;
  let sdk: VeepooSDK;

  beforeEach(async () => {
    native = makeMockNative();
    sdk = new VeepooSDK(native);
    // Wire up native event listeners (required for _emit → emitLocal flow)
    await sdk.init();
  });

  // ── runSessionBaseline ──────────────────────────────────────────

  describe('runSessionBaseline', () => {
    it('calls syncPersonalInfo, readBattery, readDeviceVersion in parallel', async () => {
      const result = await runSessionBaseline(sdk, { personalInfo: PERSONAL_INFO });

      expect(native.syncPersonalInfo).toHaveBeenCalledTimes(1);
      expect(native.syncPersonalInfo).toHaveBeenCalledWith({ sex: 1, height: 175, weight: 70, age: 30, stepAim: 8000, sleepAim: 480 });
      expect(native.readBattery).toHaveBeenCalledTimes(1);
      expect(native.readDeviceVersion).toHaveBeenCalledTimes(1);
      expect(result.personalInfoSynced).toBe(true);
      expect(result.battery).not.toBeNull();
      expect(result.deviceVersion).not.toBeNull();
      expect(result.errors).toEqual({});
    });

    it('captures syncPersonalInfo failure without blocking others', async () => {
      const syncError = new Error('sync failed');
      native.syncPersonalInfo.mockRejectedValueOnce(syncError);

      const result = await runSessionBaseline(sdk, { personalInfo: PERSONAL_INFO });

      expect(result.personalInfoSynced).toBe(false);
      expect(result.battery).not.toBeNull();
      expect(result.deviceVersion).not.toBeNull();
      expect(result.errors.syncPersonalInfo).toBeDefined();
    });

    it('captures readBattery failure without blocking others', async () => {
      native.readBattery.mockRejectedValueOnce(new Error('battery read failed'));

      const result = await runSessionBaseline(sdk, { personalInfo: PERSONAL_INFO });

      expect(result.personalInfoSynced).toBe(true);
      expect(result.battery).toBeNull();
      expect(result.deviceVersion).not.toBeNull();
      expect(result.errors.readBattery).toBeDefined();
    });

    it('captures readDeviceVersion failure without blocking others', async () => {
      native.readDeviceVersion.mockRejectedValueOnce(new Error('version read failed'));

      const result = await runSessionBaseline(sdk, { personalInfo: PERSONAL_INFO });

      expect(result.personalInfoSynced).toBe(true);
      expect(result.battery).not.toBeNull();
      expect(result.deviceVersion).toBeNull();
      expect(result.errors.readDeviceVersion).toBeDefined();
    });

    it('captures all three failures gracefully', async () => {
      native.syncPersonalInfo.mockRejectedValueOnce(new Error('a'));
      native.readBattery.mockRejectedValueOnce(new Error('b'));
      native.readDeviceVersion.mockRejectedValueOnce(new Error('c'));

      const result = await runSessionBaseline(sdk, { personalInfo: PERSONAL_INFO });

      expect(result.personalInfoSynced).toBe(false);
      expect(result.battery).toBeNull();
      expect(result.deviceVersion).toBeNull();
      expect(Object.keys(result.errors)).toHaveLength(3);
    });

    it('never rejects the returned promise', async () => {
      native.syncPersonalInfo.mockRejectedValueOnce(new Error('boom'));
      native.readBattery.mockRejectedValueOnce(new Error('boom'));
      native.readDeviceVersion.mockRejectedValueOnce(new Error('boom'));

      await expect(
        runSessionBaseline(sdk, { personalInfo: PERSONAL_INFO }),
      ).resolves.toBeDefined();
    });
  });

  // ── attachSessionBaseline ───────────────────────────────────────

  describe('attachSessionBaseline', () => {
    it('runs baseline on deviceReady and calls onResult', async () => {
      const results: SessionBaselineResult[] = [];

      attachSessionBaseline(sdk, {
        personalInfo: PERSONAL_INFO,
        onResult: (r) => results.push(r),
      });

      // Simulate deviceReady
      native._emit('deviceReady', { deviceId: 'AA:BB:CC' });

      // Allow async baseline to complete
      await flushPromises();

      expect(results).toHaveLength(1);
      expect(results[0].personalInfoSynced).toBe(true);
      expect(results[0].battery).not.toBeNull();
      expect(results[0].deviceVersion).not.toBeNull();
    });

    it('runs baseline on each deviceReady event', async () => {
      const results: SessionBaselineResult[] = [];

      attachSessionBaseline(sdk, {
        personalInfo: PERSONAL_INFO,
        onResult: (r) => results.push(r),
      });

      native._emit('deviceReady', { deviceId: 'AA:BB:CC' });
      await flushPromises();
      native._emit('deviceReady', { deviceId: 'DD:EE:FF' });
      await flushPromises();

      expect(results).toHaveLength(2);
    });

    it('destroy() stops listening to deviceReady', async () => {
      const results: SessionBaselineResult[] = [];

      const handle = attachSessionBaseline(sdk, {
        personalInfo: PERSONAL_INFO,
        onResult: (r) => results.push(r),
      });

      native._emit('deviceReady', { deviceId: 'AA:BB:CC' });
      await flushPromises();
      expect(results).toHaveLength(1);

      handle.destroy();

      native._emit('deviceReady', { deviceId: 'DD:EE:FF' });
      await flushPromises();
      expect(results).toHaveLength(1); // no new result
    });

    it('destroy() is safe to call multiple times', () => {
      const handle = attachSessionBaseline(sdk, {
        personalInfo: PERSONAL_INFO,
      });

      expect(() => {
        handle.destroy();
        handle.destroy();
        handle.destroy();
      }).not.toThrow();
    });

    it('does not call onResult after destroy even if baseline was in-flight', async () => {
      const results: SessionBaselineResult[] = [];

      // Make syncPersonalInfo slow
      let resolveSync!: () => void;
      native.syncPersonalInfo.mockReturnValueOnce(
        new Promise<boolean>((r) => {
          resolveSync = () => r(true);
        }),
      );

      const handle = attachSessionBaseline(sdk, {
        personalInfo: PERSONAL_INFO,
        onResult: (r) => results.push(r),
      });

      native._emit('deviceReady', { deviceId: 'AA:BB:CC' });

      // Destroy before the baseline finishes
      handle.destroy();

      // Now let the sync resolve
      resolveSync();
      await flushPromises();

      // onResult should NOT have been called
      expect(results).toHaveLength(0);
    });

    it('works without onResult callback', async () => {
      // Should not throw when onResult is omitted
      attachSessionBaseline(sdk, {
        personalInfo: PERSONAL_INFO,
      });

      native._emit('deviceReady', { deviceId: 'AA:BB:CC' });
      await flushPromises();
      // No assertion needed — just verifying no throw
    });

    it('captures failure in onResult.errors when syncPersonalInfo rejects', async () => {
      native.syncPersonalInfo.mockRejectedValueOnce(new Error('sync boom'));
      const results: SessionBaselineResult[] = [];

      attachSessionBaseline(sdk, {
        personalInfo: PERSONAL_INFO,
        onResult: (r) => results.push(r),
      });

      native._emit('deviceReady', { deviceId: 'AA:BB:CC' });
      await flushPromises();

      expect(results).toHaveLength(1);
      expect(results[0].personalInfoSynced).toBe(false);
      expect(results[0].errors.syncPersonalInfo).toBeDefined();
    });
  });
});

// ── Helpers ─────────────────────────────────────────────────────────

function flushPromises(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}
