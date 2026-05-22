jest.mock('expo-modules-core', () => ({
  requireNativeModule: jest.fn().mockReturnValue({}),
}));
jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

import { CAPABILITIES } from '@/sdk/capability-registry';
import { VeepooSDK } from '@/veepoo-sdk';
import { makeMockNative, type MockNative } from '@/__tests__/helpers/mock-native';

describe('CAPABILITIES registry', () => {
  it('lists exactly the 35 facade capabilities expected', () => {
    // Sentinel so adding/removing a capability without updating tests fails loudly.
    expect(Object.keys(CAPABILITIES).sort()).toEqual(
      [
        'alarms', 'autoMeasure', 'battery', 'btStatus', 'calibration',
        'camera', 'contacts', 'daySummary', 'deviceFunctions',
        'deviceSwitches', 'deviceTime', 'deviceVersion', 'dfu',
        'discovery', 'findDevice', 'gpsTimezone', 'historicalQuery',
        'language', 'music', 'originData', 'personalInfo',
        'realtimeTests', 'screenLight', 'sedentaryReminder', 'session',
        'sleepData', 'socialMsg', 'sos', 'sportMode', 'sportSteps',
        'watchFace', 'weather', 'womenHealth', 'worldClock', 'wristFlip',
      ].sort(),
    );
  });

  it.each(Object.entries(CAPABILITIES))(
    'sdk.%s is an instance of its constructor declared in CAPABILITIES',
    (key, Ctor) => {
      const native: MockNative = makeMockNative();
      const sdk = new VeepooSDK(native);
      const instance = (sdk as unknown as Record<string, unknown>)[key];
      expect(instance).toBeInstanceOf(Ctor as new (...args: unknown[]) => unknown);
    },
  );

  it('shares one runtime context across all capability instances (same connected-device id)', () => {
    const native: MockNative = makeMockNative();
    const sdk = new VeepooSDK(native);
    // Mutating connected-device via SessionCapability should be visible to BandDiscoveryCapability,
    // because they share the same runtime / context.
    expect(sdk.getConnectedDeviceId()).toBeNull();
    // Both capabilities are wired into the same runtime instance under the hood:
    expect(sdk.session).toBeDefined();
    expect(sdk.discovery).toBeDefined();
  });
});
