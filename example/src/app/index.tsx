import { useReducer, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { VeepooDevice } from "@gaozh1024/expo-veepoo-sdk";
import sdk from "@gaozh1024/expo-veepoo-sdk";
import { BLUE, GREEN, RED } from "../components/theme";
import { DeviceRow, HealthTestCard, InfoRow, InitializingScreen, ConnectingScreen, DisconnectedScreen } from "../components";
import { appStateReducer } from "../hooks/appStateReducer";
import { useSDKInit } from "../hooks/useSDKInit";
import { useBandScan } from "../hooks/useBandScan";
import { useBandSession } from "../hooks/useBandSession";
import { useHealthTests } from "../hooks/useHealthTests";
import { useDataSync } from "../hooks/useDataSync";
import { useSDKEvent } from "../hooks/useSDKEvent";
export type { AppState } from "../hooks/appStateReducer";

export default function Index() {
  const [appState, dispatch] = useReducer(appStateReducer, "initializing");
  const [findPhase, setFindPhase] = useState<string | null>(null);
  const [screenLightInfo, setScreenLightInfo] = useState<string>("—");
  const [screenDurationInfo, setScreenDurationInfo] = useState<string>("—");
  const [sedentaryInfo, setSedentaryInfo] = useState<string>("—");
  const [wristFlipInfo, setWristFlipInfo] = useState<string>("—");
  const [womenHealthInfo, setWomenHealthInfo] = useState<string>("—");
  const [watchFaceInfo, setWatchFaceInfo] = useState<string>("—");
  const [cameraInfo, setCameraInfo] = useState<string>("—");
  const [musicCommandInfo, setMusicCommandInfo] = useState<string>("—");
  const [musicEnabled, setMusicEnabled] = useState(false);
  const [gpsInfo, setGpsInfo] = useState<string>("—");
  const [btInfo, setBtInfo] = useState<string>("—");
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
  const dataSyncProgress =
    appState === "ready" ? dataSync.dataSyncProgress : null;
  const sleepSummary = appState === "ready" ? dataSync.sleepSummary : null;
  const stepData = appState === "ready" ? dataSync.stepData : null;
  const {
    startHR,
    stopHR,
    startBP,
    stopBP,
    startSpo2,
    stopSpo2,
    startHrv,
    stopHrv,
    startEcg,
    stopEcg,
    startFatigue,
    stopFatigue,
    startBreathing,
    stopBreathing,
    startBodyComposition,
    stopBodyComposition,
    setEcgIncludeWaveform,
    clearLabLog,
  } = healthTests;
  const { syncData } = dataSync;

  useSDKEvent(
    "findDeviceState",
    ({ deviceId: _, phase }) => {
      setFindPhase(phase);
    },
    appState === "ready"
  );

  useSDKEvent(
    "cameraShutter",
    ({ deviceId: _, status }) => {
      setCameraInfo(`shutter: ${status}`);
    },
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

  const permissionsGranted = permissions?.granted ?? false;

  // ─── Render ───────────────────────────────────────────────────────────────

  if (appState === "initializing") {
    return <InitializingScreen />;
  }

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
    return <ReadyScreen
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
      setMusicCommandInfo={setMusicCommandInfo}
      musicEnabled={musicEnabled}
      setMusicEnabled={setMusicEnabled}
      gpsInfo={gpsInfo}
      setGpsInfo={setGpsInfo}
      btInfo={btInfo}
      setBtInfo={setBtInfo}
      syncPct={syncPct}
      dataSyncProgress={dataSyncProgress}
      dataSyncing={dataSyncing}
      sleepSummary={sleepSummary}
      stepData={stepData}
      hrResult={hrResult}
      bpResult={bpResult}
      spo2Result={spo2Result}
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
    />;
  }  // ─── Idle / Scanning ──────────────────────────────────────────────

  return (
    <ScanScreen
      permissions={permissions}
      appState={appState}
      devices={devices}
      startScan={startScan}
      stopScan={stopScan}
      connect={connect}
    />
  );// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    paddingHorizontal: 32,
  },
  container: { flex: 1, backgroundColor: "#fff" },
  scrollContent: { paddingBottom: 40 },
  header: { paddingHorizontal: 24, paddingTop: 28, paddingBottom: 20 },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111",
    letterSpacing: -0.5,
  },
  version: { fontSize: 13, color: "#999", marginTop: 4 },
  sectionHeader: { paddingHorizontal: 24, paddingBottom: 8, paddingTop: 4 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  scanControls: { paddingHorizontal: 24, gap: 12, marginBottom: 16 },
  permissionHint: { fontSize: 14, color: "#E05C00", lineHeight: 20 },
  statusText: { fontSize: 16, color: "#666", textAlign: "center" },
  disconnectedTitle: { fontSize: 22, fontWeight: "700", color: "#111" },
  button: {
    height: 52,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  buttonPrimary: { backgroundColor: BLUE },
  buttonSecondary: {
    flex: 1,
    backgroundColor: "#E8F0FE",
    borderWidth: 1,
    borderColor: "#C5D9F5",
  },
  buttonStop: { backgroundColor: RED },
  buttonDisabled: { backgroundColor: "#E5E5E5" },
  buttonPressed: { opacity: 0.82 },
  buttonText: { fontSize: 16, fontWeight: "600", color: "#fff" },
  buttonTextSecondary: { fontSize: 14, fontWeight: "600", color: BLUE },
  buttonTextDisabled: { color: "#999" },
  findPhase: { fontSize: 14, color: "#555", marginBottom: 4 },
  findRow: { flexDirection: "row", gap: 10 },
  spinnerInline: { marginRight: 4 },
  disconnectBtn: { marginHorizontal: 24, marginTop: 8 },
  list: { flex: 1 },
  listContent: { paddingHorizontal: 24, paddingBottom: 32, gap: 10 },
  emptyText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginTop: 24,
  },
  card: {
    marginHorizontal: 24,
    marginBottom: 12,
    backgroundColor: "#F5F9FF",
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoGrid: { gap: 6 },
  syncRow: { flexDirection: "row", alignItems: "center" },
  syncDone: { fontSize: 15, color: GREEN, fontWeight: "600" },
  syncPending: { fontSize: 15, color: "#666" },
  testCardRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  testLabel: { fontSize: 15, fontWeight: "600", color: "#111" },
  testBtn: {
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 16,
    minWidth: 64,
    alignItems: "center",
  },
  testBtnIdle: { backgroundColor: BLUE },
  testBtnDisabled: { backgroundColor: "#E5E5E5" },
  testBtnText: { fontSize: 13, fontWeight: "600", color: "#fff" },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "#DDE8F5",
    overflow: "hidden",
  },
  progressFill: { height: 6, backgroundColor: BLUE, borderRadius: 3 },
  syncProgressLabel: { fontSize: 12, color: "#888" },
  dataSummary: {
    borderTopWidth: 1,
    borderTopColor: "#E5EDF7",
    paddingTop: 10,
    gap: 2,
  },
  dataSummaryTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  dataSummaryValue: { fontSize: 22, fontWeight: "700", color: "#111" },
  dataSummaryMeta: { fontSize: 12, color: "#888" },
  ecgWaveformRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "#E5EDF7",
  },
  ecgWaveformLabel: { fontSize: 13, color: "#555" },
  labLogHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  labLogClear: { fontSize: 13, fontWeight: "600", color: BLUE },
  labLogScroll: { maxHeight: 200 },
  labLogEmpty: { fontSize: 12, color: "#888", lineHeight: 18 },
  labLogLine: {
    fontSize: 11,
    lineHeight: 16,
    color: "#333",
    fontFamily: Platform.select({ ios: "Menlo", default: "monospace" }),
    marginBottom: 4,
  },
});
