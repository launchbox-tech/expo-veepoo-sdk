jest.mock('expo-modules-core', () => ({
  requireNativeModule: jest.fn().mockReturnValue({}),
}));
jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

import { PersonalInfoCapability } from '@/capabilities/personal-info';
import { VeepooSDKRuntime } from '@/sdk/veepoo-sdk-runtime';
import { makeMockNative, type MockNative } from '@/__tests__/helpers/mock-native';
import type { PersonalInfo } from '@/types/index';

describe('PersonalInfoCapability', () => {
  let native: MockNative;
  let runtime: VeepooSDKRuntime;
  let personalInfo: PersonalInfoCapability;

  beforeEach(() => {
    native = makeMockNative();
    runtime = new VeepooSDKRuntime(native);
    personalInfo = new PersonalInfoCapability(runtime.createCapabilityContext());
  });

  it('syncPersonalInfo converts snake_case to camelCase for native', async () => {
    const info: PersonalInfo = {
      sex: 1,
      height: 175,
      weight: 70,
      age: 30,
      step_aim: 8000,
      sleep_aim: 480,
    };

    const result = await personalInfo.syncPersonalInfo(info);

    expect(native.syncPersonalInfo).toHaveBeenCalledWith({
      sex: 1,
      height: 175,
      weight: 70,
      age: 30,
      stepAim: 8000,
      sleepAim: 480,
    });
    expect(result).toBe(true);
  });
});
