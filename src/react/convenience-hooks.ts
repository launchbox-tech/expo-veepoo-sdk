import { useSDKState } from "./useSDKState";

export const useIsConnected = (): boolean => useSDKState((s) => s.isConnected);

export const useIsSessionReady = (): boolean => useSDKState((s) => s.isReady);

export const useIsScanning = (): boolean => useSDKState((s) => s.isScanning);

export const useConnectedDeviceId = (): string | null => useSDKState((s) => s.connectedDeviceId);

export const useSDKInitialized = (): boolean => useSDKState((s) => s.initialized);
