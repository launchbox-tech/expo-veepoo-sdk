jest.mock('expo-modules-core', () => ({
  requireNativeModule: jest.fn().mockReturnValue({}),
}));
jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

import { WomenHealthCapability } from '@/capabilities/women-health/index';
import { VeepooSDKRuntime } from '@/sdk/veepoo-sdk-runtime';
import { makeMockNative, type MockNative } from '@/__tests__/helpers/mock-native';
import type { WomenHealthSettings } from '@/types/index';

describe('WomenHealthCapability', () => {
  let native: MockNative;
  let runtime: VeepooSDKRuntime;
  let womenHealth: WomenHealthCapability;

  beforeEach(() => {
    native = makeMockNative();
    runtime = new VeepooSDKRuntime(native);
    womenHealth = new WomenHealthCapability(runtime.createCapabilityContext());
  });

  it('readWomenHealthSettings delegates to native', async () => {
    native.readWomenHealthSettings.mockResolvedValueOnce({ status: 'none' });

    const result = await womenHealth.readWomenHealthSettings();

    expect(native.readWomenHealthSettings).toHaveBeenCalledTimes(1);
    expect(result.status).toBe('none');
  });

  it('setWomenHealthSettings delegates to native', async () => {
    const settings: WomenHealthSettings = { status: 'none' };

    await womenHealth.setWomenHealthSettings(settings);

    expect(native.setWomenHealthSettings).toHaveBeenCalledWith(settings);
  });
});
