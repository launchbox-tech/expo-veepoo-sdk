jest.mock('expo-modules-core', () => ({
  requireNativeModule: jest.fn().mockReturnValue({}),
}));
jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

import { SocialMsgCapability } from '@/capabilities/social-msg';
import { VeepooSDKRuntime } from '@/sdk/veepoo-sdk-runtime';
import { makeMockNative, type MockNative } from '@/__tests__/helpers/mock-native';

describe('SocialMsgCapability', () => {
  let native: MockNative;
  let runtime: VeepooSDKRuntime;
  let socialMsg: SocialMsgCapability;

  beforeEach(() => {
    native = makeMockNative();
    runtime = new VeepooSDKRuntime(native);
    socialMsg = new SocialMsgCapability(runtime.createCapabilityContext());
  });

  // ── readSocialMsgData ────────────────────────────────────────────────────

  it('readSocialMsgData delegates to native', async () => {
    native.readSocialMsgData.mockResolvedValueOnce({});

    await socialMsg.readSocialMsgData();

    expect(native.readSocialMsgData).toHaveBeenCalledTimes(1);
  });

  it('readSocialMsgData returns a record with every supported channel key', async () => {
    native.readSocialMsgData.mockResolvedValueOnce({});

    const result = await socialMsg.readSocialMsgData();

    expect(Object.keys(result).sort()).toEqual(
      [
        'email',
        'facebook',
        'instagram',
        'line',
        'linkedin',
        'other',
        'phone',
        'qq',
        'skype',
        'sms',
        'twitter',
        'wechat',
        'whatsapp',
      ].sort(),
    );
  });

  it('readSocialMsgData normalizes a partial native response to FunctionStatus values', async () => {
    native.readSocialMsgData.mockResolvedValueOnce({
      phone: 1,
      sms: 0,
      wechat: 2,
      qq: 3,
    });

    const result = await socialMsg.readSocialMsgData();

    expect(result.phone).toBe('support');
    expect(result.sms).toBe('unsupported');
    expect(result.wechat).toBe('open');
    expect(result.qq).toBe('close');
    // Unspecified channels fall back to 'unknown' (or the normalizer's default).
    expect(['unknown', 'unsupported']).toContain(result.facebook);
  });

  it('readSocialMsgData surfaces native rejections through the error pipeline', async () => {
    const errorListener = jest.fn();
    runtime.on('error', errorListener);
    native.readSocialMsgData.mockRejectedValueOnce(new Error('boom'));

    await expect(socialMsg.readSocialMsgData()).rejects.toMatchObject({
      code: 'OPERATION_FAILED',
    });
    expect(errorListener).toHaveBeenCalled();
  });

  // ── writeSocialMsgData ───────────────────────────────────────────────────

  it('writeSocialMsgData passes camelCase data to native', async () => {
    await socialMsg.writeSocialMsgData({ phone: 'open', sms: 'close' });

    expect(native.writeSocialMsgData).toHaveBeenCalledWith({ phone: 'open', sms: 'close' });
  });

  it('writeSocialMsgData throws INVALID_ARGUMENT for an empty object without calling native', async () => {
    await expect(socialMsg.writeSocialMsgData({})).rejects.toMatchObject({
      code: 'INVALID_ARGUMENT',
    });
    expect(native.writeSocialMsgData).not.toHaveBeenCalled();
  });

  it('writeSocialMsgData throws INVALID_ARGUMENT for an unknown FunctionStatus value', async () => {
    await expect(
      socialMsg.writeSocialMsgData({ phone: 'enabled' as never }),
    ).rejects.toMatchObject({ code: 'INVALID_ARGUMENT' });
    expect(native.writeSocialMsgData).not.toHaveBeenCalled();
  });

  it('writeSocialMsgData accepts every valid FunctionStatus value', async () => {
    await expect(
      socialMsg.writeSocialMsgData({
        phone: 'open',
        sms: 'close',
        wechat: 'support',
        qq: 'unsupported',
        facebook: 'unknown',
      }),
    ).resolves.toBeDefined();
    expect(native.writeSocialMsgData).toHaveBeenCalledTimes(1);
  });
});
