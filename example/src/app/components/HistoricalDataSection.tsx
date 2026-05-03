import type { ReadOriginProgress, SleepData, SportStepData } from "@gaozh1024/expo-veepoo-sdk";
import { ActivityIndicator, StyleSheet, Text, View, Pressable } from "react-native";
import { BLUE } from "../../components/theme";

const styles = StyleSheet.create({
  sectionHeader: { paddingHorizontal: 24, paddingBottom: 8, paddingTop: 4 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  card: {
    marginHorizontal: 24,
    marginBottom: 12,
    backgroundColor: "#F5F9FF",
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  label: { fontSize: 15, fontWeight: "600", color: "#111" },
  btn: {
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 16,
    minWidth: 64,
    alignItems: "center",
  },
  btnIdle: { backgroundColor: BLUE },
  btnDisabled: { backgroundColor: "#E5E5E5" },
  btnPressed: { opacity: 0.82 },
  btnText: { fontSize: 13, fontWeight: "600", color: "#fff" },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "#DDE8F5",
    overflow: "hidden",
  },
  progressFill: { height: 6, backgroundColor: BLUE, borderRadius: 3 },
  progressLabel: { fontSize: 12, color: "#888" },
  summary: {
    borderTopWidth: 1,
    borderTopColor: "#E5EDF7",
    paddingTop: 10,
    gap: 2,
  },
  summaryTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  summaryValue: { fontSize: 22, fontWeight: "700", color: "#111" },
  summaryMeta: { fontSize: 12, color: "#888" },
});

export default function HistoricalDataSection({
  dataSyncing,
  dataSyncProgress,
  sleepSummary,
  stepData,
  syncData,
}: {
  dataSyncing: boolean;
  dataSyncProgress: ReadOriginProgress | null;
  sleepSummary: SleepData["summary"] | null;
  stepData: SportStepData | null;
  syncData: () => Promise<void>;
}) {
  const syncPct = dataSyncProgress?.progress ?? 0;

  return (
    <>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Historical Data</Text>
      </View>
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>Sync Data</Text>
          <Pressable
            style={({ pressed }) => [
              styles.btn,
              dataSyncing ? styles.btnDisabled : styles.btnIdle,
              pressed && !dataSyncing && styles.btnPressed,
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
              <Text style={styles.btnText}>Sync</Text>
            )}
          </Pressable>
        </View>

        {dataSyncing && dataSyncProgress && (
          <>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${syncPct}%` }]} />
            </View>
            <Text style={styles.progressLabel}>
              Day {dataSyncProgress.currentDay}/{dataSyncProgress.totalDays} ·{" "}
              {Math.round(syncPct)}%
            </Text>
          </>
        )}

        {!dataSyncing && stepData && (
          <View style={styles.summary}>
            <Text style={styles.summaryTitle}>Today&apos;s Steps</Text>
            <Text style={styles.summaryValue}>
              {stepData.stepCount.toLocaleString()}
            </Text>
            <Text style={styles.summaryMeta}>
              {(stepData.distance / 1000).toFixed(2)} km ·{" "}
              {Math.round(stepData.calories)} kcal
            </Text>
          </View>
        )}

        {!dataSyncing && sleepSummary && (
          <View style={styles.summary}>
            <Text style={styles.summaryTitle}>Last Night&apos;s Sleep</Text>
            <Text style={styles.summaryValue}>
              {Math.floor(sleepSummary.totalSleepMinutes / 60)}h{" "}
              {sleepSummary.totalSleepMinutes % 60}m
            </Text>
            <Text style={styles.summaryMeta}>
              Deep {sleepSummary.totalDeepSleepMinutes}m · Light{" "}
              {sleepSummary.totalLightSleepMinutes}m · Woke{" "}
              {sleepSummary.totalWakeUpCount}×
            </Text>
          </View>
        )}
      </View>
    </>
  );
}
