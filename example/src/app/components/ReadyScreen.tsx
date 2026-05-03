import type {
  BatteryInfo,
  DeviceVersion,
  VeepooDevice,
  HeartRateTestResult,
  BloodPressureTestResult,
  BloodOxygenTestResult,
  HrvTestResult,
  EcgTestResult,
  FatigueTestResult,
  BreathingTestResult,
  BodyCompositionTestResult,
  ReadOriginProgress,
  SleepData,
  SportStepData,
} from "@gaozh1024/expo-veepoo-sdk";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { BLUE, RED } from "../../components/theme";
import {
  ReadyHeader,
  DeviceInfoCard,
  FindBandCard,
  WatchFaceCard,
  ScreenLightCard,
  SedentaryCard,
  WristFlipCard,
  WomenHealthCard,
  CameraMusicCard,
  GpsAgpsCard,
  BandBluetoothCard,
  FirmwareDfuCard,
  PersonalInfoSync,
  HealthTestsSection,
  VitalsLabSection,
  EventLogCard,
} from "../../components";

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scrollContent: { paddingBottom: 40 },
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
  sectionHeader: { paddingHorizontal: 24, paddingBottom: 8, paddingTop: 4 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
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
  button: {
    height: 52,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  buttonStop: { backgroundColor: RED },
  buttonPressed: { opacity: 0.82 },
  buttonText: { fontSize: 16, fontWeight: "600", color: "#fff" },
  disconnectBtn: { marginHorizontal: 24, marginTop: 8 },
});

export default function ReadyScreen({
  connectedDevice,
  batteryInfo,
  deviceVersion,
  syncDone,
  findPhase,
  setFindPhase,
  watchFaceInfo,
  setWatchFaceInfo,
  screenLightInfo,
  setScreenLightInfo,
  screenDurationInfo,
  setScreenDurationInfo,
  sedentaryInfo,
  setSedentaryInfo,
  wristFlipInfo,
  setWristFlipInfo,
  womenHealthInfo,
  setWomenHealthInfo,
  cameraInfo,
  setCameraInfo,
  musicCommandInfo,
  dataSyncProgress,
  dataSyncing,
  sleepSummary,
  stepData,
  hrResult,
  bpResult,
  spo2Result,
  hrvResult,
  ecgResult,
  fatigueResult,
  breathingResult,
  bodyCompositionResult,
  activeTest,
  ecgIncludeWaveform,
  setEcgIncludeWaveform,
  labLog,
  clearLabLog,
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
  syncData,
  disconnect,
}: {
  connectedDevice: VeepooDevice | null;
  batteryInfo: BatteryInfo | null;
  deviceVersion: DeviceVersion | null;
  syncDone: boolean;
  findPhase: string | null;
  setFindPhase: (phase: string | null) => void;
  watchFaceInfo: string;
  setWatchFaceInfo: (info: string) => void;
  screenLightInfo: string;
  setScreenLightInfo: (info: string) => void;
  screenDurationInfo: string;
  setScreenDurationInfo: (info: string) => void;
  sedentaryInfo: string;
  setSedentaryInfo: (info: string) => void;
  wristFlipInfo: string;
  setWristFlipInfo: (info: string) => void;
  womenHealthInfo: string;
  setWomenHealthInfo: (info: string) => void;
  cameraInfo: string;
  setCameraInfo: (info: string) => void;
  musicCommandInfo: string;
  dataSyncProgress: ReadOriginProgress | null;
  dataSyncing: boolean;
  sleepSummary: SleepData["summary"] | null;
  stepData: SportStepData | null;
  hrResult: HeartRateTestResult | null;
  bpResult: BloodPressureTestResult | null;
  spo2Result: BloodOxygenTestResult | null;
  hrvResult: HrvTestResult | null;
  ecgResult: EcgTestResult | null;
  fatigueResult: FatigueTestResult | null;
  breathingResult: BreathingTestResult | null;
  bodyCompositionResult: BodyCompositionTestResult | null;
  activeTest: string | null;
  ecgIncludeWaveform: boolean;
  setEcgIncludeWaveform: (v: boolean) => void;
  labLog: string[];
  clearLabLog: () => void;
  startHR: () => Promise<void>;
  stopHR: () => Promise<void>;
  startBP: () => Promise<void>;
  stopBP: () => Promise<void>;
  startSpo2: () => Promise<void>;
  stopSpo2: () => Promise<void>;
  startHrv: () => Promise<void>;
  stopHrv: () => Promise<void>;
  startEcg: () => Promise<void>;
  stopEcg: () => Promise<void>;
  startFatigue: () => Promise<void>;
  stopFatigue: () => Promise<void>;
  startBreathing: () => Promise<void>;
  stopBreathing: () => Promise<void>;
  startBodyComposition: () => Promise<void>;
  stopBodyComposition: () => Promise<void>;
  syncData: () => Promise<void>;
  disconnect: () => Promise<void>;
}) {
  const syncPct = dataSyncProgress?.progress ?? 0;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView contentContainerStyle={styles.scrollContent}>

        <ReadyHeader deviceName={connectedDevice?.name} />

        <DeviceInfoCard batteryInfo={batteryInfo} deviceVersion={deviceVersion} />

        <FindBandCard findPhase={findPhase} setFindPhase={setFindPhase} />
        <WatchFaceCard watchFaceInfo={watchFaceInfo} setWatchFaceInfo={setWatchFaceInfo} />
        <ScreenLightCard
          screenLightInfo={screenLightInfo}
          setScreenLightInfo={setScreenLightInfo}
          screenDurationInfo={screenDurationInfo}
          setScreenDurationInfo={setScreenDurationInfo}
        />
        <SedentaryCard sedentaryInfo={sedentaryInfo} setSedentaryInfo={setSedentaryInfo} />
        <WristFlipCard wristFlipInfo={wristFlipInfo} setWristFlipInfo={setWristFlipInfo} />
        <WomenHealthCard womenHealthInfo={womenHealthInfo} setWomenHealthInfo={setWomenHealthInfo} />

        <CameraMusicCard
          cameraInfo={cameraInfo}
          setCameraInfo={setCameraInfo}
          musicCommandInfo={musicCommandInfo}
        />
        <GpsAgpsCard />
        <BandBluetoothCard />
        <FirmwareDfuCard />

        <PersonalInfoSync syncDone={syncDone} />

        <HealthTestsSection
          activeTest={activeTest}
          hrResult={hrResult}
          bpResult={bpResult}
          spo2Result={spo2Result}
          startHR={startHR}
          stopHR={stopHR}
          startBP={startBP}
          stopBP={stopBP}
          startSpo2={startSpo2}
          stopSpo2={stopSpo2}
        />

        <VitalsLabSection
          activeTest={activeTest}
          hrvResult={hrvResult}
          ecgResult={ecgResult}
          fatigueResult={fatigueResult}
          breathingResult={breathingResult}
          bodyCompositionResult={bodyCompositionResult}
          ecgIncludeWaveform={ecgIncludeWaveform}
          setEcgIncludeWaveform={setEcgIncludeWaveform}
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
        />

        <EventLogCard labLog={labLog} clearLabLog={clearLabLog} />

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
                <View style={[styles.progressFill, { width: `${syncPct}%` }]} />
              </View>
              <Text style={styles.syncProgressLabel}>
                Day {dataSyncProgress.currentDay}/{dataSyncProgress.totalDays} ·{" "}
                {Math.round(syncPct)}%
              </Text>
            </>
          )}

          {!dataSyncing && stepData && (
            <View style={styles.dataSummary}>
              <Text style={styles.dataSummaryTitle}>Today&apos;s Steps</Text>
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
              <Text style={styles.dataSummaryTitle}>Last Night&apos;s Sleep</Text>
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
