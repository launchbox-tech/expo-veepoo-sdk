import { useReducer, useState } from "react";
import {
  ConnectingScreen,
  DisconnectedScreen,
  InitializingScreen,
  ReadyScreen,
  ScanScreen,
} from "../components";
import { appStateReducer } from "../hooks/appStateReducer";
import { useSDKInit } from "../hooks/useSDKInit";
import { useBandScan } from "../hooks/useBandScan";
import { useBandSession } from "../hooks/useBandSession";
import { useHealthTests } from "../hooks/useHealthTests";
import { useDataSync } from "../hooks/useDataSync";
import { useSDKEvent } from "../hooks/useSDKEvent";
import { usePassiveEvents } from "../hooks/usePassiveEvents";
export type { AppState } from "../hooks/appStateReducer";

export default function Index() {
  const [appState, dispatch] = useReducer(appStateReducer, "initializing");
  const [findPhase, setFindPhase] = useState<string | null>(null);
  const [cameraInfo, setCameraInfo] = useState<string>("—");
  const [musicCommandInfo, setMusicCommandInfo] = useState<string>("—");
  const [watchFaceInfo, setWatchFaceInfo] = useState<string>("—");
  const [screenLightInfo, setScreenLightInfo] = useState<string>("—");
  const [screenDurationInfo, setScreenDurationInfo] = useState<string>("—");
  const [sedentaryInfo, setSedentaryInfo] = useState<string>("—");
  const [wristFlipInfo, setWristFlipInfo] = useState<string>("—");
  const [womenHealthInfo, setWomenHealthInfo] = useState<string>("—");

  const { permissions } = useSDKInit(dispatch);
  const { devices, startScan, stopScan } = useBandScan(appState, dispatch);
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
  } = useBandSession(appState, dispatch, stopScan);

  const healthTests = useHealthTests(appState);
  const dataSync = useDataSync(appState);

  const hrResult = appState === "ready" ? healthTests.hrResult : null;
  const bpResult = appState === "ready" ? healthTests.bpResult : null;
  const spo2Result = appState === "ready" ? healthTests.spo2Result : null;
  const tempResult = appState === "ready" ? healthTests.tempResult : null;
  const stressResult = appState === "ready" ? healthTests.stressResult : null;
  const bloodGlucoseResult = appState === "ready" ? healthTests.bloodGlucoseResult : null;
  const hrvResult = appState === "ready" ? healthTests.hrvResult : null;
  const ecgResult = appState === "ready" ? healthTests.ecgResult : null;
  const fatigueResult = appState === "ready" ? healthTests.fatigueResult : null;
  const breathingResult = appState === "ready" ? healthTests.breathingResult : null;
  const bodyCompositionResult =
    appState === "ready" ? healthTests.bodyCompositionResult : null;
  const activeTest = appState === "ready" ? healthTests.activeTest : null;
  const ecgIncludeWaveform =
    appState === "ready" ? healthTests.ecgIncludeWaveform : false;
  const labLog = appState === "ready" ? healthTests.labLog : [];
  const dataSyncing = appState === "ready" ? dataSync.dataSyncing : false;
  const dataSyncProgress = appState === "ready" ? dataSync.dataSyncProgress : null;
  const sleepSummary = appState === "ready" ? dataSync.sleepSummary : null;
  const stepData = appState === "ready" ? dataSync.stepData : null;
  usePassiveEvents(appState, healthTests.appendLog);

  const {
    startHR, stopHR,
    startBP, stopBP,
    startSpo2, stopSpo2,
    startTemp, stopTemp,
    startStress, stopStress,
    startBloodGlucose, stopBloodGlucose,
    startHrv, stopHrv,
    startEcg, stopEcg,
    startFatigue, stopFatigue,
    startBreathing, stopBreathing,
    startBodyComposition, stopBodyComposition,
    setEcgIncludeWaveform,
    clearLabLog,
  } = healthTests;
  const { syncData } = dataSync;

  useSDKEvent(
    "findDeviceState",
    ({ deviceId: _, phase }) => { setFindPhase(phase); },
    appState === "ready"
  );
  useSDKEvent(
    "cameraShutter",
    ({ deviceId: _, status }) => { setCameraInfo(`shutter: ${status}`); },
    appState === "ready"
  );
  useSDKEvent(
    "musicRemoteCommand",
    ({ deviceId: _, command }) => {
      const ts = new Date().toISOString().slice(11, 19);
      setMusicCommandInfo(`[${ts}] ${command}`);
    },
    appState === "ready"
  );

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
        findPhase={findPhase}
        setFindPhase={setFindPhase}
        watchFaceInfo={watchFaceInfo}
        setWatchFaceInfo={setWatchFaceInfo}
        screenLightInfo={screenLightInfo}
        setScreenLightInfo={setScreenLightInfo}
        screenDurationInfo={screenDurationInfo}
        setScreenDurationInfo={setScreenDurationInfo}
        sedentaryInfo={sedentaryInfo}
        setSedentaryInfo={setSedentaryInfo}
        wristFlipInfo={wristFlipInfo}
        setWristFlipInfo={setWristFlipInfo}
        womenHealthInfo={womenHealthInfo}
        setWomenHealthInfo={setWomenHealthInfo}
        cameraInfo={cameraInfo}
        setCameraInfo={setCameraInfo}
        musicCommandInfo={musicCommandInfo}
        dataSyncProgress={dataSyncProgress}
        dataSyncing={dataSyncing}
        sleepSummary={sleepSummary}
        stepData={stepData}
        hrResult={hrResult}
        bpResult={bpResult}
        spo2Result={spo2Result}
        tempResult={tempResult}
        stressResult={stressResult}
        bloodGlucoseResult={bloodGlucoseResult}
        hrvResult={hrvResult}
        ecgResult={ecgResult}
        fatigueResult={fatigueResult}
        breathingResult={breathingResult}
        bodyCompositionResult={bodyCompositionResult}
        activeTest={activeTest}
        ecgIncludeWaveform={ecgIncludeWaveform}
        setEcgIncludeWaveform={setEcgIncludeWaveform}
        labLog={labLog}
        clearLabLog={clearLabLog}
        startHR={startHR}
        stopHR={stopHR}
        startBP={startBP}
        stopBP={stopBP}
        startSpo2={startSpo2}
        stopSpo2={stopSpo2}
        startTemp={startTemp}
        stopTemp={stopTemp}
        startStress={startStress}
        stopStress={stopStress}
        startBloodGlucose={startBloodGlucose}
        stopBloodGlucose={stopBloodGlucose}
        startHrv={startHrv}
        stopHrv={stopHrv}
        startEcg={startEcg}
        stopEcg={stopEcg}
        startFatigue={startFatigue}
        stopFatigue={stopFatigue}
        startBreathing={startBreathing}
        stopBreathing={stopBreathing}
        startBodyComposition={startBodyComposition}
        stopBodyComposition={stopBodyComposition}
        syncData={syncData}
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
