import { Pressable, Text, View, StyleSheet } from "react-native";
import { BLUE } from "../../components/theme";
import sdk from "@gaozh1024/expo-veepoo-sdk";

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
  findPhase: { fontSize: 14, color: "#555", marginBottom: 4 },
  findRow: { flexDirection: "row", gap: 10 },
  button: {
    height: 52,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  buttonSecondary: {
    flex: 1,
    backgroundColor: "#E8F0FE",
    borderWidth: 1,
    borderColor: "#C5D9F5",
  },
  buttonPressed: { opacity: 0.82 },
  buttonTextSecondary: { fontSize: 14, fontWeight: "600", color: BLUE },
});

export default function FindBandCard({
  findPhase,
  setFindPhase,
}: {
  findPhase: string | null;
  setFindPhase: (phase: string | null) => void;
}) {
  return (
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
            void sdk.findDevice.startFindDevice().catch(() => {});
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
            void sdk.findDevice.stopFindDevice().catch(() => {});
          }}
          accessibilityRole="button"
        >
          <Text style={styles.buttonTextSecondary}>Stop find</Text>
        </Pressable>
      </View>
    </View>
  );
}
