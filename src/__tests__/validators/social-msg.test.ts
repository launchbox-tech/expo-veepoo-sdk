import { validateSocialMsgData } from '@/capabilities/social-msg';
import { expectInvalidArgument } from '@/__tests__/helpers/expect-invalid-argument';

describe('validateSocialMsgData', () => {
  it('throws INVALID_ARGUMENT for empty object', () => {
    expectInvalidArgument(() => validateSocialMsgData({}));
  });

  it('passes for a single valid channel', () => {
    expect(() => validateSocialMsgData({ whatsapp: 'open' })).not.toThrow();
  });

  it('passes for multiple valid channels', () => {
    expect(() => validateSocialMsgData({ whatsapp: 'open', instagram: 'close' })).not.toThrow();
  });

  it('throws INVALID_ARGUMENT for an invalid FunctionStatus value', () => {
    expectInvalidArgument(() => validateSocialMsgData({ whatsapp: 'badvalue' as any }), 'whatsapp');
  });

  it('throws when one channel is invalid even if others are valid', () => {
    expectInvalidArgument(() => validateSocialMsgData({ phone: 'open', sms: 'invalid' as any }), 'sms');
  });

  it('passes for all valid FunctionStatus literals', () => {
    expect(() => validateSocialMsgData({ phone: 'unsupported' })).not.toThrow();
    expect(() => validateSocialMsgData({ sms: 'support' })).not.toThrow();
    expect(() => validateSocialMsgData({ wechat: 'open' })).not.toThrow();
    expect(() => validateSocialMsgData({ qq: 'close' })).not.toThrow();
    expect(() => validateSocialMsgData({ facebook: 'unknown' })).not.toThrow();
  });

  it('passes for all 13 channel keys with valid values', () => {
    expect(() =>
      validateSocialMsgData({
        phone: 'open',
        sms: 'open',
        wechat: 'close',
        qq: 'close',
        facebook: 'open',
        twitter: 'open',
        instagram: 'close',
        linkedin: 'open',
        whatsapp: 'open',
        line: 'close',
        skype: 'open',
        email: 'open',
        other: 'close',
      })
    ).not.toThrow();
  });
});
