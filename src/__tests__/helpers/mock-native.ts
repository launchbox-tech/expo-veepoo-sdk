/// <reference types="@types/jest" />
import {
  NATIVE_ASYNC_METHOD_NAMES,
  type NativeAsyncMethodName,
} from '../../bridge-contract/async-native-method-registry';
import type { NativeVeepooSDKInterface } from '../../NativeVeepooSDK';

export type MockNative = jest.Mocked<NativeVeepooSDKInterface> & {
  _emit(event: string, payload: unknown): void;
};

/** Resolved values for `jest.fn().mockResolvedValue` — keys not listed default to `undefined`. */
export const NATIVE_ASYNC_MOCK_RESOLVES: Partial<
  Record<NativeAsyncMethodName, unknown>
> = {
  isBluetoothEnabled: true,
  requestPermissions: {
    granted: true,
    status: 'granted',
    canAskAgain: false,
  },
  getConnectionStatus: 'connected',
  verifyPassword: { status: 'CHECK_SUCCESS' },
  readBattery: { level: 80, state: 0 },
  syncPersonalInfo: true,
  readDeviceFunctions: {},
  readSocialMsgData: {},
  readDeviceVersion: { version: '1.2.3', model: 'V11' },
  readDeviceAllData: true,
  readSleepData: [],
  readSportStepData: {},
  readOriginData: [],
  readDaySummaryData: {},
  readAutoMeasureSetting: [],
  modifyAutoMeasureSetting: [],
  setLanguage: true,
  writeSocialMsgData: 'success',
  readAlarms: [],
  setAlarm: 'success',
  deleteAlarm: 'success',
  setDeviceTime: true,
  readHeartRateAlarm: {
    enabled: true,
    highThreshold: 120,
    lowThreshold: 60,
  },
  setHeartRateAlarm: 'success',
  readWatchFaceStyle: {
    dialType: 'default',
    screenIndex: 0,
    operationSuccess: true,
  },
  readContacts: [],
  readSosCallTimes: { times: 3, minTimes: 1, maxTimes: 9 },
};

export function makeMockNative(
  overrides?: Partial<Record<NativeAsyncMethodName, unknown>>,
): MockNative {
  const resolves = overrides
    ? { ...NATIVE_ASYNC_MOCK_RESOLVES, ...overrides }
    : NATIVE_ASYNC_MOCK_RESOLVES;
  const listeners = new Map<string, Set<(p: unknown) => void>>();
  const base = {} as Record<string, jest.Mock>;
  for (const name of NATIVE_ASYNC_METHOD_NAMES) {
    const resolved = resolves[name];
    base[name] =
      resolved !== undefined
        ? jest.fn().mockResolvedValue(resolved)
        : jest.fn().mockResolvedValue(undefined);
  }
  return {
    ...base,
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
    _emit(event: string, payload: unknown) {
      listeners.get(event)?.forEach(l => l(payload));
    },
  } as unknown as MockNative;
}
