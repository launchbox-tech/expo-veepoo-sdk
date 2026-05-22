jest.mock('expo-modules-core', () => ({
  requireNativeModule: jest.fn().mockReturnValue({}),
}));
jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

import { SessionCapability } from '@/capabilities/session/index';
import { VeepooSDKRuntime } from '@/sdk/veepoo-sdk-runtime';
import { makeMockNative, type MockNative } from '@/__tests__/helpers/mock-native';

describe('SessionCapability — new utilities (#186)', () => {
  let native: MockNative;
  let runtime: VeepooSDKRuntime;
  let session: SessionCapability;

  beforeEach(() => {
    native = makeMockNative();
    runtime = new VeepooSDKRuntime(native);
    session = new SessionCapability(runtime.createCapabilityContext());
  });

  // ── renameDevice ──────────────────────────────────────────────────────────

  it('renameDevice("MyBand") delegates correctly', async () => {
    const result = await session.renameDevice('MyBand');

    expect(native.renameDevice).toHaveBeenCalledWith('MyBand');
    expect(result).toBe('success');
  });

  it('renameDevice("") throws INVALID_ARGUMENT', async () => {
    await expect(session.renameDevice('')).rejects.toMatchObject({
      code: 'INVALID_ARGUMENT',
    });
    expect(native.renameDevice).not.toHaveBeenCalled();
  });

  it('renameDevice with name > 20 UTF-8 bytes throws INVALID_ARGUMENT', async () => {
    // 21 ASCII chars = 21 bytes
    await expect(session.renameDevice('a'.repeat(21))).rejects.toMatchObject({
      code: 'INVALID_ARGUMENT',
    });
    expect(native.renameDevice).not.toHaveBeenCalled();
  });

  it('renameDevice with exactly 20-byte name succeeds', async () => {
    // 20 ASCII chars = 20 bytes
    await expect(session.renameDevice('a'.repeat(20))).resolves.toBe('success');
    expect(native.renameDevice).toHaveBeenCalled();
  });

  // ── isConnectionConfirmEnabled ────────────────────────────────────────────

  it('isConnectionConfirmEnabled() delegates and returns boolean', async () => {
    const result = await session.isConnectionConfirmEnabled();

    expect(native.isConnectionConfirmEnabled).toHaveBeenCalledTimes(1);
    expect(typeof result).toBe('boolean');
    expect(result).toBe(false);
  });

  it('isConnectionConfirmEnabled returns true when native resolves true', async () => {
    native.isConnectionConfirmEnabled.mockResolvedValueOnce(true);

    const result = await session.isConnectionConfirmEnabled();

    expect(result).toBe(true);
  });

  // ── setConnectionConfirmEnabled ───────────────────────────────────────────

  it('setConnectionConfirmEnabled(false) delegates', async () => {
    const result = await session.setConnectionConfirmEnabled(false);

    expect(native.setConnectionConfirmEnabled).toHaveBeenCalledWith(false);
    expect(result).toBe('success');
  });

  it('setConnectionConfirmEnabled(true) delegates', async () => {
    await session.setConnectionConfirmEnabled(true);

    expect(native.setConnectionConfirmEnabled).toHaveBeenCalledWith(true);
  });

  // ── setConnectionConfirmTimeout ───────────────────────────────────────────

  it('setConnectionConfirmTimeout(30) delegates', async () => {
    const result = await session.setConnectionConfirmTimeout(30);

    expect(native.setConnectionConfirmTimeout).toHaveBeenCalledWith(30);
    expect(result).toBe('success');
  });

  it('setConnectionConfirmTimeout(4) throws INVALID_ARGUMENT (below minimum)', async () => {
    await expect(session.setConnectionConfirmTimeout(4)).rejects.toMatchObject({
      code: 'INVALID_ARGUMENT',
    });
    expect(native.setConnectionConfirmTimeout).not.toHaveBeenCalled();
  });

  it('setConnectionConfirmTimeout(121) throws INVALID_ARGUMENT (above maximum)', async () => {
    await expect(session.setConnectionConfirmTimeout(121)).rejects.toMatchObject({
      code: 'INVALID_ARGUMENT',
    });
    expect(native.setConnectionConfirmTimeout).not.toHaveBeenCalled();
  });

  it('setConnectionConfirmTimeout(5) succeeds (minimum valid value)', async () => {
    await expect(session.setConnectionConfirmTimeout(5)).resolves.toBe('success');
  });

  it('setConnectionConfirmTimeout(120) succeeds (maximum valid value)', async () => {
    await expect(session.setConnectionConfirmTimeout(120)).resolves.toBe('success');
  });

  it('setConnectionConfirmTimeout(30.5) throws INVALID_ARGUMENT (non-integer)', async () => {
    await expect(session.setConnectionConfirmTimeout(30.5)).rejects.toMatchObject({
      code: 'INVALID_ARGUMENT',
    });
  });

  // ── connect (validateDeviceId + validateConnectOptions) ───────────────────

  it.each([
    { name: 'empty deviceId', deviceId: '', options: undefined },
    { name: 'whitespace-only deviceId', deviceId: '   ', options: undefined },
    { name: 'null deviceId', deviceId: null as unknown as string, options: undefined },
    { name: 'undefined deviceId', deviceId: undefined as unknown as string, options: undefined },
    { name: 'numeric deviceId', deviceId: 42 as unknown as string, options: undefined },
    {
      name: 'options.password empty string',
      deviceId: 'AA:BB:CC:DD:EE:FF',
      options: { password: '' },
    },
    {
      name: 'options.time_setting.hour out of range',
      deviceId: 'AA:BB:CC:DD:EE:FF',
      options: {
        time_setting: { year: 2024, month: 1, day: 1, hour: 24, minute: 0, second: 0 },
      },
    },
    {
      name: 'options.time_setting.minute out of range',
      deviceId: 'AA:BB:CC:DD:EE:FF',
      options: {
        time_setting: { year: 2024, month: 1, day: 1, hour: 0, minute: 60, second: 0 },
      },
    },
    {
      name: 'options.time_setting.month out of range',
      deviceId: 'AA:BB:CC:DD:EE:FF',
      options: {
        time_setting: { year: 2024, month: 13, day: 1, hour: 0, minute: 0, second: 0 },
      },
    },
  ])('connect rejects $name → INVALID_ARGUMENT, no native call', async ({ deviceId, options }) => {
    await expect(session.connect(deviceId, options)).rejects.toMatchObject({
      code: 'INVALID_ARGUMENT',
    });
    expect(native.connect).not.toHaveBeenCalled();
  });
});
