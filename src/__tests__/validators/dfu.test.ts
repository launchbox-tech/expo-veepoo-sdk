import { validateFirmwareDfuFilePath } from '@/capabilities/dfu';
import { expectInvalidArgument } from '@/__tests__/helpers/expect-invalid-argument';

describe('validateFirmwareDfuFilePath', () => {
  it('passes for non-empty path', () => {
    expect(() => validateFirmwareDfuFilePath('/tmp/f.bin')).not.toThrow();
  });

  it('throws for empty string', () => {
    expectInvalidArgument(() => validateFirmwareDfuFilePath(''), 'filePath');
  });
});
