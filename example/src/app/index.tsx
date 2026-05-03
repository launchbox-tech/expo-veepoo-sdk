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
    const syncPct = dataSyncProgress?.progress ?? 0;

    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* ── Header ── */}
          <View style={styles.header}>
            <Text style={styles.title}>Session Active</Text>
            <Text style={styles.version}>
              {connectedDevice?.name ?? "HBand Device"}
            </Text>
          </View>

          {/* ── Device Info (#10) ── */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Device Info</Text>
            <View style={styles.infoGrid}>
              <InfoRow
                label="Battery"
                value={
                  batteryInfo
                    ? `${batteryInfo.percent}%${
                        batteryInfo.chargeState === "charging"
                          ? " ⚡"
                          : batteryInfo.isLowBattery
                          ? " ⚠️"
                          : ""
                      }`
                    : "—"
                }
              />
              <InfoRow
                label="Firmware"
                value={deviceVersion?.firmwareVersion ?? "—"}
              />
            </View>
          </View>

          {/* ── Find Band (phone → Band) (#96) ── */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Find Band</Text>
            <Text style={styles.findPhase}>
              Last state: {findPhase ?? "—"}
            </Text>
            <View style={styles.findRow}>
              <Pressable
                style={({ pressed }) => [
                  styles.button,
                  styles.buttonSecondary,
                  pressed && styles.buttonPressed,
                ]}
                onPress={() => {
                  void sdk.startFindDevice().catch(() => {});
                }}
                accessibilityRole="button"
              >
                <Text style={styles.buttonTextSecondary}>Start find</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.button,
                  styles.buttonSecondary,
                  pressed && styles.buttonPressed,
                ]}
                onPress={() => {
                  void sdk.stopFindDevice().catch(() => {});
                }}
                accessibilityRole="button"
              >
                <Text style={styles.buttonTextSecondary}>Stop find</Text>
              </Pressable>
            </View>
          </View>

          {/* ── Watch face / dial (#101) — read only in example */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Watch face (dial)</Text>
            <Text style={styles.findPhase} numberOfLines={5}>
              {watchFaceInfo}
            </Text>
            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.buttonSecondary,
                pressed && styles.buttonPressed,
              ]}
              onPress={() => {
                void sdk
                  .readWatchFaceStyle()
                  .then(s => setWatchFaceInfo(JSON.stringify(s)))
                  .catch(() =>
                    setWatchFaceInfo("(unsupported or error — gate with screenStyleFunction)")
                  );
              }}
              accessibilityRole="button"
            >
              <Text style={styles.buttonTextSecondary}>Read dial</Text>
            </Pressable>
          </View>

          {/* ── Screen light & duration (#97) ── */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Screen (brightness / on-time)</Text>
            <Text style={styles.findPhase} numberOfLines={4}>
              Brightness: {screenLightInfo}
            </Text>
            <Text style={styles.findPhase} numberOfLines={3}>
              On-time: {screenDurationInfo}
            </Text>
            <View style={styles.findRow}>
              <Pressable
                style={({ pressed }) => [
                  styles.button,
                  styles.buttonSecondary,
                  pressed && styles.buttonPressed,
                ]}
                onPress={() => {
                  void sdk
                    .readScreenLightSettings()
                    .then(s => setScreenLightInfo(JSON.stringify(s)))
                    .catch(() =>
                      setScreenLightInfo("(unsupported or error)")
                    );
                }}
                accessibilityRole="button"
              >
                <Text style={styles.buttonTextSecondary}>Read brightness</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.button,
                  styles.buttonSecondary,
                  pressed && styles.buttonPressed,
                ]}
                onPress={() => {
                  void sdk
                    .readScreenLightDuration()
                    .then(d => setScreenDurationInfo(JSON.stringify(d)))
                    .catch(() =>
                      setScreenDurationInfo("(unsupported or error)")
                    );
                }}
                accessibilityRole="button"
              >
                <Text style={styles.buttonTextSecondary}>Read on-time</Text>
              </Pressable>
            </View>
          </View>

          {/* ── Sedentary reminder (#98) ── */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Sedentary reminder</Text>
            <Text style={styles.findPhase} numberOfLines={6}>
              {sedentaryInfo}
            </Text>
            <View style={styles.findRow}>
              <Pressable
                style={({ pressed }) => [
                  styles.button,
                  styles.buttonSecondary,
                  pressed && styles.buttonPressed,
                ]}
                onPress={() => {
                  void sdk
                    .readSedentaryReminder()
                    .then(s => setSedentaryInfo(JSON.stringify(s)))
                    .catch(() => setSedentaryInfo("(unsupported or error)"));
                }}
                accessibilityRole="button"
              >
                <Text style={styles.buttonTextSecondary}>Read</Text>
              </Pressable>
            </View>
          </View>

          {/* ── Wrist-flip wake (#99) ── */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Wrist-flip wake</Text>
            <Text style={styles.findPhase} numberOfLines={6}>
              {wristFlipInfo}
            </Text>
            <View style={styles.findRow}>
              <Pressable
                style={({ pressed }) => [
                  styles.button,
                  styles.buttonSecondary,
                  pressed && styles.buttonPressed,
                ]}
                onPress={() => {
                  void sdk
                    .readWristFlipWakeSettings()
                    .then(s => setWristFlipInfo(JSON.stringify(s)))
                    .catch(() => setWristFlipInfo("(unsupported or error)"));
                }}
                accessibilityRole="button"
              >
                <Text style={styles.buttonTextSecondary}>Read</Text>
              </Pressable>
            </View>
          </View>

          {/* ── Women's health (#103) — gate with readDeviceFunctions().woman ── */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Women&apos;s health</Text>
            <Text style={styles.findPhase} numberOfLines={8}>
              {womenHealthInfo}
            </Text>
            <View style={styles.findRow}>
              <Pressable
                style={({ pressed }) => [
                  styles.button,
                  styles.buttonSecondary,
                  pressed && styles.buttonPressed,
                ]}
                onPress={() => {
                  void sdk
                    .readWomenHealthSettings()
                    .then(s => setWomenHealthInfo(JSON.stringify(s)))
                    .catch(() => setWomenHealthInfo("(unsupported or error)"));
                }}
                accessibilityRole="button"
              >
                <Text style={styles.buttonTextSecondary}>Read</Text>
              </Pressable>
            </View>
          </View>

          {/* ── Camera remote & Music control (#107) ── */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Camera remote &amp; Music (#107)</Text>
            <Text style={styles.findPhase}>Shutter: {cameraInfo}</Text>
            <Text style={styles.findPhase}>Music cmd: {musicCommandInfo}</Text>
            <View style={styles.findRow}>
              <Pressable
                style={({ pressed }) => [
                  styles.button,
                  styles.buttonSecondary,
                  pressed && styles.buttonPressed,
                ]}
                onPress={() => {
                  void sdk.enterCameraMode().catch(() => setCameraInfo("enterCameraMode error"));
                }}
                accessibilityRole="button"
              >
                <Text style={styles.buttonTextSecondary}>Enter camera</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.button,
                  styles.buttonSecondary,
                  pressed && styles.buttonPressed,
                ]}
                onPress={() => {
                  void sdk.exitCameraMode().then(() => setCameraInfo("—")).catch(() => {});
                }}
                accessibilityRole="button"
              >
                <Text style={styles.buttonTextSecondary}>Exit camera</Text>
              </Pressable>
            </View>
            <View style={styles.findRow}>
              <Pressable
                style={({ pressed }) => [
                  styles.button,
                  styles.buttonSecondary,
                  pressed && styles.buttonPressed,
                ]}
                onPress={() => {
                  const next = !musicEnabled;
                  setMusicEnabled(next);
                  void sdk.setMusicControlEnabled(next).catch(() => {});
                }}
                accessibilityRole="button"
              >
                <Text style={styles.buttonTextSecondary}>
                  Music control: {musicEnabled ? "ON" : "OFF"}
                </Text>
              </Pressable>
              {Platform.OS === "android" && (
                <Pressable
                  style={({ pressed }) => [
                    styles.button,
                    styles.buttonSecondary,
                    pressed && styles.buttonPressed,
                  ]}
                  onPress={() => {
                    void sdk
                      .pushMusicData({
                        name: "Test Track",
                        artist: "Test Artist",
                        isPlaying: true,
                        volume: 50,
                      })
                      .catch(() => {});
                  }}
                  accessibilityRole="button"
                >
                  <Text style={styles.buttonTextSecondary}>Push track</Text>
                </Pressable>
              )}
            </View>
          </View>

          {/* ── GPS / AGPS (#106) ── */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>GPS / AGPS (#106)</Text>
            <Text style={styles.findPhase}>Status: {gpsInfo}</Text>
            <View style={styles.testCardRow}>
              <Pressable
                style={styles.buttonSecondary}
                onPress={() => {
                  setGpsInfo("sending…");
                  void sdk
                    .setDeviceGPSAndTimezone({
                      latitude: 27.7172,
                      longitude: 85.324,
                      altitude: 1400,
                      timezoneOffsetMinutes: 345,
                    })
                    .then(() => setGpsInfo("sent OK"))
                    .catch((e: any) => setGpsInfo(e?.message ?? "error"));
                }}
                accessibilityRole="button"
              >
                <Text style={styles.buttonTextSecondary}>Push GPS</Text>
              </Pressable>
            </View>
          </View>

          {/* ── Band Bluetooth (#108) ── */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Band Bluetooth (#108)</Text>
            <Text style={styles.findPhase}>Status: {btInfo}</Text>
            <View style={styles.testCardRow}>
              <Pressable
                style={styles.buttonSecondary}
                onPress={() => {
                  setBtInfo("reading…");
                  void sdk
                    .readDeviceBTStatus()
                    .then((s) =>
                      setBtInfo(
                        `open=${s.isBTOpen} state=${s.state}`
                      )
                    )
                    .catch((e: any) => setBtInfo(e?.message ?? "error"));
                }}
                accessibilityRole="button"
              >
                <Text style={styles.buttonTextSecondary}>Read BT</Text>
              </Pressable>
              <Pressable
                style={styles.buttonSecondary}
                onPress={() => {
                  setBtInfo("opening…");
                  void sdk
                    .setDeviceBTSwitch(true)
                    .then(() => setBtInfo("opened"))
                    .catch((e: any) => setBtInfo(e?.message ?? "error"));
                }}
                accessibilityRole="button"
              >
                <Text style={styles.buttonTextSecondary}>Open BT</Text>
              </Pressable>
              <Pressable
                style={styles.buttonSecondary}
                onPress={() => {
                  setBtInfo("closing…");
                  void sdk
                    .setDeviceBTSwitch(false)
                    .then(() => setBtInfo("closed"))
                    .catch((e: any) => setBtInfo(e?.message ?? "error"));
                }}
                accessibilityRole="button"
              >
                <Text style={styles.buttonTextSecondary}>Close BT</Text>
              </Pressable>
            </View>
          </View>

          {/* ── Firmware DFU (#100) — no flash in example (CONTEXT) ── */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Firmware DFU (local file)</Text>
            <Text style={styles.findPhase} numberOfLines={8}>
              Use{" "}
              <Text style={{ fontWeight: "600" }}>startLocalFirmwareDfu(path)</Text>{" "}
              from your host app with a vendor OTA package. Subscribe to{" "}
              <Text style={{ fontWeight: "600" }}>firmwareDfuProgress</Text>. Android:
              JL-platform Bands only. This example does not run DFU.
            </Text>
          </View>

          {/* ── Personal Info Sync ── */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Personal Info Sync</Text>
            <View style={styles.syncRow}>
              {syncDone ? (
                <Text style={styles.syncDone}>✓ Synced</Text>
              ) : (
                <>
                  <ActivityIndicator size="small" color={BLUE} />
                  <Text style={styles.syncPending}> Syncing…</Text>
                </>
              )}
            </View>
          </View>

          {/* ── Health Tests (#8) ── */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Health Tests</Text>
          </View>

          <HealthTestCard
            label="Heart Rate"
            isActive={activeTest === "hr"}
            disabled={activeTest !== null && activeTest !== "hr"}
            progress={hrResult?.progress}
            state={hrResult?.state}
            resultLine={
              hrResult?.value != null ? `${hrResult.value} bpm` : null
            }
            onStart={startHR}
            onStop={stopHR}
          />
          <HealthTestCard
            label="Blood Pressure"
            isActive={activeTest === "bp"}
            disabled={activeTest !== null && activeTest !== "bp"}
            progress={bpResult?.progress}
            state={bpResult?.state}
            resultLine={
              bpResult?.systolic != null
                ? `${bpResult.systolic}/${bpResult.diastolic} mmHg · ${bpResult.pulse} bpm`
                : null
            }
            onStart={startBP}
            onStop={stopBP}
          />
          <HealthTestCard
            label="Blood Oxygen (SpO₂)"
            isActive={activeTest === "spo2"}
            disabled={activeTest !== null && activeTest !== "spo2"}
            progress={spo2Result?.progress}
            state={spo2Result?.state}
            resultLine={
              spo2Result?.value != null ? `${spo2Result.value}% SpO₂` : null
            }
            onStart={startSpo2}
            onStop={stopSpo2}
          />

          {/* ── Vitals lab (#66 / #72): HRV, ECG, fatigue, breathing ── */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Vitals lab</Text>
          </View>

          <HealthTestCard
            label="HRV (manual)"
            isActive={activeTest === "hrv"}
            disabled={activeTest !== null && activeTest !== "hrv"}
            progress={hrvResult?.progress}
            state={typeof hrvResult?.state === "string" ? hrvResult.state : undefined}
            resultLine={
              hrvResult?.value != null ? `${hrvResult.value}` : null
            }
            onStart={startHrv}
            onStop={stopHrv}
          />
          <HealthTestCard
            label="ECG"
            isActive={activeTest === "ecg"}
            disabled={activeTest !== null && activeTest !== "ecg"}
            progress={ecgResult?.progress}
            state={typeof ecgResult?.state === "string" ? ecgResult.state : undefined}
            resultLine={
              ecgResult?.heartRate != null
                ? `HR ${ecgResult.heartRate}${
                    ecgResult.hrv != null ? ` · HRV ${ecgResult.hrv}` : ""
                  }${
                    ecgResult.waveform?.length
                      ? ` · ${ecgResult.waveform.length} waveform samples`
                      : ""
                  }`
                : null
            }
            footer={
              <View style={styles.ecgWaveformRow}>
                <Text style={styles.ecgWaveformLabel}>Include waveform</Text>
                <Switch
                  value={ecgIncludeWaveform}
                  onValueChange={setEcgIncludeWaveform}
                  disabled={activeTest === "ecg"}
                />
              </View>
            }
            onStart={startEcg}
            onStop={stopEcg}
          />
          <HealthTestCard
            label="Fatigue"
            isActive={activeTest === "fatigue"}
            disabled={activeTest !== null && activeTest !== "fatigue"}
            progress={fatigueResult?.progress}
            state={
              typeof fatigueResult?.state === "string"
                ? fatigueResult.state
                : undefined
            }
            resultLine={
              fatigueResult?.level != null
                ? `Level ${fatigueResult.level}`
                : null
            }
            onStart={startFatigue}
            onStop={stopFatigue}
          />
          <HealthTestCard
            label="Breathing rate"
            isActive={activeTest === "breathing"}
            disabled={activeTest !== null && activeTest !== "breathing"}
            progress={breathingResult?.progress}
            state={
              typeof breathingResult?.state === "string"
                ? breathingResult.state
                : undefined
            }
            resultLine={
              breathingResult?.rate != null
                ? `${breathingResult.rate} bpm`
                : null
            }
            onStart={startBreathing}
            onStop={stopBreathing}
          />
          <HealthTestCard
            label="Body composition (#102)"
            isActive={activeTest === "bodyComposition"}
            disabled={
              activeTest !== null && activeTest !== "bodyComposition"
            }
            progress={bodyCompositionResult?.progress}
            state={
              typeof bodyCompositionResult?.state === "string"
                ? bodyCompositionResult.state
                : undefined
            }
            resultLine={
              bodyCompositionResult?.composition?.bmi != null
                ? `BMI ${bodyCompositionResult.composition.bmi.toFixed(1)}`
                : bodyCompositionResult?.composition?.bodyFatPercentage !=
                    null
                ? `Fat ${bodyCompositionResult.composition.bodyFatPercentage}%`
                : null
            }
            onStart={startBodyComposition}
            onStop={stopBodyComposition}
          />

          <View style={styles.card}>
            <View style={styles.labLogHeader}>
              <Text style={styles.cardLabel}>Event log</Text>
              <Pressable
                onPress={clearLabLog}
                accessibilityRole="button"
                accessibilityLabel="Clear event log"
              >
                <Text style={styles.labLogClear}>Clear</Text>
              </Pressable>
            </View>
            <ScrollView
              style={styles.labLogScroll}
              nestedScrollEnabled
              keyboardShouldPersistTaps="handled"
            >
              {labLog.length === 0 ? (
                <Text style={styles.labLogEmpty}>
                  Vitals events, errors from start/stop, and `error` events appear
                  here (mutex: one realtime test at a time).
                </Text>
              ) : (
                labLog.map((line, i) => (
                  <Text
                    key={`log-${i}`}
                    style={styles.labLogLine}
                    selectable
                  >
                    {line}
                  </Text>
                ))
              )}
            </ScrollView>
          </View>

          {/* ── Historical Data Sync (#9) ── */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Historical Data</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.testCardRow}>
              <Text style={styles.testLabel}>Sync Data</Text>
              <Pressable
                style={({ pressed }) => [
                  styles.testBtn,
                  dataSyncing ? styles.testBtnDisabled : styles.testBtnIdle,
                  pressed && !dataSyncing && styles.buttonPressed,
                ]}
                disabled={dataSyncing}
                onPress={syncData}
                accessibilityRole="button"
                accessibilityLabel="Sync historical data from device"
                accessibilityState={{ disabled: dataSyncing }}
              >
                {dataSyncing ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.testBtnText}>Sync</Text>
                )}
              </Pressable>
            </View>

            {dataSyncing && dataSyncProgress && (
              <>
                <View style={styles.progressTrack}>
                  <View
                    style={[styles.progressFill, { width: `${syncPct}%` }]}
                  />
                </View>
                <Text style={styles.syncProgressLabel}>
                  Day {dataSyncProgress.currentDay}/{dataSyncProgress.totalDays}{" "}
                  · {Math.round(syncPct)}%
                </Text>
              </>
            )}

            {!dataSyncing && stepData && (
              <View style={styles.dataSummary}>
                <Text style={styles.dataSummaryTitle}>Today's Steps</Text>
                <Text style={styles.dataSummaryValue}>
                  {stepData.stepCount.toLocaleString()}
                </Text>
                <Text style={styles.dataSummaryMeta}>
                  {(stepData.distance / 1000).toFixed(2)} km ·{" "}
                  {Math.round(stepData.calories)} kcal
                </Text>
              </View>
            )}

            {!dataSyncing && sleepSummary && (
              <View style={styles.dataSummary}>
                <Text style={styles.dataSummaryTitle}>Last Night's Sleep</Text>
                <Text style={styles.dataSummaryValue}>
                  {Math.floor(sleepSummary.totalSleepMinutes / 60)}h{" "}
                  {sleepSummary.totalSleepMinutes % 60}m
                </Text>
                <Text style={styles.dataSummaryMeta}>
                  Deep {sleepSummary.totalDeepSleepMinutes}m · Light{" "}
                  {sleepSummary.totalLightSleepMinutes}m · Woke{" "}
                  {sleepSummary.totalWakeUpCount}×
                </Text>
              </View>
            )}
          </View>

          {/* ── Disconnect ── */}
          <Pressable
            style={({ pressed }) => [
              styles.button,
              styles.buttonStop,
              pressed && styles.buttonPressed,
              styles.disconnectBtn,
            ]}
            onPress={disconnect}
            accessibilityRole="button"
            accessibilityLabel="Disconnect from device"
          >
            <Text style={styles.buttonText}>Disconnect</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ─── Idle / Scanning ──────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.header}>
        <Text style={styles.title}>HBand Connect</Text>
        <Text style={styles.version}>@gaozh1024/expo-veepoo-sdk v1.2.11</Text>
      </View>

      <View style={styles.scanControls}>
        {!permissionsGranted && permissions?.canAskAgain === false ? (
          <>
            <Text style={styles.permissionHint}>
              Bluetooth access was permanently denied. Open Settings to grant
              permission.
            </Text>
            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.buttonPrimary,
                pressed && styles.buttonPressed,
              ]}
              onPress={() => Linking.openSettings()}
              accessibilityRole="button"
              accessibilityLabel="Open app settings to grant Bluetooth permission"
            >
              <Text style={styles.buttonText}>Open Settings</Text>
            </Pressable>
          </>
        ) : !permissionsGranted ? (
          <Text style={styles.permissionHint}>
            Bluetooth permission is required to scan for devices.
          </Text>
        ) : null}

        {appState === "scanning" ? (
          <Pressable
            style={({ pressed }) => [
              styles.button,
              styles.buttonStop,
              pressed && styles.buttonPressed,
            ]}
            onPress={stopScan}
            accessibilityRole="button"
          >
            <ActivityIndicator
              size="small"
              color="#fff"
              style={styles.spinnerInline}
            />
            <Text style={styles.buttonText}>Stop Scan</Text>
          </Pressable>
        ) : (
          <Pressable
            style={({ pressed }) => [
              styles.button,
              permissionsGranted ? styles.buttonPrimary : styles.buttonDisabled,
              pressed && permissionsGranted && styles.buttonPressed,
            ]}
            disabled={!permissionsGranted}
            onPress={startScan}
            accessibilityRole="button"
            accessibilityState={{ disabled: !permissionsGranted }}
          >
            <Text
              style={[
                styles.buttonText,
                !permissionsGranted && styles.buttonTextDisabled,
              ]}
            >
              Start Scan
            </Text>
          </Pressable>
        )}
      </View>

      {(appState === "scanning" || devices.length > 0) && (
        <FlatList
          data={devices}
          keyExtractor={item => item.id}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              Scanning for nearby HBand devices…
            </Text>
          }
          renderItem={({ item }) => (
            <DeviceRow device={item} onConnect={() => connect(item)} />
          )}
        />
      )}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

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
