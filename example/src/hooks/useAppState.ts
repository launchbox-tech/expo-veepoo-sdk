import { useEffect, useRef, useState } from 'react';
import { useSDKState } from '@gaozh1024/expo-veepoo-sdk';

export type AppState =
  | 'initializing'
  | 'idle'
  | 'scanning'
  | 'connecting'
  | 'ready'
  | 'disconnected';

/**
 * Derives the app lifecycle state purely from the SDK's reactive snapshot.
 * The `disconnected` state fires when a Session was active and then lost
 * without an intentional disconnect. Call `onIntentionalDisconnect()` before
 * calling `sdk.session.disconnect()` to prevent that transition.
 */
export function useAppState(): {
  appState: AppState;
  onIntentionalDisconnect: () => void;
} {
  const initialized = useSDKState((s) => s.initialized);
  const isScanning = useSDKState((s) => s.isScanning);
  const isConnected = useSDKState((s) => s.isConnected);
  const isReady = useSDKState((s) => s.isReady);

  const [sessionLost, setSessionLost] = useState(false);
  const wasReadyRef = useRef(false);
  const suppressRef = useRef(false);

  useEffect(() => {
    if (isReady) {
      wasReadyRef.current = true;
      setSessionLost(false);
    } else if (wasReadyRef.current && !isConnected && !suppressRef.current) {
      setSessionLost(true);
      wasReadyRef.current = false;
    }
  }, [isReady, isConnected]);

  const onIntentionalDisconnect = () => {
    suppressRef.current = true;
    wasReadyRef.current = false;
    setSessionLost(false);
    setTimeout(() => { suppressRef.current = false; }, 500);
  };

  const appState: AppState =
    !initialized ? 'initializing' :
    isReady ? 'ready' :
    isConnected ? 'connecting' :
    isScanning ? 'scanning' :
    sessionLost ? 'disconnected' :
    'idle';

  return { appState, onIntentionalDisconnect };
}
