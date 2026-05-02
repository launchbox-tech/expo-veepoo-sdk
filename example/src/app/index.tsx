import { useReducer } from "react";
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
import type { VeepooDevice } from "expo-veepoo-sdk";
import { BLUE, GREEN, RED } from "../components/theme";
import { DeviceRow, HealthTestCard, InfoRow } from "../components";
import { appStateReducer } from "../hooks/appStateReducer";
import { useSDKInit } from "../hooks/useSDKInit";
import { useBandScan } from "../hooks/useBandScan";
import { useBandSession } from "../hooks/useBandSession";
import { useHealthTests } from "../hooks/useHealthTests";
import { useDataSync } from "../hooks/useDataSync";
export type { AppState } from "../hooks/appStateReducer";

export default function Index() {
  const [appState, dispatch] = useReducer(appStateReducer, "initializing");
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
    setEcgIncludeWaveform,
    clearLabLog,
  } = healthTests;
  const { syncData } = dataSync;

  const permissionsGranted = permissions?.granted ?? false;

  // ─── Render ───────────────────────────────────────────────────────────────

  if (appState === "initializing") {
    return (
      <SafeAreaView style={styles.centered}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <ActivityIndicator size="large" color={BLUE} />
        <Text style={styles.statusText}>Initializing SDK…</Text>
      </SafeAreaView>
    );
  }

  if (appState === "connecting") {
    return (
      <SafeAreaView style={styles.centered}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <ActivityIndicator size="large" color={BLUE} />
        <Text style={styles.statusText}>
          Connecting to {connectingDevice?.name ?? "device"}…
        </Text>
      </SafeAreaView>
    );
  }

  if (appState === "disconnected") {
    const isFailedAttempt = connectError != null;
    return (
      <SafeAreaView style={styles.centered}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <Text style={styles.disconnectedTitle}>
          {isFailedAttempt ? "Connection Failed" : "Device Disconnected"}
        </Text>
        <Text style={styles.statusText}>
          {isFailedAttempt
            ? connectError
            : `${
                connectedDevice?.name ?? "The device"
              } dropped the connection.`}
        </Text>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            styles.buttonPrimary,
            pressed && styles.buttonPressed,
          ]}
          onPress={reconnect}
          accessibilityRole="button"
        >
          <Text style={styles.buttonText}>
            {isFailedAttempt ? "Try Again" : "Reconnect"}
          </Text>
        </Pressable>
      </SafeAreaView>
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
        <Text style={styles.version}>expo-veepoo-sdk v1.2.11</Text>
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
  buttonStop: { backgroundColor: RED },
  buttonDisabled: { backgroundColor: "#E5E5E5" },
  buttonPressed: { opacity: 0.82 },
  buttonText: { fontSize: 16, fontWeight: "600", color: "#fff" },
  buttonTextDisabled: { color: "#999" },
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
