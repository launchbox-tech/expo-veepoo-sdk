import { normalizeCameraShutterStatus } from './normalizers';

describe('normalizeCameraShutterStatus', () => {
  it('maps "canTake" → "canTake"', () => {
    expect(normalizeCameraShutterStatus('canTake')).toBe('canTake');
  });

  it('maps Android ECameraStatus "TAKEPHOTO_CAN" → "canTake"', () => {
    expect(normalizeCameraShutterStatus('TAKEPHOTO_CAN')).toBe('canTake');
  });

  it('maps "cannotTake" → "cannotTake"', () => {
    expect(normalizeCameraShutterStatus('cannotTake')).toBe('cannotTake');
  });

  it('maps "TAKEPHOTO_CAN_NOT" → "cannotTake"', () => {
    expect(normalizeCameraShutterStatus('TAKEPHOTO_CAN_NOT')).toBe('cannotTake');
  });

  it('maps unknown string → "cannotTake"', () => {
    expect(normalizeCameraShutterStatus('UNKNOWN')).toBe('cannotTake');
  });

  it('maps null → "cannotTake"', () => {
    expect(normalizeCameraShutterStatus(null)).toBe('cannotTake');
  });
});
