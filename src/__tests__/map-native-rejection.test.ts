import { mapNativeRejection, isVeepooErrorShape } from '@/errors/map-native-rejection';
import type { VeepooError } from '@/types/errors';

describe('isVeepooErrorShape', () => {
  it('returns true for validator-style VeepooError', () => {
    const e: VeepooError = { code: 'INVALID_ARGUMENT', message: 'bad' };
    expect(isVeepooErrorShape(e)).toBe(true);
  });

  it('returns false for plain Error', () => {
    expect(isVeepooErrorShape(new Error('x'))).toBe(false);
  });

  it('returns false for unknown code string', () => {
    expect(isVeepooErrorShape({ code: 'START_FAILED', message: 'm' })).toBe(false);
  });
});

describe('mapNativeRejection', () => {
  it('passes through shaped VeepooError and merges device_id', () => {
    const e: VeepooError = { code: 'INVALID_ARGUMENT', message: 'x' };
    const out = mapNativeRejection(e, { fallbackCode: 'UNKNOWN', deviceId: 'd1' });
    expect(out).toEqual({ code: 'INVALID_ARGUMENT', message: 'x', device_id: 'd1' });
  });

  it('maps REALTIME_TEST_IN_PROGRESS 1:1 without native_code', () => {
    const err = { code: 'REALTIME_TEST_IN_PROGRESS', message: 'busy' };
    const out = mapNativeRejection(err, { fallbackCode: 'UNKNOWN' });
    expect(out.code).toBe('REALTIME_TEST_IN_PROGRESS');
    expect(out.message).toBe('busy');
    expect(out.native_code).toBeUndefined();
  });

  it('maps START_FAILED to OPERATION_FAILED with native_code', () => {
    const err = Object.assign(new Error('vendor'), { code: 'START_FAILED' });
    const out = mapNativeRejection(err, { fallbackCode: 'UNKNOWN', deviceId: 'b' });
    expect(out).toEqual({
      code: 'OPERATION_FAILED',
      message: 'vendor',
      native_code: 'START_FAILED',
      device_id: 'b',
    });
  });

  it('maps SDK_NOT_AVAILABLE to SDK_NOT_INITIALIZED with native_code', () => {
    const err = Object.assign(new Error('na'), { code: 'SDK_NOT_AVAILABLE' });
    const out = mapNativeRejection(err, { fallbackCode: 'UNKNOWN' });
    expect(out.code).toBe('SDK_NOT_INITIALIZED');
    expect(out.native_code).toBe('SDK_NOT_AVAILABLE');
  });

  it('maps DISCONNECT_FAILED to DISCONNECTION_FAILED with native_code', () => {
    const err = Object.assign(new Error('x'), { code: 'DISCONNECT_FAILED' });
    const out = mapNativeRejection(err, { fallbackCode: 'UNKNOWN' });
    expect(out.code).toBe('DISCONNECTION_FAILED');
    expect(out.native_code).toBe('DISCONNECT_FAILED');
  });

  it('uses fallback when no native code on Error', () => {
    const out = mapNativeRejection(new Error('oops'), { fallbackCode: 'PERMISSION_DENIED' });
    expect(out.code).toBe('PERMISSION_DENIED');
    expect(out.message).toBe('oops');
  });

  it('maps unknown SCREAMING_SNAKE to OPERATION_FAILED', () => {
    const err = Object.assign(new Error('m'), { code: 'WEIRD_VENDOR_CODE' });
    const out = mapNativeRejection(err, { fallbackCode: 'UNKNOWN' });
    expect(out.code).toBe('OPERATION_FAILED');
    expect(out.native_code).toBe('WEIRD_VENDOR_CODE');
  });

  it('normalizes lowercase native code', () => {
    const err = Object.assign(new Error('x'), { code: 'device_not_connected' });
    const out = mapNativeRejection(err, { fallbackCode: 'UNKNOWN' });
    expect(out.code).toBe('DEVICE_NOT_CONNECTED');
    expect(out.native_code).toBeUndefined();
  });

  /** Vendor-opaque codes from bridge-contract allowed list → OPERATION_FAILED (ADR 0003). */
  it('maps CONTEXT_ERROR (Android) to OPERATION_FAILED with native_code', () => {
    const err = Object.assign(new Error('no ctx'), { code: 'CONTEXT_ERROR' });
    const out = mapNativeRejection(err, { fallbackCode: 'UNKNOWN' });
    expect(out.code).toBe('OPERATION_FAILED');
    expect(out.native_code).toBe('CONTEXT_ERROR');
  });
});
