jest.mock('expo-modules-core', () => ({
  requireNativeModule: jest.fn().mockReturnValue({}),
}));
jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

import { VeepooSDK } from '@/veepoo-sdk';
import { RealtimeTest } from '@/types/index';
import { makeMockNative, type MockNative } from './helpers/mock-native';

// ── VeepooSDK class ───────────────────────────────────────────────────────────

describe('VeepooSDK', () => {
  let native: MockNative;
  let sdk: VeepooSDK;

  beforeEach(() => {
    native = makeMockNative();
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

    it('connect() maps native CONNECTION_FAILED rejection code for host branching', async () => {
      native.connect.mockRejectedValueOnce(
        Object.assign(new Error('ble'), { code: 'CONNECTION_FAILED' }),
      );
      const errorListener = jest.fn();
      sdk.on('error', errorListener);
      await expect(sdk.connect('device-1')).rejects.toMatchObject({
        code: 'CONNECTION_FAILED',
      });
      expect(errorListener).toHaveBeenCalledWith(
        expect.objectContaining({ code: 'CONNECTION_FAILED' }),
      );
    });

    it('handshake path: scan → connect → verifyPassword', async () => {
      await sdk.startScan();
      await sdk.connect('band-1');
      const pwd = await sdk.verifyPassword('0000', false);
      expect(pwd.status).toBe('CHECK_SUCCESS');
      expect(native.startScan).toHaveBeenCalled();
      expect(native.connect).toHaveBeenCalledWith('band-1', undefined);
      expect(native.verifyPassword).toHaveBeenCalledWith('0000', false);
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
        expect.objectContaining({ state: 'powered_on', authorization: 'allowed_always' })
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
      const info = { sex: 1 as const, height: 175, weight: 70, age: 30, step_aim: 8000, sleep_aim: 480 };
      await sdk.syncPersonalInfo(info);
      expect(native.syncPersonalInfo).toHaveBeenCalledWith({ sex: 1, height: 175, weight: 70, age: 30, stepAim: 8000, sleepAim: 480 });
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
      expect(result.high_threshold).toBe(120);
      expect(result.low_threshold).toBe(60);
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          device_id: '',
          data: expect.objectContaining({ high_threshold: 120, low_threshold: 60, enabled: true }),
        }),
      );
    });

    it('setHeartRateAlarm validates then delegates to native and emits heartRateAlarmData', async () => {
      const listener = jest.fn();
      sdk.on('heartRateAlarmData', listener);
      const alarm = { enabled: true, high_threshold: 120, low_threshold: 50 };
      const status = await sdk.setHeartRateAlarm(alarm);
      expect(native.setHeartRateAlarm).toHaveBeenCalledWith({ enabled: true, highThreshold: 120, lowThreshold: 50 });
      expect(status).toBe('success');
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({ device_id: '', data: alarm }),
      );
    });

    it('setHeartRateAlarm throws INVALID_ARGUMENT when high_threshold <= low_threshold', async () => {
      await expect(
        sdk.setHeartRateAlarm({ enabled: true, high_threshold: 80, low_threshold: 100 }),
      ).rejects.toMatchObject({ code: 'INVALID_ARGUMENT' });
      expect(native.setHeartRateAlarm).not.toHaveBeenCalled();
    });

    it('readWatchFaceStyle passes null to native when dialType omitted', async () => {
      native.readWatchFaceStyle.mockResolvedValueOnce({
        dialType: 'default',
        screenIndex: 3,
        operationSuccess: true,
      });
      const r = await sdk.readWatchFaceStyle();
      expect(native.readWatchFaceStyle).toHaveBeenCalledWith(null);
      expect(r.dial_type).toBe('default');
      expect(r.screen_index).toBe(3);
    });

    it('readWatchFaceStyle passes dialType when set', async () => {
      native.readWatchFaceStyle.mockResolvedValueOnce({
        dialType: 'market',
        screenIndex: 0,
        operationSuccess: true,
      });
      await sdk.readWatchFaceStyle({ dial_type: 'market' });
      expect(native.readWatchFaceStyle).toHaveBeenCalledWith({ dialType: 'market' });
    });

    it('setWatchFaceStyle sends default dialType when omitted', async () => {
      await sdk.setWatchFaceStyle({ screen_index: 2 });
      expect(native.setWatchFaceStyle).toHaveBeenCalledWith({ screenIndex: 2, dialType: 'default' });
    });

    it('setWatchFaceStyle forwards explicit dialType', async () => {
      await sdk.setWatchFaceStyle({ screen_index: 1, dial_type: 'photo' });
      expect(native.setWatchFaceStyle).toHaveBeenCalledWith({ screenIndex: 1, dialType: 'photo' });
    });

    it('startTest(RealtimeTest.BODY_COMPOSITION) delegates to native', async () => {
      await sdk.startTest(RealtimeTest.BODY_COMPOSITION);
      expect(native.startBodyCompositionTest).toHaveBeenCalled();
    });

    it('stopTest(RealtimeTest.BODY_COMPOSITION) delegates to native', async () => {
      await sdk.stopTest(RealtimeTest.BODY_COMPOSITION);
      expect(native.stopBodyCompositionTest).toHaveBeenCalled();
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
      expect(result[0].heart_value).toBe(72);
    });

    it('readSportStepData(date) normalizes step alias to stepCount', async () => {
      native.readSportStepData.mockResolvedValueOnce({ date: '2024-01-02', step: 5000 });
      const result = await sdk.readSportStepData('2024-01-02');
      expect(native.readSportStepData).toHaveBeenCalledWith('2024-01-02');
      expect(result.step_count).toBe(5000);
    });

    it('readDaySummaryData(dayOffset) returns normalized DaySummaryData', async () => {
      native.readDaySummaryData.mockResolvedValueOnce({
        date: '2024-06-01',
        allStep: 100,
        sportList: [],
        rateList: [],
        bpList: [],
      });
      const result = await sdk.readDaySummaryData(0);
      expect(native.readDaySummaryData).toHaveBeenCalledWith(0);
      expect(result.date).toBe('2024-06-01');
      expect(result.all_step).toBe(100);
    });

    it('readDeviceVersion() returns normalized DeviceVersion', async () => {
      native.readDeviceVersion.mockResolvedValueOnce({
        hardwareVersion: '1',
        softwareVersion: '2',
      });
      const result = await sdk.readDeviceVersion();
      expect(native.readDeviceVersion).toHaveBeenCalled();
      expect(result.hardware_version).toBe('1');
      expect(result.software_version).toBe('2');
    });

    it('readAutoMeasureSetting() returns normalized list', async () => {
      native.readAutoMeasureSetting.mockResolvedValueOnce([
        { funType: 1, measureInterval: 30 },
      ]);
      const result = await sdk.readAutoMeasureSetting();
      expect(native.readAutoMeasureSetting).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0].measure_interval).toBe(30);
    });

    it('startReadOriginData() delegates to native', async () => {
      await sdk.startReadOriginData();
      expect(native.startReadOriginData).toHaveBeenCalled();
    });

    it('startTest(RealtimeTest.HEART_RATE) delegates to native', async () => {
      await sdk.startTest(RealtimeTest.HEART_RATE);
      expect(native.startHeartRateTest).toHaveBeenCalled();
    });

    it('startTest(RealtimeTest.HEART_RATE) preserves REALTIME_TEST_IN_PROGRESS from native', async () => {
      native.startHeartRateTest.mockRejectedValueOnce({
        code: 'REALTIME_TEST_IN_PROGRESS',
        message: 'Another realtime test is already in progress',
      });
      await expect(sdk.startTest(RealtimeTest.HEART_RATE)).rejects.toMatchObject({
        code: 'REALTIME_TEST_IN_PROGRESS',
      });
    });

    it('stopTest(RealtimeTest.HEART_RATE) delegates to native', async () => {
      await sdk.stopTest(RealtimeTest.HEART_RATE);
      expect(native.stopHeartRateTest).toHaveBeenCalled();
    });

    it('startTest(RealtimeTest.HRV) delegates to native', async () => {
      await sdk.startTest(RealtimeTest.HRV);
      expect(native.startHrvTest).toHaveBeenCalled();
    });

    it('startEcgTest({ includeWaveform: true }) passes options to native', async () => {
      await sdk.startEcgTest({ includeWaveform: true });
      expect(native.startEcgTest).toHaveBeenCalledWith({ includeWaveform: true });
    });

    it('stopTest(RealtimeTest.FATIGUE) delegates to native', async () => {
      await sdk.stopTest(RealtimeTest.FATIGUE);
      expect(native.stopFatigueTest).toHaveBeenCalled();
    });
  });
});
