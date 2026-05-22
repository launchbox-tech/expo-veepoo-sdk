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

  const validInfo: PersonalInfo = {
    sex: 1,
    height: 175,
    weight: 70,
    age: 30,
    step_aim: 8000,
    sleep_aim: 480,
  };

  it('syncPersonalInfo converts snake_case to camelCase for native', async () => {
    const result = await personalInfo.syncPersonalInfo(validInfo);

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

  it('syncPersonalInfo passes when sleep_aim is 0', async () => {
    await expect(
      personalInfo.syncPersonalInfo({ ...validInfo, sleep_aim: 0 }),
    ).resolves.toBe(true);
  });

  it.each([
    { name: 'invalid sex', input: { ...validInfo, sex: 2 as unknown as 0 | 1 } },
    { name: 'height below range', input: { ...validInfo, height: -5 } },
    { name: 'height above range', input: { ...validInfo, height: 301 } },
    { name: 'weight below range', input: { ...validInfo, weight: 0 } },
    { name: 'weight above range', input: { ...validInfo, weight: 501 } },
    { name: 'age below range', input: { ...validInfo, age: 0 } },
    { name: 'age above range', input: { ...validInfo, age: 121 } },
    { name: 'step_aim below range', input: { ...validInfo, step_aim: 0 } },
    { name: 'step_aim above range', input: { ...validInfo, step_aim: 100_001 } },
    { name: 'sleep_aim above 1440', input: { ...validInfo, sleep_aim: 1_441 } },
  ])('syncPersonalInfo rejects $name → INVALID_ARGUMENT, no native call', async ({ input }) => {
    await expect(personalInfo.syncPersonalInfo(input)).rejects.toMatchObject({
      code: 'INVALID_ARGUMENT',
    });
    expect(native.syncPersonalInfo).not.toHaveBeenCalled();
  });
});
