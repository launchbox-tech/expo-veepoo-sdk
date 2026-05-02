jest.mock('expo-modules-core', () => ({
  requireNativeModule: jest.fn().mockReturnValue({}),
}));
jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

import { VeepooSDK } from '../VeepooSDK';
import type { NativeVeepooSDKInterface } from '../NativeVeepooSDK';

type MockNative = jest.Mocked<NativeVeepooSDKInterface> & {
  _emit(event: string, payload: unknown): void;
};

function makeMockNative(): MockNative {
  const listeners = new Map<string, Set<(p: unknown) => void>>();
  return {
    init: jest.fn().mockResolvedValue(undefined),
    isBluetoothEnabled: jest.fn().mockResolvedValue(true),
    requestPermissions: jest.fn().mockResolvedValue({ granted: true, status: 'granted', canAskAgain: false }),
    startScan: jest.fn().mockResolvedValue(undefined),
    stopScan: jest.fn().mockResolvedValue(undefined),
    connect: jest.fn().mockResolvedValue(undefined),
    disconnect: jest.fn().mockResolvedValue(undefined),
    getConnectionStatus: jest.fn().mockResolvedValue('connected' as const),
    verifyPassword: jest.fn().mockResolvedValue({ status: 'CHECK_SUCCESS' }),
    readBattery: jest.fn().mockResolvedValue({ level: 80, state: 0 }),
    syncPersonalInfo: jest.fn().mockResolvedValue(true),
    readDeviceFunctions: jest.fn().mockResolvedValue({}),
    readSocialMsgData: jest.fn().mockResolvedValue({}),
    readDeviceVersion: jest.fn().mockResolvedValue({}),
    startReadOriginData: jest.fn().mockResolvedValue(undefined),
    readDeviceAllData: jest.fn().mockResolvedValue(true),
    readSleepData: jest.fn().mockResolvedValue([]),
    readSportStepData: jest.fn().mockResolvedValue({}),
    readOriginData: jest.fn().mockResolvedValue([]),
    readDaySummaryData: jest.fn().mockResolvedValue({}),
    readAutoMeasureSetting: jest.fn().mockResolvedValue([]),
    modifyAutoMeasureSetting: jest.fn().mockResolvedValue([]),
    setLanguage: jest.fn().mockResolvedValue(true),
    startHeartRateTest: jest.fn().mockResolvedValue(undefined),
    stopHeartRateTest: jest.fn().mockResolvedValue(undefined),
    startBloodPressureTest: jest.fn().mockResolvedValue(undefined),
    stopBloodPressureTest: jest.fn().mockResolvedValue(undefined),
    startBloodOxygenTest: jest.fn().mockResolvedValue(undefined),
    stopBloodOxygenTest: jest.fn().mockResolvedValue(undefined),
    startTemperatureTest: jest.fn().mockResolvedValue(undefined),
    stopTemperatureTest: jest.fn().mockResolvedValue(undefined),
    startStressTest: jest.fn().mockResolvedValue(undefined),
    stopStressTest: jest.fn().mockResolvedValue(undefined),
    startBloodGlucoseTest: jest.fn().mockResolvedValue(undefined),
    stopBloodGlucoseTest: jest.fn().mockResolvedValue(undefined),
    startHrvTest: jest.fn().mockResolvedValue(undefined),
    stopHrvTest: jest.fn().mockResolvedValue(undefined),
    startEcgTest: jest.fn().mockResolvedValue(undefined),
    stopEcgTest: jest.fn().mockResolvedValue(undefined),
    startFatigueTest: jest.fn().mockResolvedValue(undefined),
    stopFatigueTest: jest.fn().mockResolvedValue(undefined),
    startBreathingTest: jest.fn().mockResolvedValue(undefined),
    stopBreathingTest: jest.fn().mockResolvedValue(undefined),
    addListener: jest.fn().mockImplementation((event: string, listener: (p: unknown) => void) => {
      if (!listeners.has(event)) listeners.set(event, new Set());
      listeners.get(event)!.add(listener);
      return {
        remove: jest.fn().mockImplementation(() => {
          listeners.get(event)?.delete(listener);
        }),
      };
    }),
    removeListeners: jest.fn(),
    readHeartRateAlarm: jest.fn().mockResolvedValue({
      enabled: true,
      highThreshold: 120,
      lowThreshold: 60,
    }),
    setHeartRateAlarm: jest.fn().mockResolvedValue('success'),
    _emit(event: string, payload: unknown) {
      listeners.get(event)?.forEach(l => l(payload));
    },
  };
}

// ── VeepooSDK class ───────────────────────────────────────────────────────────

describe('VeepooSDK', () => {
  let native: MockNative;
  let sdk: VeepooSDK;

  beforeEach(() => {
    native = makeMockNative();
    // @ts-ignore — constructor injection will be added in the refactoring
    sdk = new VeepooSDK(native);
  });

  // ── State accessors ────────────────────────────────────────────────────────
  describe('state accessors', () => {
    it('isSDKInitialized() is false before init', () => {
      expect(sdk.isSDKInitialized()).toBe(false);
    });
    it('isScanningActive() is false initially', () => {
      expect(sdk.isScanningActive()).toBe(false);
    });
    it('getConnectedDeviceId() is null initially', () => {
      expect(sdk.getConnectedDeviceId()).toBeNull();
    });
  });

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  describe('lifecycle', () => {
    it('init() calls native.init() once and sets isSDKInitialized', async () => {
      await sdk.init();
      expect(native.init).toHaveBeenCalledTimes(1);
      expect(sdk.isSDKInitialized()).toBe(true);
    });

    it('init() is idempotent — second call skips native.init()', async () => {
      await sdk.init();
      await sdk.init();
      expect(native.init).toHaveBeenCalledTimes(1);
    });

    it('destroy() resets all state fields', async () => {
      await sdk.init();
      await sdk.connect('device-1');
      await sdk.startScan();
      sdk.destroy();
      expect(sdk.isSDKInitialized()).toBe(false);
      expect(sdk.isScanningActive()).toBe(false);
      expect(sdk.getConnectedDeviceId()).toBeNull();
    });

    it('destroy() calls remove() on registered native subscriptions', async () => {
      await sdk.init();
      const firstSub = (native.addListener as jest.Mock).mock.results[0]?.value as { remove: jest.Mock };
      sdk.destroy();
      expect(firstSub?.remove).toHaveBeenCalled();
    });

    it('destroy() clears JS listeners so post-destroy _emit has no effect', async () => {
      await sdk.init();
      const listener = jest.fn();
      sdk.on('deviceFound', listener);
      sdk.destroy();
      native._emit('deviceFound', { device: { id: 'x', name: 'T', rssi: -50 }, timestamp: 1 });
      expect(listener).not.toHaveBeenCalled();
    });
  });

  // ── Band Discovery (scanning) ──────────────────────────────────────────────
  describe('Band Discovery (scanning)', () => {
    beforeEach(async () => { await sdk.init(); });

    it('startScan() calls native.startScan and sets isScanningActive', async () => {
      await sdk.startScan();
      expect(native.startScan).toHaveBeenCalledTimes(1);
      expect(sdk.isScanningActive()).toBe(true);
    });

    it('startScan() is idempotent when already scanning', async () => {
      await sdk.startScan();
      await sdk.startScan();
      expect(native.startScan).toHaveBeenCalledTimes(1);
    });

    it('startScan() clears isScanningActive on native error', async () => {
      native.startScan.mockRejectedValueOnce(new Error('BT error'));
      await expect(sdk.startScan()).rejects.toBeDefined();
      expect(sdk.isScanningActive()).toBe(false);
    });

    it('stopScan() calls native.stopScan and clears isScanningActive', async () => {
      await sdk.startScan();
      await sdk.stopScan();
      expect(native.stopScan).toHaveBeenCalledTimes(1);
      expect(sdk.isScanningActive()).toBe(false);
    });

    it('stopScan() is idempotent when not scanning', async () => {
      await sdk.stopScan();
      expect(native.stopScan).not.toHaveBeenCalled();
    });
  });

  // ── Session (connection) ───────────────────────────────────────────────────
  describe('Session (connection)', () => {
    beforeEach(async () => { await sdk.init(); });

    it('connect(id) calls native.connect and stores connectedDeviceId', async () => {
      await sdk.connect('device-1');
      expect(native.connect).toHaveBeenCalledWith('device-1', undefined);
      expect(sdk.getConnectedDeviceId()).toBe('device-1');
    });

    it('connect() throws and emits error event on failure', async () => {
      native.connect.mockRejectedValueOnce(new Error('conn failed'));
      const errorListener = jest.fn();
      sdk.on('error', errorListener);
      await expect(sdk.connect('device-1')).rejects.toBeDefined();
      expect(errorListener).toHaveBeenCalledWith(
        expect.objectContaining({ code: 'CONNECTION_FAILED' })
      );
    });

    it('disconnect(id) calls native.disconnect with the given ID', async () => {
      await sdk.connect('device-1');
      await sdk.disconnect('device-1');
      expect(native.disconnect).toHaveBeenCalledWith('device-1');
    });

    it('disconnect() falls back to stored connectedDeviceId and clears it', async () => {
      await sdk.connect('device-1');
      await sdk.disconnect();
      expect(native.disconnect).toHaveBeenCalledWith('device-1');
      expect(sdk.getConnectedDeviceId()).toBeNull();
    });

    it('disconnect() is a no-op when no Band is connected', async () => {
      await sdk.disconnect();
      expect(native.disconnect).not.toHaveBeenCalled();
    });

    it('getConnectionStatus() returns disconnected when no Band ID is available', async () => {
      const status = await sdk.getConnectionStatus();
      expect(status).toBe('disconnected');
      expect(native.getConnectionStatus).not.toHaveBeenCalled();
    });

    it('getConnectionStatus() delegates to native when Band ID is available', async () => {
      await sdk.connect('device-1');
      native.getConnectionStatus.mockResolvedValueOnce('connected');
      const status = await sdk.getConnectionStatus();
      expect(native.getConnectionStatus).toHaveBeenCalledWith('device-1');
      expect(status).toBe('connected');
    });
  });

  // ── Event system ───────────────────────────────────────────────────────────
  describe('event system', () => {
    beforeEach(async () => { await sdk.init(); });

    it('on() registers a listener and returns this', () => {
      const listener = jest.fn();
      const result = sdk.on('deviceFound', listener);
      expect(result).toBe(sdk);
      native._emit('deviceFound', { device: { id: 'x', name: 'T', rssi: -50 }, timestamp: 1 });
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('off() removes a listener and returns this', () => {
      const listener = jest.fn();
      sdk.on('deviceFound', listener);
      const result = sdk.off('deviceFound', listener);
      expect(result).toBe(sdk);
      native._emit('deviceFound', { device: { id: 'x', name: 'T', rssi: -50 }, timestamp: 1 });
      expect(listener).not.toHaveBeenCalled();
    });

    it('once() fires exactly once — regression test for the wrapper-deletion bug', () => {
      const listener = jest.fn();
      sdk.once('deviceFound', listener);
      const payload = { device: { id: 'x', name: 'T', rssi: -50 }, timestamp: 1 };
      native._emit('deviceFound', payload);
      native._emit('deviceFound', payload);
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('once() returns this', () => {
      expect(sdk.once('deviceFound', jest.fn())).toBe(sdk);
    });

    it('removeAllListeners() clears all events', () => {
      const l1 = jest.fn();
      const l2 = jest.fn();
      sdk.on('deviceFound', l1);
      sdk.on('deviceConnected', l2);
      sdk.removeAllListeners();
      native._emit('deviceFound', { device: { id: 'x', name: 'T', rssi: -50 }, timestamp: 1 });
      native._emit('deviceConnected', { deviceId: 'x' });
      expect(l1).not.toHaveBeenCalled();
      expect(l2).not.toHaveBeenCalled();
    });

    it('removeAllListeners(event) clears only that event', () => {
      const l1 = jest.fn();
      const l2 = jest.fn();
      sdk.on('deviceFound', l1);
      sdk.on('deviceConnected', l2);
      sdk.removeAllListeners('deviceFound');
      native._emit('deviceFound', { device: { id: 'x', name: 'T', rssi: -50 }, timestamp: 1 });
      native._emit('deviceConnected', { deviceId: 'x' });
      expect(l1).not.toHaveBeenCalled();
      expect(l2).toHaveBeenCalledTimes(1);
    });

    it('listener receives the normalized payload', () => {
      const listener = jest.fn();
      sdk.on('bluetoothStateChanged', listener);
      native._emit('bluetoothStateChanged', {
        state: 5, authorization: 3, isScanning: false, pendingScanStart: false,
      });
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({ state: 'poweredOn', authorization: 'allowedAlways' })
      );
    });

    it('error thrown in a listener is caught and does not propagate', () => {
      const badListener = jest.fn().mockImplementation(() => { throw new Error('boom'); });
      sdk.on('deviceFound', badListener);
      expect(() => {
        native._emit('deviceFound', { device: { id: 'x', name: 'T', rssi: -50 }, timestamp: 1 });
      }).not.toThrow();
    });
  });

  // ── State mutations via events ─────────────────────────────────────────────
  describe('state mutations via events', () => {
    beforeEach(async () => { await sdk.init(); });

    it('bluetoothStateChanged { isScanning: true } sets isScanningActive', () => {
      native._emit('bluetoothStateChanged', {
        state: 5, authorization: 3, isScanning: true, pendingScanStart: false,
      });
      expect(sdk.isScanningActive()).toBe(true);
    });

    it('bluetoothStateChanged { isScanning: false } clears isScanningActive', async () => {
      await sdk.startScan();
      native._emit('bluetoothStateChanged', {
        state: 5, authorization: 3, isScanning: false, pendingScanStart: false,
      });
      expect(sdk.isScanningActive()).toBe(false);
    });

    it('deviceConnected event sets connectedDeviceId', () => {
      native._emit('deviceConnected', { deviceId: 'device-99' });
      expect(sdk.getConnectedDeviceId()).toBe('device-99');
    });

    it('deviceDisconnected clears connectedDeviceId and isScanningActive', async () => {
      await sdk.startScan();
      native._emit('deviceConnected', { deviceId: 'device-99' });
      native._emit('deviceDisconnected', { deviceId: 'device-99' });
      expect(sdk.getConnectedDeviceId()).toBeNull();
      expect(sdk.isScanningActive()).toBe(false);
    });

    it('deviceConnectStatus with disconnected clears connectedDeviceId', () => {
      native._emit('deviceConnected', { deviceId: 'device-1' });
      native._emit('deviceConnectStatus', { deviceId: 'device-1', status: 'disconnected' });
      expect(sdk.getConnectedDeviceId()).toBeNull();
    });

    it('connectionStatusChanged with disconnected clears connectedDeviceId', () => {
      native._emit('deviceConnected', { deviceId: 'device-1' });
      native._emit('connectionStatusChanged', { deviceId: 'device-1', status: 'disconnected' });
      expect(sdk.getConnectedDeviceId()).toBeNull();
    });

    describe('readOriginProgress deduplication', () => {
      const progress = (value: number, readState = 'reading') => ({
        deviceId: 'd1',
        progress: { readState, totalDays: 10, currentDay: 1, progress: value },
      });

      it('first event dispatches', () => {
        const listener = jest.fn();
        sdk.on('readOriginProgress', listener);
        native._emit('readOriginProgress', progress(50));
        expect(listener).toHaveBeenCalledTimes(1);
      });

      it('exact duplicate value is suppressed', () => {
        const listener = jest.fn();
        sdk.on('readOriginProgress', listener);
        native._emit('readOriginProgress', progress(50));
        native._emit('readOriginProgress', progress(50));
        expect(listener).toHaveBeenCalledTimes(1);
      });

      it('smaller value (backward reset) dispatches', () => {
        const listener = jest.fn();
        sdk.on('readOriginProgress', listener);
        native._emit('readOriginProgress', progress(80));
        native._emit('readOriginProgress', progress(10));
        expect(listener).toHaveBeenCalledTimes(2);
      });

      it('readState "start" always dispatches regardless of repeated value', () => {
        const listener = jest.fn();
        sdk.on('readOriginProgress', listener);
        native._emit('readOriginProgress', progress(50));
        native._emit('readOriginProgress', progress(50, 'start'));
        expect(listener).toHaveBeenCalledTimes(2);
      });
    });
  });

  // ── Error handling ─────────────────────────────────────────────────────────
  describe('error handling', () => {
    beforeEach(async () => { await sdk.init(); });

    it('checkBluetoothStatus() returns false and emits error on native failure', async () => {
      native.isBluetoothEnabled.mockRejectedValueOnce(new Error('BT fail'));
      const errorListener = jest.fn();
      sdk.on('error', errorListener);
      const result = await sdk.checkBluetoothStatus();
      expect(result).toBe(false);
      expect(errorListener).toHaveBeenCalledWith(
        expect.objectContaining({ code: 'UNKNOWN' })
      );
    });

    it('requestPermissions() returns denied result on native failure', async () => {
      native.requestPermissions.mockRejectedValueOnce(new Error('perm fail'));
      const result = await sdk.requestPermissions();
      expect(result.granted).toBe(false);
      expect(result.status).toBe('denied');
    });
  });

  // ── Logging ────────────────────────────────────────────────────────────────
  describe('logging', () => {
    it('setLogEnabled(true) is chainable and mutates isLogEnabled()', () => {
      expect(sdk.setLogEnabled(true)).toBe(sdk);
      expect(sdk.isLogEnabled()).toBe(true);
    });

    it('setLogEnabled(false) is chainable and clears isLogEnabled()', () => {
      sdk.setLogEnabled(true);
      expect(sdk.setLogEnabled(false)).toBe(sdk);
      expect(sdk.isLogEnabled()).toBe(false);
    });

    it('setLogger(fn) is chainable', () => {
      expect(sdk.setLogger(jest.fn())).toBe(sdk);
    });

    it('when logEnabled is true console methods are called', async () => {
      sdk.setLogEnabled(true);
      const spy = jest.spyOn(console, 'info').mockImplementation(() => {});
      await sdk.init();
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });

    it('when logger is set callback is invoked', async () => {
      const logger = jest.fn();
      sdk.setLogger(logger);
      await sdk.init();
      expect(logger).toHaveBeenCalled();
    });

    it('logger callback that throws is caught silently', async () => {
      const logger = jest.fn().mockImplementation(() => { throw new Error('logger boom'); });
      sdk.setLogger(logger);
      await expect(Promise.resolve(sdk.init())).resolves.toBeUndefined();
    });

    it('suppresses console output when __DEV__ is false (production mode)', async () => {
      const origDev = (globalThis as any).__DEV__;
      (globalThis as any).__DEV__ = false;
      sdk.setLogEnabled(true);
      const spy = jest.spyOn(console, 'info').mockImplementation(() => {});
      await sdk.init();
      expect(spy).not.toHaveBeenCalled();
      spy.mockRestore();
      (globalThis as any).__DEV__ = origDev;
    });
  });

  // ── Arrow function pass-throughs ───────────────────────────────────────────
  describe('arrow function pass-throughs', () => {
    beforeEach(async () => { await sdk.init(); });

    it('syncPersonalInfo delegates to native.syncPersonalInfo', async () => {
      const info = { sex: 1 as const, height: 175, weight: 70, age: 30, stepAim: 8000, sleepAim: 480 };
      await sdk.syncPersonalInfo(info);
      expect(native.syncPersonalInfo).toHaveBeenCalledWith(info);
    });

    it('readDeviceAllData delegates to native.readDeviceAllData and returns result', async () => {
      native.readDeviceAllData.mockResolvedValueOnce(true);
      const result = await sdk.readDeviceAllData();
      expect(native.readDeviceAllData).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('setLanguage delegates to native.setLanguage', async () => {
      await sdk.setLanguage('english');
      expect(native.setLanguage).toHaveBeenCalledWith('english');
    });

    it('readHeartRateAlarm delegates to native, normalizes, and emits heartRateAlarmData', async () => {
      const listener = jest.fn();
      sdk.on('heartRateAlarmData', listener);
      const result = await sdk.readHeartRateAlarm();
      expect(native.readHeartRateAlarm).toHaveBeenCalled();
      expect(result.highThreshold).toBe(120);
      expect(result.lowThreshold).toBe(60);
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          deviceId: '',
          data: expect.objectContaining({ highThreshold: 120, lowThreshold: 60, enabled: true }),
        }),
      );
    });

    it('setHeartRateAlarm validates then delegates to native and emits heartRateAlarmData', async () => {
      const listener = jest.fn();
      sdk.on('heartRateAlarmData', listener);
      const alarm = { enabled: true, highThreshold: 120, lowThreshold: 50 };
      const status = await sdk.setHeartRateAlarm(alarm);
      expect(native.setHeartRateAlarm).toHaveBeenCalledWith(alarm);
      expect(status).toBe('success');
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({ deviceId: '', data: alarm }),
      );
    });

    it('setHeartRateAlarm throws INVALID_ARGUMENT when highThreshold <= lowThreshold', async () => {
      await expect(
        sdk.setHeartRateAlarm({ enabled: true, highThreshold: 80, lowThreshold: 100 }),
      ).rejects.toMatchObject({ code: 'INVALID_ARGUMENT' });
      expect(native.setHeartRateAlarm).not.toHaveBeenCalled();
    });
  });

  // ── Data methods ───────────────────────────────────────────────────────────
  describe('data methods', () => {
    beforeEach(async () => { await sdk.init(); });

    it('readBattery() calls native and returns normalized BatteryInfo', async () => {
      native.readBattery.mockResolvedValueOnce({ level: 80, state: 0 });
      const result = await sdk.readBattery();
      expect(native.readBattery).toHaveBeenCalled();
      expect(result.level).toBe(80);
    });

    it('readSleepData(date) passes date to native', async () => {
      await sdk.readSleepData('2024-01-01');
      expect(native.readSleepData).toHaveBeenCalledWith('2024-01-01');
    });

    it('readSleepData() without date passes undefined', async () => {
      await sdk.readSleepData();
      expect(native.readSleepData).toHaveBeenCalledWith(undefined);
    });

    it('readOriginData(dayOffset) passes offset and returns normalized list', async () => {
      native.readOriginData.mockResolvedValueOnce([{ time: '12:00', heartValue: 72 }]);
      const result = await sdk.readOriginData(1);
      expect(native.readOriginData).toHaveBeenCalledWith(1);
      expect(result[0].heartValue).toBe(72);
    });

    it('startHeartRateTest() delegates to native', async () => {
      await sdk.startHeartRateTest();
      expect(native.startHeartRateTest).toHaveBeenCalled();
    });

    it('stopHeartRateTest() delegates to native', async () => {
      await sdk.stopHeartRateTest();
      expect(native.stopHeartRateTest).toHaveBeenCalled();
    });

    it('startHrvTest() delegates to native', async () => {
      await sdk.startHrvTest();
      expect(native.startHrvTest).toHaveBeenCalled();
    });

    it('startEcgTest({ includeWaveform: true }) passes options to native', async () => {
      await sdk.startEcgTest({ includeWaveform: true });
      expect(native.startEcgTest).toHaveBeenCalledWith({ includeWaveform: true });
    });

    it('stopFatigueTest() delegates to native', async () => {
      await sdk.stopFatigueTest();
      expect(native.stopFatigueTest).toHaveBeenCalled();
    });
  });
});
