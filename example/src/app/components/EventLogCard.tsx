import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { BLUE } from "../../components/theme";

const styles = StyleSheet.create({
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  clearBtn: { fontSize: 13, fontWeight: "600", color: BLUE },
  scroll: { maxHeight: 200 },
  empty: { fontSize: 12, color: "#888", lineHeight: 18 },
  line: {
    fontSize: 11,
    lineHeight: 16,
    color: "#333",
    fontFamily: Platform.select({ ios: "Menlo", default: "monospace" }),
    marginBottom: 4,
  },
});

export default function EventLogCard({
  labLog,
  clearLabLog,
}: {
  labLog: string[];
  clearLabLog: () => void;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.cardLabel}>Event log</Text>
        <Pressable
          onPress={clearLabLog}
          accessibilityRole="button"
          accessibilityLabel="Clear event log"
        >
          <Text style={styles.clearBtn}>Clear</Text>
        </Pressable>
      </View>
      <ScrollView
        style={styles.scroll}
        nestedScrollEnabled
        keyboardShouldPersistTaps="handled"
      >
        {labLog.length === 0 ? (
          <Text style={styles.empty}>
            Vitals events, errors from start/stop, and `error` events appear
            here (mutex: one realtime test at a time).
          </Text>
        ) : (
          labLog.map((line, i) => (
            <Text key={`log-${i}`} style={styles.line} selectable>
              {line}
            </Text>
          ))
        )}
      </ScrollView>
    </View>
  );
}
