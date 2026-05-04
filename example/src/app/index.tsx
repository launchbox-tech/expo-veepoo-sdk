import {
  ConnectingScreen,
  DisconnectedScreen,
  InitializingScreen,
  ReadyScreen,
  ScanScreen,
} from "../components";
import { useAppState } from "../hooks/useAppState";
import { useSDKInit } from "../hooks/useSDKInit";
import { useBandScan } from "../hooks/useBandScan";
import { useBandSession } from "../hooks/useBandSession";
export type { AppState } from "../hooks/useAppState";

export default function Index() {
  const { appState, onIntentionalDisconnect } = useAppState();
  const { permissions } = useSDKInit();
  const { devices, startScan, stopScan } = useBandScan(appState);
  const {
    connectedDevice,
    connectingDevice,
    connectError,
    syncDone,
    batteryInfo,
    deviceVersion,
    connect,
    disconnect,
    reconnect,
  } = useBandSession(appState, onIntentionalDisconnect, stopScan);

  if (appState === "initializing") return <InitializingScreen />;
  if (appState === "connecting") {
    return <ConnectingScreen connectingDevice={connectingDevice} />;
  }
  if (appState === "disconnected") {
    return (
      <DisconnectedScreen
        connectError={connectError}
        connectedDevice={connectedDevice}
        reconnect={reconnect}
      />
    );
  }
  if (appState === "ready") {
    return (
      <ReadyScreen
        connectedDevice={connectedDevice}
        batteryInfo={batteryInfo}
        deviceVersion={deviceVersion}
        syncDone={syncDone}
        disconnect={disconnect}
      />
    );
  }

  return (
    <ScanScreen
      permissions={permissions}
      appState={appState}
      devices={devices}
      startScan={startScan}
      stopScan={stopScan}
      connect={connect}
    />
  );
}
