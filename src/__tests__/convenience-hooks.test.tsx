jest.mock('expo-modules-core', () => ({
  requireNativeModule: jest.fn().mockReturnValue({}),
}));
jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

import React, { act } from 'react';
import { create } from 'react-test-renderer';
import { VeepooSDKProvider } from '@/react/veepoo-sdk-provider';
import {
  useIsConnected,
  useIsSessionReady,
  useIsScanning,
  useConnectedDeviceId,
  useSDKInitialized,
} from '@/react/convenience-hooks';

type HookResult<T> = { current: T };

function renderInProvider<T>(useHook: () => T): HookResult<T> {
  const result: HookResult<T> = { current: undefined as T };
  function Inner() {
    result.current = useHook();
    return null;
  }
  act(() => {
    create(
      React.createElement(VeepooSDKProvider, {}, React.createElement(Inner)),
    );
  });
  return result;
}

describe('convenience hooks (default store state)', () => {
  it('useIsConnected returns false initially', () => {
    const { current } = renderInProvider(() => useIsConnected());
    expect(current).toBe(false);
  });

  it('useIsSessionReady returns false initially', () => {
    const { current } = renderInProvider(() => useIsSessionReady());
    expect(current).toBe(false);
  });

  it('useIsScanning returns false initially', () => {
    const { current } = renderInProvider(() => useIsScanning());
    expect(current).toBe(false);
  });

  it('useConnectedDeviceId returns null initially', () => {
    const { current } = renderInProvider(() => useConnectedDeviceId());
    expect(current).toBeNull();
  });

  it('useSDKInitialized returns a boolean', () => {
    const { current } = renderInProvider(() => useSDKInitialized());
    expect(typeof current).toBe('boolean');
  });
});
