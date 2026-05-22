jest.mock('expo-modules-core', () => ({
  requireNativeModule: jest.fn().mockReturnValue({}),
}));
jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

import { DfuCapability } from '@/capabilities/dfu';
import { VeepooSDKRuntime } from '@/sdk/veepoo-sdk-runtime';
import { makeMockNative, type MockNative } from '@/__tests__/helpers/mock-native';

describe('DfuCapability', () => {
  let native: MockNative;
  let runtime: VeepooSDKRuntime;
  let dfu: DfuCapability;

  beforeEach(() => {
    native = makeMockNative();
    runtime = new VeepooSDKRuntime(native);
    dfu = new DfuCapability(runtime.createCapabilityContext());
  });

  it('startLocalFirmwareDfu trims the file path before passing it to native', async () => {
    await dfu.startLocalFirmwareDfu('  /tmp/firmware.bin  ');

    expect(native.startLocalFirmwareDfu).toHaveBeenCalledWith('/tmp/firmware.bin');
  });

  it('startLocalFirmwareDfu rejects an empty string without calling native', async () => {
    await expect(dfu.startLocalFirmwareDfu('')).rejects.toMatchObject({
      code: 'INVALID_ARGUMENT',
    });
    expect(native.startLocalFirmwareDfu).not.toHaveBeenCalled();
  });

  it('startLocalFirmwareDfu rejects a whitespace-only string without calling native', async () => {
    await expect(dfu.startLocalFirmwareDfu('   ')).rejects.toMatchObject({
      code: 'INVALID_ARGUMENT',
    });
    expect(native.startLocalFirmwareDfu).not.toHaveBeenCalled();
  });

  it('startLocalFirmwareDfu rejects a path longer than 4096 chars', async () => {
    const tooLong = 'x'.repeat(4097);

    await expect(dfu.startLocalFirmwareDfu(tooLong)).rejects.toMatchObject({
      code: 'INVALID_ARGUMENT',
    });
    expect(native.startLocalFirmwareDfu).not.toHaveBeenCalled();
  });

  it('startLocalFirmwareDfu surfaces native rejections', async () => {
    native.startLocalFirmwareDfu.mockRejectedValueOnce({
      code: 'CAPABILITY_UNSUPPORTED',
      message: 'not a JL device',
    });

    await expect(dfu.startLocalFirmwareDfu('/tmp/firmware.bin')).rejects.toMatchObject({
      code: 'CAPABILITY_UNSUPPORTED',
    });
  });
});
