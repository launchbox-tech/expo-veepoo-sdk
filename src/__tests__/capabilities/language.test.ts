jest.mock('expo-modules-core', () => ({
  requireNativeModule: jest.fn().mockReturnValue({}),
}));
jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

import { LanguageCapability } from '@/capabilities/language';
import { VeepooSDKRuntime } from '@/sdk/veepoo-sdk-runtime';
import { makeMockNative, type MockNative } from '@/__tests__/helpers/mock-native';

describe('LanguageCapability', () => {
  let native: MockNative;
  let runtime: VeepooSDKRuntime;
  let language: LanguageCapability;

  beforeEach(() => {
    native = makeMockNative();
    runtime = new VeepooSDKRuntime(native);
    language = new LanguageCapability(runtime.createCapabilityContext());
  });

  it('setLanguage delegates to native', async () => {
    const result = await language.setLanguage('en');

    expect(native.setLanguage).toHaveBeenCalledWith('en');
    expect(result).toBe(true);
  });
});
