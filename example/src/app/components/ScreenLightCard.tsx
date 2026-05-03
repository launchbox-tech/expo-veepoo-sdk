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

export default function ScreenLightCard({
  screenLightInfo,
  setScreenLightInfo,
  screenDurationInfo,
  setScreenDurationInfo,
}: {
  screenLightInfo: string;
  setScreenLightInfo: (info: string) => void;
  screenDurationInfo: string;
  setScreenDurationInfo: (info: string) => void;
}) {
  return (
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
              .catch(() => setScreenLightInfo("(unsupported or error)"));
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
              .catch(() => setScreenDurationInfo("(unsupported or error)"));
          }}
          accessibilityRole="button"
        >
          <Text style={styles.buttonTextSecondary}>Read on-time</Text>
        </Pressable>
      </View>
    </View>
  );
}
