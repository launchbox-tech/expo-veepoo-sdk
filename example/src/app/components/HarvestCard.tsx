import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { BLUE, GREEN, RED } from "../../components/theme";
import { useHarvest } from "../../hooks/useHarvest";
import type { HarvestOutcome, HarvestPoint } from "../../harvest";

const OUTCOME_STYLE: Record<HarvestOutcome, { color: string; glyph: string }> = {
  measured: { color: GREEN, glyph: "●" },
  skipped: { color: "#BBB", glyph: "—" },
  not_worn: { color: "#E08600", glyph: "⚠" },
  busy: { color: "#E08600", glyph: "↻" },
  error: { color: RED, glyph: "✕" },
  timeout: { color: RED, glyph: "⏱" },
};

function PointRow({ point }: { point: HarvestPoint }) {
  const s = OUTCOME_STYLE[point.outcome];
  return (
    <View style={styles.row}>
      <Text style={[styles.dot, { color: s.color }]}>{s.glyph}</Text>
      <Text style={styles.rowLabel} numberOfLines={1}>
        {point.label}
      </Text>
      <Text style={[styles.rowValue, { color: s.color }]} numberOfLines={1}>
        {point.detail ?? point.error ?? point.outcome}
      </Text>
    </View>
  );
}

export default function HarvestCard() {
  const {
    running,
    progress,
    result,
    contact,
    wearWarning,
    historyDays,
    setHistoryDays,
    canStart,
    failedCount,
    start,
    retryFailed,
    cancel,
    resolveContact,
    exportJson,
  } = useHarvest();

  const points = progress?.points ?? result?.points ?? [];
  const pct = Math.round((progress?.fraction ?? (result ? 1 : 0)) * 100);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Extract everything</Text>
      <Text style={styles.subtitle}>
        Wear the Band, then run one sweep to harvest every data point it supports.
      </Text>

      {/* History range stepper */}
      <View style={styles.stepperRow}>
        <Text style={styles.stepperLabel}>History range</Text>
        <View style={styles.stepper}>
          <Pressable
            disabled={running || historyDays <= 1}
            onPress={() => setHistoryDays(Math.max(1, historyDays - 1))}
            style={({ pressed }) => [styles.stepBtn, pressed && styles.pressed]}
            accessibilityLabel="Decrease history days"
          >
            <Text style={styles.stepBtnText}>−</Text>
          </Pressable>
          <Text style={styles.stepValue}>{historyDays}d</Text>
          <Pressable
            disabled={running || historyDays >= 30}
            onPress={() => setHistoryDays(Math.min(30, historyDays + 1))}
            style={({ pressed }) => [styles.stepBtn, pressed && styles.pressed]}
            accessibilityLabel="Increase history days"
          >
            <Text style={styles.stepBtnText}>+</Text>
          </Pressable>
        </View>
      </View>

      {/* Primary action */}
      {running ? (
        <Pressable
          onPress={cancel}
          style={({ pressed }) => [styles.button, styles.buttonStop, pressed && styles.pressed]}
          accessibilityRole="button"
        >
          <ActivityIndicator size="small" color="#fff" style={styles.spinner} />
          <Text style={styles.buttonText}>Cancel ({pct}%)</Text>
        </Pressable>
      ) : (
        <Pressable
          disabled={!canStart}
          onPress={start}
          style={({ pressed }) => [
            styles.button,
            canStart ? styles.buttonPrimary : styles.buttonDisabled,
            pressed && canStart && styles.pressed,
          ]}
          accessibilityRole="button"
          accessibilityState={{ disabled: !canStart }}
        >
          <Text style={[styles.buttonText, !canStart && styles.buttonTextDisabled]}>
            {result ? "Run again" : "Extract everything"}
          </Text>
        </Pressable>
      )}

      {!canStart && !running && (
        <Text style={styles.hint}>Connect a Band to enable.</Text>
      )}

      {/* Progress bar */}
      {(running || result) && (
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${pct}%` }]} />
        </View>
      )}
      {progress && running && (
        <Text style={styles.phase}>
          {progress.phase}
          {progress.currentKey ? ` · ${progress.currentKey}` : ""}
        </Text>
      )}

      {/* Wear warning */}
      {wearWarning && running && (
        <View style={styles.warnBanner}>
          <Text style={styles.warnText}>
            ⚠ The Band looks like it isn&apos;t on your wrist — put it on for accurate readings.
          </Text>
        </View>
      )}

      {/* Contact prompt (ECG / body composition) */}
      {contact && (
        <View style={styles.contactBanner}>
          <Text style={styles.contactText}>
            Hold a finger on the Band&apos;s electrode to record {contact.label}.
          </Text>
          <View style={styles.contactBtns}>
            <Pressable
              onPress={() => resolveContact(true)}
              style={({ pressed }) => [styles.contactBtn, styles.contactGo, pressed && styles.pressed]}
            >
              <Text style={styles.contactBtnText}>I&apos;m ready</Text>
            </Pressable>
            <Pressable
              onPress={() => resolveContact(false)}
              style={({ pressed }) => [styles.contactBtn, styles.contactSkip, pressed && styles.pressed]}
            >
              <Text style={[styles.contactBtnText, { color: "#666" }]}>Skip</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Live results */}
      {points.length > 0 && (
        <View style={styles.results}>
          {points.map(p => (
            <PointRow key={`${p.category}:${p.key}`} point={p} />
          ))}
        </View>
      )}

      {/* Summary + export */}
      {result && !running && (
        <>
          <Text style={styles.summary}>
            {result.summary.measured} measured · {result.summary.skipped} skipped ·{" "}
            {result.summary.failed} failed · {result.summary.notWorn} not worn ·{" "}
            {(result.durationMs / 1000).toFixed(0)}s
          </Text>
          {failedCount > 0 && (
            <Pressable
              onPress={retryFailed}
              style={({ pressed }) => [styles.button, styles.buttonRetry, pressed && styles.pressed]}
              accessibilityRole="button"
            >
              <Text style={styles.buttonText}>Retry failed ({failedCount})</Text>
            </Pressable>
          )}
          <Pressable
            onPress={exportJson}
            style={({ pressed }) => [styles.button, styles.buttonExport, pressed && styles.pressed]}
            accessibilityRole="button"
          >
            <Text style={styles.buttonText}>Export JSON</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 18,
    borderRadius: 16,
    backgroundColor: "#F7FAFF",
    borderWidth: 1,
    borderColor: "#DCEAFB",
  },
  title: { fontSize: 20, fontWeight: "700", color: "#111" },
  subtitle: { fontSize: 13, color: "#667", marginTop: 4, lineHeight: 18 },
  stepperRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
  },
  stepperLabel: { fontSize: 14, color: "#333", fontWeight: "500" },
  stepper: { flexDirection: "row", alignItems: "center", gap: 14 },
  stepBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#E8F1FE",
    alignItems: "center",
    justifyContent: "center",
  },
  stepBtnText: { fontSize: 20, color: BLUE, fontWeight: "700" },
  stepValue: { fontSize: 16, fontWeight: "600", color: "#111", minWidth: 36, textAlign: "center" },
  button: {
    height: 52,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 16,
  },
  buttonPrimary: { backgroundColor: BLUE },
  buttonStop: { backgroundColor: RED },
  buttonExport: { backgroundColor: "#111" },
  buttonRetry: { backgroundColor: "#E08600" },
  buttonDisabled: { backgroundColor: "#E5E5E5" },
  pressed: { opacity: 0.82 },
  buttonText: { fontSize: 16, fontWeight: "600", color: "#fff" },
  buttonTextDisabled: { color: "#999" },
  spinner: { marginRight: 4 },
  hint: { fontSize: 12, color: "#999", textAlign: "center", marginTop: 8 },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "#E3ECF7",
    marginTop: 14,
    overflow: "hidden",
  },
  progressFill: { height: 6, borderRadius: 3, backgroundColor: BLUE },
  phase: { fontSize: 12, color: "#667", marginTop: 6, textTransform: "capitalize" },
  warnBanner: {
    marginTop: 12,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#FFF4E5",
  },
  warnText: { fontSize: 13, color: "#9A5B00", lineHeight: 18 },
  contactBanner: {
    marginTop: 12,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#EAF3FF",
    borderWidth: 1,
    borderColor: BLUE,
  },
  contactText: { fontSize: 14, color: "#0A4B8C", lineHeight: 19 },
  contactBtns: { flexDirection: "row", gap: 10, marginTop: 10 },
  contactBtn: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  contactGo: { backgroundColor: BLUE },
  contactSkip: { backgroundColor: "#E5E5E5" },
  contactBtnText: { fontSize: 14, fontWeight: "600", color: "#fff" },
  results: { marginTop: 16, gap: 2 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E8EEF6",
  },
  dot: { width: 18, fontSize: 13, textAlign: "center" },
  rowLabel: { flex: 1, fontSize: 14, color: "#333", marginLeft: 4 },
  rowValue: { fontSize: 13, fontWeight: "500", maxWidth: "45%", textAlign: "right" },
  summary: { fontSize: 12, color: "#667", marginTop: 14, textAlign: "center" },
});
